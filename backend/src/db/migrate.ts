import sql from "./connection.ts";

async function waitForDatabase(): Promise<void> {
  const maxAttempts = 30;
  const delayMs = 2000;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      await sql`select 1`;
      return;
    } catch (error) {
      if (attempt === maxAttempts) {
        throw error;
      }
      console.warn(
        `Database not ready (attempt ${attempt}/${maxAttempts}). Retrying in ${delayMs}ms...`,
      );
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}

export async function migrate() {
  console.log("Migrating database...");
  await waitForDatabase();
  const initSql = await Bun.file(
    new URL("init.sql", import.meta.url),
  ).text();
  await sql.unsafe(initSql);
  console.log("Database migration complete");
}
