import { sql } from 'drizzle-orm';
import {
  sqliteTable, text, integer, uniqueIndex, index,
} from 'drizzle-orm/sqlite-core';

// ─── Catatan D1 / SQLite ─────────────────────────────────────────
// Skema ini semula PostgreSQL (Supabase). Di D1 (SQLite):
//   * uuid         → TEXT dengan default berbentuk uuid dari randomblob()
//   * timestamptz  → INTEGER unix epoch (drizzle `mode: 'timestamp'`)
//   * boolean      → INTEGER 0/1       (drizzle `mode: 'boolean'`)
//   * text[]       → TEXT JSON         (drizzle `mode: 'json'`)
// Semua nama properti JS tetap snake_case agar cocok dengan kode yang ada.

// uuid-shaped default (36 karakter) — SQLite tidak punya gen_random_uuid()
const uuidDefault = sql`(lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-' || lower(hex(randomblob(2))) || '-' || lower(hex(randomblob(2))) || '-' || lower(hex(randomblob(6))))`;
const nowDefault = sql`(unixepoch())`;

const idColumn = () => text('id').default(uuidDefault).primaryKey();
const tsColumn = (name: string) => integer(name, { mode: 'timestamp' }).notNull().default(nowDefault);

// ─── Users / sessions ────────────────────────────────────────────
export const coffee_users = sqliteTable('coffee_users', {
  id:            idColumn(),
  email:         text('email').notNull(),
  name:          text('name').notNull().default(''),
  password_hash: text('password_hash').notNull(),
  role:          text('role', { enum: ['admin', 'editor'] }).notNull().default('admin'),
  created_at:    tsColumn('created_at'),
  updated_at:    tsColumn('updated_at'),
}, (t) => [
  uniqueIndex('uq_coffee_users_email').on(t.email),
]);

export const coffee_sessions = sqliteTable('coffee_sessions', {
  id:         idColumn(),
  user_id:    text('user_id').notNull().references(() => coffee_users.id, { onDelete: 'cascade' }),
  token:      text('token').notNull(),
  expires_at: integer('expires_at', { mode: 'timestamp' }).notNull(),
  created_at: tsColumn('created_at'),
}, (t) => [
  uniqueIndex('uq_coffee_sessions_token').on(t.token),
  index('idx_coffee_sessions_user').on(t.user_id),
]);

// ─── Menu items ──────────────────────────────────────────────────
export const coffee_menu_items = sqliteTable('coffee_menu_items', {
  id:           idColumn(),
  slug:         text('slug').notNull(),
  section:      text('section', { enum: ['coffee', 'sweet', 'list'] }).notNull().default('coffee'),
  title_en:     text('title_en').notNull(),
  title_id:     text('title_id').notNull(),
  desc_en:      text('desc_en').notNull().default(''),
  desc_id:      text('desc_id').notNull().default(''),
  price:        text('price').notNull().default(''),
  img:          text('img').notNull().default(''),
  position:     integer('position').notNull().default(0),
  is_published: integer('is_published', { mode: 'boolean' }).notNull().default(true),
  created_at:   tsColumn('created_at'),
  updated_at:   tsColumn('updated_at'),
}, (t) => [
  uniqueIndex('uq_coffee_menu_items_slug').on(t.slug),
  index('idx_coffee_menu_items_section_pub').on(t.section, t.is_published, t.position),
]);

// ─── Chefs ───────────────────────────────────────────────────────
export const coffee_chefs = sqliteTable('coffee_chefs', {
  id:           idColumn(),
  slug:         text('slug').notNull(),
  name:         text('name').notNull(),
  role_en:      text('role_en').notNull(),
  role_id:      text('role_id').notNull(),
  img:          text('img').notNull().default(''),
  bio_en:       text('bio_en').notNull().default(''),
  bio_id:       text('bio_id').notNull().default(''),
  position:     integer('position').notNull().default(0),
  is_published: integer('is_published', { mode: 'boolean' }).notNull().default(true),
  created_at:   tsColumn('created_at'),
  updated_at:   tsColumn('updated_at'),
}, (t) => [
  uniqueIndex('uq_coffee_chefs_slug').on(t.slug),
  index('idx_coffee_chefs_pub').on(t.is_published, t.position),
]);

// ─── Blog posts ──────────────────────────────────────────────────
export const coffee_blog_posts = sqliteTable('coffee_blog_posts', {
  id:            idColumn(),
  slug:          text('slug').unique().notNull(),
  title_en:      text('title_en'),
  title_id:      text('title_id'),
  title_cn:      text('title_cn'),
  excerpt_en:    text('excerpt_en').notNull().default(''),
  excerpt_id:    text('excerpt_id').notNull().default(''),
  excerpt_cn:    text('excerpt_cn').notNull().default(''),
  content_en:    text('content_en').notNull().default(''),
  content_id:    text('content_id').notNull().default(''),
  content_cn:    text('content_cn').notNull().default(''),
  image:         text('image').notNull().default(''),
  author_name:   text('author_name').notNull().default('Brew Haven'),
  published_at:  tsColumn('published_at'),
  is_published:  integer('is_published', { mode: 'boolean' }).notNull().default(true),
  created_at:    tsColumn('created_at'),
  updated_at:    tsColumn('updated_at'),
}, (t) => [
  index('idx_coffee_blog_posts_pub').on(t.is_published, t.published_at),
]);

// ─── Settings ────────────────────────────────────────────────────
export const coffee_settings = sqliteTable('coffee_settings', {
  id:                 integer('id').primaryKey(),
  default_language:   text('default_language').notNull().default('en'),
  active_languages:   text('active_languages', { mode: 'json' }).$type<string[]>().notNull().default(sql`'["en","id","cn"]'`),
  google_maps_iframe: text('google_maps_iframe').notNull().default(''),
  opening_time:       text('opening_time', { mode: 'json' }).$type<string[]>().notNull().default(sql`'[]'`),
  updated_at:         tsColumn('updated_at'),
});
