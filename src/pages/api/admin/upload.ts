// /api/admin/upload — Image upload with WebP conversion.
// Accepts multipart/form-data, converts to WebP via sharp,
// saves to public/uploads/blog/, returns the public path.
//
//   POST   /api/admin/upload   → multipart with "file" field
//   Response: { ok: true, path: "/uploads/blog/abc123.webp" }

import type { APIRoute } from 'astro';
import { verifySession, readSessionCookie } from '../../../lib/auth';
import sharp from 'sharp';
import { randomUUID } from 'crypto';
import { mkdirSync } from 'fs';
import { join } from 'path';

export const prerender = false;

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
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'];
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
    const buffer = Buffer.from(await (file as any).arrayBuffer());
    const filename = `${randomUUID()}.webp`;
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'blog');

    // Ensure directory exists
    mkdirSync(uploadDir, { recursive: true });

    // Convert to WebP and save
    await sharp(buffer)
      .webp({ quality: 85 })
      .toFile(join(uploadDir, filename));

    const publicPath = `/uploads/blog/${filename}`;
    return json({ ok: true, path: publicPath }, 200);
  } catch (e: any) {
    console.error('Upload error:', e);
    return json({ error: 'Failed to process image' }, 500);
  }
};

// ── Helpers ───────────────────────────────────────────────────────
function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
