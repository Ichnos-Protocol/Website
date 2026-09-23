-- Migration: 009_20260923_rate_limit_hits
-- Creates rate_limit_hits, the shared-state table behind P11's Postgres rate-limit store
-- (rateLimitRepository.js / pgRateLimitStore.js), which replaces the per-instance in-memory limiter.
-- Additive only: safe to run before P11 is deployed; the table sits unused until then.
-- Idempotent: CREATE TABLE IF NOT EXISTS makes the file safe to re-run.
-- key is the limiter prefix plus client IP and the row is the whole record: no foreign keys, no
-- updated_at, so the update_updated_at trigger from migration 000 is deliberately not attached.
-- reset_at is TIMESTAMPTZ, unlike the TIMESTAMP columns of the 2026-02 tables, because the window
-- expiry is compared against now() across serverless regions.

CREATE TABLE IF NOT EXISTS rate_limit_hits (
    key         TEXT PRIMARY KEY,
    hits        INTEGER NOT NULL,
    reset_at    TIMESTAMPTZ NOT NULL
);
