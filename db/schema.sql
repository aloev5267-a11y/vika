-- Схема базы данных для записи на сеансы электроэпиляции.
-- Применение на VPS:
--   psql "$DATABASE_URL" -f db/schema.sql
-- или:
--   psql -U postgres -d electroepil_db -f db/schema.sql

-- Справочник стандартных слотов времени.
-- Используется для расчёта "день полностью занят" (HAVING COUNT >= число слотов).
CREATE TABLE IF NOT EXISTS time_slots (
  id          SERIAL PRIMARY KEY,
  slot_time   TIME NOT NULL UNIQUE
);

-- Записи клиентов.
CREATE TABLE IF NOT EXISTS bookings (
  id            SERIAL PRIMARY KEY,
  service_id    TEXT        NOT NULL,
  booking_date  DATE        NOT NULL,
  booking_time  TIME        NOT NULL,
  phone         TEXT        NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Ключевое ограничение: одно и то же время в один день нельзя занять дважды.
  -- Именно нарушение этого ограничения (код 23505) обрабатывается в API как 409.
  CONSTRAINT bookings_unique_slot UNIQUE (booking_date, booking_time)
);

-- Индекс для быстрых выборок по дате.
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings (booking_date);

-- Наполняем справочник стандартными слотами (10:00–20:00 через 2 часа).
INSERT INTO time_slots (slot_time)
VALUES ('10:00'), ('12:00'), ('14:00'), ('16:00'), ('18:00'), ('20:00')
ON CONFLICT (slot_time) DO NOTHING;
