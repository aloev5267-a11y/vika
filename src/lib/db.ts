import { Pool } from 'pg';

/**
 * Пул подключений к PostgreSQL.
 *
 * Никаких паролей в коде — все параметры берутся из переменных окружения.
 * Поддерживаются два способа конфигурации:
 *   1) Единая строка подключения DATABASE_URL
 *      (например: postgres://user:password@localhost:5432/electroepil_db)
 *   2) Отдельные переменные PGHOST / PGPORT / PGDATABASE / PGUSER / PGPASSWORD
 *
 * Значения по умолчанию заданы только для хоста/порта/имени БД — пароль
 * обязателен и должен приходить из окружения.
 */
const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        // Включите SSL, если ваша БД этого требует (управляется переменной окружения)
        ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : undefined,
      }
    : {
        host: process.env.PGHOST || 'localhost',
        port: Number(process.env.PGPORT) || 5432,
        database: process.env.PGDATABASE || 'electroepil_db',
        user: process.env.PGUSER || 'postgres',
        password: process.env.PGPASSWORD,
        ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : undefined,
      }
);

pool.on('error', (err) => {
  console.error('Неожиданная ошибка пула PostgreSQL:', err);
});

export const query = (text: string, params?: unknown[]) => pool.query(text, params);

export default pool;
