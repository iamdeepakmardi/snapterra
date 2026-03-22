import { query } from "../db";

async function migrate() {
  console.log("Running task migration...");
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        description TEXT,
        status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'done')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("Table 'tasks' created successfully.");
  } catch (err: any) {
    console.error("Migration failed:", err.message);
  } finally {
    process.exit();
  }
}

migrate();
