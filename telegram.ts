import crypto from 'crypto';

/**
 * Серверный модуль работы с Telegram Bot API.
 *
 * Используется:
 *   - api-server.ts        — отправка уведомлений о новых записях, обработка нажатий кнопок;
 *   - scripts/setup-telegram.ts — автоматическая регистрация вебхука при сборке.
 *
 * Все секреты берутся из переменных окружения:
 *   - TELEGRAM_BOT_TOKEN     — токен бота (обязателен для любой отправки);
 *   - TELEGRAM_CHAT_ID       — чат/группа администратора, куда падают заявки;
 *   - TELEGRAM_WEBHOOK_SECRET (необязательно) — секрет для проверки вебхука.
 *     Если не задан — выводится стабильно из токена бота, чтобы «всё работало сразу».
 */

const API_BASE = (method: string) =>
  `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/${method}`;

/** Настроен ли Telegram (есть токен и чат). */
export function isTelegramConfigured(): boolean {
  return Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID);
}

/**
 * Секрет для проверки входящих вебхуков Telegram.
 * Telegram присылает его в заголовке `X-Telegram-Bot-Api-Secret-Token`.
 * Если переменная окружения не задана — выводим детерминированно из токена бота,
 * чтобы вебхук работал без дополнительной настройки, но при этом был защищён.
 */
export function getWebhookSecret(): string {
  const explicit = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (explicit && explicit.trim()) return explicit.trim();
  const token = process.env.TELEGRAM_BOT_TOKEN || '';
  // Только допустимые для Telegram символы (A-Z a-z 0-9 _ -), длина ≤ 256.
  return crypto.createHash('sha256').update(`wh:${token}`).digest('hex').slice(0, 48);
}

/** Сравнение секрета вебхука за постоянное время. */
export function verifyWebhookSecret(received: string | undefined): boolean {
  const expected = getWebhookSecret();
  if (!received) return false;
  const a = Buffer.from(received, 'utf8');
  const b = Buffer.from(expected, 'utf8');
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export interface InlineButton {
  text: string;
  callback_data: string;
}

/**
 * Отправляет сообщение администратору. Возвращает message_id (для последующего
 * редактирования) или null, если Telegram не настроен / произошла ошибка.
 */
export async function tgSendMessage(
  text: string,
  inlineKeyboard?: InlineButton[][]
): Promise<number | null> {
  if (!isTelegramConfigured()) {
    console.warn('Telegram не настроен — сообщение пропущено.');
    return null;
  }
  try {
    const res = await fetch(API_BASE('sendMessage'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: process.env.TELEGRAM_CHAT_ID,
        text,
        parse_mode: 'HTML',
        ...(inlineKeyboard ? { reply_markup: { inline_keyboard: inlineKeyboard } } : {}),
      }),
    });
    const data = (await res.json().catch(() => ({}))) as {
      ok?: boolean;
      result?: { message_id?: number };
    };
    if (!res.ok || !data.ok) {
      console.error('Telegram sendMessage ошибка:', res.status, JSON.stringify(data));
      return null;
    }
    return data.result?.message_id ?? null;
  } catch (e) {
    console.error('Ошибка при отправке в Telegram:', e);
    return null;
  }
}

/**
 * Редактирует ранее отправленное сообщение (например, чтобы убрать кнопки
 * и показать итоговый статус заявки). Ошибки не критичны.
 */
export async function tgEditMessage(messageId: number, text: string): Promise<void> {
  if (!isTelegramConfigured()) return;
  try {
    const res = await fetch(API_BASE('editMessageText'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: process.env.TELEGRAM_CHAT_ID,
        message_id: messageId,
        text,
        parse_mode: 'HTML',
        reply_markup: { inline_keyboard: [] }, // убираем кнопки после решения
      }),
    });
    if (!res.ok) console.error('Telegram editMessageText ошибка:', res.status, await res.text());
  } catch (e) {
    console.error('Ошибка при редактировании сообщения Telegram:', e);
  }
}

/** Отвечает на нажатие inline-кнопки (всплывающее уведомление у админа). */
export async function tgAnswerCallback(callbackQueryId: string, text: string): Promise<void> {
  if (!process.env.TELEGRAM_BOT_TOKEN) return;
  try {
    await fetch(API_BASE('answerCallbackQuery'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ callback_query_id: callbackQueryId, text }),
    });
  } catch (e) {
    console.error('Ошибка answerCallbackQuery:', e);
  }
}

/**
 * Регистрирует вебхук в Telegram. Вызывается из postbuild-скрипта.
 * publicUrl — публичный адрес сайта (например, https://example.com).
 */
export async function tgSetWebhook(publicUrl: string): Promise<boolean> {
  if (!process.env.TELEGRAM_BOT_TOKEN) {
    console.warn('[telegram] TELEGRAM_BOT_TOKEN не задан — вебхук не настроен.');
    return false;
  }
  const url = `${publicUrl.replace(/\/$/, '')}/api/telegram/webhook`;
  try {
    const res = await fetch(API_BASE('setWebhook'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url,
        secret_token: getWebhookSecret(),
        allowed_updates: ['callback_query'],
        drop_pending_updates: false,
      }),
    });
    const data = (await res.json().catch(() => ({}))) as { ok?: boolean; description?: string };
    if (!res.ok || !data.ok) {
      console.error('[telegram] setWebhook ошибка:', res.status, JSON.stringify(data));
      return false;
    }
    console.log(`[telegram] Вебхук успешно установлен: ${url}`);
    return true;
  } catch (e) {
    console.error('[telegram] Ошибка при установке вебхука:', e);
    return false;
  }
}
