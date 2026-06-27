// Единый источник правды для общих констант приложения.
// Используется и фронтендом (React), и бэкендом (api-server.ts),
// чтобы исключить рассинхрон цен, слотов и списка услуг.

export interface Service {
  id: string;
  title: string;
  desc: string;
  price: string;
}

/** Фиксированная стоимость одного сеанса (оплата за час работы, а не за зону). */
export const SESSION_PRICE = 40;

/** Валюта прайса. */
export const CURRENCY = 'BYN';

/** Готовая строка цены, например "40 BYN". */
export const PRICE_LABEL = `${SESSION_PRICE} ${CURRENCY}`;

/** Строка цены с указанием единицы времени, например "40 BYN / час". */
export const PRICE_PER_HOUR_LABEL = `${SESSION_PRICE} ${CURRENCY} / час`;

/** ID счётчика Яндекс.Метрики. Должен совпадать со счётчиком в index.html. */
export const YANDEX_METRIKA_ID = 110161298;

/**
 * Стандартные почасовые слоты времени (fallback, если БД недоступна).
 * Должны совпадать с db/schema.sql (таблица time_slots).
 */
export const TIME_SLOTS: string[] = [
  '10:00', '11:00', '12:00', '13:00', '14:00', '15:00',
  '16:00', '17:00', '18:00', '19:00', '20:00',
];

/**
 * Единый список услуг. Идентификаторы (id) согласованы с тем,
 * что сохраняется в БД (bookings.service_id).
 */
export const SERVICES: Service[] = [
  { id: 'body', title: 'Тело', desc: 'Руки, ноги, спина. Полная гладкость навсегда.', price: PRICE_LABEL },
  { id: 'bikini', title: 'Бикини', desc: 'Деликатные зоны. Комфорт и гигиена.', price: PRICE_LABEL },
  { id: 'legs', title: 'Ноги полностью', desc: 'Безупречный результат для ваших ног.', price: PRICE_LABEL },
];

/** Множество валидных id услуг — для серверной валидации. */
export const SERVICE_IDS = new Set(SERVICES.map((s) => s.id));

/** Соответствие id услуги → человекочитаемый заголовок. */
export const SERVICE_TITLES: Record<string, string> = Object.fromEntries(
  SERVICES.map((s) => [s.id, s.title])
);
