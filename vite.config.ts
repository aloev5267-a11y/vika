import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import { defineConfig } from 'vite';
import { dispatchApi, ApiError, isAuthed } from './api-server.ts';
import { optimizeUpload } from './optimize-upload.ts';
import { ensureUploadsDir, createUploader, getBearerToken } from './upload-handler.ts';

const uploadsDir = ensureUploadsDir(__dirname);
const upload = createUploader(uploadsDir);

function getToken(req: { headers: Record<string, unknown> }): string | undefined {
  return getBearerToken(req.headers);
}

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'vite-backend-api',
        configureServer(server) {
          // Раздача загруженных файлов в dev
          server.middlewares.use('/uploads', (req, res, next) => {
            const filePath = path.join(uploadsDir, decodeURIComponent((req.url || '').split('?')[0]));
            if (filePath.startsWith(uploadsDir) && fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
              fs.createReadStream(filePath).pipe(res);
            } else {
              next();
            }
          });

          server.middlewares.use(async (req, res, next) => {
            const url = req.url || '';
            if (!url.startsWith('/api/')) return next();

            const pathname = url.split('?')[0];
            const send = (status: number, data: unknown) => {
              res.statusCode = status;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(data));
            };

            // Загрузка изображения
            if (pathname === '/api/admin/upload' && req.method === 'POST') {
              if (!isAuthed(getToken(req as any))) return send(401, { error: 'Требуется авторизация' });
              upload.single('file')(req as any, res as any, async (err: unknown) => {
                const file = (req as any).file;
                if (err || !file) return send(400, { error: 'Не удалось загрузить файл' });
                const optimized = await optimizeUpload(uploadsDir, file.filename);
                send(200, { url: `/uploads/${optimized}` });
              });
              return;
            }

            // Остальные JSON-маршруты
            let raw = '';
            req.on('data', (chunk) => (raw += chunk));
            req.on('end', async () => {
              try {
                const body = raw ? JSON.parse(raw) : undefined;
                const result = await dispatchApi({
                  method: req.method || 'GET',
                  path: pathname,
                  body,
                  token: getToken(req as any),
                  secretToken: req.headers['x-telegram-bot-api-secret-token'] as string | undefined,
                });
                send(200, result);
              } catch (err) {
                if (err instanceof ApiError) return send(err.status, { error: err.message });
                console.error('Ошибка API (dev):', err);
                send(500, { error: 'Ошибка сервера' });
              }
            });
          });
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
