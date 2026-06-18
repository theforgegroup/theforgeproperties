import pg from 'pg';

const dbUrl = process.env.DATABASE_URL;
let dbPool: pg.Pool | null = null;

if (dbUrl) {
  console.log("Configuring config/database PostgreSQL connection pool...");
  dbPool = new pg.Pool({ connectionString: dbUrl });
} else {
  console.log("Warning: DATABASE_URL not set in config/database. Direct SQL queries will fail/mock.");
}

export const query = async (text: string, params?: unknown[]) => {
  if (!dbPool) {
    throw new Error("DATABASE_URL environment variable is required to execute PostgreSQL database queries.");
  }
  return dbPool.query(text, params);
};

export default {
  query
};
