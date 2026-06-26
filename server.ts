import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import multer from 'multer';
import { dispatchApi, ApiError, isAuthed } from './api-server';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || '0.0.0.0';

app.use(express.json({ limit: '1mb' }));

// --- Папка загрузок (фото до/после, фото мастера) ---
const uploadsDir = path.join(__dirname, 'uploads');
fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase().replace(/[^.a-z0-9]/g, '');
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext || '.jpg'}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 }, // 8 МБ
  fileFilter: (_req, file, cb) => cb(null, file.mimetype.startsWith('image/')),
});

function getToken(req: express.Request): string | undefined {
  const h = req.headers.authorization;
  return h?.startsWith('Bearer ') ? h.slice(7) : undefined;
}

// --- Загрузка изображения (только для админа) ---
app.post('/api/admin/upload', (req, res) => {
  if (!isAuthed(getToken(req))) {
    res.status(401).json({ error: 'Требуется авторизация' });
    return;
  }
  upload.single('file')(req, res, (err) => {
    if (err || !req.file) {
      res.status(400).json({ error: 'Не удалось загрузить файл' });
      return;
    }
    res.json({ url: `/uploads/${req.file.filename}` });
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
