import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
// Импортируем функции бэкенда для работы с PostgreSQL
import { handleGetBookedSlots, handleCreateBooking } from './api-server.ts';

export default defineConfig(() => {
  return {
    plugins: [
      react(), 
      tailwindcss(),
      // Наш кастомный плагин-перехватчик для API запросов к БД
      {
        name: 'vite-backend-api',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            
            // 1. Обработка GET /api/booked-slots (Получение занятых мест)
            if (req.url === '/api/booked-slots' && req.method === 'GET') {
              try {
                const data = await handleGetBookedSlots();
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(data));
              } catch (err) {
                res.statusCode = 500;
                res.end(JSON.stringify({ error: 'Ошибка сервера при получении данных' }));
              }
              return;
            }

            // 2. Обработка POST /api/bookings (Создание новой записи)
            if (req.url === '/api/bookings' && req.method === 'POST') {
              let body = '';
              req.on('data', chunk => { body += chunk; });
              req.on('end', async () => {
                try {
                  const parsedBody = JSON.parse(body);
                  const result = await handleCreateBooking(parsedBody);
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify(result));
                } catch (err: any) {
                  res.statusCode = err.status || 500;
                  res.end(JSON.stringify({ error: err.message || 'Ошибка сервера при записи' }));
                }
              });
              return;
            }

            next();
          });
        }
      }
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});