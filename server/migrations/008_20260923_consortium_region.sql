-- Migration: 008_20260923_consortium_region
-- Adds the consortium_region column to user_profiles, consumed by P3a's registration field,
-- Zod enum and repository parameter.
-- Additive only: safe to run before P3a is deployed, since nothing reads or writes the column until then.
-- Nullable deliberately: existing registrations predate the question. Requiredness for new
-- registrations is enforced by the Zod schema, not by the column.
-- Idempotent: ADD COLUMN IF NOT EXISTS skips the whole clause, constraint included, when the column exists.

ALTER TABLE user_profiles
    ADD COLUMN IF NOT EXISTS consortium_region               VARCHAR(10)
        CONSTRAINT chk_user_profiles_consortium_region
        CHECK (consortium_region IN ('asean', 'eu', 'other'));
