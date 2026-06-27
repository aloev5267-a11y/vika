// Общая логика загрузки изображений — используется и Express (server.ts),
// и Vite dev-сервером (vite.config.ts), чтобы не дублировать настройку multer.
import fs from 'fs';
import path from 'path';
import multer from 'multer';

/** Создаёт (при необходимости) и возвращает путь к папке загрузок. */
export function ensureUploadsDir(baseDir: string): string {
  const dir = path.join(baseDir, 'uploads');
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

/** Создаёт инстанс multer с безопасным именованием файлов и лимитами. */
export function createUploader(uploadsDir: string) {
  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadsDir),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase().replace(/[^.a-z0-9]/g, '');
      cb(null, `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext || '.jpg'}`);
    },
  });
  return multer({
    storage,
    limits: { fileSize: 8 * 1024 * 1024 }, // 8 МБ
    fileFilter: (_req, file, cb) => cb(null, file.mimetype.startsWith('image/')),
  });
}

/** Извлекает Bearer-токен из заголовков запроса. */
export function getBearerToken(headers: Record<string, unknown>): string | undefined {
  const h = headers['authorization'];
  return typeof h === 'string' && h.startsWith('Bearer ') ? h.slice(7) : undefined;
}
