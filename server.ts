import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import {
  handleGetBookedSlots,
  handleCreateBooking,
  ApiError,
  type CreateBookingInput,
} from './api-server';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || '0.0.0.0';

app.use(express.json({ limit: '32kb' }));

// --- API ---
app.get('/api/booked-slots', async (_req, res) => {
  try {
    const data = await handleGetBookedSlots();
    res.json(data);
  } catch (err) {
    console.error('Ошибка GET /api/booked-slots:', err);
    res.status(500).json({ error: 'Ошибка сервера при получении данных' });
  }
});

app.post('/api/bookings', async (req, res) => {
  try {
    const result = await handleCreateBooking(req.body as CreateBookingInput);
    res.json(result);
  } catch (err) {
    if (err instanceof ApiError) {
      res.status(err.status).json({ error: err.message });
      return;
    }
    console.error('Ошибка POST /api/bookings:', err);
    res.status(500).json({ error: 'Ошибка сервера при записи' });
  }
});

// --- Раздача собранного фронтенда (vite build -> dist) ---
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

// SPA-fallback: любые не-API маршруты отдают index.html
app.get(/^(?!\/api\/).*/, (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, HOST, () => {
  console.log(`Сервер запущен на http://${HOST}:${PORT}`);
});
