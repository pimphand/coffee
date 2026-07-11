// /api/admin/blog — Blog CRUD with Drizzle ORM.
export const prerender = false;

import type { APIRoute } from 'astro';
import { verifySession, readSessionCookie } from '../../../lib/auth';
import { BlogPosts } from '../../../lib/db';

async function auth(request: Request) {
  const raw = readSessionCookie(request);
  if (!raw) return null;
  return verifySession(raw);
}

export const GET: APIRoute = async ({ request }) => {
  const user = await auth(request);
  if (!user) return json({ error: 'Unauthorized' }, 401);
  const posts = await BlogPosts.listAll();
  return json({ posts }, 200);
};

export const POST: APIRoute = async ({ request }) => {
  const user = await auth(request);
  if (!user) return json({ error: 'Unauthorized' }, 401);

  let body: any;
  try { body = await request.json(); } catch { return json({ error: 'Invalid JSON' }, 400); }

  const { slug, title_en, title_id, title_cn, excerpt_en, excerpt_id, excerpt_cn, content_en, content_id, content_cn, image, author_name } = body;
  if (!slug || (!title_en && !title_id && !title_cn)) {
    return json({ error: 'slug and at least one title are required' }, 400);
  }

  try {
    const post = await BlogPosts.create({
      slug,
      title_en: title_en || null,
      title_id: title_id || null,
      title_cn: title_cn || null,
      excerpt_en: excerpt_en || '',
      excerpt_id: excerpt_id || '',
      excerpt_cn: excerpt_cn || '',
      content_en: content_en || '',
      content_id: content_id || '',
      content_cn: content_cn || '',
      image: image || '',
      author_name: author_name || 'Brew Haven',
    });
    return json({ ok: true, post }, 201);
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

  const { id, slug, title_en, title_id, title_cn, excerpt_en, excerpt_id, excerpt_cn, content_en, content_id, content_cn, image, author_name } = body;
  if (!id) return json({ error: 'id is required' }, 400);

  try {
    const post = await BlogPosts.update(id, {
      slug,
      title_en: title_en || null,
      title_id: title_id || null,
      title_cn: title_cn || null,
      excerpt_en: excerpt_en || '',
      excerpt_id: excerpt_id || '',
      excerpt_cn: excerpt_cn || '',
      content_en: content_en || '',
      content_id: content_id || '',
      content_cn: content_cn || '',
      image: image || '',
      author_name: author_name || '',
    });
    if (!post) return json({ error: 'Post not found' }, 404);
    return json({ ok: true, post }, 200);
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
  await BlogPosts.delete(id);
  return json({ ok: true }, 200);
};

export const PATCH: APIRoute = async ({ request }) => {
  const user = await auth(request);
  if (!user) return json({ error: 'Unauthorized' }, 401);
  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  if (!id) return json({ error: '?id= is required' }, 400);
  const post = await BlogPosts.togglePublish(id);
  if (!post) return json({ error: 'Post not found' }, 404);
  return json({ ok: true, post }, 200);
};

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
