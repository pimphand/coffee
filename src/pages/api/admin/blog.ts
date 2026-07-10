// /api/admin/blog — Blog CRUD. All methods require a valid session cookie.
//
//   GET    /api/admin/blog              → list all posts (published + draft)
//   POST   /api/admin/blog              → create  { slug, title_en, title_id, ... }
//   PUT    /api/admin/blog              → update  { id, slug, title_en, ... }
//   DELETE /api/admin/blog?id=xxx       → delete
//   PATCH  /api/admin/blog?id=xxx       → toggle is_published
//
// Auth is enforced via the same `verifySession` / `readSessionCookie`
// helpers as /api/admin/login and the admin dashboard.

import type { APIRoute } from 'astro';
import { verifySession, readSessionCookie } from '../../../lib/auth';
import { query } from '../../../lib/db';

export const prerender = false;

// ── Auth guard ────────────────────────────────────────────────────
async function auth(request: Request) {
  const raw = readSessionCookie(request);
  if (!raw) return null;
  return verifySession(raw);
}

// ── Handlers ──────────────────────────────────────────────────────

export const GET: APIRoute = async ({ request }) => {
  const user = await auth(request);
  if (!user) return json({ error: 'Unauthorized' }, 401);

  const rows = await query<any>(
    `SELECT * FROM coffee_blog_posts ORDER BY created_at DESC`
  );
  return json({ posts: rows }, 200);
};

export const POST: APIRoute = async ({ request }) => {
  const user = await auth(request);
  if (!user) return json({ error: 'Unauthorized' }, 401);

  let body: any;
  try { body = await request.json(); } catch { return json({ error: 'Invalid JSON' }, 400); }

  const { slug, title_en, title_id, excerpt_en, excerpt_id, content_en, content_id, image, author_name } = body;
  if (!slug || !title_en || !title_id) {
    return json({ error: 'slug, title_en, and title_id are required' }, 400);
  }

  try {
    const rows = await query<any>(
      `INSERT INTO coffee_blog_posts (slug, title_en, title_id, excerpt_en, excerpt_id, content_en, content_id, image, author_name)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [slug, title_en, title_id, excerpt_en || '', excerpt_id || '', content_en || '', content_id || '', image || '', author_name || 'Brew Haven']
    );
    return json({ ok: true, post: rows[0] }, 201);
  } catch (e: any) {
    if (e?.code === '23505') return json({ error: 'Slug already exists' }, 409);
    throw e;
  }
};

export const PUT: APIRoute = async ({ request }) => {
  const user = await auth(request);
  if (!user) return json({ error: 'Unauthorized' }, 401);

  let body: any;
  try { body = await request.json(); } catch { return json({ error: 'Invalid JSON' }, 400); }

  const { id, slug, title_en, title_id, excerpt_en, excerpt_id, content_en, content_id, image, author_name } = body;
  if (!id) return json({ error: 'id is required' }, 400);

  try {
    const rows = await query<any>(
      `UPDATE coffee_blog_posts SET
         slug=$1, title_en=$2, title_id=$3, excerpt_en=$4, excerpt_id=$5,
         content_en=$6, content_id=$7, image=$8, author_name=$9,
         updated_at = now()
       WHERE id=$10 RETURNING *`,
      [slug, title_en, title_id, excerpt_en || '', excerpt_id || '', content_en || '', content_id || '', image || '', author_name || '', id]
    );
    if (rows.length === 0) return json({ error: 'Post not found' }, 404);
    return json({ ok: true, post: rows[0] }, 200);
  } catch (e: any) {
    if (e?.code === '23505') return json({ error: 'Slug already exists' }, 409);
    throw e;
  }
};

export const DELETE: APIRoute = async ({ request }) => {
  const user = await auth(request);
  if (!user) return json({ error: 'Unauthorized' }, 401);

  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  if (!id) return json({ error: '?id= is required' }, 400);

  await query(`DELETE FROM coffee_blog_posts WHERE id = $1`, [id]);
  return json({ ok: true }, 200);
};

export const PATCH: APIRoute = async ({ request }) => {
  const user = await auth(request);
  if (!user) return json({ error: 'Unauthorized' }, 401);

  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  if (!id) return json({ error: '?id= is required' }, 400);

  const rows = await query<any>(
    `UPDATE coffee_blog_posts
       SET is_published = NOT is_published, updated_at = now()
     WHERE id = $1 RETURNING *`,
    [id]
  );
  if (rows.length === 0) return json({ error: 'Post not found' }, 404);
  return json({ ok: true, post: rows[0] }, 200);
};

// ── Helpers ───────────────────────────────────────────────────────
function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
