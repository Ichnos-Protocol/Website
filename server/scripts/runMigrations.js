/**
 * Run SQL migrations in order, tracking applied files in schema_migrations.
 *
 * Usage:
 *   - Standalone: DATABASE_URL=... node scripts/runMigrations.js
 *   - Imported:   import { runMigrations } from './runMigrations.js'
 *
 * Concurrent runners (parallel preview cold starts) serialize on a
 * transaction-scoped advisory lock and re-check schema_migrations inside it,
 * so each file is applied once. Session-level locks are never taken: Neon's
 * pooled endpoint runs in transaction mode and would not keep them.
 */
import pg from "pg";
import fs from "fs";
import { dirname, join } from "path";
import { fileURLToPath, pathToFileURL } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = join(__dirname, "../migrations");
const MIGRATION_ADVISORY_LOCK_KEY = 8126042117;

async function loadAppliedSet(client) {
  try {
    const res = await client.query("SELECT filename FROM schema_migrations");
    return new Set(res.rows.map((r) => r.filename));
  } catch (err) {
    if (err.code === "42P01") return new Set();
    throw err;
  }
}

function listMigrationFiles() {
  if (!fs.existsSync(MIGRATIONS_DIR)) {
    throw new Error(`migrations directory not found: ${MIGRATIONS_DIR}`);
  }
  const files = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(".sql"))
    .sort();
  if (files.length === 0) {
    throw new Error(`no .sql migration files found in ${MIGRATIONS_DIR}`);
  }
  return files;
}

/**
 * Inside the lock: has another runner recorded this file since our first
 * read? to_regclass keeps the probe from aborting the transaction before
 * migration 000 has created the table.
 */
async function isRecordedInLock(client, filename) {
  const probe = await client.query(
    "SELECT to_regclass('public.schema_migrations') IS NOT NULL AS present",
  );
  if (!probe.rows[0]?.present) return false;
  const res = await client.query(
    "SELECT 1 FROM schema_migrations WHERE filename = $1 LIMIT 1",
    [filename],
  );
  return res.rows.length > 0;
}

/** Returns true when the file ran, false when another runner recorded it. */
async function applyMigration(client, filename, sql, applied) {
  await client.query("BEGIN");
  await client.query("SELECT pg_advisory_xact_lock($1::bigint)", [
    MIGRATION_ADVISORY_LOCK_KEY,
  ]);
  if (await isRecordedInLock(client, filename)) {
    await client.query("COMMIT");
    return false;
  }
  await client.query(sql);
  if (applied.size > 0 || filename.startsWith("000")) {
    await client.query(
      "INSERT INTO schema_migrations (filename) VALUES ($1) ON CONFLICT DO NOTHING",
      [filename],
    );
  }
  await client.query("COMMIT");
  return true;
}

async function applyPending(client, files, applied) {
  for (const file of files) {
    if (applied.has(file)) {
      console.log(`[migration] skipping: ${file}`);
      continue;
    }
    console.log(`[migration] applying: ${file}`);
    const sql = fs.readFileSync(join(MIGRATIONS_DIR, file), "utf8");
    const ran = await applyMigration(client, file, sql, applied);
    if (!ran) console.log(`[migration] skipping: ${file}`);
    applied.add(file);
  }
}

export async function runMigrations(connectionString, { ssl } = {}) {
  const files = listMigrationFiles();
  const client = new pg.Client({ connectionString, ...(ssl ? { ssl } : {}) });
  await client.connect();

  try {
    const applied = await loadAppliedSet(client);
    await applyPending(client, files, applied);
    console.log("[migration] done");
  } finally {
    await client.end();
  }
}

/** True only when argvPath resolves to exactly the module at moduleUrl. */
export function isMainModule(argvPath, moduleUrl) {
  return Boolean(argvPath) && moduleUrl === pathToFileURL(argvPath).href;
}

if (isMainModule(process.argv[1], import.meta.url)) {
  runMigrations(process.env.DATABASE_URL).catch((err) => {
    console.error("[migration] failed:", err.message);
    process.exit(1);
  });
}
