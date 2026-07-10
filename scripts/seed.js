import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import { Client } from "pg";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const seedDir = path.join(__dirname, "../db/seeder");

const client = new Client({
  connectionString:
    process.env.SUPABASE_DATABASE_URL ||
    process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function seed() {
  try {
    await client.connect();

    const files = fs
      .readdirSync(seedDir)
      .filter((f) => f.endsWith(".sql"))
      .sort();

    for (const file of files) {
      console.log(`🌱 Running ${file}`);

      const sql = fs.readFileSync(
        path.join(seedDir, file),
        "utf8"
      );

      await client.query(sql);

      console.log(`✅ ${file} selesai`);
    }

    console.log("🎉 Semua seeder berhasil dijalankan.");
  } catch (err) {
    console.error(err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

seed();