-- Migration: 006_20260823_add_consortium_columns
-- Adds consortium registration columns to user_profiles and the kind marker to contact_requests.
-- Additive only: no column is dropped, no type is changed, no existing row is rewritten.
-- Idempotent: every ADD COLUMN and CREATE INDEX carries IF NOT EXISTS, so the file is safe to re-run.
-- The shared battery-passport tables are untouched; only user_profiles and contact_requests are referenced.
-- consortium_registered_at is deliberately distinct from updated_at, which trigger_update_updated_at
-- bumps on every profile edit.

-- Section A: consortium registration fields on user_profiles.
ALTER TABLE user_profiles
    ADD COLUMN IF NOT EXISTS consortium_interest             BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS consortium_position             VARCHAR(40)
        CONSTRAINT chk_user_profiles_consortium_position
        CHECK (consortium_position IN ('anchor', 'supplier', 'equipment_supplier', 'institute', 'other')),
    ADD COLUMN IF NOT EXISTS consortium_chain_role           VARCHAR(40)
        CONSTRAINT chk_user_profiles_consortium_chain_role
        CHECK (consortium_chain_role IN ('mining_refining', 'cathode_material', 'electrode', 'dry_cell', 'cell_activation', 'module_pack', 'recycling', 'equipment', 'institute', 'other')),
    ADD COLUMN IF NOT EXISTS consortium_product_line         TEXT,
    ADD COLUMN IF NOT EXISTS consortium_customer_request     TEXT,
    ADD COLUMN IF NOT EXISTS consortium_data_extract         VARCHAR(20)
        CONSTRAINT chk_user_profiles_consortium_data_extract
        CHECK (consortium_data_extract IN ('yes', 'not_yet', 'no', 'not_applicable')),
    ADD COLUMN IF NOT EXISTS consortium_data_needs           TEXT,
    ADD COLUMN IF NOT EXISTS consortium_preferred_start      VARCHAR(20)
        CONSTRAINT chk_user_profiles_consortium_preferred_start
        CHECK (consortium_preferred_start IN ('nov_2026', 'later')),
    ADD COLUMN IF NOT EXISTS consortium_source               VARCHAR(40),
    ADD COLUMN IF NOT EXISTS consortium_consent_timestamp    TIMESTAMP,
    ADD COLUMN IF NOT EXISTS consortium_consent_version      VARCHAR(20),
    ADD COLUMN IF NOT EXISTS consortium_registered_at        TIMESTAMP,
    ADD COLUMN IF NOT EXISTS consortium_tier                 VARCHAR(30)
        CONSTRAINT chk_user_profiles_consortium_tier
        CHECK (consortium_tier IN ('readiness', 'pilot', 'consortium_anchor', 'consortium_supplier', 'member', 'not_sure')),
    ADD COLUMN IF NOT EXISTS consortium_tier_selected_at     TIMESTAMP,
    ADD COLUMN IF NOT EXISTS consortium_status               VARCHAR(30)
        CONSTRAINT chk_user_profiles_consortium_status
        CHECK (consortium_status IN ('registered', 'contacted', 'readiness', 'in_consortium', 'declined')),
    ADD COLUMN IF NOT EXISTS consortium_admin_notes          TEXT;

-- Section B: distinguishes consortium registrations from ordinary inquiries.
-- Both existing rows take the default, so no backfill statement is required.
ALTER TABLE contact_requests
    ADD COLUMN IF NOT EXISTS kind VARCHAR(20) NOT NULL DEFAULT 'inquiry'
        CONSTRAINT chk_contact_requests_kind
        CHECK (kind IN ('inquiry', 'consortium'));

-- Section C: supporting indexes for admin filtering and reporting.
CREATE INDEX IF NOT EXISTS idx_user_profiles_consortium_interest ON user_profiles (consortium_interest);
CREATE INDEX IF NOT EXISTS idx_user_profiles_consortium_tier ON user_profiles (consortium_tier);
CREATE INDEX IF NOT EXISTS idx_user_profiles_consortium_source ON user_profiles (consortium_source);
CREATE INDEX IF NOT EXISTS idx_user_profiles_consortium_registered_at ON user_profiles (consortium_registered_at);
CREATE INDEX IF NOT EXISTS idx_contact_requests_kind ON contact_requests (kind);

-- Section D: concurrency guard — enforces "at most one consortium row per person" as a database fact.
CREATE UNIQUE INDEX IF NOT EXISTS uq_contact_requests_one_consortium_per_user ON contact_requests (user_id) WHERE kind = 'consortium';
