# Bistly Coffee

Situs marketing (static) + dashboard admin (SSR) berbasis Astro 7, Vue 3, Drizzle ORM,
dan **Cloudflare D1** (SQLite) di Cloudflare Workers — sebelumnya memakai Supabase Postgres.

- Halaman marketing di-*prerender* saat build (membaca D1).
- `/admin/*` dan `/api/admin/*` di-render on-demand (session cookie HMAC + bcrypt).
- Gambar yang di-upload disimpan di bucket **R2** (`UPLOADS`), disajikan oleh
  `src/pages/uploads/blog/[...key].ts`.
- File lama di `public/uploads/blog/` tetap disajikan langsung oleh aset statis.

## Setup sekali jalan

```bash
bun install                       # atau npm install

# 1. Buat database D1, lalu salin database_id ke wrangler.jsonc
npx wrangler d1 create bistly-coffee

# 2. Buat bucket R2 untuk upload gambar
npx wrangler r2 bucket create bistly-uploads

# 3. Secret untuk session cookie
npx wrangler secret put SESSION_SECRET      # produksi
#    (development lokal memakai .dev.vars — sudah ada contohnya)

# 4. Generate tipe TypeScript dari wrangler.jsonc (jalankan tiap ubah config)
npm run types
```

## Database

```bash
npm run db:generate        # ubah src/lib/db/schema.ts → SQL migration baru di db/drizzle/
npm run db:migrate         # apply migration ke D1 LOKAL
npm run db:migrate:remote  # apply migration ke D1 PRODUKSI

npm run db:seed            # isi user default + settings (lokal)
npm run db:seed:remote     # hal yang sama untuk produksi
```

Login default: `admin@gmail.cafe` / `password` dan `editor@gmail.cafe` / `password`.

Migration dijalankan Wrangler dari folder `db/drizzle` (lihat `migrations_dir` di
`wrangler.jsonc`), jadi tidak perlu credentials Drizzle.

## Pindahkan data lama dari Supabase ke D1

```bash
# 1. isi SOURCE_DATABASE_URL di .env (koneksi Postgres lama)
npm run db:import                       # → db/export/d1-import.sql

# 2. import hasilnya
npx wrangler d1 execute DB --file db/export/d1-import.sql --local    # D1 lokal
npx wrangler d1 execute DB --file db/export/d1-import.sql --remote   # D1 produksi
```

Setelah data lama pindah, dependency `postgres` boleh dihapus: `bun remove postgres`.

## Menjalankan

```bash
npm run dev            # dev server (workerd + D1 lokal) di http://localhost:4321
npm run build          # build statis + worker
npm run preview        # preview hasil build
npm run deploy         # build + wrangler deploy
```

### Catatan build

Halaman marketing yang membaca database (blog, contact, komponen Time/Blog)
di-prerender di dalam workerd dan membaca **D1 lokal** (`.wrangler/state/`).
Sebelum `npm run build`, jalankan dulu `npm run db:migrate` (+ `db:seed` atau
impor data) supaya halaman ter-build dengan data terbaru. Untuk produksi,
jalankan juga `npm run db:migrate:remote` dan impor data ke D1 produksi.

## Struktur terkait Cloudflare

| File | Fungsi |
| --- | --- |
| `wrangler.jsonc` | binding D1 `DB`, R2 `UPLOADS`, flags, assets |
| `worker-configuration.d.ts` | tipe binding (generated: `npm run types`) |
| `src/lib/db/schema.ts` | skema Drizzle dialect SQLite untuk D1 |
| `src/lib/db/index.ts` | helper query (binding D1 lewat `cloudflare:workers`) |
| `db/drizzle/*.sql` | migration (diapply Wrangler) |
| `db/seeder/*.sql` | seed users + settings |
| `scripts/export-postgres-to-d1.js` | export data Postgres lama → SQL D1 |
