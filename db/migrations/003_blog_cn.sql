-- 003_blog_cn.sql
-- Add Chinese (cn) locale columns to coffee_blog_posts for trilingual support.

ALTER TABLE coffee_blog_posts
  ADD COLUMN IF NOT EXISTS title_cn   text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS excerpt_cn text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS content_cn text NOT NULL DEFAULT '';
