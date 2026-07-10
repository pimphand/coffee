import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import pg from "pg";

dotenv.config();

const { Client } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const migrationDir = path.join(__dirname, "../db/migrations");

const client = new Client({
  connectionString: process.env.SUPABASE_DATABASE_URL,
  ssl: process.env.SUPABASE_DATABASE_URL.includes("supabase")
    ? { rejectUnauthorized: false }
    : false,
});

async function migrate() {
  try {
    await client.connect();

    const files = fs
      .readdirSync(migrationDir)
      .filter((f) => f.endsWith(".sql"))
      .sort();

    for (const file of files) {
      console.log(`▶ Menjalankan ${file}`);

      const sql = fs.readFileSync(
        path.join(migrationDir, file),
        "utf8"
      );

      await client.query(sql);

      console.log(`✅ ${file} selesai`);
    }

    console.log("🎉 Semua migration berhasil.");
  } catch (err) {
    console.error(err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

migrate();