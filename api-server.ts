import 'dotenv/config';
import { query } from './src/lib/db';

/**
 * Ошибка уровня API с HTTP-статусом.
 * Позволяет обработчикам выбрасывать осмысленные коды состояния.
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

/** Нормализует и проверяет телефон: оставляем цифры и ведущий "+". */
function normalizePhone(raw: string): string {
  const trimmed = String(raw).trim();
  const digits = trimmed.replace(/\D/g, '');
  if (digits.length < 7 || digits.length > 15) {
    throw new ApiError(400, 'Укажите корректный номер телефона');
  }
  return trimmed;
}

/** Отправляет уведомление в Telegram. Секреты берутся только из окружения. */
export async function sendTelegramNotification(text: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.warn('Telegram не настроен (нет TELEGRAM_BOT_TOKEN/TELEGRAM_CHAT_ID) — уведомление пропущено.');
    return;
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'Markdown' }),
    });
    if (!res.ok) {
      console.error('Telegram API вернул ошибку:', res.status, await res.text());
    }
  } catch (e) {
    // Сбой отправки уведомления не должен ломать саму запись
    console.error('Ошибка при отправке в Telegram:', e);
  }
}

// Обработчик для получения занятых слотов (GET)
export async function handleGetBookedSlots() {
  const totalSlotsRes = await query('SELECT COUNT(*) FROM time_slots');
  const totalSlotsCount = parseInt(totalSlotsRes.rows[0].count, 10);

  // Если справочник слотов пуст — день не может быть "забит полностью"
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

  const allBookingsRes = await query(
    `SELECT booking_date::text, booking_time::text FROM bookings`
  );

  const bookedSlotsByDate: Record<string, string[]> = {};

  allBookingsRes.rows.forEach((row) => {
    const dateStr = row.booking_date;
    const timeStr = row.booking_time.substring(0, 5);

    if (!bookedSlotsByDate[dateStr]) {
      bookedSlotsByDate[dateStr] = [];
    }
    bookedSlotsByDate[dateStr].push(timeStr);
  });

  return { fullyBookedDates, bookedSlotsByDate };
}

// Обработчик для создания новой записи (POST)
export async function handleCreateBooking(body: CreateBookingInput) {
  const { serviceId, bookingDate, bookingTime, phone } = body ?? ({} as CreateBookingInput);

  if (!serviceId || !bookingDate || !bookingTime || !phone) {
    throw new ApiError(400, 'Все поля обязательны');
  }
  if (!DATE_RE.test(bookingDate)) {
    throw new ApiError(400, 'Некорректный формат даты');
  }
  if (!TIME_RE.test(bookingTime)) {
    throw new ApiError(400, 'Некорректный формат времени');
  }

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
    console.error('Ошибка базы данных при создании записи:', error);
    throw new ApiError(500, 'Ошибка базы данных');
  }

  // Запись сохранена — уведомляем мастера в Telegram (на стороне сервера).
  const text =
    body.message ??
    `🔔 Новая запись!\n📅 Дата: ${bookingDate}\n⏰ Время: ${bookingTime}\n📱 Телефон: ${normalizedPhone}`;
  await sendTelegramNotification(text);

  return { success: true, message: 'Вы успешно записаны!' };
}
