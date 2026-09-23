/**
 * Rate Limit Repository
 *
 * Data access functions for the rate_limit_hits table, the shared counter
 * store behind PgRateLimitStore. Keys arrive already prefixed by the store.
 * All queries are parameterized to prevent SQL injection. Keys embed the
 * client IP, so failures log only the error message, never the key.
 */
import pool from "../config/database.js";

// One statement per hit: a new key starts a window, an expired key restarts
// it, a live key counts up. The row lock taken by ON CONFLICT makes
// concurrent serverless instances serialize on the same counter.
const INCREMENT_HIT_SQL = `INSERT INTO rate_limit_hits (key, hits, reset_at)
       VALUES ($1, 1, NOW() + ($2::bigint * INTERVAL '1 millisecond'))
       ON CONFLICT (key) DO UPDATE SET
         hits = CASE WHEN rate_limit_hits.reset_at <= NOW() THEN 1
                     ELSE rate_limit_hits.hits + 1 END,
         reset_at = CASE WHEN rate_limit_hits.reset_at <= NOW()
                         THEN NOW() + ($2::bigint * INTERVAL '1 millisecond')
                         ELSE rate_limit_hits.reset_at END
       RETURNING hits, reset_at`;

const DECREMENT_HIT_SQL = `UPDATE rate_limit_hits
       SET hits = GREATEST(hits - 1, 0)
       WHERE key = $1 AND reset_at > NOW()
       RETURNING hits, reset_at`;

const DELETE_KEY_SQL = `DELETE FROM rate_limit_hits WHERE key = $1`;

const GET_HIT_SQL = `SELECT hits, reset_at FROM rate_limit_hits
       WHERE key = $1 AND reset_at > NOW()`;

// Expired rows are never read again, and a key that never returns is never
// reset, so they are reclaimed in bounded batches through the reset_at index
// (migration 011). SKIP LOCKED leaves rows a live increment holds alone, and
// the outer reset_at check keeps a row restarted mid-sweep from being deleted.
const DELETE_EXPIRED_SQL = `DELETE FROM rate_limit_hits
       WHERE key IN (
         SELECT key FROM rate_limit_hits
         WHERE reset_at <= NOW()
         ORDER BY reset_at
         LIMIT $1
         FOR UPDATE SKIP LOCKED
       ) AND reset_at <= NOW()`;

// Roughly one increment in a hundred triggers a sweep, so reclamation keeps
// pace with traffic without a scheduler and without a per-request cost.
export const SWEEP_PROBABILITY = 0.01;
export const SWEEP_BATCH_SIZE = 500;

function mapHitRow(row) {
  if (!row) return null;
  return { hits: Number(row.hits), resetAt: row.reset_at };
}

export async function deleteExpiredHits(limit = SWEEP_BATCH_SIZE) {
  try {
    const { rowCount } = await pool.query(DELETE_EXPIRED_SQL, [limit]);
    return rowCount;
  } catch (error) {
    console.error("rateLimitRepository.deleteExpiredHits failed:", error.message);
    throw error;
  }
}

// Awaited by incrementHit: Vercel freezes the function once the response is
// sent, so an unawaited DELETE may never finish. It never rejects (a failure
// is logged by deleteExpiredHits and resolves to 0), so the increment keeps
// its result. Returns the pending sweep, or null when this call was not sampled.
export function maybeSweepExpired() {
  if (Math.random() >= SWEEP_PROBABILITY) return null;
  return deleteExpiredHits().catch(() => 0);
}

export async function incrementHit(key, windowMs) {
  try {
    const { rows } = await pool.query(INCREMENT_HIT_SQL, [key, windowMs]);
    await maybeSweepExpired();
    return mapHitRow(rows[0]);
  } catch (error) {
    console.error("rateLimitRepository.incrementHit failed:", error.message);
    throw error;
  }
}

export async function decrementHit(key) {
  try {
    const { rows } = await pool.query(DECREMENT_HIT_SQL, [key]);
    return mapHitRow(rows[0]);
  } catch (error) {
    console.error("rateLimitRepository.decrementHit failed:", error.message);
    throw error;
  }
}

export async function resetKey(key) {
  try {
    const { rowCount } = await pool.query(DELETE_KEY_SQL, [key]);
    return rowCount > 0;
  } catch (error) {
    console.error("rateLimitRepository.resetKey failed:", error.message);
    throw error;
  }
}

export async function getHit(key) {
  try {
    const { rows } = await pool.query(GET_HIT_SQL, [key]);
    return mapHitRow(rows[0]);
  } catch (error) {
    console.error("rateLimitRepository.getHit failed:", error.message);
    throw error;
  }
}
