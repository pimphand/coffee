-- Seed pengguna default (SQLite / Cloudflare D1).
-- Password keduanya: "password" (hash bcrypt, identik dengan skrip lama
-- yang memakai pgcrypto crypt()/gen_salt()).
-- Jalankan: npm run db:seed  (lokal) atau npm run db:seed:remote (produksi)

INSERT INTO coffee_users (email, name, password_hash, role)
VALUES
  ('admin@gmail.cafe', 'Administrator', '$2a$10$jTweT.zfwK8ZD1lLOiIXNOy1.yXeryEpB3CjnZtZBje7B17jfT8WK', 'admin'),
  ('editor@gmail.cafe', 'Content Editor', '$2a$10$jTweT.zfwK8ZD1lLOiIXNOy1.yXeryEpB3CjnZtZBje7B17jfT8WK', 'editor')
ON CONFLICT (email) DO NOTHING;
