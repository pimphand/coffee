-- Add new columns to coffee_settings for Google Maps embed and
-- opening-time configuration (stored as string arrays per Drizzle schema).
ALTER TABLE coffee_settings
  ADD COLUMN IF NOT EXISTS google_maps_iframe text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS opening_time       text[] NOT NULL DEFAULT '{}';
