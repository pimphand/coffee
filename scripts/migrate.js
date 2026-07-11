// Drizzle migration runner — applies Drizzle Kit generated migrations.
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import dotenv from 'dotenv';

dotenv.config();

const url = process.env.SUPABASE_DATABASE_URL;
if (!url) {
  console.error('❌ SUPABASE_DATABASE_URL is required');
  process.exit(1);
}

async function main() {
  const sql = postgres(url, { ssl: 'require', max: 1 });
  const db = drizzle(sql);

  try {
    console.log('▶ Running Drizzle migrations...');
    await migrate(db, { migrationsFolder: './db/drizzle' });
    console.log('✅ All migrations applied.');
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

main();
