// Глобальные типы для сторонних скриптов, подключённых в index.html

interface Window {
  /** Глобальная функция Яндекс.Метрики (подключается в index.html). */
  ym?: (counterId: number, action: string, ...params: unknown[]) => void;
}
