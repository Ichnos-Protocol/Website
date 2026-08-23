/**
 * User Repository
 *
 * Data access functions for users and user_profiles tables.
 * All queries are parameterized to prevent SQL injection.
 */
import pool from "../config/database.js";

export async function createUser(firebaseUid) {
  try {
    const { rows } = await pool.query(
      `INSERT INTO users (firebase_uid) VALUES ($1) RETURNING *`,
      [firebaseUid],
    );
    return rows[0];
  } catch (error) {
    console.error("userRepository.createUser failed:", error.message);
    throw error;
  }
}

export async function upsertProfile(userId, profileData, db = pool) {
  try {
    const { name, surname, email, phone, company, linkedin } = profileData;
    const { rows } = await db.query(
      `INSERT INTO user_profiles (user_id, name, surname, email, phone, company, linkedin)
       VALUES ($1, COALESCE($2, ''), COALESCE($3, ''), $4, $5, $6, $7)
       ON CONFLICT (user_id)
       DO UPDATE SET
         name = COALESCE($2, user_profiles.name),
         surname = COALESCE($3, user_profiles.surname),
         email = $4, phone = $5, company = $6, linkedin = $7
       RETURNING *`,
      [userId, name ?? null, surname ?? null, email, phone || null, company || null, linkedin || null],
    );
    return rows[0];
  } catch (error) {
    console.error("userRepository.upsertProfile failed:", error.message);
    throw error;
  }
}

export async function getUserById(userId, db = pool) {
  try {
    const { rows } = await db.query(
      `SELECT u.firebase_uid, u.deleted_at, u.created_at, u.updated_at,
              p.name, p.surname, p.email, p.phone, p.company, p.linkedin
       FROM users u
       LEFT JOIN user_profiles p ON u.firebase_uid = p.user_id
       WHERE u.firebase_uid = $1`,
      [userId],
    );
    return rows[0] || null;
  } catch (error) {
    console.error("userRepository.getUserById failed:", error.message);
    throw error;
  }
}

export async function getUserByEmail(email) {
  try {
    const { rows } = await pool.query(
      `SELECT u.firebase_uid, u.deleted_at, u.created_at, u.updated_at,
              p.name, p.surname, p.email, p.phone, p.company, p.linkedin
       FROM user_profiles p
       JOIN users u ON p.user_id = u.firebase_uid
       WHERE p.email = $1`,
      [email],
    );
    return rows[0] || null;
  } catch (error) {
    console.error("userRepository.getUserByEmail failed:", error.message);
    throw error;
  }
}

export async function updateUserActivity(userId, db = pool) {
  try {
    await db.query(
      `UPDATE users SET updated_at = NOW() WHERE firebase_uid = $1`,
      [userId],
    );
  } catch (error) {
    console.error("userRepository.updateUserActivity failed:", error.message);
    throw error;
  }
}

const DEFAULT_CONSORTIUM_STATUS = "registered";

// consortium_admin_notes is deliberately excluded: nothing returned by these
// functions may surface internal admin commentary to a visitor.
const CONSORTIUM_COLUMNS = `consortium_interest, consortium_position, consortium_chain_role,
              consortium_product_line, consortium_customer_request, consortium_data_extract,
              consortium_data_needs, consortium_preferred_start, consortium_source,
              consortium_consent_timestamp, consortium_consent_version,
              consortium_registered_at, consortium_tier, consortium_tier_selected_at,
              consortium_status`;

// First write wins for registration metadata: COALESCE keeps the original
// registered_at, source and status while the answers themselves are overwritten.
const UPDATE_CONSORTIUM_SQL = `UPDATE user_profiles
       SET consortium_interest = true,
           consortium_position = $2,
           consortium_chain_role = $3,
           consortium_product_line = $4,
           consortium_customer_request = $5,
           consortium_data_extract = $6,
           consortium_data_needs = $7,
           consortium_preferred_start = $8,
           consortium_consent_timestamp = $9,
           consortium_consent_version = $10,
           consortium_registered_at = COALESCE(consortium_registered_at, NOW()),
           consortium_source = COALESCE(consortium_source, $11),
           consortium_status = COALESCE(consortium_status, $12)
       WHERE user_id = $1
       RETURNING ${CONSORTIUM_COLUMNS}`;

function buildConsortiumParams(userId, data) {
  return [
    userId,
    data.position,
    data.chainRole,
    data.productLine,
    data.customerRequest ?? null,
    data.dataExtract,
    data.dataNeeds ?? null,
    data.preferredStart,
    data.consentTimestamp,
    data.consentVersion,
    data.source ?? null,
    DEFAULT_CONSORTIUM_STATUS,
  ];
}

export async function updateConsortiumProfile(userId, data, db = pool) {
  try {
    const { rows } = await db.query(
      UPDATE_CONSORTIUM_SQL,
      buildConsortiumParams(userId, data),
    );
    return rows[0] || null;
  } catch (error) {
    console.error("userRepository.updateConsortiumProfile failed:", error.message);
    throw error;
  }
}

// Every synced user has a profile row and migration 006 defaults
// consortium_interest to false, so only consortium_interest = true marks an
// actual registration. The predicate filters at the database, the guard below
// keeps the null contract if a caller ever hands over a non-registrant row.
export async function getConsortiumProfile(userId, db = pool) {
  try {
    const { rows } = await db.query(
      `SELECT ${CONSORTIUM_COLUMNS}
       FROM user_profiles
       WHERE user_id = $1 AND consortium_interest = true`,
      [userId],
    );
    const row = rows[0];
    return row && row.consortium_interest === true ? row : null;
  } catch (error) {
    console.error("userRepository.getConsortiumProfile failed:", error.message);
    throw error;
  }
}

export async function scrubConsortiumText(userId, db = pool) {
  try {
    await db.query(
      `UPDATE user_profiles
       SET consortium_product_line = NULL,
           consortium_customer_request = NULL,
           consortium_data_needs = NULL,
           consortium_admin_notes = NULL
       WHERE user_id = $1`,
      [userId],
    );
  } catch (error) {
    console.error("userRepository.scrubConsortiumText failed:", error.message);
    throw error;
  }
}

// The consortium_interest = true predicate is defence in depth behind the
// service authorization check: a non-registrant updates no row and gets null.
export async function setConsortiumTier(userId, tier, db = pool) {
  try {
    const { rows } = await db.query(
      `UPDATE user_profiles
       SET consortium_tier = $2,
           consortium_tier_selected_at = NOW()
       WHERE user_id = $1 AND consortium_interest = true
       RETURNING ${CONSORTIUM_COLUMNS}`,
      [userId, tier],
    );
    return rows[0] || null;
  } catch (error) {
    console.error("userRepository.setConsortiumTier failed:", error.message);
    throw error;
  }
}

export async function deleteUserData(userId) {
  try {
    await pool.query(
      `UPDATE user_profiles
       SET name = 'Deleted', surname = 'Deleted',
           email = 'deleted@deleted.invalid',
           phone = NULL, company = NULL, linkedin = NULL
       WHERE user_id = $1`,
      [userId],
    );
    await pool.query(
      `UPDATE users SET deleted_at = NOW() WHERE firebase_uid = $1`,
      [userId],
    );
  } catch (error) {
    console.error("userRepository.deleteUserData failed:", error.message);
    throw error;
  }
}
