import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  const hasTable = await knex.schema.hasTable("users");
  if (!hasTable) {
    return knex.schema.createTable("users", (table) => {
      table.increments("id").primary();
      table.string("email").unique().notNullable();
      table.string("password").notNullable();
      table.boolean("is_pro").defaultTo(false);
      table.bigInteger("storage_used").defaultTo(0);
      table.timestamps(true, true);
    });
  } else {
    return knex.schema.alterTable("users", (table) => {
      // Check if columns exist before adding them
      table.boolean("is_pro").defaultTo(false);
      table.bigInteger("storage_used").defaultTo(0);
      // We don't need timestamps if they exist, but let's assume we might need to add them
      // table.timestamps(true, true);
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable("users");
}
