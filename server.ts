import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import { dispatchApi, ApiError, isAuthed } from './api-server';
import { optimizeUpload } from './optimize-upload';
import { ensureUploadsDir, createUploader, getBearerToken } from './upload-handler';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || '0.0.0.0';

app.use(express.json({ limit: '1mb' }));

// --- Папка загрузок (фото до/после, фото мастера) ---
const uploadsDir = ensureUploadsDir(__dirname);
const upload = createUploader(uploadsDir);

function getToken(req: express.Request): string | undefined {
  return getBearerToken(req.headers as Record<string, unknown>);
}

// --- Загрузка изображения (только для админа) ---
app.post('/api/admin/upload', (req, res) => {
  if (!isAuthed(getToken(req))) {
    res.status(401).json({ error: 'Требуется авторизация' });
    return;
  }
  upload.single('file')(req, res, async (err) => {
    if (err || !req.file) {
      res.status(400).json({ error: 'Не удалось загрузить файл' });
      return;
    }
    const optimized = await optimizeUpload(uploadsDir, req.file.filename);
    res.json({ url: `/uploads/${optimized}` });
  });
});

// --- Единый JSON-обработчик API ---
app.all(/^\/api\/.*/, async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    const result = await dispatchApi({
      method: req.method,
      path: url.pathname,
      body: req.body,
      token: getToken(req),
      secretToken: req.headers['x-telegram-bot-api-secret-token'] as string | undefined,
    });
    res.json(result);
  } catch (err) {
    if (err instanceof ApiError) {
      res.status(err.status).json({ error: err.message });
      return;
    }
    console.error('Ошибка API:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// --- Раздача загрузок и собранного фронтенда ---
app.use('/uploads', express.static(uploadsDir));
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

// SPA-fallback
app.get(/^(?!\/api\/).*/, (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, HOST, () => {
  console.log(`Сервер запущен на http://${HOST}:${PORT}`);
});
