import { readFileSync, readdirSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";

const databaseUrl = process.env.DATABASE_URL || "file:./prisma/dev.db";
if (!databaseUrl.startsWith("file:")) throw new Error("The local migration helper only supports SQLite file URLs.");
const relative = databaseUrl.slice(5).replace(/^\.\//, "");
const databasePath = relative === "dev.db" ? "prisma/dev.db" : relative;
const database = new DatabaseSync(databasePath);
database.exec('CREATE TABLE IF NOT EXISTS "_IaraMigration" ("name" TEXT NOT NULL PRIMARY KEY, "appliedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP);');
const migrations = readdirSync("prisma/migrations", { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();
const applied = database.prepare('SELECT 1 FROM "_IaraMigration" WHERE "name" = ?');
const record = database.prepare('INSERT INTO "_IaraMigration" ("name") VALUES (?)');
for (const name of migrations) {
  if (applied.get(name)) continue;
  const migration = readFileSync(`prisma/migrations/${name}/migration.sql`, "utf8");
  database.exec("BEGIN");
  try {
    database.exec(migration);
    record.run(name);
    database.exec("COMMIT");
  } catch (error) {
    database.exec("ROLLBACK");
    throw error;
  }
}
database.close();
console.log(`Applied ${migrations.length} SQLite migrations to ${databasePath}.`);
