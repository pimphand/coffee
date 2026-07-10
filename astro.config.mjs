import { defineConfig } from 'astro/config';
import vue       from '@astrojs/vue';
import tailwind  from '@astrojs/tailwind';
import node      from '@astrojs/node';

// Hybrid mode: marketing pages stay SSG (no `export const prerender = false`
// on them), while /admin/* and /api/admin/* fall through to SSR so they can
// query Postgres and sign HttpOnly session cookies. Static pages continue
// to be pre-rendered at build time and served as fast .html files.
export default defineConfig({
  output: 'hybrid',
  adapter: node({ mode: 'standalone' }),

  integrations: [
    vue(),
    tailwind({ applyBaseStyles: false })  // we'll inject tailwind base ourselves
  ],

  server: {
    host: true,
    port: 4321
  },

  build: {
    assets: 'assets'
  },

  // Bilingual site — Indonesian default + /en/ English (carried over from
  // earlier i18n work, retained in hybrid mode).
  i18n: {
    defaultLocale: 'id',
    locales: ['id', 'en'],
    routing: { prefixDefaultLocale: false }
  }
});
