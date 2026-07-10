-- 002_settings.sql
-- Brew Haven site-wide settings — single-row configuration table.
-- Stores active languages, default language, and future site config.
-- Run after 001_initial.sql.

CREATE TABLE IF NOT EXISTS coffee_settings (
  id                integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  default_language  text NOT NULL DEFAULT 'en'
                      CHECK (default_language IN ('en','id','cn')),
  active_languages  text[] NOT NULL DEFAULT ARRAY['en','id','cn'],
  updated_at        timestamptz NOT NULL DEFAULT now()
);

-- Insert the singleton row if it doesn't exist yet
INSERT INTO coffee_settings (id, default_language, active_languages)
VALUES (1, 'en', ARRAY['en','id','cn'])
ON CONFLICT (id) DO NOTHING;
