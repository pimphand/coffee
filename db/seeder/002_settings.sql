-- Pengaturan situs default: bahasa Inggris sebagai default, 3 bahasa aktif.
-- Jalankan setelah 001_users.sql (npm run db:seed).

INSERT INTO coffee_settings (id, default_language, active_languages, google_maps_iframe, opening_time, updated_at)
VALUES (1, 'en', '["en","id","cn"]', '', '[]', unixepoch())
ON CONFLICT (id) DO UPDATE SET
  default_language   = excluded.default_language,
  active_languages   = excluded.active_languages,
  google_maps_iframe = excluded.google_maps_iframe,
  opening_time       = excluded.opening_time,
  updated_at         = unixepoch();
