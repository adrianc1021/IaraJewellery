import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";

const databaseUrl = process.env.DATABASE_URL || "file:./prisma/dev.db";
if (!databaseUrl.startsWith("file:")) throw new Error("The local migration helper only supports SQLite file URLs.");
const relative = databaseUrl.slice(5).replace(/^\.\//, "");
const databasePath = relative === "dev.db" ? "prisma/dev.db" : relative;
const migration = readFileSync("prisma/migrations/202608270001_init/migration.sql", "utf8");
const database = new DatabaseSync(databasePath);
database.exec(migration);
database.close();
console.log(`Applied SQLite migration to ${databasePath}.`);
