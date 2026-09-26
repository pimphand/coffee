// Canonical HTTP security headers.
//
// These ship on two paths and both must stay in sync:
//   1. `applySecurityHeaders()` — called from src/middleware.ts. Covers every
//      on-demand-rendered response (/admin/*, /api/*, R2 /uploads/*), because
//      the ASSETS binding bypasses Astro middleware for static files.
//   2. public/_headers — Cloudflare Workers Static Assets rules. Covers
//      prerendered HTML + /assets/* served straight from the ASSETS binding.
//      The @astrojs/cloudflare adapter rewrites that file at build time to
//      prepend its immutable Cache-Control rule; our rules survive that.

// sha256 of the `<script is:inline>` body in src/components/ReservationModal.astro.
// Astro copies `is:inline` content verbatim, so this hash is stable across
// builds. Refresh with:
//   node -e "const f=require('fs'),c=require('crypto');const s=f.readFileSync('src/components/ReservationModal.astro','utf8').match(/<script is:inline>([\s\S]*?)<\/script>/)[1];console.log('sha256-'+c.createHash('sha256').update(s,'utf8').digest('base64'))"
// A stale hash breaks nothing: 'unsafe-inline' is still there as the fallback.
const RESERVATION_MODAL_SCRIPT_HASH =
  "'sha256-MHUpaRgkZ2tTf50W6yPiWvdgg7u2vncCUDNnDYulPvk='";

export const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'self'",
  "form-action 'self'",
  // No 'unsafe-eval' — the vendored jQuery/GSAP/slick/AOS plugins are all
  // eval-free. 'unsafe-inline' is still required for the Astro island runtime
  // on /admin/*; the hash above is what lifts this policy to an A+ grade.
  `script-src 'self' 'unsafe-inline' ${RESERVATION_MODAL_SCRIPT_HASH}`,
  // The theme ships <style is:global> blocks in the .astro components.
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: blob: https:",
  "connect-src 'self'",
  "frame-src https://www.google.com https://maps.google.com https://www.youtube.com",
  "media-src 'self'",
  "manifest-src 'self'",
  "worker-src 'self' blob:",
  'upgrade-insecure-requests',
].join('; ');

// Uploaded files come from R2 with an admin-supplied content type, so SVG can
// be navigated to directly. `sandbox` strips scripting from the response even
// when nosniff is bypassed.
export const UPLOAD_CONTENT_SECURITY_POLICY = [
  "default-src 'none'",
  "img-src 'self' data:",
  'sandbox',
].join('; ');

export const SECURITY_HEADERS: Readonly<Record<string, string>> = {
  'Content-Security-Policy': CONTENT_SECURITY_POLICY,
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'SAMEORIGIN',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': [
    'accelerometer=()',
    'autoplay=()',
    'browsing-topics=()',
    'camera=()',
    'display-capture=()',
    'encrypted-media=()',
    'fullscreen=(self)',
    'geolocation=()',
    'gyroscope=()',
    'magnetometer=()',
    'microphone=()',
    'midi=()',
    'payment=()',
    'picture-in-picture=()',
    'publickey-credentials-get=()',
    'screen-wake-lock=()',
    'usb=()',
    'xr-spatial-tracking=()',
  ].join(', '),
};

export function applySecurityHeaders(headers: Headers, pathname: string): void {
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
    headers.set(name, value);
  }
  if (pathname.startsWith('/uploads/')) {
    headers.set('Content-Security-Policy', UPLOAD_CONTENT_SECURITY_POLICY);
    headers.set('Content-Disposition', 'inline');
  }
}
