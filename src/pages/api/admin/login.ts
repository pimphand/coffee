// POST /api/admin/login — accepts { email, password } JSON, verifies
// the bcrypt hash against coffee_users, and on success issues the
// HMAC-signed session cookie from src/lib/auth.ts. Always responds
// JSON so the LoginForm.vue island has a stable error contract.

import type { APIRoute } from 'astro';
import { verifyPassword, createSession, setSessionCookie } from '../../../lib/auth';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  let body: { email?: string; password?: string };
  try { body = await request.json(); }
  catch { return json({ error: 'Invalid JSON body' }, 400); }

  const email    = (body.email    || '').trim().toLowerCase();
  const password = body.password  || '';

  if (!email || !password) {
    return json({ error: 'Email and password are required' }, 400);
  }

  // Generic message regardless of which side is wrong to avoid
  // disclosing whether the email exists.
  const user = await verifyPassword(email, password);
  if (!user) {
    return json({ error: 'Invalid credentials' }, 401);
  }

  // Mint the session (returns the formatted cookie value) and attach
  // it to the success response. createSession writes the sha256(token)
  // hash to coffee_sessions, NOT the raw token.
  const cookieValue = await createSession(user.id);
  const res = json({ ok: true, email: user.email }, 200);
  setSessionCookie(res.headers, cookieValue);
  return res;
};

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
