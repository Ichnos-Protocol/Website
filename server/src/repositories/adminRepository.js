/**
 * Admin Repository
 *
 * Data access functions for admin dashboard queries.
 * All queries are parameterized to prevent SQL injection.
 */
import pool from "../config/database.js";

// `kind` is a property of the contact_requests row, not of the person. The
// chat-only surfaces exclude a user only when they filed an actual inquiry, so
// a consortium-kind row must not disqualify them. Both chat-only queries share
// this literal fragment so the two exclusions can never drift apart.
const CHAT_ONLY_EXCLUSION_SQL = `u.firebase_uid NOT IN (
           SELECT DISTINCT user_id FROM contact_requests WHERE kind = 'inquiry'
         )`;

// Consortium answers are a property of the person (user_profiles), so the
// export selects them identically in both UNION arms — both already join
// user_profiles, which keeps the arms type-compatible without NULL casts.
// The export carries every consortium column from migration 006, including
// consortium_admin_notes, so an admin export is a complete consortium record.
const CONSORTIUM_EXPORT_COLUMNS = `p.consortium_interest, p.consortium_position, p.consortium_chain_role,
              p.consortium_product_line, p.consortium_customer_request,
              p.consortium_data_extract, p.consortium_data_needs,
              p.consortium_preferred_start, p.consortium_source,
              p.consortium_consent_timestamp, p.consortium_consent_version,
              p.consortium_registered_at, p.consortium_tier,
              p.consortium_tier_selected_at, p.consortium_status,
              p.consortium_admin_notes`;

export async function getUsersWithRequests() {
  try {
    const { rows } = await pool.query(
      `SELECT u.firebase_uid AS "userId",
              p.name, p.surname, p.email, p.phone, p.company,
              p.consortium_interest AS "consortiumInterest",
              COUNT(cr.id) FILTER (WHERE cr.kind = 'inquiry')::int AS "totalRequests",
              MAX(cr.updated_at) AS "lastActivity"
       FROM users u
       JOIN user_profiles p ON u.firebase_uid = p.user_id
       JOIN contact_requests cr ON cr.user_id = u.firebase_uid
       WHERE u.deleted_at IS NULL
       GROUP BY u.firebase_uid, p.name, p.surname, p.email, p.phone, p.company,
                p.consortium_interest
       ORDER BY "lastActivity" DESC`,
    );
    return rows;
  } catch (error) {
    console.error("adminRepository.getUsersWithRequests failed:", error.message);
    throw error;
  }
}

export async function getRequestsWithQuestionsByUserId(userId) {
  try {
    const { rows } = await pool.query(
      `SELECT cr.* FROM contact_requests cr
       WHERE cr.user_id = $1
       ORDER BY cr.created_at DESC`,
      [userId],
    );
    if (rows.length === 0) return [];

    const ids = rows.map((r) => r.id);
    const { rows: qRows } = await pool.query(
      `SELECT id, question, answer, source, created_at, contact_request_id
       FROM questions WHERE contact_request_id = ANY($1)
       ORDER BY created_at ASC`,
      [ids],
    );

    const questionsMap = new Map();
    for (const q of qRows) {
      const list = questionsMap.get(q.contact_request_id) || [];
      list.push(q);
      questionsMap.set(q.contact_request_id, list);
    }

    return rows.map((r) => ({
      ...r,
      questionPreview: questionsMap.get(r.id)?.[0]?.question ?? "",
      questions: questionsMap.get(r.id) ?? [],
    }));
  } catch (error) {
    console.error(
      "adminRepository.getRequestsWithQuestionsByUserId failed:",
      error.message,
    );
    throw error;
  }
}

export async function getChatOnlyUsers() {
  try {
    const { rows } = await pool.query(
      `SELECT u.firebase_uid AS "userId",
              p.name, p.surname, p.email, p.phone, p.company,
              COUNT(q.id)::int AS "totalMessages",
              MAX(q.created_at) AS "lastActivity"
       FROM users u
       JOIN user_profiles p ON u.firebase_uid = p.user_id
       JOIN questions q ON q.user_id = u.firebase_uid AND q.source = 'chat'
       WHERE u.deleted_at IS NULL
         AND ${CHAT_ONLY_EXCLUSION_SQL}
       GROUP BY u.firebase_uid, p.name, p.surname, p.email, p.phone, p.company
       ORDER BY "lastActivity" DESC`,
    );
    return rows;
  } catch (error) {
    console.error("adminRepository.getChatOnlyUsers failed:", error.message);
    throw error;
  }
}

export async function getUncategorizedQuestions() {
  try {
    const { rows } = await pool.query(
      `SELECT id, question FROM questions
       WHERE id NOT IN (SELECT question_id FROM question_topics)
       ORDER BY id ASC`,
    );
    return rows;
  } catch (error) {
    console.error("adminRepository.getUncategorizedQuestions failed:", error.message);
    throw error;
  }
}

export async function getTopicAggregates() {
  try {
    const { rows } = await pool.query(
      `SELECT topic, COUNT(*)::int AS count,
              AVG(confidence)::numeric AS avg_confidence
       FROM question_topics
       GROUP BY topic
       ORDER BY count DESC
       LIMIT 20`,
    );
    return rows;
  } catch (error) {
    console.error("adminRepository.getTopicAggregates failed:", error.message);
    throw error;
  }
}

export async function getAllDataForExport() {
  try {
    const { rows } = await pool.query(
      `SELECT u.firebase_uid, p.name, p.surname, p.email, p.company,
              cr.id AS request_id, cr.status,
              cr.created_at AS request_created_at,
              q.id AS question_id, q.question, q.answer, q.source,
              q.created_at AS question_created_at,
              ${CONSORTIUM_EXPORT_COLUMNS}
       FROM users u
       JOIN user_profiles p ON u.firebase_uid = p.user_id
       LEFT JOIN contact_requests cr ON cr.user_id = u.firebase_uid
       LEFT JOIN questions q ON q.contact_request_id = cr.id
       WHERE u.deleted_at IS NULL

       UNION ALL

       SELECT u.firebase_uid, p.name, p.surname, p.email, p.company,
              NULL AS request_id, NULL AS status,
              NULL AS request_created_at,
              q.id AS question_id, q.question, q.answer, q.source,
              q.created_at AS question_created_at,
              ${CONSORTIUM_EXPORT_COLUMNS}
       FROM users u
       JOIN user_profiles p ON u.firebase_uid = p.user_id
       JOIN questions q ON q.user_id = u.firebase_uid
              AND q.contact_request_id IS NULL
       WHERE u.deleted_at IS NULL

       ORDER BY firebase_uid, request_id, question_id`,
    );
    return rows;
  } catch (error) {
    console.error("adminRepository.getAllDataForExport failed:", error.message);
    throw error;
  }
}

export async function getInactiveUsers() {
  try {
    const { rows } = await pool.query(
      `SELECT firebase_uid FROM users
       WHERE updated_at < NOW() - INTERVAL '24 months'
         AND deleted_at IS NULL`,
    );
    return rows;
  } catch (error) {
    console.error("adminRepository.getInactiveUsers failed:", error.message);
    throw error;
  }
}

export async function getRecentInquiries() {
  try {
    const { rows } = await pool.query(
      `SELECT cr.id, cr.status, cr.created_at,
              p.name, p.email, p.company,
              (SELECT LEFT(q.question, 120)
               FROM questions q
               WHERE q.contact_request_id = cr.id
               ORDER BY q.created_at ASC
               LIMIT 1) AS "questionPreview"
       FROM contact_requests cr
       JOIN user_profiles p ON cr.user_id = p.user_id
       WHERE cr.created_at >= NOW() - INTERVAL '24 hours'
         AND cr.kind = 'inquiry'
       ORDER BY cr.created_at DESC`,
    );
    return rows;
  } catch (error) {
    console.error("adminRepository.getRecentInquiries failed:", error.message);
    throw error;
  }
}

// Registration is a property of the person, not of a row, so discovery reads
// user_profiles rather than contact_requests.kind — not every registrant has a
// consortium-kind row. Row-level filters use `kind`; person-level discovery
// uses `consortium_interest`.
export async function getRecentConsortiumRegistrations() {
  try {
    const { rows } = await pool.query(
      `SELECT p.name, p.email, p.company,
              p.consortium_position AS "position",
              p.consortium_chain_role AS "chainRole",
              p.consortium_source AS "source",
              p.consortium_registered_at AS "registeredAt"
       FROM user_profiles p
       JOIN users u ON u.firebase_uid = p.user_id
       WHERE u.deleted_at IS NULL
         AND p.consortium_interest = true
         AND p.consortium_registered_at >= NOW() - INTERVAL '24 hours'
       ORDER BY p.consortium_registered_at DESC`,
    );
    return rows;
  } catch (error) {
    console.error(
      "adminRepository.getRecentConsortiumRegistrations failed:",
      error.message,
    );
    throw error;
  }
}

export async function getRecentChatOnlyLeads() {
  try {
    const { rows } = await pool.query(
      `SELECT u.firebase_uid AS "userId",
              p.name, p.email,
              COUNT(q.id)::int AS "totalMessages"
       FROM users u
       JOIN user_profiles p ON u.firebase_uid = p.user_id
       JOIN questions q ON q.user_id = u.firebase_uid AND q.source = 'chat'
       WHERE u.deleted_at IS NULL
         AND u.created_at >= NOW() - INTERVAL '24 hours'
         AND ${CHAT_ONLY_EXCLUSION_SQL}
       GROUP BY u.firebase_uid, p.name, p.email
       ORDER BY "totalMessages" DESC`,
    );
    return rows;
  } catch (error) {
    console.error("adminRepository.getRecentChatOnlyLeads failed:", error.message);
    throw error;
  }
}

const CONSORTIUM_REGISTRANTS_SQL = `SELECT u.firebase_uid AS "userId",
              p.name, p.surname, p.email, p.phone, p.company, p.linkedin,
              p.consortium_interest AS "consortiumInterest",
              p.consortium_position AS "consortiumPosition",
              p.consortium_chain_role AS "consortiumChainRole",
              p.consortium_product_line AS "consortiumProductLine",
              p.consortium_customer_request AS "consortiumCustomerRequest",
              p.consortium_data_extract AS "consortiumDataExtract",
              p.consortium_data_needs AS "consortiumDataNeeds",
              p.consortium_preferred_start AS "consortiumPreferredStart",
              p.consortium_source AS "consortiumSource",
              p.consortium_consent_timestamp AS "consortiumConsentTimestamp",
              p.consortium_consent_version AS "consortiumConsentVersion",
              p.consortium_registered_at AS "consortiumRegisteredAt",
              p.consortium_tier AS "consortiumTier",
              p.consortium_tier_selected_at AS "consortiumTierSelectedAt",
              p.consortium_status AS "consortiumStatus",
              p.consortium_admin_notes AS "consortiumAdminNotes"
       FROM user_profiles p
       JOIN users u ON u.firebase_uid = p.user_id
       WHERE u.deleted_at IS NULL
         AND p.consortium_interest = true`;

const CONSORTIUM_FILTER_COLUMNS = {
  tier: "p.consortium_tier",
  source: "p.consortium_source",
  status: "p.consortium_status",
};

// Only the placeholder number is interpolated; every value travels in `params`.
function buildConsortiumFilterClause(filters) {
  const clauses = [];
  const params = [];

  for (const [key, column] of Object.entries(CONSORTIUM_FILTER_COLUMNS)) {
    const value = filters?.[key];
    if (value === undefined || value === null || value === "") continue;
    params.push(value);
    clauses.push(` AND ${column} = $${params.length}`);
  }

  return { clause: clauses.join(""), params };
}

export async function getConsortiumRegistrants(filters = {}) {
  const { clause, params } = buildConsortiumFilterClause(filters);
  try {
    const { rows } = await pool.query(
      `${CONSORTIUM_REGISTRANTS_SQL}${clause}
       ORDER BY p.consortium_registered_at DESC NULLS LAST`,
      params,
    );
    return rows;
  } catch (error) {
    console.error(
      "adminRepository.getConsortiumRegistrants failed:",
      error.message,
    );
    throw error;
  }
}

export async function getChatMessagesByUserId(userId) {
  try {
    const { rows } = await pool.query(
      `SELECT id, question, answer, created_at
       FROM questions
       WHERE user_id = $1 AND source = 'chat'
       ORDER BY created_at ASC`,
      [userId],
    );
    return rows;
  } catch (error) {
    console.error(
      "adminRepository.getChatMessagesByUserId failed:",
      error.message,
    );
    throw error;
  }
}
