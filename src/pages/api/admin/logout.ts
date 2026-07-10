// POST /api/admin/logout — destroys the session row keyed by the
// hashed cookie value and clears the cookie on the response.
// Sidebar.vue's nav-secondary "Logout" entry posts to this endpoint.

import type { APIRoute } from 'astro';
import { destroySession, clearSessionCookie, readSessionCookie } from '../../../lib/auth';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const cookieValue = readSessionCookie(request);
  if (cookieValue) {
    await destroySession(cookieValue);
  }
  const res = new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
  clearSessionCookie(res.headers);
  return res;
};
