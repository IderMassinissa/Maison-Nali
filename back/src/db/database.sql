-- Schéma source de la base applicative (back/data/maison-nali.sqlite),
-- appliqué par init.js (`npm run init-db`) sur une base neuve. Tenu à jour
-- manuellement après chaque évolution de schéma — colonnes ajoutées après
-- coup par ALTER TABLE visibles ici en fin de CREATE TABLE d'origine
-- (announcements.start_date/end_date, products.focus_x/focus_y/position).
-- Les sessions (table "sessions") vivent dans un fichier séparé
-- (back/data/sessions.sqlite), créé au runtime par sqliteSessionStore.js,
-- pas dans ce fichier.

CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email VARCHAR NOT NULL UNIQUE,
  password_hash VARCHAR NOT NULL
);

CREATE TABLE pages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug VARCHAR NOT NULL UNIQUE,
  title VARCHAR NOT NULL,
  position INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE sections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type VARCHAR NOT NULL,
  position INTEGER NOT NULL,
  content TEXT,
  page_id INTEGER NOT NULL,
  FOREIGN KEY (page_id) REFERENCES pages(id)
);

CREATE TABLE categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR NOT NULL
);

CREATE TABLE products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR NOT NULL,
  description TEXT,
  photo_url VARCHAR,
  video_url VARCHAR,
  category_id INTEGER,
  focus_x INTEGER DEFAULT 50,
  focus_y INTEGER DEFAULT 50,
  position INTEGER DEFAULT 0,
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

CREATE TABLE announcements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  message VARCHAR NOT NULL,
  active BOOLEAN NOT NULL DEFAULT 0,
  start_date TEXT,
  end_date TEXT
);

CREATE TABLE opening_hours (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  day VARCHAR NOT NULL,
  open_time TIME,
  close_time TIME
);

CREATE UNIQUE INDEX idx_opening_hours_day ON opening_hours(day);

CREATE TABLE settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key VARCHAR NOT NULL UNIQUE,
  value VARCHAR
);

CREATE TABLE event_photos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  image_url TEXT NOT NULL,
  alt TEXT,
  position INTEGER NOT NULL DEFAULT 0
);
