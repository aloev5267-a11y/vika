import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

/**
 * Сжимает загруженное изображение в WebP (макс. 1280px, q72), удаляет оригинал
 * и возвращает имя нового файла. При ошибке возвращает исходное имя.
 */
export async function optimizeUpload(uploadsDir: string, filename: string): Promise<string> {
  const src = path.join(uploadsDir, filename);
  const base = path.parse(filename).name;
  const outName = `${base}.webp`;
  const out = path.join(uploadsDir, outName);

  try {
    await sharp(src)
      .rotate() // учесть EXIF-ориентацию
      .resize({ width: 1280, height: 1280, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 72, effort: 6 })
      .toFile(out);

    if (out !== src) fs.promises.unlink(src).catch(() => {});
    return outName;
  } catch (err) {
    console.error('Не удалось оптимизировать изображение:', err);
    return filename;
  }
}
