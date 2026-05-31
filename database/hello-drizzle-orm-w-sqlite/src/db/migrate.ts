import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import path from "path";

export async function runMigrations(dbPath: string): Promise<void> {
  const sqlite = new Database(dbPath);
  const db = drizzle(sqlite);

  migrate(db, {
    migrationsFolder: path.join(process.cwd(), "drizzle"),
  });

  sqlite.close();
  console.log("Migrations applied successfully");
}
