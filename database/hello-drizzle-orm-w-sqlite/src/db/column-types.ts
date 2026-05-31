import { integer, sqliteTable } from "drizzle-orm/sqlite-core";


export const timestamp = (name: string) => integer(name, { mode: "timestamp" });

// Usage in schema - always uses timestamp_s consistently
export const myTable = sqliteTable("my_table", {
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
});