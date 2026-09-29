/**
 * Idempotent seed queries for the preview E2E accounts. Every statement is an
 * upsert or a guarded insert, so re-running the seed never duplicates rows.
 */

async function upsertUser(pool, uid, firstName, lastName, email) {
  await pool.query(
    `INSERT INTO users (firebase_uid)
     VALUES ($1)
     ON CONFLICT (firebase_uid) DO UPDATE SET deleted_at = NULL`,
    [uid],
  );
  await pool.query(
    `INSERT INTO user_profiles (user_id, name, surname, email, company)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (user_id) DO UPDATE
       SET name = $2, surname = $3, email = $4, company = $5`,
    [uid, firstName, lastName, email, "E2E Corp"],
  );
}

/**
 * Seed a user whose profile is deliberately incomplete (empty name/surname).
 *
 * The profile-completion E2E spec relies on this account so that a real
 * login always opens the "Complete Your Profile" modal. We store empty
 * strings (not NULL) because the user_profiles.name / surname columns are
 * NOT NULL, and computeProfileState() treats empty strings as missing.
 *
 * Idempotent: re-running the seed resets name/surname back to '' even if a
 * prior test run successfully completed the profile.
 */
async function upsertIncompleteUser(pool, uid, email) {
  await pool.query(
    `INSERT INTO users (firebase_uid)
     VALUES ($1)
     ON CONFLICT (firebase_uid) DO UPDATE SET deleted_at = NULL`,
    [uid],
  );
  await pool.query(
    `INSERT INTO user_profiles (user_id, name, surname, email, company)
     VALUES ($1, '', '', $2, NULL)
     ON CONFLICT (user_id) DO UPDATE
       SET name = '', surname = '', email = $2, company = NULL`,
    [uid, email],
  );
}

async function findOrCreateRequest(pool, uid) {
  const existing = await pool.query(
    "SELECT id FROM contact_requests WHERE user_id = $1 LIMIT 1",
    [uid],
  );
  if (existing.rows.length > 0) return existing.rows[0].id;

  const res = await pool.query(
    `INSERT INTO contact_requests
       (user_id, status, contact_consent_timestamp, contact_consent_version)
     VALUES ($1, 'new', NOW(), 'v1') RETURNING id`,
    [uid],
  );
  return res.rows[0].id;
}

async function upsertQuestion(pool, uid, requestId) {
  await pool.query(
    `INSERT INTO questions (user_id, contact_request_id, question, source)
     SELECT $1::varchar, $2::integer, 'E2E test question', 'form'
     WHERE NOT EXISTS (
       SELECT 1 FROM questions
       WHERE user_id = $1::varchar AND contact_request_id = $2::integer
         AND question = 'E2E test question'
     )`,
    [uid, requestId],
  );
}

async function upsertContactRequest(pool, uid) {
  const requestId = await findOrCreateRequest(pool, uid);
  await upsertQuestion(pool, uid, requestId);
}

async function seedOptionalUser(pool) {
  if (!process.env.E2E_USER_UID || !process.env.E2E_USER_EMAIL) return;
  await upsertUser(
    pool,
    process.env.E2E_USER_UID,
    "E2E",
    "User",
    process.env.E2E_USER_EMAIL,
  );
}

async function seedOptionalIncompleteUser(pool) {
  if (
    !process.env.E2E_INCOMPLETE_USER_UID ||
    !process.env.E2E_INCOMPLETE_USER_EMAIL
  ) {
    return;
  }
  await upsertIncompleteUser(
    pool,
    process.env.E2E_INCOMPLETE_USER_UID,
    process.env.E2E_INCOMPLETE_USER_EMAIL,
  );
}

async function seedAdmin(pool) {
  await upsertUser(
    pool,
    process.env.E2E_ADMIN_UID,
    "E2E",
    "Admin",
    process.env.E2E_ADMIN_EMAIL,
  );
  await upsertContactRequest(pool, process.env.E2E_ADMIN_UID);
}

async function seedOptionalSuperAdmin(pool) {
  if (!process.env.E2E_SUPER_ADMIN_UID || !process.env.E2E_SUPER_ADMIN_EMAIL)
    return;
  await upsertUser(
    pool,
    process.env.E2E_SUPER_ADMIN_UID,
    "E2E",
    "SuperAdmin",
    process.env.E2E_SUPER_ADMIN_EMAIL,
  );
  await upsertContactRequest(pool, process.env.E2E_SUPER_ADMIN_UID);
}

/** Run every seed step in order against an already-connected pool. */
export async function runSeedQueries(pool) {
  await seedOptionalUser(pool);
  await seedOptionalIncompleteUser(pool);
  await seedAdmin(pool);
  await seedOptionalSuperAdmin(pool);
}
