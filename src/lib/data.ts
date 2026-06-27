// Реэкспорт общих данных из единого конфига (src/lib/config.ts).
// Файл сохранён для обратной совместимости импортов вида `from './lib/data'`.

export type { Service } from './config';
export { SERVICES as services, TIME_SLOTS as timeSlots } from './config';
