import { Pool } from 'pg';
import type { PoolConfig } from 'pg';

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
 *
 * SSL:
 *   - PGSSL=true            — включить SSL с проверкой сертификата (безопасно, по умолчанию для SSL).
 *   - PGSSL_NO_VERIFY=true  — отключить проверку сертификата (ТОЛЬКО для self-signed/dev).
 */
function buildSslConfig(): PoolConfig['ssl'] {
  if (process.env.PGSSL !== 'true') return undefined;
  // Проверку сертификата отключаем только при явном опасном флаге.
  return process.env.PGSSL_NO_VERIFY === 'true' ? { rejectUnauthorized: false } : { rejectUnauthorized: true };
}

const ssl = buildSslConfig();

const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl,
      }
    : {
        host: process.env.PGHOST || 'localhost',
        port: Number(process.env.PGPORT) || 5432,
        database: process.env.PGDATABASE || 'electroepil_db',
        user: process.env.PGUSER || 'postgres',
        password: process.env.PGPASSWORD,
        ssl,
      }
);

pool.on('error', (err) => {
  console.error('Неожиданная ошибка пула PostgreSQL:', err);
});

export const query = (text: string, params?: unknown[]) => pool.query(text, params);

export default pool;
