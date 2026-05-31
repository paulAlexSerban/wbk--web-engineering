import path from "path";
import { runMigrations } from "./db/migrate";

const PORT = Number(process.env.PORT) || 3000;
const dbPath = path.join(process.cwd(), "data", "app.db");

async function main() {
  await runMigrations(dbPath);

  const { createApp } = await import("./app");
  const app = createApp();
  app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
  });
}

main().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
