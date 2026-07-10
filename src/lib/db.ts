// Postgres Pool singleton + typed row interfaces for the coffee_ tables.
// We deliberately fail OPEN: if SUPABASE_DATABASE_URL is not set, every
// query returns empty/throws in a controlled way so the SSG build still
// succeeds against the existing hardcoded fallback arrays in
// src/data/posts.ts (used while the DB hasn't been seeded yet).
import { Pool, type PoolClient } from 'pg';

// ── Row types (mirror db/migrations/001_initial.sql) ─────────────
export interface CoffeeUser {
  id:            string;
  email:         string;
  name:          string;
  password_hash: string;
  role:          'admin' | 'editor';
  created_at:    string;
  updated_at:    string;
}

export interface CoffeeMenuItem {
  id:            string;
  slug:          string;
  section:       'coffee' | 'sweet' | 'list';
  title_en:      string;
  title_id:      string;
  desc_en:       string;
  desc_id:       string;
  price:         string;
  img:           string;
  position:      number;
  is_published:  boolean;
  created_at:    string;
  updated_at:    string;
}

export interface CoffeeChef {
  id:            string;
  slug:          string;
  name:          string;
  role_en:       string;
  role_id:       string;
  img:           string;
  bio_en:        string;
  bio_id:        string;
  position:      number;
  is_published:  boolean;
  created_at:    string;
  updated_at:    string;
}

export interface CoffeeBlogPost {
  id:            string;
  slug:          string;
  title_en:      string;
  title_id:      string;
  excerpt_en:    string;
  excerpt_id:    string;
  content_en:    string;
  content_id:    string;
  image:         string;
  author_name:   string;
  published_at:  string;
  is_published:  boolean;
  created_at:    string;
  updated_at:    string;
}

// ── Pool (lazy) ───────────────────────────────────────────────────
let _pool: Pool | null = null;

export function getPool(): Pool | null {
  if (_pool) return _pool;
  const url = import.meta.env.SUPABASE_DATABASE_URL ?? process.env.SUPABASE_DATABASE_URL;
  if (!url || url.includes('YOUR_PASSWORD')) return null;          // graceful fail-open
  _pool = new Pool({
    connectionString: url,
    ssl: { rejectUnauthorized: false },                           // Supabase pooler
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 8_000
  });
  return _pool;
}

export async function query<T = any>(text: string, params: any[] = []): Promise<T[]> {
  const pool = getPool();
  if (!pool) return [];
  const client: PoolClient = await pool.connect();
  try { return (await client.query(text, params)).rows as T[]; }
  finally { client.release(); }
}

// Type-safe helpers — these return EMPTY arrays (not throw) when DB is
// off-line, so the SSG build won't fail before seeds are loaded.
export const MenuItems     = {
  // FIX #4: alphabetical ORDER BY `section` would put 'list' before 'sweet'
  // and 'sweet' between 'coffee' and 'list'. Use an explicit numeric
  // CASE so the marketing-side render order (coffee → sweet → list) is
  // what actually ships.
  list:   () => query<CoffeeMenuItem>(
    `SELECT * FROM coffee_menu_items
       WHERE is_published = true
       ORDER BY CASE section WHEN 'coffee' THEN 1 WHEN 'sweet' THEN 2 ELSE 3 END,
                position, created_at`
  ),
  bySlug: (s: string) => query<CoffeeMenuItem>(`SELECT * FROM coffee_menu_items WHERE slug = $1 LIMIT 1`, [s])
};
export const Chefs         = {
  list:   () => query<CoffeeChef>(`SELECT * FROM coffee_chefs WHERE is_published = true ORDER BY position, created_at`)
};
export const BlogPosts     = {
  list:    (limit = 100) => query<CoffeeBlogPost>(`SELECT * FROM coffee_blog_posts WHERE is_published = true  ORDER BY published_at DESC LIMIT $1`, [limit]),
  listAll: (limit = 500) => query<CoffeeBlogPost>(`SELECT * FROM coffee_blog_posts ORDER BY created_at DESC LIMIT $1`, [limit]),
  bySlug:  (s: string)   => query<CoffeeBlogPost>(`SELECT * FROM coffee_blog_posts WHERE slug = $1 LIMIT 1`, [s])
};
export const Users         = {
  byEmail: (email: string) => query<CoffeeUser>(`SELECT * FROM coffee_users WHERE email = $1 LIMIT 1`, [email])
};
