// Applies the security headers from src/lib/security-headers.ts to every
// on-demand-rendered response. Static assets and prerendered pages never reach
// this middleware (the Cloudflare adapter serves them from the ASSETS binding
// first), so they are covered by public/_headers instead.
import { defineMiddleware } from 'astro:middleware';
import { applySecurityHeaders } from './lib/security-headers';

export const onRequest = defineMiddleware(async (context, next) => {
  const response = await next();
  applySecurityHeaders(response.headers, context.url.pathname);
  return response;
});
