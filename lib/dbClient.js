// FAYL: lib/dbClient.js
//
// Postgres ulanish poolini yaratadi. .env.local (yoki Netlify Environment
// Variables) ichida DATABASE_URL o'rnatilgan bo'lishi kerak, masalan:
//   DATABASE_URL=postgresql://postgres:PAROL@db.xxxx.supabase.co:5432/postgres

import { Pool } from "pg";

if (!process.env.DATABASE_URL) {
  console.warn(
    "[dbClient] OGOHLANTIRISH: DATABASE_URL .env.local faylida topilmadi"
  );
}

// Next.js dev rejimida Fast Refresh sabab modul qayta-qayta yuklanadi —
// har safar yangi pool ochilmasligi uchun global'da keshlaymiz.
const globalForPg = global;

const pool =
  globalForPg._pgPool ||
  new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

if (process.env.NODE_ENV !== "production") {
  globalForPg._pgPool = pool;
}

export default pool;