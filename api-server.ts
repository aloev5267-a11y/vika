import 'dotenv/config';
import crypto from 'crypto';
import { query } from './src/lib/db';
import { SERVICE_IDS, SERVICE_TITLES, SESSION_PRICE, CURRENCY } from './src/lib/config';
import {
  tgSendMessage,
  tgEditMessage,
  tgAnswerCallback,
  verifyWebhookSecret,
  type InlineButton,
} from './telegram';

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
  durationHours?: number;
  phone: string;
  name?: string;
}

// --- Валидация ---
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^\d{2}:\d{2}$/;
const MAX_DURATION_HOURS = 12; // разумный верхний предел длительности визита

/** "14:00" + n часов → "17:00" (с обнулением минут, в пределах суток). */
function addHours(time: string, hours: number): string {
  const [h, m] = time.split(':').map(Number);
  const total = h + hours;
  return `${String(total).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function normalizePhone(raw: string): string {
  const trimmed = String(raw).trim();
  const digits = trimmed.replace(/\D/g, '');
  if (digits.length < 7 || digits.length > 15) {
    throw new ApiError(400, 'Укажите корректный номер телефона');
  }
  // Нормализуем к формату "+<цифры>": сохраняем ведущий + у международных номеров.
  return trimmed.startsWith('+') ? `+${digits}` : digits;
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

// --- Защита от перебора пароля ---
const LOGIN_WINDOW_MS = 1000 * 60 * 15; // окно 15 минут
const LOGIN_MAX_ATTEMPTS = 5; // не более 5 неудачных попыток за окно
const loginAttempts = { count: 0, windowStart: Date.now() };

/** Сравнение строк за постоянное время — защита от тайминг-атак. */
function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');
  if (bufA.length !== bufB.length) {
    // Всё равно делаем сравнение, чтобы не выдать различие по времени.
    crypto.timingSafeEqual(bufA, bufA);
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

export function login(password: string): { token: string } {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    throw new ApiError(500, 'ADMIN_PASSWORD не задан на сервере');
  }

  // Сбрасываем счётчик при наступлении нового окна.
  const now = Date.now();
  if (now - loginAttempts.windowStart > LOGIN_WINDOW_MS) {
    loginAttempts.count = 0;
    loginAttempts.windowStart = now;
  }
  if (loginAttempts.count >= LOGIN_MAX_ATTEMPTS) {
    throw new ApiError(429, 'Слишком много попыток входа. Попробуйте позже.');
  }

  if (!password || !safeEqual(password, expected)) {
    loginAttempts.count += 1;
    throw new ApiError(401, 'Неверный пароль');
  }

  // Успешный вход — сбрасываем счётчик попыток.
  loginAttempts.count = 0;
  const token = crypto.randomUUID();
  sessions.set(token, now + SESSION_TTL);
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
// TELEGRAM (транспорт вынесен в ./telegram.ts)
// ============================================================

/** Человекочитаемая подпись статуса заявки. */
const STATUS_LABEL: Record<string, string> = {
  pending: '⏳ Ожидает подтверждения',
  confirmed: '✅ Подтверждена',
  rejected: '❌ Отклонена',
};

interface BookingTextData {
  serviceTitles: string;
  bookingDate: string;
  bookingTime: string;
  durationHours: number;
  phone: string;
  name?: string;
  status: string;
}

/** Формирует текст сообщения в Telegram из проверенных серверных полей. */
function buildBookingMessage(b: BookingTextData): string {
  const endTime = addHours(b.bookingTime, b.durationHours);
  const total = SESSION_PRICE * b.durationHours;
  const lines = [
    `🔔 <b>Новая запись</b>`,
    ``,
    b.name ? `👤 Имя: ${escapeHtml(b.name)}` : null,
    `📱 Телефон: ${escapeHtml(b.phone)}`,
    `✨ Услуги: ${escapeHtml(b.serviceTitles)}`,
    `📅 Дата: ${b.bookingDate}`,
    `⏰ Время: ${b.bookingTime}–${endTime} (${b.durationHours} ч)`,
    `💰 Стоимость: ${total} ${CURRENCY} (${SESSION_PRICE} ${CURRENCY}/час)`,
    ``,
    `Статус: <b>${STATUS_LABEL[b.status] ?? b.status}</b>`,
  ].filter(Boolean);
  return lines.join('\n');
}

/** Экранирование для parse_mode=HTML. */
function escapeHtml(s: string): string {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// ============================================================
// БРОНИРОВАНИЕ
// ============================================================

export async function handleGetBookedSlots() {
  // Актуальный список слотов берём из БД (управляется из админки).
  const slotsRes = await query('SELECT slot_time::text FROM time_slots ORDER BY slot_time');
  const allSlots: string[] = slotsRes.rows.map((row) => row.slot_time.substring(0, 5));
  const totalSlotsCount = allSlots.length;
  const slotSet = new Set(allSlots);

  // Берём только активные заявки (pending + confirmed). Отклонённые освобождают слот.
  // Каждая запись разворачивается в набор занятых часов (старт + длительность).
  const activeRes = await query(
    `SELECT booking_date::text, booking_time::text, duration_hours
       FROM bookings
      WHERE status <> 'rejected'`
  );

  const bookedSlotsByDate: Record<string, string[]> = {};
  for (const row of activeRes.rows as { booking_date: string; booking_time: string; duration_hours: number }[]) {
    const dateStr = row.booking_date;
    const start = row.booking_time.substring(0, 5);
    const duration = Math.max(1, Number(row.duration_hours) || 1);
    const set = (bookedSlotsByDate[dateStr] ??= []);
    // Помечаем занятым каждый час визита, но только если такой слот реально существует.
    for (let i = 0; i < duration; i++) {
      const hour = addHours(start, i);
      if (slotSet.has(hour)) set.push(hour);
    }
  }

  // День считается полностью занятым, если заняты все существующие слоты.
  const fullyBookedDates =
    totalSlotsCount > 0
      ? Object.entries(bookedSlotsByDate)
          .filter(([, hours]) => new Set(hours).size >= totalSlotsCount)
          .map(([date]) => date)
      : [];

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

// ============================================================
// АДМИН: ПРОСМОТР И УПРАВЛЕНИЕ ЗАПИСЯМИ КЛИЕНТОВ
// ============================================================

interface BookingRow {
  id: number;
  service_id: string;
  booking_date: string;
  booking_time: string;
  duration_hours: number;
  phone: string;
  client_name: string;
  status: string;
  created_at: string;
}

/** Преобразует "body, legs" → "Тело, Ноги полностью" (с запасом на неизвестные id). */
function serviceIdsToTitles(serviceId: string): string {
  return String(serviceId)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((id) => SERVICE_TITLES[id] ?? id)
    .join(', ');
}

/** Список всех записей с разбивкой на предстоящие и прошедшие (по серверной дате). */
async function listBookings() {
  const res = await query(
    `SELECT id,
            service_id,
            booking_date::text,
            booking_time::text,
            duration_hours,
            phone,
            client_name,
            status,
            created_at::text
       FROM bookings
      ORDER BY booking_date DESC, booking_time DESC`
  );

  const todayISO = new Date().toISOString().slice(0, 10);

  const all = (res.rows as BookingRow[]).map((r) => {
    const time = r.booking_time.substring(0, 5);
    const duration = Math.max(1, Number(r.duration_hours) || 1);
    return {
      id: r.id,
      serviceId: r.service_id,
      serviceTitle: serviceIdsToTitles(r.service_id),
      date: r.booking_date,
      time,
      endTime: addHours(time, duration),
      durationHours: duration,
      phone: r.phone,
      name: r.client_name || '',
      status: r.status,
      total: SESSION_PRICE * duration,
      createdAt: r.created_at,
      isPast: r.booking_date < todayISO,
    };
  });

  return {
    bookings: all,
    total: all.length,
    upcoming: all.filter((b) => !b.isPast && b.status !== 'rejected').length,
    pending: all.filter((b) => b.status === 'pending').length,
  };
}

/** Отмена/удаление записи администратором — освобождает слот. */
async function deleteBooking(id: number) {
  await query('DELETE FROM bookings WHERE id=$1', [id]);
  return { success: true };
}

// ============================================================
// СМЕНА СТАТУСА ЗАПИСИ (общий код для админки и Telegram-кнопок)
// ============================================================

interface DecisionRow {
  id: number;
  service_id: string;
  booking_date: string;
  booking_time: string;
  duration_hours: number;
  phone: string;
  client_name: string;
  status: string;
  tg_message_id: string | null;
}

/**
 * Меняет статус записи и синхронизирует сообщение в Telegram.
 * Возвращает обновлённую запись или null, если запись не найдена.
 * Источник вызова (admin / telegram) не важен — поведение одинаковое,
 * благодаря чему админка и кнопки в Telegram работают синхронно.
 */
async function decideBooking(id: number, status: 'confirmed' | 'rejected') {
  const res = await query(
    `UPDATE bookings
        SET status = $1
      WHERE id = $2
      RETURNING id, service_id, booking_date::text, booking_time::text,
                duration_hours, phone, client_name, status, tg_message_id`,
    [status, id]
  );
  const row = (res.rows as DecisionRow[])[0];
  if (!row) return null;

  // Синхронизируем сообщение в Telegram (убираем кнопки, показываем статус).
  if (row.tg_message_id) {
    const text = buildBookingMessage({
      serviceTitles: serviceIdsToTitles(row.service_id),
      bookingDate: row.booking_date,
      bookingTime: row.booking_time.substring(0, 5),
      durationHours: Math.max(1, Number(row.duration_hours) || 1),
      phone: row.phone,
      name: row.client_name || undefined,
      status: row.status,
    });
    await tgEditMessage(Number(row.tg_message_id), text);
  }

  return row;
}

/** Админ меняет статус записи вручную (подтвердить/отклонить). */
async function setBookingStatus(id: number, status: unknown) {
  if (status !== 'confirmed' && status !== 'rejected') {
    throw new ApiError(400, 'Недопустимый статус');
  }
  const row = await decideBooking(id, status);
  if (!row) throw new ApiError(404, 'Запись не найдена');
  return { success: true, status: row.status };
}

// ============================================================
// TELEGRAM WEBHOOK (нажатия inline-кнопок «Подтвердить» / «Отклонить»)
// ============================================================

export async function handleTelegramWebhook(update: any, secretToken?: string) {
  // Проверяем секрет из заголовка X-Telegram-Bot-Api-Secret-Token.
  if (!verifyWebhookSecret(secretToken)) {
    throw new ApiError(403, 'Неверный секрет вебхука');
  }

  const cb = update?.callback_query;
  if (!cb || typeof cb.data !== 'string') {
    // Не интересующий нас тип апдейта — просто подтверждаем приём.
    return { ok: true };
  }

  const match = cb.data.match(/^(confirm|reject):(\d+)$/);
  if (!match) {
    await tgAnswerCallback(cb.id, 'Неизвестная команда');
    return { ok: true };
  }

  const action = match[1];
  const id = parseInt(match[2], 10);
  const status = action === 'confirm' ? 'confirmed' : 'rejected';

  try {
    const row = await decideBooking(id, status);
    if (!row) {
      await tgAnswerCallback(cb.id, 'Запись не найдена (возможно, удалена)');
      return { ok: true };
    }
    await tgAnswerCallback(cb.id, status === 'confirmed' ? 'Запись подтверждена ✅' : 'Запись отклонена ❌');
  } catch (e) {
    console.error('Ошибка обработки вебхука Telegram:', e);
    await tgAnswerCallback(cb.id, 'Ошибка обработки');
  }

  return { ok: true };
}

export async function handleCreateBooking(body: CreateBookingInput) {
  const { serviceId, bookingDate, bookingTime, phone } = body ?? ({} as CreateBookingInput);
  if (!serviceId || !bookingDate || !bookingTime || !phone) {
    throw new ApiError(400, 'Все поля обязательны');
  }
  if (!DATE_RE.test(bookingDate)) throw new ApiError(400, 'Некорректный формат даты');
  if (!TIME_RE.test(bookingTime)) throw new ApiError(400, 'Некорректный формат времени');

  // Длительность визита в часах (по 1 часу). Клиент выбирает сам.
  const durationHours = Math.floor(Number(body?.durationHours ?? 1));
  if (!Number.isFinite(durationHours) || durationHours < 1 || durationHours > MAX_DURATION_HOURS) {
    throw new ApiError(400, 'Некорректная длительность визита');
  }

  // Имя клиента — необязательное поле.
  const name = String(body?.name ?? '').trim().slice(0, 100);

  // Валидируем услуги: принимаем список id через запятую и проверяем по справочнику.
  const ids = String(serviceId)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  if (ids.length === 0 || ids.some((id) => !SERVICE_IDS.has(id))) {
    throw new ApiError(400, 'Указана недопустимая услуга');
  }
  const canonicalServiceId = ids.join(', ');
  const serviceTitles = ids.map((id) => SERVICE_TITLES[id]).join(', ');

  const normalizedPhone = normalizePhone(phone);

  // Все запрашиваемые часы должны существовать как слоты в расписании.
  const slotsRes = await query('SELECT slot_time::text FROM time_slots');
  const slotSet = new Set<string>(slotsRes.rows.map((r) => r.slot_time.substring(0, 5)));
  const requestedHours: string[] = [];
  for (let i = 0; i < durationHours; i++) {
    const hour = addHours(bookingTime, i);
    if (!slotSet.has(hour)) {
      throw new ApiError(400, 'Выбранная длительность выходит за пределы рабочего времени');
    }
    requestedHours.push(hour);
  }

  // Проверяем, что ни один из запрашиваемых часов не пересекается с активной
  // (pending/confirmed) записью на эту дату. Отклонённые записи не блокируют слот.
  const overlapRes = await query(
    `SELECT booking_time::text, duration_hours
       FROM bookings
      WHERE booking_date = $1 AND status <> 'rejected'`,
    [bookingDate]
  );
  const occupied = new Set<string>();
  for (const r of overlapRes.rows as { booking_time: string; duration_hours: number }[]) {
    const start = r.booking_time.substring(0, 5);
    const dur = Math.max(1, Number(r.duration_hours) || 1);
    for (let i = 0; i < dur; i++) occupied.add(addHours(start, i));
  }
  if (requestedHours.some((h) => occupied.has(h))) {
    throw new ApiError(409, 'Это время уже занято!');
  }

  let bookingId: number;
  try {
    const insertRes = await query(
      `INSERT INTO bookings (service_id, booking_date, booking_time, duration_hours, phone, client_name, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'pending')
       RETURNING id`,
      [canonicalServiceId, bookingDate, bookingTime, durationHours, normalizedPhone, name]
    );
    bookingId = insertRes.rows[0].id;
  } catch (error: unknown) {
    if (typeof error === 'object' && error !== null && 'code' in error && (error as { code?: string }).code === '23505') {
      throw new ApiError(409, 'Это время уже занято!');
    }
    console.error('Ошибка БД при создании записи:', error);
    throw new ApiError(500, 'Ошибка базы данных');
  }

  // Уведомление администратору с кнопками «Подтвердить» / «Отклонить».
  // Текст формируется ТОЛЬКО на сервере из проверенных полей (защита от инъекций).
  const text = buildBookingMessage({
    serviceTitles,
    bookingDate,
    bookingTime,
    durationHours,
    phone: normalizedPhone,
    name: name || undefined,
    status: 'pending',
  });
  const keyboard: InlineButton[][] = [
    [
      { text: '✅ Подтвердить', callback_data: `confirm:${bookingId}` },
      { text: '❌ Отклонить', callback_data: `reject:${bookingId}` },
    ],
  ];
  const messageId = await tgSendMessage(text, keyboard);
  if (messageId != null) {
    // Сохраняем id сообщения, чтобы потом отредактировать его при смене статуса.
    await query('UPDATE bookings SET tg_message_id = $1 WHERE id = $2', [messageId, bookingId]);
  }

  return {
    success: true,
    message: 'Заявка отправлена! Мастер свяжется с вами для подтверждения.',
  };
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
  /** Секрет из заголовка X-Telegram-Bot-Api-Secret-Token (для вебхука Telegram). */
  secretToken?: string;
}

export async function dispatchApi(req: ApiRequest): Promise<unknown> {
  const { method, path, body, token, secretToken } = req;

  // --- Публичные маршруты ---
  if (method === 'GET' && path === '/api/booked-slots') return handleGetBookedSlots();
  if (method === 'POST' && path === '/api/bookings') return handleCreateBooking(body);
  if (method === 'GET' && path === '/api/content') return getPublicContent();

  // --- Вебхук Telegram (нажатия кнопок «Подтвердить» / «Отклонить») ---
  if (method === 'POST' && path === '/api/telegram/webhook') {
    return handleTelegramWebhook(body, secretToken);
  }

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

    // Записи клиентов
    if (method === 'GET' && path === '/api/admin/bookings') return listBookings();
    const bookingStatusMatch = path.match(/^\/api\/admin\/bookings\/(\d+)\/status$/);
    if (bookingStatusMatch && method === 'POST') {
      return setBookingStatus(parseInt(bookingStatusMatch[1], 10), body?.status);
    }
    const bookingMatch = path.match(/^\/api\/admin\/bookings\/(\d+)$/);
    if (bookingMatch && method === 'DELETE') return deleteBooking(parseInt(bookingMatch[1], 10));

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
