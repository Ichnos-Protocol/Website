-- Migration: 011_20260924_rate_limit_hits_reset_at_index
-- Indexes rate_limit_hits.reset_at so rateLimitRepository.deleteExpiredHits can find expired rows
-- without scanning the table. Without the sweep, every client key ever seen keeps a row forever:
-- incrementHit restarts only a key that comes back, and express-rate-limit never calls resetKey
-- when a window lapses.
-- Additive only: 009 is already applied and is not edited. 010, the consortium preferred_start
-- contraction, has been applied and recorded; it is independent of this rate-limit index.
-- Idempotent: CREATE INDEX IF NOT EXISTS makes the file safe to re-run. Not CONCURRENTLY, because
-- runMigrations.js wraps each file in a transaction; the table holds only short-lived counters.

CREATE INDEX IF NOT EXISTS idx_rate_limit_hits_reset_at ON rate_limit_hits (reset_at);
