// /uploads/blog/* — serves images uploaded from /admin out of the R2 bucket.
// Files that already exist in public/uploads/blog/ are served directly by the
// ASSETS binding; this route only handles keys stored in R2.
import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';

export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
  const name = params.key;
  if (!name || name.includes('..')) return new Response('Not found', { status: 404 });

  const object = await env.UPLOADS.get(`blog/${name}`);
  if (!object) return new Response('Not found', { status: 404 });

  const headers = new Headers();
  headers.set('Content-Type', object.httpMetadata?.contentType || 'application/octet-stream');
  headers.set('Cache-Control', 'public, max-age=31536000, immutable');

  return new Response(await object.arrayBuffer(), { headers });
};
