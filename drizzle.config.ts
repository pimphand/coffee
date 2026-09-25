import { defineConfig } from 'drizzle-kit';

// Drizzle Kit config untuk Cloudflare D1 (SQLite dialect).
//
// 1. `npm run db:generate`        → membuat SQL migration di ./db/drizzle
// 2. `npm run db:migrate`         → apply ke D1 lokal (wrangler)
// 3. `npm run db:migrate:remote`  → apply ke D1 produksi (wrangler)
//
// Apply dilakukan oleh Wrangler (lihat `migrations_dir` di wrangler.jsonc),
// bukan `drizzle-kit migrate`, jadi tidak perlu credentials di sini.
export default defineConfig({
  schema: './src/lib/db/schema.ts',
  out: './db/drizzle',
  dialect: 'sqlite',
});
