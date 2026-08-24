/**
 * PostgreSQL Connection Pool Singleton
 *
 * Uses a global reference to maintain a single pool instance across
 * Vercel serverless invocations. On warm starts the existing pool is
 * reused, avoiding repeated connection negotiation with Neon Tech.
 */
import pg from "pg";

const { Pool } = pg;

if (!globalThis.__pgPool) {
  globalThis.__pgPool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });

  globalThis.__pgPool.on("error", (err) => {
    console.error("Unexpected PostgreSQL pool error:", err);
  });
}

const pool = globalThis.__pgPool;

/**
 * Runs `fn` inside a single-client transaction.
 *
 * Checks out one client from the pool, opens a transaction, and hands the
 * client to `fn`. Commits on success and returns whatever `fn` resolved to;
 * rolls back and re-throws the original error on any failure. The client is
 * always released, on both paths.
 *
 * A `Pool` and a `PoolClient` expose the same `.query(...)` interface, which
 * is what lets repository functions take a `db = pool` parameter and accept
 * either one without changing their bodies.
 */
export async function withTransaction(fn) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch (rollbackError) {
      console.error("Failed to roll back transaction:", rollbackError);
    }
    throw error;
  } finally {
    client.release();
  }
}

export default pool;
