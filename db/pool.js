import pg from "pg";
import dotenv from "dotenv";
dotenv.config();

const { Pool } = pg;

const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    })
  : new Pool({
      host:     process.env.DB_HOST,
      port:     process.env.DB_PORT || 5432,
      database: process.env.DB_NAME,
      user:     process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
    });

pool.on("error", (err) => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1);
});

console.log("[pool] DATABASE_URL set:", !!process.env.DATABASE_URL);
if (process.env.DATABASE_URL) {
  const u = new URL(process.env.DATABASE_URL);
  console.log(`[pool] host=${u.hostname} port=${u.port} db=${u.pathname}`);
}

export default pool;
