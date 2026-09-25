// /api/admin/upload — Image upload to Cloudflare R2.
// Accepts multipart/form-data, stores the original bytes in the R2 bucket
// bound as UPLOADS, returns the public path served by
// src/pages/uploads/blog/[...key].ts.
//
//   POST   /api/admin/upload   → multipart with "file" field
//   Response: { ok: true, path: "/uploads/blog/abc123.webp" }

import type { APIRoute } from 'astro';
import { verifySession, readSessionCookie } from '../../../lib/auth';
import { env } from 'cloudflare:workers';

export const prerender = false;

const EXT_BY_TYPE: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
  'image/gif': 'gif',
  'image/svg+xml': 'svg',
};

// ── Auth guard ────────────────────────────────────────────────────
async function auth(request: Request) {
  const raw = readSessionCookie(request);
  if (!raw) return null;
  return verifySession(raw);
}

// ── Upload handler ────────────────────────────────────────────────
export const POST: APIRoute = async ({ request }) => {
  const user = await auth(request);
  if (!user) return json({ error: 'Unauthorized' }, 401);

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return json({ error: 'Invalid form data' }, 400);
  }

  const file = formData.get('file');
  if (!file || typeof file === 'string') {
    return json({ error: 'No file uploaded' }, 400);
  }

  // Validate file type
  const fileType = (file as any).type || '';
  const allowedTypes = Object.keys(EXT_BY_TYPE);
  if (fileType && !allowedTypes.includes(fileType)) {
    return json({ error: 'Only JPEG, PNG, WebP, AVIF, and GIF images are allowed' }, 400);
  }

  // Validate file size (max 10MB)
  const fileSize = (file as any).size || 0;
  const maxSize = 10 * 1024 * 1024;
  if (fileSize > maxSize) {
    return json({ error: 'File too large. Maximum size is 10MB' }, 400);
  }

  try {
    const buffer = await (file as any).arrayBuffer();
    const ext = EXT_BY_TYPE[fileType] || 'bin';
    const filename = `${crypto.randomUUID()}.${ext}`;
    const key = `blog/${filename}`;

    await env.UPLOADS.put(key, buffer, {
      httpMetadata: { contentType: fileType || 'application/octet-stream' },
    });

    const publicPath = `/uploads/blog/${filename}`;
    return json({ ok: true, path: publicPath }, 200);
  } catch (e: any) {
    console.error('Upload error:', e);
    return json({ error: 'Failed to upload image' }, 500);
  }
};

// ── Helpers ───────────────────────────────────────────────────────
function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
