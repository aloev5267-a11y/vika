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

-- ============================================================
-- КОНТЕНТ, УПРАВЛЯЕМЫЙ ИЗ АДМИН-ПАНЕЛИ
-- ============================================================

-- Отзывы клиентов ("Ощущения клиентов").
CREATE TABLE IF NOT EXISTS testimonials (
  id          SERIAL PRIMARY KEY,
  author      TEXT NOT NULL,
  text        TEXT NOT NULL,
  sort_order  INT  NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Галерея "до/после". Используется и в hero, и в отдельной секции.
CREATE TABLE IF NOT EXISTS before_after (
  id            SERIAL PRIMARY KEY,
  title         TEXT NOT NULL DEFAULT '',
  image_before  TEXT NOT NULL,
  image_after   TEXT NOT NULL,
  sort_order    INT  NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Преимущества (блок "Почему мы").
CREATE TABLE IF NOT EXISTS advantages (
  id           SERIAL PRIMARY KEY,
  icon         TEXT NOT NULL DEFAULT 'sparkles',
  title        TEXT NOT NULL,
  description  TEXT NOT NULL,
  sort_order   INT  NOT NULL DEFAULT 0
);

-- Простое key-value хранилище настроек сайта (адрес, карта, телефон, о мастере).
CREATE TABLE IF NOT EXISTS site_settings (
  key    TEXT PRIMARY KEY,
  value  TEXT NOT NULL DEFAULT ''
);

-- Значения по умолчанию для настроек (белорусские контакты).
INSERT INTO site_settings (key, value) VALUES
  ('phone',            '+375 33 681 5427'),
  ('address',          'г. Минск, ул. Примерная, 1'),
  ('map_embed',        ''),
  ('master_name',      'Виктория'),
  ('master_experience','Более 7 лет опыта в электроэпиляции'),
  ('master_bio',       'Сертифицированный специалист по электроэпиляции. Индивидуальный подход, стерильные одноразовые инструменты и забота о каждом клиенте.'),
  ('master_photo',     '/master.jpg'),
  ('master_certificates', '[]')
ON CONFLICT (key) DO NOTHING;

-- Стартовое наполнение отзывов (можно отредактировать в админке).
INSERT INTO testimonials (author, text, sort_order)
SELECT * FROM (VALUES
  ('Анна С.', 'Лучшее решение в моей жизни. Эффект виден уже через пару процедур!', 1),
  ('Мария К.', 'Очень бережно и профессионально.', 2),
  ('Елена В.', 'Лазер не помогал, а электроэпиляция справилась на 100%.', 3)
) AS v(author, text, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM testimonials);

-- Стартовое наполнение галереи "до/после".
INSERT INTO before_after (title, image_before, image_after, sort_order)
SELECT * FROM (VALUES
  ('Ноги полностью', '/placeholders/legs-before.webp',     '/placeholders/legs-after.webp',     1),
  ('Руки',           '/placeholders/arm-before.webp',      '/placeholders/arm-after.webp',      2),
  ('Колени',         '/placeholders/knee-before.webp',     '/placeholders/knee-after.webp',     3),
  ('Плечи',          '/placeholders/shoulder-before.webp', '/placeholders/shoulder-after.webp', 4),
  ('Подмышки',       '/placeholders/underarm-before.webp', '/placeholders/underarm-after.webp', 5),
  ('Спина',          '/placeholders/back-before.webp',     '/placeholders/back-after.webp',     6)
) AS v(title, image_before, image_after, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM before_after);

-- Стартовое наполнение преимуществ.
INSERT INTO advantages (icon, title, description, sort_order)
SELECT * FROM (VALUES
  ('infinity', 'Навсегда', 'Электроэпиляция — единственный метод удаления волос навсегда.', 1),
  ('shield', 'Стерильность', 'Только одноразовые стерильные иглы и инструменты.', 2),
  ('heart', 'Бережно', 'Индивидуальный подход и комфорт на каждой процедуре.', 3),
  ('award', 'Опыт', 'Сертифицированный мастер с многолетней практикой.', 4)
) AS v(icon, title, description, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM advantages);
