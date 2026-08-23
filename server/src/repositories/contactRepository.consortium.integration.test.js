/**
 * Integration Tests — Consortium Registration
 *
 * Runs against a real PostgreSQL database via TEST_DATABASE_URL.
 * Skipped when the env var is not set.
 *
 * Exercises the real repository functions by passing the test pool as their
 * trailing `db` argument, so the ON CONFLICT inference and the COALESCE
 * first-write-wins rules are checked against the actual engine.
 */
import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import pg from "pg";

import { createContactRequest } from "./contactRepository.js";
import {
  updateConsortiumProfile,
  getConsortiumProfile,
  scrubConsortiumText,
} from "./userRepository.js";

const TEST_DB_URL = process.env.TEST_DATABASE_URL;
const skip = !TEST_DB_URL;

const describeIf = skip ? describe.skip : describe;

let pool;

const answers = {
  position: "supplier",
  chainRole: "cathode_material",
  productLine: "NMC cathode powders",
  customerRequest: "OEM asked for a passport-ready datasheet",
  dataExtract: "not_yet",
  dataNeeds: "Cell-level carbon footprint",
  preferredStart: "nov_2026",
  source: "landing_page",
  consentTimestamp: "2026-02-16T12:00:00Z",
  consentVersion: "v1",
};

const consortiumConsent = {
  consentTimestamp: "2026-02-16T12:00:00Z",
  consentVersion: "v1",
  kind: "consortium",
};

describeIf("consortium registration (integration)", () => {
  beforeAll(async () => {
    pool = new pg.Pool({ connectionString: TEST_DB_URL });

    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        firebase_uid VARCHAR(128) PRIMARY KEY,
        deleted_at   TIMESTAMPTZ,
        created_at   TIMESTAMPTZ DEFAULT NOW(),
        updated_at   TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_profiles (
        user_id                        VARCHAR(128) PRIMARY KEY REFERENCES users(firebase_uid) ON DELETE CASCADE,
        name                           VARCHAR(255) NOT NULL,
        surname                        VARCHAR(255) NOT NULL,
        email                          VARCHAR(255) NOT NULL,
        phone                          VARCHAR(50),
        company                        VARCHAR(255),
        linkedin                       VARCHAR(500),
        consortium_interest            BOOLEAN NOT NULL DEFAULT false,
        consortium_position            VARCHAR(40),
        consortium_chain_role          VARCHAR(40),
        consortium_product_line        TEXT,
        consortium_customer_request    TEXT,
        consortium_data_extract        VARCHAR(20),
        consortium_data_needs          TEXT,
        consortium_preferred_start     VARCHAR(20),
        consortium_source              VARCHAR(40),
        consortium_consent_timestamp   TIMESTAMP,
        consortium_consent_version     VARCHAR(20),
        consortium_registered_at       TIMESTAMP,
        consortium_tier                VARCHAR(30),
        consortium_tier_selected_at    TIMESTAMP,
        consortium_status              VARCHAR(30),
        consortium_admin_notes         TEXT
      )
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS contact_requests (
        id                          SERIAL PRIMARY KEY,
        user_id                     VARCHAR(128) NOT NULL REFERENCES users(firebase_uid),
        contact_consent_timestamp   TIMESTAMPTZ NOT NULL,
        contact_consent_version     VARCHAR(20) NOT NULL,
        status                      VARCHAR(50) DEFAULT 'new',
        admin_notes                 TEXT,
        kind                        VARCHAR(20) NOT NULL DEFAULT 'inquiry'
          CONSTRAINT chk_contact_requests_kind CHECK (kind IN ('inquiry', 'consortium')),
        created_at                  TIMESTAMPTZ DEFAULT NOW(),
        updated_at                  TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    await pool.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS uq_contact_requests_one_consortium_per_user
      ON contact_requests (user_id) WHERE kind = 'consortium'
    `);
  });

  beforeEach(async () => {
    await pool.query("DELETE FROM contact_requests");
    await pool.query("DELETE FROM user_profiles");
    await pool.query("DELETE FROM users");
    await pool.query("INSERT INTO users (firebase_uid) VALUES ($1)", ["test-uid"]);
    await pool.query(
      "INSERT INTO user_profiles (user_id, name, surname, email) VALUES ($1, $2, $3, $4)",
      ["test-uid", "Alice", "Smith", "alice@test.com"],
    );
  });

  afterAll(async () => {
    await pool.query("DROP TABLE IF EXISTS contact_requests CASCADE");
    await pool.query("DROP TABLE IF EXISTS user_profiles CASCADE");
    await pool.query("DROP TABLE IF EXISTS users CASCADE");
    await pool.end();
  });

  it("allows only one consortium row per user", async () => {
    const first = await createContactRequest("test-uid", consortiumConsent, pool);
    const second = await createContactRequest("test-uid", consortiumConsent, pool);

    expect(first.kind).toBe("consortium");
    expect(second).toBeNull();

    const { rows } = await pool.query(
      "SELECT id FROM contact_requests WHERE user_id = $1 AND kind = 'consortium'",
      ["test-uid"],
    );
    expect(rows).toHaveLength(1);
  });

  it("still accepts an inquiry row for a registered user", async () => {
    await createContactRequest("test-uid", consortiumConsent, pool);
    const inquiry = await createContactRequest(
      "test-uid",
      { consentTimestamp: "2026-03-01T00:00:00Z", consentVersion: "v1" },
      pool,
    );

    expect(inquiry.kind).toBe("inquiry");

    const { rows } = await pool.query(
      "SELECT kind FROM contact_requests WHERE user_id = $1 ORDER BY id",
      ["test-uid"],
    );
    expect(rows.map((r) => r.kind)).toEqual(["consortium", "inquiry"]);
  });

  it("overwrites answers but keeps the original registration metadata", async () => {
    const first = await updateConsortiumProfile("test-uid", answers, pool);
    const second = await updateConsortiumProfile(
      "test-uid",
      {
        ...answers,
        position: "anchor",
        productLine: "LFP cathode powders",
        source: "second_source",
      },
      pool,
    );

    expect(second.consortium_position).toBe("anchor");
    expect(second.consortium_product_line).toBe("LFP cathode powders");
    expect(second.consortium_interest).toBe(true);
    expect(second.consortium_source).toBe("landing_page");
    expect(second.consortium_status).toBe("registered");
    expect(second.consortium_registered_at).toEqual(first.consortium_registered_at);
  });

  it("scrubs free text and leaves the structured answers intact", async () => {
    await updateConsortiumProfile("test-uid", answers, pool);
    await pool.query(
      "UPDATE user_profiles SET consortium_tier = $2, consortium_admin_notes = $3 WHERE user_id = $1",
      ["test-uid", "pilot", "internal note"],
    );

    await scrubConsortiumText("test-uid", pool);
    const profile = await getConsortiumProfile("test-uid", pool);

    expect(profile.consortium_product_line).toBeNull();
    expect(profile.consortium_customer_request).toBeNull();
    expect(profile.consortium_data_needs).toBeNull();
    expect(profile.consortium_position).toBe("supplier");
    expect(profile.consortium_chain_role).toBe("cathode_material");
    expect(profile.consortium_data_extract).toBe("not_yet");
    expect(profile.consortium_preferred_start).toBe("nov_2026");
    expect(profile.consortium_tier).toBe("pilot");
    expect(profile.consortium_status).toBe("registered");

    const { rows } = await pool.query(
      "SELECT consortium_admin_notes FROM user_profiles WHERE user_id = $1",
      ["test-uid"],
    );
    expect(rows[0].consortium_admin_notes).toBeNull();
  });

  it("is a no-op when scrubbing an unknown user", async () => {
    await expect(scrubConsortiumText("no-such-uid", pool)).resolves.toBeUndefined();
  });
});
