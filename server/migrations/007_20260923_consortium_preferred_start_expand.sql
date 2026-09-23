-- Migration: 007_20260923_consortium_preferred_start_expand
-- Expands the CHECK on user_profiles.consortium_preferred_start from the two values migration 006
-- created to three, adding 'asap'. Serves P1.
-- Compatibility window: the deployed code writes 'nov_2026' and the P1 code writes 'asap'; both must
-- satisfy the constraint between this migration running and P1 being deployed.
-- Additive only: safe to run before P1 is deployed, and no existing row is rewritten.
-- Idempotent: the drop carries IF EXISTS, so the drop-then-add pair is safe to re-run as a whole.
-- The backfill of 'nov_2026' to 'asap' and the contraction to just 'asap' and 'later' belong to migration 010
-- (P14), run only after P1 is confirmed in production.

ALTER TABLE user_profiles
    DROP CONSTRAINT IF EXISTS chk_user_profiles_consortium_preferred_start;

ALTER TABLE user_profiles
    ADD CONSTRAINT chk_user_profiles_consortium_preferred_start
        CHECK (consortium_preferred_start IN ('nov_2026', 'asap', 'later'));
