// Seeder using Drizzle ORM — inserts default data.
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import dotenv from 'dotenv';
import { eq, sql } from 'drizzle-orm';
import * as schema from '../src/lib/db/schema';

dotenv.config();

const url = process.env.SUPABASE_DATABASE_URL;
if (!url) {
  console.error('❌ SUPABASE_DATABASE_URL is required');
  process.exit(1);
}

async function main() {
  const sqlClient = postgres(url, { ssl: 'require', max: 1 });
  const db = drizzle(sqlClient, { schema });

  try {
    // Seed users
    console.log('🌱 Seeding users...');
    await db.insert(schema.coffeeUsers).values([
      {
        name: 'Administrator',
        email: 'admin@gmail.cafe',
        passwordHash: sql`crypt('password', gen_salt('bf', 10))`,
        role: 'admin',
      },
      {
        name: 'Content Editor',
        email: 'editor@gmail.cafe',
        passwordHash: sql`crypt('password', gen_salt('bf', 10))`,
        role: 'editor',
      },
    ]).onConflictDoNothing({ target: schema.coffeeUsers.email });
    console.log('✅ Users seeded.');

    // Seed settings
    console.log('🌱 Seeding settings...');
    await db.insert(schema.coffeeSettings).values({
      id: 1,
      defaultLanguage: 'en',
      activeLanguages: ['en', 'id', 'cn'],
    }).onConflictDoUpdate({
      target: schema.coffeeSettings.id,
      set: {
        defaultLanguage: sql`EXCLUDED.default_language`,
        activeLanguages: sql`EXCLUDED.active_languages`,
        updatedAt: new Date(),
      },
    });
    console.log('✅ Settings seeded.');
    console.log('🎉 All seeders completed.');
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  } finally {
    await sqlClient.end();
  }
}

main();
