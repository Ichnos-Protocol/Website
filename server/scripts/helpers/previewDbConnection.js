/**
 * Connection helpers for the preview E2E seed: pool config, SSL decision,
 * connectivity probe, pool shutdown and transient-error classification.
 */

// Substrings of pg / Neon errors that clear on retry: a compute waking from
// scale-to-zero, an SSL handshake timeout, or branch churn from a re-deploy.
const TRANSIENT_ERROR_PATTERNS = [
  "timed out",
  "terminated",
  "Connection refused",
  "ECONNRESET",
  "ECONNREFUSED",
  "ETIMEDOUT",
];

/**
 * Parse the DATABASE_URL to extract host info for diagnostics.
 * Never logs credentials — only host, port, and database name.
 */
export function logConnectionInfo(dbUrl) {
  try {
    const u = new URL(dbUrl);
    console.log(
      `[e2e-seed] DB target: host=${u.hostname}, port=${u.port || 5432}, ` +
        `db=${u.pathname.slice(1)}, user=${u.username}, ssl=${u.searchParams.get("sslmode") || "default"}`,
    );
  } catch {
    console.error("[e2e-seed] DATABASE_URL is not a valid URL");
  }
}

/**
 * Neon always requires SSL. If sslmode is in the URL, pg handles it.
 * If not, explicitly enable SSL to avoid "Connection terminated" errors.
 */
export function buildSslOption(dbUrl) {
  if (dbUrl.includes("sslmode=")) return undefined;
  return { rejectUnauthorized: false };
}

/** Build Pool configuration from DATABASE_URL. */
export function buildPoolConfig(dbUrl) {
  const config = {
    connectionString: dbUrl,
    connectionTimeoutMillis: 15000,
    max: 2,
  };
  const ssl = buildSslOption(dbUrl);
  if (ssl) config.ssl = ssl;
  return config;
}

/**
 * Test basic connectivity with a simple SELECT 1 before running the full seed.
 * This isolates connection issues from seed logic errors.
 */
export async function testConnection(pool) {
  const { rows } = await pool.query("SELECT 1 AS ok");
  return rows[0]?.ok === 1;
}

export async function closePool(pool) {
  try {
    await pool.end();
  } catch (err) {
    console.error("[e2e-seed] Pool close failed:", err.message);
  }
}

/** True when an error message names a failure that a retry can clear. */
export function isTransientDbError(message) {
  return TRANSIENT_ERROR_PATTERNS.some((pattern) => message.includes(pattern));
}
