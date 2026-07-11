// Drizzle ORM — typed database access for the Brew Haven app.
// All helpers keep their existing public signatures — only the
// internals changed from raw SQL (pg) to Drizzle's type-safe API.
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq, desc, asc, sql } from 'drizzle-orm';
import * as schema from './schema';

// ── Connection (lazy singleton) ──────────────────────────────────
let _db: ReturnType<typeof drizzle> | null = null;
let _sql: ReturnType<typeof postgres> | null = null;

export function getDb() {
  if (_db) return _db;
  const url = import.meta.env.SUPABASE_DATABASE_URL ?? process.env.SUPABASE_DATABASE_URL;
  if (!url || url.includes('YOUR_PASSWORD')) {
    _sql = postgres(url || 'postgres://localhost:5432/void', { max: 0 });
    _db = drizzle(_sql, { schema });
    return _db;
  }
  _sql = postgres(url, {
    ssl: 'require',
    max: 10,
    idle_timeout: 30,
    connect_timeout: 8,
  });
  _db = drizzle(_sql, { schema });
  return _db;
}

// ── Type exports (backward-compatible snake_case) ────────────────
export type CoffeeUser       = typeof schema.coffee_users.$inferSelect;
export type CoffeeMenuItem   = typeof schema.coffee_menu_items.$inferSelect;
export type CoffeeChef       = typeof schema.coffee_chefs.$inferSelect;
export type CoffeeBlogPost   = typeof schema.coffee_blog_posts.$inferSelect;
export type CoffeeSettings   = typeof schema.coffee_settings.$inferSelect;

// ── Typed helpers (same API as before) ───────────────────────────
export const MenuItems = {
  list: async () => {
    const db = getDb();
    return db.select().from(schema.coffee_menu_items)
      .where(eq(schema.coffee_menu_items.is_published, true))
      .orderBy(
        sql`CASE ${schema.coffee_menu_items.section} WHEN 'coffee' THEN 1 WHEN 'sweet' THEN 2 ELSE 3 END`,
        asc(schema.coffee_menu_items.position),
        asc(schema.coffee_menu_items.created_at),
      );
  },
  bySlug: async (slug: string) => {
    const db = getDb();
    return db.select().from(schema.coffee_menu_items)
      .where(eq(schema.coffee_menu_items.slug, slug))
      .limit(1);
  },
};

export const Chefs = {
  list: async () => {
    const db = getDb();
    return db.select().from(schema.coffee_chefs)
      .where(eq(schema.coffee_chefs.is_published, true))
      .orderBy(asc(schema.coffee_chefs.position), asc(schema.coffee_chefs.created_at));
  },
};

export const BlogPosts = {
  list: async (limit = 100) => {
    const db = getDb();
    return db.select().from(schema.coffee_blog_posts)
      .where(eq(schema.coffee_blog_posts.is_published, true))
      .orderBy(desc(schema.coffee_blog_posts.published_at))
      .limit(limit);
  },
  listAll: async (limit = 500) => {
    const db = getDb();
    return db.select().from(schema.coffee_blog_posts)
      .orderBy(desc(schema.coffee_blog_posts.created_at))
      .limit(limit);
  },
  bySlug: async (slug: string) => {
    const db = getDb();
    return db.select().from(schema.coffee_blog_posts)
      .where(eq(schema.coffee_blog_posts.slug, slug))
      .limit(1);
  },
  create: async (data: typeof schema.coffee_blog_posts.$inferInsert) => {
    const db = getDb();
    const rows = await db.insert(schema.coffee_blog_posts).values(data).returning();
    return rows[0];
  },
  update: async (id: string, data: Partial<typeof schema.coffee_blog_posts.$inferInsert>) => {
    const db = getDb();
    const rows = await db.update(schema.coffee_blog_posts)
      .set({ ...data, updated_at: new Date() } as any)
      .where(eq(schema.coffee_blog_posts.id, id))
      .returning();
    return rows[0];
  },
  delete: async (id: string) => {
    const db = getDb();
    await db.delete(schema.coffee_blog_posts).where(eq(schema.coffee_blog_posts.id, id));
  },
  togglePublish: async (id: string) => {
    const db = getDb();
    const rows = await db.update(schema.coffee_blog_posts)
      .set({
        is_published: sql`NOT ${schema.coffee_blog_posts.is_published}`,
        updated_at: new Date(),
      })
      .where(eq(schema.coffee_blog_posts.id, id))
      .returning();
    return rows[0];
  },
};

export const Settings = {
  get: async () => {
    const db = getDb();
    const rows = await db.select().from(schema.coffee_settings).where(eq(schema.coffee_settings.id, 1)).limit(1);
    return rows[0] ?? null;
  },
  upsert: async (data: {
    default_language?: string;
    active_languages?: string[];
    google_maps_iframe?: string;
    opening_time?: string[];
  }) => {
    const db = getDb();
    const rows = await db.insert(schema.coffee_settings)
      .values({
        id: 1,
        default_language: data.default_language ?? 'en',
        active_languages: data.active_languages ?? ['en', 'id', 'cn'],
        google_maps_iframe: data.google_maps_iframe ?? '',
        opening_time: data.opening_time ?? [],
        updated_at: new Date(),
      })
      .onConflictDoUpdate({
        target: schema.coffee_settings.id,
        set: {
          default_language: sql`EXCLUDED.default_language`,
          active_languages: sql`EXCLUDED.active_languages`,
          google_maps_iframe: sql`EXCLUDED.google_maps_iframe`,
          opening_time: sql`EXCLUDED.opening_time`,
          updated_at: new Date(),
        },
      })
      .returning();
    return rows[0];
  },
};

export const Users = {
  byEmail: async (email: string) => {
    const db = getDb();
    return db.select().from(schema.coffee_users)
      .where(eq(schema.coffee_users.email, email))
      .limit(1);
  },
  byId: async (id: string) => {
    const db = getDb();
    return db.select().from(schema.coffee_users)
      .where(eq(schema.coffee_users.id, id))
      .limit(1);
  },
};

export const Sessions = {
  create: async (userId: string, token: string, expiresAt: Date) => {
    const db = getDb();
    await db.insert(schema.coffee_sessions).values({
      user_id: userId,
      token,
      expires_at: expiresAt,
    });
  },
  findByToken: async (token: string) => {
    const db = getDb();
    const rows = await db.select().from(schema.coffee_sessions)
      .where(eq(schema.coffee_sessions.token, token))
      .limit(1);
    return rows[0] ?? null;
  },
  deleteByToken: async (token: string) => {
    const db = getDb();
    await db.delete(schema.coffee_sessions).where(eq(schema.coffee_sessions.token, token));
  },
};
