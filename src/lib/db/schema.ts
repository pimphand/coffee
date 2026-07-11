import {
  pgTable, uuid, text, integer, boolean, timestamp, uniqueIndex, index,
} from 'drizzle-orm/pg-core';

// All JS property names use snake_case so $inferSelect matches the
// existing codebase. Drizzle maps them to the DB column names (second arg).

// ─── Users / sessions ────────────────────────────────────────────
export const coffee_users = pgTable('coffee_users', {
  id:            uuid('id').defaultRandom().primaryKey(),
  email:         text('email').notNull(), // DB already has UNIQUE constraint
  name:          text('name').notNull().default(''),
  password_hash: text('password_hash').notNull(),
  role:          text('role', { enum: ['admin', 'editor'] }).notNull().default('admin'),
  created_at:    timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at:    timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index('idx_coffee_users_email').on(t.email),
]);

export const coffee_sessions = pgTable('coffee_sessions', {
  id:         uuid('id').defaultRandom().primaryKey(),
  user_id:    uuid('user_id').notNull().references(() => coffee_users.id, { onDelete: 'cascade' }),
  token:      text('token').notNull(), // DB already has UNIQUE constraint
  expires_at: timestamp('expires_at', { withTimezone: true }).notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index('idx_coffee_sessions_token').on(t.token),
  index('idx_coffee_sessions_user').on(t.user_id),
]);

// ─── Menu items ──────────────────────────────────────────────────
export const coffee_menu_items = pgTable('coffee_menu_items', {
  id:           uuid('id').defaultRandom().primaryKey(),
  slug:         text('slug').notNull(), // DB already has UNIQUE constraint
  section:      text('section', { enum: ['coffee', 'sweet', 'list'] }).notNull().default('coffee'),
  title_en:     text('title_en').notNull(),
  title_id:     text('title_id').notNull(),
  desc_en:      text('desc_en').notNull().default(''),
  desc_id:      text('desc_id').notNull().default(''),
  price:        text('price').notNull().default(''),
  img:          text('img').notNull().default(''),
  position:     integer('position').notNull().default(0),
  is_published: boolean('is_published').notNull().default(true),
  created_at:   timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at:   timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index('idx_coffee_menu_items_section_pub').on(t.section, t.is_published, t.position),
]);

// ─── Chefs ───────────────────────────────────────────────────────
export const coffee_chefs = pgTable('coffee_chefs', {
  id:           uuid('id').defaultRandom().primaryKey(),
  slug:         text('slug').notNull(), // DB already has UNIQUE constraint
  name:         text('name').notNull(),
  role_en:      text('role_en').notNull(),
  role_id:      text('role_id').notNull(),
  img:          text('img').notNull().default(''),
  bio_en:       text('bio_en').notNull().default(''),
  bio_id:       text('bio_id').notNull().default(''),
  position:     integer('position').notNull().default(0),
  is_published: boolean('is_published').notNull().default(true),
  created_at:   timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at:   timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index('idx_coffee_chefs_pub').on(t.is_published, t.position),
]);

// ─── Blog posts ──────────────────────────────────────────────────
export const coffee_blog_posts = pgTable('coffee_blog_posts', {
  id:            uuid('id').defaultRandom().primaryKey(),
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
  published_at:  timestamp('published_at', { withTimezone: true }).notNull().defaultNow(),
  is_published:  boolean('is_published').notNull().default(true),
  created_at:    timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at:    timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index('idx_coffee_blog_posts_pub').on(t.is_published, t.published_at),
]);

// ─── Settings ────────────────────────────────────────────────────
export const coffee_settings = pgTable('coffee_settings', {
  id:                 integer('id').primaryKey(),
  default_language:   text('default_language').notNull().default('en'),
  active_languages:   text('active_languages').array().notNull().default(['en', 'id', 'cn']),
  google_maps_iframe: text('google_maps_iframe').notNull().default(''),
  opening_time:       text('opening_time').array().notNull().default([]),
  updated_at:         timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
