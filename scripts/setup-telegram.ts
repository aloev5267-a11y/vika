import 'dotenv/config';
import { tgSetWebhook } from '../telegram';

/**
 * Автоматическая регистрация Telegram-вебхука.
 * Запускается автоматически после сборки (npm script "postbuild").
 *
 * Требуемые переменные окружения:
 *   - TELEGRAM_BOT_TOKEN — токен бота;
 *   - PUBLIC_URL (или WEBHOOK_URL) — публичный адрес сайта, напр. https://example.com.
 *
 * Если переменные не заданы — скрипт НЕ роняет сборку, а лишь выводит предупреждение,
 * чтобы локальная сборка/CI без секретов всё равно проходили успешно.
 */
async function main() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const publicUrl = process.env.PUBLIC_URL || process.env.WEBHOOK_URL;

  if (!token) {
    console.warn('[setup-telegram] TELEGRAM_BOT_TOKEN не задан — пропускаю настройку вебхука.');
    return;
  }
  if (!publicUrl) {
    console.warn(
      '[setup-telegram] PUBLIC_URL (или WEBHOOK_URL) не задан — пропускаю настройку вебхука.\n' +
        '  Укажите публичный адрес сайта, чтобы кнопки в Telegram заработали, напр.:\n' +
        '  PUBLIC_URL=https://ваш-домен.ru'
    );
    return;
  }

  const ok = await tgSetWebhook(publicUrl);
  if (!ok) {
    console.warn('[setup-telegram] Не удалось установить вебхук (см. ошибку выше).');
  }
}

// Никогда не валим сборку из-за проблем с Telegram.
main().catch((e) => {
  console.error('[setup-telegram] Непредвиденная ошибка:', e);
});
