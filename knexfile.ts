import type { Knex } from "knex";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const config: { [key: string]: Knex.Config } = {
  development: {
    client: "postgresql",
    connection: process.env.DATABASE_URL,
    migrations: {
      directory: "./src/db/migrations",
      extension: "ts",
    },
  },
  production: {
    client: "postgresql",
    connection: process.env.DATABASE_URL,
    migrations: {
      directory: "./src/db/migrations",
      extension: "ts",
    },
  },
};

export default config;
