-- Default site settings: English default, all 3 languages active.
-- Run after 001_users.sql.
INSERT INTO coffee_settings (id, default_language, active_languages)
VALUES (1, 'en', ARRAY['en','id','cn'])
ON CONFLICT (id)
DO UPDATE SET
  default_language = EXCLUDED.default_language,
  active_languages = EXCLUDED.active_languages,
  updated_at       = now();
