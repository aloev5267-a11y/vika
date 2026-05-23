import { Pool } from 'pg';

// Создаем пул подключений к pgAdmin 4
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'electroepil_db',
  user: 'postgres',          // имя пользователя по умолчанию в pgAdmin
  password: 'mrtdtlevkv00808',    // введите пароль, который указывали при установке PostgreSQL
});

export const query = (text: string, params?: any[]) => pool.query(text, params);