-- 001_initial.sql
-- Brew Haven Supabase Postgres schema — all tables use the `coffee_` prefix
-- per project convention. Run this in Supabase Studio's SQL editor (or via
-- `psql $SUPABASE_DATABASE_URL -f 001_initial.sql`) before starting the
-- dev server. Requires the `pgcrypto` extension for `gen_random_uuid()`.
--
-- After tables are created, seed at least one admin user:
--   INSERT INTO coffee_users (email, name, password_hash, role)
--   VALUES ('admin@brewhaven.cafe', 'Admin',
--           crypt('your-password', gen_salt('bf', 10)), 'admin');

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ─── Users / sessions ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS coffee_users (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email         text UNIQUE NOT NULL,
  name          text NOT NULL DEFAULT '',
  password_hash text NOT NULL,
  role          text NOT NULL DEFAULT 'admin' CHECK (role IN ('admin','editor')),
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_coffee_users_email ON coffee_users (email);

CREATE TABLE IF NOT EXISTS coffee_sessions (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES coffee_users(id) ON DELETE CASCADE,
  token      text UNIQUE NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_coffee_sessions_token ON coffee_sessions (token);
CREATE INDEX IF NOT EXISTS idx_coffee_sessions_user  ON coffee_sessions (user_id);

-- ─── Menu items (used on /menu, /menu-list, /admin/menu-items) ───
-- `section` keeps coffee and pastries/snacks in one table so the admin
-- can group them later; for now `/menu` renders sections via position.
CREATE TABLE IF NOT EXISTS coffee_menu_items (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          text UNIQUE NOT NULL,
  section       text NOT NULL DEFAULT 'coffee'
                  CHECK (section IN ('coffee','sweet','list')),
  title_en      text NOT NULL,
  title_id      text NOT NULL,
  desc_en       text NOT NULL DEFAULT '',
  desc_id       text NOT NULL DEFAULT '',
  price         text NOT NULL DEFAULT '',
  img           text NOT NULL DEFAULT '',
  position      int  NOT NULL DEFAULT 0,
  is_published  boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_coffee_menu_items_section_pub
  ON coffee_menu_items (section, is_published, position);

-- ─── Chefs (used on /team and /about's "Our Chefs" if added) ──────
CREATE TABLE IF NOT EXISTS coffee_chefs (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          text UNIQUE NOT NULL,
  name          text NOT NULL,             -- proper noun, single column
  role_en       text NOT NULL,
  role_id       text NOT NULL,
  img           text NOT NULL DEFAULT '',
  bio_en        text NOT NULL DEFAULT '',
  bio_id        text NOT NULL DEFAULT '',
  position      int  NOT NULL DEFAULT 0,
  is_published  boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_coffee_chefs_pub
  ON coffee_chefs (is_published, position);

-- ─── Blog posts (used on /, /blog, /about's "Our Recent Posts") ──
CREATE TABLE IF NOT EXISTS coffee_blog_posts (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          text UNIQUE NOT NULL,
  title_en      text NOT NULL,
  title_id      text NOT NULL,
  excerpt_en    text NOT NULL DEFAULT '',
  excerpt_id    text NOT NULL DEFAULT '',
  content_en    text NOT NULL DEFAULT '',
  content_id    text NOT NULL DEFAULT '',
  image         text NOT NULL DEFAULT '',
  author_name   text NOT NULL DEFAULT 'Brew Haven',
  published_at  timestamptz NOT NULL DEFAULT now(),
  is_published  boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_coffee_blog_posts_pub
  ON coffee_blog_posts (is_published, published_at DESC);
