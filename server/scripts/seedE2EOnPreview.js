/**
 * Auto-seed E2E test data on preview startup.
 *
 * When the server starts in a Vercel preview environment (VERCEL_ENV === 'preview')
 * and the required E2E account env vars are present, this module idempotently
 * upserts test users and contact requests into the preview database.
 *
 * IMPORTANT — Vercel serverless lifecycle:
 * On Vercel, async work that outlives the HTTP response is killed. A fire-and-
 * forget call like `seedE2EOnPreview()` at module scope gets interrupted when
 * Vercel terminates the function after sending the response.
 *
 * Solution: the seed is exposed as a lazy singleton promise via `ensureSeeded()`.
 * The health endpoint `await`s this promise, keeping the function alive until
 * the seed completes. The promise is created once and shared across requests —
 * subsequent callers get the same (already-resolved) promise.
 */
import pg from "pg";

import { runSeedQueries } from "./helpers/e2eSeedQueries.js";
import {
  buildPoolConfig,
  closePool,
  isTransientDbError,
  logConnectionInfo,
  testConnection,
} from "./helpers/previewDbConnection.js";
import { applyPreviewMigrations } from "./helpers/previewMigrations.js";

const { Pool } = pg;

const REQUIRED_VARS = ["DATABASE_URL", "E2E_ADMIN_EMAIL", "E2E_ADMIN_UID"];

export const seedStatus = {
  seeded: false,
  error: null,
  attempts: 0,
  mode: "in_progress",
};

/** Singleton promise — created on first call, shared across all callers. */
let seedPromise = null;

/**
 * Returns a promise that resolves when seeding is complete (or skipped).
 * Safe to call multiple times — only runs the seed once.
 */
export function ensureSeeded() {
  if (!seedPromise) {
    seedPromise = seedE2EOnPreview();
  }
  return seedPromise;
}

/**
 * Reset seed state for testing. Clears the singleton promise and status
 * so each test starts fresh.
 */
export function resetSeedState() {
  seedPromise = null;
  seedStatus.seeded = false;
  seedStatus.error = null;
  seedStatus.attempts = 0;
  seedStatus.mode = "in_progress";
}

// Retry logic: Neon ephemeral branch compute endpoints may start suspended
// (scale-to-zero). The first connection attempt can fail with:
//   - "Connection terminated due to connection timeout" (compute waking up)
//   - "Authentication timed out" (SSL handshake timeout)
//   - "Connection terminated unexpectedly" (branch churn from re-deploy)
// Retrying after a delay gives Neon time to provision the compute endpoint.
const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 5000;

function markSkipped() {
  seedStatus.mode = "skipped";
  seedStatus.seeded = true;
}

/** Returns true when a preview guard says the seed must not run. */
function shouldSkipSeed() {
  if (process.env.SKIP_E2E_SEED === "true") {
    markSkipped();
    console.log("[e2e-seed] Seed skipped (SKIP_E2E_SEED=true)");
    return true;
  }
  if (process.env.VERCEL_ENV !== "preview") {
    markSkipped();
    return true;
  }
  return false;
}

function findMissingVars() {
  return REQUIRED_VARS.filter(
    (key) =>
      typeof process.env[key] !== "string" || process.env[key].length === 0,
  );
}

/** Returns true when every required variable is set; records the failure otherwise. */
function validateRequiredVars() {
  const missing = findMissingVars();
  if (missing.length === 0) return true;
  const msg = `Preview environment missing required seed vars: ${missing.join(", ")}`;
  seedStatus.error = msg;
  seedStatus.mode = "failed";
  console.error(`[e2e-seed] ${msg}`);
  return false;
}

function markSeeded() {
  seedStatus.seeded = true;
  seedStatus.error = null;
  seedStatus.mode = "seeded";
  console.log("[e2e-seed] E2E seed complete");
}

async function connectMigrateAndSeed(pool, dbUrl, attempt) {
  // Phase 1: Test basic connectivity
  console.log(
    `[e2e-seed] Attempt ${attempt}/${MAX_RETRIES}: testing connection...`,
  );
  await testConnection(pool);
  console.log("[e2e-seed] Connection established");

  // Phase 2: Bring the schema up to date (main preview only)
  await applyPreviewMigrations(dbUrl);

  // Phase 3: Run seed operations
  console.log("[e2e-seed] Running seed queries...");
  await runSeedQueries(pool);
}

async function waitBeforeRetry(err, attempt) {
  console.warn(
    `[e2e-seed] Attempt ${attempt}/${MAX_RETRIES} failed: ${err.message} — ` +
      `retrying in ${RETRY_DELAY_MS / 1000}s...`,
  );
  seedStatus.error = `Attempt ${attempt}: ${err.message}`;
  await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
}

function reportTerminalFailure(err, attempt) {
  seedStatus.error = err.message;
  seedStatus.mode = "failed";
  console.error(
    `[e2e-seed] E2E seed failed after ${attempt} attempt(s): ${err.message}`,
  );
  if (err.stack) console.error(`[e2e-seed] Stack: ${err.stack}`);
}

/** Returns true when the retry loop must stop after a terminal failure. */
async function handleAttemptFailure(err, attempt) {
  if (isTransientDbError(err.message) && attempt < MAX_RETRIES) {
    await waitBeforeRetry(err, attempt);
    return false;
  }
  reportTerminalFailure(err, attempt);
  return true;
}

/** Runs one attempt. Returns true when the loop is done, seeded or failed. */
async function runAttempt(dbUrl, attempt) {
  seedStatus.attempts = attempt;
  let pool;
  try {
    pool = new Pool(buildPoolConfig(dbUrl));
    await connectMigrateAndSeed(pool, dbUrl, attempt);
    markSeeded();
    return true;
  } catch (err) {
    return handleAttemptFailure(err, attempt);
  } finally {
    if (pool) await closePool(pool);
  }
}

export async function seedE2EOnPreview() {
  seedStatus.error = null;
  if (shouldSkipSeed() || !validateRequiredVars()) return;

  const dbUrl = process.env.DATABASE_URL;
  console.log("[e2e-seed] Preview environment detected — seeding E2E data...");
  logConnectionInfo(dbUrl);

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    if (await runAttempt(dbUrl, attempt)) return;
  }
}
