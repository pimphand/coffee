import { defineConfig } from 'astro/config';
import vue       from '@astrojs/vue';
import tailwind  from '@astrojs/tailwind';
import node      from '@astrojs/node';
import fs        from 'node:fs';

// Hybrid mode: marketing pages stay SSG (no `export const prerender = false`
// on them), while /admin/* and /api/admin/* fall through to SSR so they can
// query Postgres and sign HttpOnly session cookies. Static pages continue
// to be pre-rendered at build time and served as fast .html files.
export default defineConfig({
  output: 'static',
  adapter: node({ mode: 'standalone' }),

  integrations: [
    vue({
      script: {
        // Astro 7 + @vue/compiler-sfc needs explicit fs to resolve
        // type-only imports (e.g. import type { SeparatorProps } from "reka-ui")
        fs: {
          fileExists: (file) => fs.existsSync(file),
          readFile:    (file) => fs.readFileSync(file, 'utf-8'),
        },
      },
    }),
    tailwind({ applyBaseStyles: false })  // we'll inject tailwind base ourselves
  ],

  server: {
    host: true,
    port: 4321
  },

  build: {
    assets: 'assets'
  },

  // Trilingual site — English default (/) + /id/ Indonesian + /cn/ Chinese.
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'id', 'cn'],
    routing: { prefixDefaultLocale: false }
  }
});
