// GET  /api/admin/settings  → read current settings
// PUT  /api/admin/settings  → update settings (requires auth)
export const prerender = false;

import { Settings } from '../../../lib/db';
import { verifySession, readSessionCookie } from '../../../lib/auth';
import { getPool } from '../../../lib/db';

export async function GET({ request }: { request: Request }) {
  const cookie = readSessionCookie(request);
  const session = cookie ? await verifySession(cookie) : null;
  if (!session) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

  const settings = await Settings.get();
  return new Response(JSON.stringify(settings ?? {
    id: 1,
    default_language: 'en',
    active_languages: ['en', 'id', 'cn'],
    updated_at: new Date().toISOString(),
  }), { status: 200 });
}

export async function PUT({ request }: { request: Request }) {
  const cookie = readSessionCookie(request);
  const session = cookie ? await verifySession(cookie) : null;
  if (!session) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

  try {
    const body = await request.json();
    const { default_language, active_languages } = body;

    // Validation
    const validLangs = ['en', 'id', 'cn'];
    if (default_language && !validLangs.includes(default_language)) {
      return new Response(JSON.stringify({ error: 'Invalid default language' }), { status: 400 });
    }
    if (active_languages) {
      if (!Array.isArray(active_languages) || active_languages.length === 0) {
        return new Response(JSON.stringify({ error: 'At least one active language required' }), { status: 400 });
      }
      for (const l of active_languages) {
        if (!validLangs.includes(l)) {
          return new Response(JSON.stringify({ error: `Invalid language: ${l}` }), { status: 400 });
        }
      }
      if (!active_languages.includes(default_language ?? 'en')) {
        return new Response(JSON.stringify({ error: 'Default language must be in active languages' }), { status: 400 });
      }
    }

    const pool = getPool();
    if (!pool) return new Response(JSON.stringify({ error: 'Database unavailable' }), { status: 503 });

    await pool.query(
      `INSERT INTO coffee_settings (id, default_language, active_languages, updated_at)
       VALUES (1, $1, $2, now())
       ON CONFLICT (id) DO UPDATE SET
         default_language = EXCLUDED.default_language,
         active_languages = EXCLUDED.active_languages,
         updated_at = now()`,
      [default_language ?? 'en', active_languages ?? ['en', 'id', 'cn']]
    );

    const updated = await Settings.get();
    return new Response(JSON.stringify({ ok: true, settings: updated }), { status: 200 });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
