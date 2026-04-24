import { Pool } from "pg";

let pool: Pool;

declare global {
  var pool: Pool | undefined;
}

if (process.env.NODE_ENV === "production") {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
} else {
  if (!global.pool) {
    global.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
  }
  pool = global.pool;
}

export const connectDB = async () => {
  try {
    const client = await pool.connect();
    console.log("PG Database connected successfully");
    client.release();
  } catch (error) {
    console.error("Database connection failed: ", error);
  }
};

export const query = async (text: string, params?: unknown[]) => {
  try {
    const result = await pool.query(text, params);
    return result;
  } catch (error) {
    console.error("DB error: ", error);
    throw error;
  }
};

export default pool;
