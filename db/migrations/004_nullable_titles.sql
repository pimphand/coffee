-- 004_nullable_titles.sql
-- Make blog post titles nullable — a post can be written in just one
-- language, with titles in other languages left NULL.
-- The `i18n/utils.ts` localizeBlogPost() function already falls back
-- from NULL to the default-locale title.

ALTER TABLE coffee_blog_posts
  ALTER COLUMN title_en DROP NOT NULL,
  ALTER COLUMN title_id DROP NOT NULL,
  ALTER COLUMN title_cn DROP NOT NULL;
