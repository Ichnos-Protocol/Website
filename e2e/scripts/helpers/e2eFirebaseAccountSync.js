/**
 * Account convergence for the provisioning orchestrator. Every account is
 * checked first (existence, disabled flag, display name, custom claims and a
 * password sign-in probe); only then are the differing fields written, so an
 * abort on any account leaves Firebase untouched. firebaseTestSetup.js keeps
 * its legacy always-write behaviour for server/scripts/setupTestEnvironment.js.
 *
 * No password, API key or token is ever logged, returned or put in an error.
 */

export const SIGN_IN_ENDPOINT =
  "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword";

export const PASSWORD_MISMATCH_CODES = [
  "INVALID_LOGIN_CREDENTIALS",
  "INVALID_PASSWORD",
];

const STATUS_ORDER = ["created", "updated", "unchanged"];

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function arraysEqual(a, b) {
  return a.length === b.length && a.every((v, i) => jsonEqual(v, b[i]));
}

function objectsEqual(a, b) {
  const keysA = Object.keys(a).sort();
  const keysB = Object.keys(b).sort();
  if (!arraysEqual(keysA, keysB)) return false;
  return keysA.every((key) => jsonEqual(a[key], b[key]));
}

/** Plain-JSON deep equality that ignores object key order. */
export function jsonEqual(a, b) {
  if (Array.isArray(a) || Array.isArray(b)) {
    return Array.isArray(a) && Array.isArray(b) && arraysEqual(a, b);
  }
  if (isPlainObject(a) || isPlainObject(b)) {
    return isPlainObject(a) && isPlainObject(b) && objectsEqual(a, b);
  }
  return Object.is(a, b);
}

/** The leading Identity Toolkit error code; never any other body field. */
export function providerCode(body) {
  const message = body?.error?.message;
  if (typeof message !== "string" || message.trim() === "") return "UNKNOWN";
  return message.trim().split(/[\s:]/)[0] || "UNKNOWN";
}

function signInError(email, detail) {
  return new Error(
    `Sign-in check for ${email} failed (${detail}). Nothing was changed in Firebase.`,
  );
}

// A thrown fetch or parse error can carry the keyed URL, so only a fixed
// label is reported.
async function postSignIn({ email, password, apiKey, fetchImpl }) {
  try {
    return await fetchImpl(
      `${SIGN_IN_ENDPOINT}?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, returnSecureToken: true }),
      },
    );
  } catch {
    throw signInError(email, "network error");
  }
}

async function parseBody(response, email) {
  try {
    return await response.json();
  } catch {
    throw signInError(email, "non-JSON response");
  }
}

/** Resolves "matches" or "differs"; any other outcome throws. */
export async function checkPassword({ email, password, apiKey, fetchImpl }) {
  const response = await postSignIn({ email, password, apiKey, fetchImpl });
  const body = await parseBody(response, email);
  if (response.ok) return "matches";
  const code = providerCode(body);
  if (PASSWORD_MISMATCH_CODES.includes(code)) return "differs";
  throw signInError(email, code);
}

async function readUser(auth, email) {
  try {
    return await auth.getUserByEmail(email);
  } catch (err) {
    if (err?.code === "auth/user-not-found") return null;
    throw err;
  }
}

async function planAccount(auth, spec, { apiKey, fetchImpl }) {
  const user = await readUser(auth, spec.email);
  if (!user) return { spec, action: "create" };
  if (user.disabled === true) {
    throw new Error(
      `Firebase account ${spec.email} is disabled. Nothing was changed in Firebase.`,
    );
  }
  const fields = [];
  const probe = { ...spec, apiKey, fetchImpl };
  if ((await checkPassword(probe)) === "differs") fields.push("password");
  if (user.displayName !== spec.displayName) fields.push("displayName");
  if (!jsonEqual(user.customClaims ?? {}, spec.claims)) fields.push("claims");
  const action = fields.length ? "update" : "none";
  return { spec, action, uid: user.uid, fields };
}

async function createAccount(auth, spec) {
  const { email, password, displayName } = spec;
  const user = await auth.createUser({ email, password, displayName });
  await auth.setCustomUserClaims(user.uid, spec.claims);
  return { uid: user.uid, status: "created" };
}

async function updateAccount(auth, { spec, uid, fields }) {
  const payload = {};
  if (fields.includes("password")) payload.password = spec.password;
  if (fields.includes("displayName")) payload.displayName = spec.displayName;
  if (Object.keys(payload).length > 0) await auth.updateUser(uid, payload);
  if (fields.includes("claims"))
    await auth.setCustomUserClaims(uid, spec.claims);
  return { uid, status: "updated", fields };
}

async function applyPlan(auth, plan) {
  const { email, uidKey } = plan.spec;
  if (plan.action === "create") {
    return { email, uidKey, ...(await createAccount(auth, plan.spec)) };
  }
  if (plan.action === "update") {
    return { email, uidKey, ...(await updateAccount(auth, plan)) };
  }
  return { email, uidKey, uid: plan.uid, status: "unchanged" };
}

function logResult({ email, status, fields }) {
  const detail = fields ? ` (${fields.join(", ")})` : "";
  console.log(`[firebase] ${status}: ${email}${detail}`);
}

function summarize(results) {
  return STATUS_ORDER.map((status) => [
    status,
    results.filter((r) => r.status === status).length,
  ])
    .filter(([, count]) => count > 0)
    .map(([status, count]) => `${count} ${status}`)
    .join(", ");
}

/**
 * Pre-checks every spec, then writes only the differences.
 * Returns { uidMap, results } with uidMap keyed by each spec's uidKey.
 */
export async function syncFirebaseAccounts({
  auth,
  specs,
  apiKey,
  fetchImpl = fetch,
}) {
  const plans = [];
  for (const spec of specs) {
    plans.push(await planAccount(auth, spec, { apiKey, fetchImpl }));
  }
  const results = [];
  for (const plan of plans) {
    const result = await applyPlan(auth, plan);
    logResult(result);
    results.push(result);
  }
  console.log(`[firebase] ${summarize(results)}`);
  const uidMap = Object.fromEntries(results.map((r) => [r.uidKey, r.uid]));
  return { uidMap, results };
}
