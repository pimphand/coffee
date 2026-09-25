import { defineConfig, sessionDrivers } from 'astro/config';
import vue       from '@astrojs/vue';
import tailwind  from '@astrojs/tailwind';
import cloudflare from '@astrojs/cloudflare';
import fs        from 'node:fs';

// Hybrid mode: marketing pages stay SSG (no `export const prerender = false`
// on them), while /admin/* and /api/admin/* fall through to SSR so they can
// query Cloudflare D1 and sign HttpOnly session cookies. Static pages
// continue to be pre-rendered at build time and served as fast .html files.
export default defineConfig({
  output: 'static',
  adapter: cloudflare({
    // Gambar tidak dioptimasi di runtime (tidak ada <Image> Astro),
    // cukup disajikan apa adanya dari /uploads atau public/.
    imageService: 'passthrough',
  }),

  // Auth memakai cookie HMAC sendiri (src/lib/auth.ts), bukan Astro sessions,
  // jadi pakai driver in-memory agar adapter tidak meng-provision KV SESSION.
  session: { driver: sessionDrivers.lruCache() },

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
