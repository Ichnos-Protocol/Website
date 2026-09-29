-- Migration: 010_20260923_consortium_preferred_start_contract
-- Backfills the retired value 'nov_2026' to 'asap' on user_profiles.consortium_preferred_start, then
-- contracts the CHECK from the three values migration 007 allowed to two: 'asap' and 'later'. Serves P14.
-- Runs only after P1 is live in production (live since 23 September 2026), so no deployed code still
-- writes 'nov_2026'.
-- This is the epic's only contraction. After it runs, code that writes 'nov_2026' must not be restored
-- without first re-expanding the CHECK.
-- Idempotent: the drop carries IF EXISTS, so the drop-then-add pair is safe to re-run as a whole, and the
-- backfill matches no row on a second run. NULL still satisfies the CHECK, so unset rows are untouched.

UPDATE user_profiles
    SET consortium_preferred_start = 'asap'
    WHERE consortium_preferred_start = 'nov_2026';

ALTER TABLE user_profiles
    DROP CONSTRAINT IF EXISTS chk_user_profiles_consortium_preferred_start;

ALTER TABLE user_profiles
    ADD CONSTRAINT chk_user_profiles_consortium_preferred_start
        CHECK (consortium_preferred_start IN ('asap', 'later'));
