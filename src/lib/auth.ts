// Auth — HMAC-signed session cookies with Drizzle ORM.
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { Users, Sessions } from './db';
import type { CoffeeUser } from './db';

const COOKIE_NAME = 'bh-session';
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

function sha256Hex(input: string): string {
  return crypto.createHash('sha256').update(input).digest('hex');
}

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

export async function verifyPassword(email: string, password: string): Promise<CoffeeUser | null> {
  const rows = await Users.byEmail(email);
  if (rows.length === 0) return null;
  const ok = await bcrypt.compare(password, rows[0].password_hash);
  if (!ok) return null;
  return rows[0];
}

export async function createSession(userId: string): Promise<string> {
  const rawToken = crypto.randomBytes(32).toString('hex');
  const sha      = sha256Hex(rawToken);
  await Sessions.create(userId, sha, new Date(Date.now() + SEVEN_DAYS_MS));
  return `${rawToken}|${hmacSign(sha)}`;
}

export async function destroySession(cookieValue: string): Promise<void> {
  const parsed = parseCookieValue(cookieValue);
  if (!parsed) return;
  await Sessions.deleteByToken(parsed.sha);
}

export async function verifySession(cookieValue: string): Promise<CoffeeUser | null> {
  const parsed = parseCookieValue(cookieValue);
  if (!parsed) return null;
  const sessionRow = await Sessions.findByToken(parsed.sha);
  if (!sessionRow) return null;
  if (new Date(sessionRow.expires_at).getTime() < Date.now()) {
    await Sessions.deleteByToken(parsed.sha);
    return null;
  }
  const u = await Users.byId(sessionRow.user_id);
  return u[0] ?? null;
}
