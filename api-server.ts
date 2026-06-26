import 'dotenv/config';
import crypto from 'crypto';
import { query } from './src/lib/db';

/**
 * Ошибка уровня API с HTTP-статусом.
 */
export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

export interface CreateBookingInput {
  serviceId: string;
  bookingDate: string;
  bookingTime: string;
  phone: string;
  message?: string;
}

// --- Валидация ---
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^\d{2}:\d{2}$/;

function normalizePhone(raw: string): string {
  const trimmed = String(raw).trim();
  const digits = trimmed.replace(/\D/g, '');
  if (digits.length < 7 || digits.length > 15) {
    throw new ApiError(400, 'Укажите корректный номер телефона');
  }
  return trimmed;
}

// ============================================================
// АВТОРИЗАЦИЯ АДМИНИСТРАТОРА
// ============================================================

// Сессии хранятся в памяти процесса. Для одного администратора этого достаточно;
// при перезапуске сервера потребуется повторный вход.
const sessions = new Map<string, number>(); // token -> expiresAt (ms)
const SESSION_TTL = 1000 * 60 * 60 * 12; // 12 часов

function pruneSessions() {
  const now = Date.now();
  for (const [token, exp] of sessions) {
    if (exp < now) sessions.delete(token);
  }
}

export function login(password: string): { token: string } {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    throw new ApiError(500, 'ADMIN_PASSWORD не задан на сервере');
  }
  if (!password || password !== expected) {
    throw new ApiError(401, 'Неверный пароль');
  }
  const token = crypto.randomUUID();
  sessions.set(token, Date.now() + SESSION_TTL);
  return { token };
}

function requireAuth(token?: string) {
  pruneSessions();
  if (!token || !sessions.has(token)) {
    throw new ApiError(401, 'Требуется авторизация');
  }
  const exp = sessions.get(token)!;
  if (exp < Date.now()) {
    sessions.delete(token);
    throw new ApiError(401, 'Сессия истекла');
  }
}

/** Проверка токена без выброса исключения (для multipart-загрузок). */
export function isAuthed(token?: string): boolean {
  try {
    requireAuth(token);
    return true;
  } catch {
    return false;
  }
}

// ============================================================
// TELEGRAM
// ============================================================

export async function sendTelegramNotification(text: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    console.warn('Telegram не настроен — уведомление пропущено.');
    return;
  }
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'Markdown' }),
    });
    if (!res.ok) console.error('Telegram API ошибка:', res.status, await res.text());
  } catch (e) {
    console.error('Ошибка при отправке в Telegram:', e);
  }
}

// ============================================================
// БРОНИРОВАНИЕ
// ============================================================

export async function handleGetBookedSlots() {
  // Актуальный список слотов берём из БД (управляется из админки).
  const slotsRes = await query('SELECT slot_time::text FROM time_slots ORDER BY slot_time');
  const allSlots = slotsRes.rows.map((row) => row.slot_time.substring(0, 5));
  const totalSlotsCount = allSlots.length;

  const fullyBookedRes =
    totalSlotsCount > 0
      ? await query(
          `SELECT booking_date::text
             FROM bookings
            GROUP BY booking_date
           HAVING COUNT(booking_time) >= $1`,
          [totalSlotsCount]
        )
      : { rows: [] as { booking_date: string }[] };

  const fullyBookedDates = fullyBookedRes.rows.map((row) => row.booking_date);

  const allBookingsRes = await query(`SELECT booking_date::text, booking_time::text FROM bookings`);
  const bookedSlotsByDate: Record<string, string[]> = {};
  allBookingsRes.rows.forEach((row) => {
    const dateStr = row.booking_date;
    const timeStr = row.booking_time.substring(0, 5);
    (bookedSlotsByDate[dateStr] ??= []).push(timeStr);
  });

  return { fullyBookedDates, bookedSlotsByDate, allSlots };
}

// ============================================================
// СЛОТЫ ВРЕМЕНИ (управление из админки)
// ============================================================

interface TimeSlotRow {
  id: number;
  slot_time: string;
}

async function listTimeSlots() {
  const res = await query('SELECT id, slot_time::text FROM time_slots ORDER BY slot_time');
  return {
    slots: res.rows.map((r: TimeSlotRow) => ({ id: r.id, time: r.slot_time.substring(0, 5) })),
  };
}

async function createTimeSlot(b: { time?: string }) {
  const time = String(b?.time ?? '').trim();
  if (!TIME_RE.test(time)) throw new ApiError(400, 'Некорректный формат времени (нужно ЧЧ:ММ)');
  try {
    const res = await query(
      'INSERT INTO time_slots (slot_time) VALUES ($1) RETURNING id',
      [time]
    );
    return { id: res.rows[0].id };
  } catch (error: unknown) {
    if (typeof error === 'object' && error !== null && 'code' in error && (error as { code?: string }).code === '23505') {
      throw new ApiError(409, 'Такое время уже есть в списке');
    }
    console.error('Ошибка БД при создании слота:', error);
    throw new ApiError(500, 'Ошибка базы данных');
  }
}

async function deleteTimeSlot(id: number) {
  await query('DELETE FROM time_slots WHERE id=$1', [id]);
  return { success: true };
}

export async function handleCreateBooking(body: CreateBookingInput) {
  const { serviceId, bookingDate, bookingTime, phone } = body ?? ({} as CreateBookingInput);
  if (!serviceId || !bookingDate || !bookingTime || !phone) {
    throw new ApiError(400, 'Все поля обязательны');
  }
  if (!DATE_RE.test(bookingDate)) throw new ApiError(400, 'Некорректный формат даты');
  if (!TIME_RE.test(bookingTime)) throw new ApiError(400, 'Некорректный формат времени');

  const normalizedPhone = normalizePhone(phone);

  try {
    await query(
      `INSERT INTO bookings (service_id, booking_date, booking_time, phone)
       VALUES ($1, $2, $3, $4)`,
      [String(serviceId), bookingDate, bookingTime, normalizedPhone]
    );
  } catch (error: unknown) {
    if (typeof error === 'object' && error !== null && 'code' in error && (error as { code?: string }).code === '23505') {
      throw new ApiError(409, 'Это время уже занято!');
    }
    console.error('Ошибка БД при создании записи:', error);
    throw new ApiError(500, 'Ошибка базы данных');
  }

  const text =
    body.message ??
    `🔔 Новая запись!\n📅 Дата: ${bookingDate}\n⏰ Время: ${bookingTime}\n📱 Телефон: ${normalizedPhone}`;
  await sendTelegramNotification(text);

  return { success: true, message: 'Вы успешно записаны!' };
}

// ============================================================
// ПУБЛИЧНЫЙ КОНТЕНТ
// ============================================================

export async function getPublicContent() {
  const [testimonials, beforeAfter, advantages, settingsRes] = await Promise.all([
    query('SELECT id, author, text FROM testimonials ORDER BY sort_order, id'),
    query('SELECT id, title, image_before, image_after FROM before_after ORDER BY sort_order, id'),
    query('SELECT id, icon, title, description FROM advantages ORDER BY sort_order, id'),
    query('SELECT key, value FROM site_settings'),
  ]);

  const settings: Record<string, string> = {};
  settingsRes.rows.forEach((r) => (settings[r.key] = r.value));

  return {
    testimonials: testimonials.rows,
    beforeAfter: beforeAfter.rows.map((r) => ({
      id: r.id,
      title: r.title,
      imageBefore: r.image_before,
      imageAfter: r.image_after,
    })),
    advantages: advantages.rows,
    settings,
  };
}

// ============================================================
// АДМИН: CRUD
// ============================================================

async function listAdminContent() {
  return getPublicContent();
}

async function createTestimonial(b: { author?: string; text?: string; sortOrder?: number }) {
  if (!b.author || !b.text) throw new ApiError(400, 'Имя и текст обязательны');
  const res = await query(
    'INSERT INTO testimonials (author, text, sort_order) VALUES ($1, $2, $3) RETURNING id',
    [b.author, b.text, b.sortOrder ?? 0]
  );
  return { id: res.rows[0].id };
}

async function updateTestimonial(id: number, b: { author?: string; text?: string; sortOrder?: number }) {
  await query('UPDATE testimonials SET author=$1, text=$2, sort_order=$3 WHERE id=$4', [
    b.author, b.text, b.sortOrder ?? 0, id,
  ]);
  return { success: true };
}

async function createBeforeAfter(b: { title?: string; imageBefore?: string; imageAfter?: string; sortOrder?: number }) {
  if (!b.imageBefore || !b.imageAfter) throw new ApiError(400, 'Нужны оба фото (до и после)');
  const res = await query(
    'INSERT INTO before_after (title, image_before, image_after, sort_order) VALUES ($1, $2, $3, $4) RETURNING id',
    [b.title ?? '', b.imageBefore, b.imageAfter, b.sortOrder ?? 0]
  );
  return { id: res.rows[0].id };
}

async function updateBeforeAfter(id: number, b: { title?: string; imageBefore?: string; imageAfter?: string; sortOrder?: number }) {
  await query('UPDATE before_after SET title=$1, image_before=$2, image_after=$3, sort_order=$4 WHERE id=$5', [
    b.title ?? '', b.imageBefore, b.imageAfter, b.sortOrder ?? 0, id,
  ]);
  return { success: true };
}

async function createAdvantage(b: { icon?: string; title?: string; description?: string; sortOrder?: number }) {
  if (!b.title || !b.description) throw new ApiError(400, 'Заголовок и описание обязательны');
  const res = await query(
    'INSERT INTO advantages (icon, title, description, sort_order) VALUES ($1, $2, $3, $4) RETURNING id',
    [b.icon ?? 'sparkles', b.title, b.description, b.sortOrder ?? 0]
  );
  return { id: res.rows[0].id };
}

async function updateAdvantage(id: number, b: { icon?: string; title?: string; description?: string; sortOrder?: number }) {
  await query('UPDATE advantages SET icon=$1, title=$2, description=$3, sort_order=$4 WHERE id=$5', [
    b.icon ?? 'sparkles', b.title, b.description, b.sortOrder ?? 0, id,
  ]);
  return { success: true };
}

async function deleteRow(table: 'testimonials' | 'before_after' | 'advantages', id: number) {
  await query(`DELETE FROM ${table} WHERE id=$1`, [id]);
  return { success: true };
}

async function updateSettings(body: Record<string, string>) {
  const entries = Object.entries(body || {});
  for (const [key, value] of entries) {
    await query(
      `INSERT INTO site_settings (key, value) VALUES ($1, $2)
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
      [key, String(value ?? '')]
    );
  }
  return { success: true };
}

// ============================================================
// ДИСПЕТЧЕР JSON-РОУТОВ
// Используется и Express (server.ts), и Vite dev (vite.config.ts).
// ============================================================

export interface ApiRequest {
  method: string;
  path: string; // pathname без query
  body: any;
  token?: string;
}

export async function dispatchApi(req: ApiRequest): Promise<unknown> {
  const { method, path, body, token } = req;

  // --- Публичные маршруты ---
  if (method === 'GET' && path === '/api/booked-slots') return handleGetBookedSlots();
  if (method === 'POST' && path === '/api/bookings') return handleCreateBooking(body);
  if (method === 'GET' && path === '/api/content') return getPublicContent();

  // --- Авторизация ---
  if (method === 'POST' && path === '/api/admin/login') return login(body?.password);
  if (method === 'GET' && path === '/api/admin/verify') {
    requireAuth(token);
    return { ok: true };
  }

  // --- Админские маршруты (всё ниже требует токен) ---
  if (path.startsWith('/api/admin/')) {
    requireAuth(token);

    if (method === 'GET' && path === '/api/admin/content') return listAdminContent();
    if (method === 'PUT' && path === '/api/admin/settings') return updateSettings(body);

    // Управление слотами времени
    if (path === '/api/admin/time-slots') {
      if (method === 'GET') return listTimeSlots();
      if (method === 'POST') return createTimeSlot(body);
    }
    const slotMatch = path.match(/^\/api\/admin\/time-slots\/(\d+)$/);
    if (slotMatch && method === 'DELETE') return deleteTimeSlot(parseInt(slotMatch[1], 10));

    // Коллекции с :id
    const idMatch = path.match(/^\/api\/admin\/(testimonials|before-after|advantages)(?:\/(\d+))?$/);
    if (idMatch) {
      const resource = idMatch[1];
      const id = idMatch[2] ? parseInt(idMatch[2], 10) : null;

      if (resource === 'testimonials') {
        if (method === 'POST') return createTestimonial(body);
        if (method === 'PUT' && id) return updateTestimonial(id, body);
        if (method === 'DELETE' && id) return deleteRow('testimonials', id);
      }
      if (resource === 'before-after') {
        if (method === 'POST') return createBeforeAfter(body);
        if (method === 'PUT' && id) return updateBeforeAfter(id, body);
        if (method === 'DELETE' && id) return deleteRow('before_after', id);
      }
      if (resource === 'advantages') {
        if (method === 'POST') return createAdvantage(body);
        if (method === 'PUT' && id) return updateAdvantage(id, body);
        if (method === 'DELETE' && id) return deleteRow('advantages', id);
      }
    }
  }

  throw new ApiError(404, 'Маршрут не найден');
}
