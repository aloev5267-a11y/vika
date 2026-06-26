export interface Service {
  id: string;
  title: string;
  desc: string;
  price: string;
}

export interface Testimonial {
  text: string;
  author: string;
}

/**
 * Единый источник данных об услугах.
 * Идентификаторы (id) согласованы с тем, что сохраняется в БД (service_id).
 */
export const services: Service[] = [
  { id: 'face', title: 'Лицо', desc: 'Удаление волос над губой, на подбородке и щеках.', price: '40 BYN' },
  { id: 'body', title: 'Тело', desc: 'Руки, ноги, спина. Полная гладкость навсегда.', price: '40 BYN' },
  { id: 'bikini', title: 'Бикини', desc: 'Деликатные зоны. Комфорт и гигиена.', price: '40 BYN' },
  { id: 'legs', title: 'Ноги полностью', desc: 'Безупречный результат для ваших ног.', price: '40 BYN' },
];

export const testimonials: Testimonial[] = [
  { text: 'Лучшее решение в моей жизни. Эффект виден уже через пару процедур!', author: 'Анна С.' },
  { text: 'Очень бережно и профессионально.', author: 'Мария К.' },
  { text: 'Лазер не помогал, а электроэпиляция справилась на 100%.', author: 'Елена В.' },
];

/** Стандартные слоты времени. Должны совпадать с db/schema.sql (time_slots). */
export const timeSlots: string[] = ['10:00', '12:00', '14:00', '16:00', '18:00', '20:00'];
