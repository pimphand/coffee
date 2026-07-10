// Auth — fixed per reviewer feedback:
//   (1) HMAC-sign cookies with SESSION_SECRET so cookies can't be reused
//       from a stolen DB snapshot or a tampered-with value.
//   (2) Store `sha256(token)` in `coffee_sessions.token` so a raw DB read
//       leaks only the digest, not a live bearer token.
// Cookie format: `${rawToken}|${hexHmac(sha256(rawToken), SESSION_SECRET)}`.
// On verify: parse, recompute, timing-safe-equal HMAC, then look up
// `WHERE token = sha256(rawToken)` in coffee_sessions.
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { Users, query, type CoffeeUser } from './db';

const COOKIE_NAME = 'bh-session';
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

// ── Crypto helpers ────────────────────────────────────────────────
function sha256Hex(input: string): string {
  return crypto.createHash('sha256').update(input).digest('hex');
}
// Fail-loud guard: if NODE_ENV=production and SESSION_SECRET was never
// set, refuse to boot. Otherwise mis-configured production would silently
// fall through to the public fallback string and every signed cookie would
// be forgeable.
const SESSION_SECRET =
  import.meta.env.SESSION_SECRET ?? process.env.SESSION_SECRET ?? '';
if (!SESSION_SECRET && process.env.NODE_ENV === 'production') {
  throw new Error('SESSION_SECRET env var is required in production');
}
function hmacSign(payload: string): string {
  return crypto
    .createHmac('sha256', SESSION_SECRET || 'dev-only-not-for-prod')
    .update(payload)
    .digest('hex');
}
function safeEqualHex(a: string, b: string): boolean {
  // Buffer.from(_, 'hex') silently truncates odd-length hex strings,
  // so a malformed signature like 'fff' could compare equal-length to
  // another trimmed value. Tighten with length checks before the
  // buffer conversion — HMAC-SHA256 always yields exactly 64 chars.
  if (a.length !== 64 || b.length !== 64 || a.length !== b.length) return false;
  const ab = Buffer.from(a, 'hex');
  const bb = Buffer.from(b, 'hex');
  return crypto.timingSafeEqual(ab, bb);
}
function parseCookieValue(raw: string): { sha: string } | null {
  const sep = raw.indexOf('|');
  if (sep === -1) return null;
  const rawToken = raw.slice(0, sep);
  const sig     = raw.slice(sep + 1);
  if (!/^[0-9a-f]{64}$/.test(rawToken)) return null;
  const sha = sha256Hex(rawToken);
  if (!safeEqualHex(sig, hmacSign(sha))) return null;
  return { sha };
}

// ── Cookie helpers ────────────────────────────────────────────────
export function setSessionCookie(headers: Headers, cookieValue: string) {
  headers.append('Set-Cookie',
    `${COOKIE_NAME}=${encodeURIComponent(cookieValue)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SEVEN_DAYS_MS / 1000}${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`
  );
}
export function clearSessionCookie(headers: Headers) {
  headers.append('Set-Cookie', `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);
}
export function readSessionCookie(request: Request): string | null {
  const raw = request.headers.get('cookie');
  if (!raw) return null;
  for (const part of raw.split(';').map((s) => s.trim())) {
    if (part.startsWith(`${COOKIE_NAME}=`)) {
      return decodeURIComponent(part.slice(COOKIE_NAME.length + 1));
    }
  }
  return null;
}

// ── Password ──────────────────────────────────────────────────────
export async function verifyPassword(email: string, password: string): Promise<CoffeeUser | null> {
  const rows = await Users.byEmail(email);
  if (rows.length === 0) return null;
  const ok = await bcrypt.compare(password, rows[0].password_hash);
  if (!ok) return null;
  return rows[0];
}

// ── Sessions ──────────────────────────────────────────────────────
// Returns the cookie value (raw|sig) the caller should write to Set-Cookie.
export async function createSession(userId: string): Promise<string> {
  const rawToken = crypto.randomBytes(32).toString('hex');
  const sha      = sha256Hex(rawToken);
  await query(
    `INSERT INTO coffee_sessions (user_id, token, expires_at) VALUES ($1, $2, $3)`,
    [userId, sha, new Date(Date.now() + SEVEN_DAYS_MS).toISOString()]
  );
  return `${rawToken}|${hmacSign(sha)}`;
}
export async function destroySession(cookieValue: string): Promise<void> {
  const parsed = parseCookieValue(cookieValue);
  if (!parsed) return;
  await query(`DELETE FROM coffee_sessions WHERE token = $1`, [parsed.sha]);
}
export async function verifySession(cookieValue: string): Promise<CoffeeUser | null> {
  const parsed = parseCookieValue(cookieValue);
  if (!parsed) return null;
  const rows = await query<{ user_id: string; expires_at: string }>(
    `SELECT user_id, expires_at FROM coffee_sessions WHERE token = $1 LIMIT 1`,
    [parsed.sha]
  );
  if (rows.length === 0) return null;
  if (new Date(rows[0].expires_at).getTime() < Date.now()) {
    await query(`DELETE FROM coffee_sessions WHERE token = $1`, [parsed.sha]);
    return null;
  }
  const u = await query<CoffeeUser>(`SELECT * FROM coffee_users WHERE id = $1 LIMIT 1`, [rows[0].user_id]);
  return u[0] ?? null;
}
