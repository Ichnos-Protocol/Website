/**
 * One Vercel environment variable on the all-branches Preview scope: no git
 * branch, no custom environment, not Production. Branch-scoped overrides and
 * Production entries are never selected, read or written. An unchanged value
 * is not written. A result carries non-secret outcome metadata only: the
 * operation and the provider's updatedAt wherever the read, create or update
 * response supplies one. A key whose name marks it as a secret is fully
 * masked at the source, so no consumer can print a tail of its value.
 */
import { maskValue } from "./e2eEnvFile.js";

const SECRET_KEY_NAME = /API_KEY|PASSWORD|SECRET|TOKEN/;

function maskFor(key, value) {
  return SECRET_KEY_NAME.test(key) ? "****" : maskValue(value);
}

// ISO 8601 date-time with an explicit zone. A zoneless or locale-style string
// is ambiguous, so it is refused rather than handed to permissive Date parsing.
const ISO_8601 =
  /^(\d{4})-(\d{2})-(\d{2})T([01]\d|2[0-3]):([0-5]\d)(?::([0-5]\d)(?:\.\d{1,9})?)?(?:Z|[+-](?:[01]\d|2[0-3]):[0-5]\d)$/;

function parseIso8601(raw) {
  const match = ISO_8601.exec(raw);
  if (!match) return undefined;
  const [year, month, day] = match.slice(1, 4).map(Number);
  const calendar = new Date(Date.UTC(year, month - 1, day));
  const realDay =
    calendar.getUTCFullYear() === year &&
    calendar.getUTCMonth() === month - 1 &&
    calendar.getUTCDate() === day;
  return realDay ? new Date(raw) : undefined;
}

/**
 * The provider timestamp as ISO, or undefined. A finite number or all-digit
 * string is epoch milliseconds; another string must be ISO 8601 with a zone.
 */
export function normalizeUpdatedAt(raw) {
  let date;
  if (typeof raw === "number" && Number.isFinite(raw)) date = new Date(raw);
  else if (typeof raw === "string" && /^\d+$/.test(raw)) {
    date = new Date(Number(raw));
  } else if (typeof raw === "string") date = parseIso8601(raw);
  if (!date || !Number.isFinite(date.getTime())) return undefined;
  return date.toISOString();
}

// Only the normalized timestamp leaves a write response; ids, values,
// branches and every other provider field are dropped here.
function writeOutcome(operation, raw) {
  const updatedAt = normalizeUpdatedAt(raw);
  return {
    status: "success",
    operation,
    ...(updatedAt ? { updatedAt } : {}),
  };
}

// The v10 create response wraps the entry in created, as an object or array.
function createdUpdatedAt(response) {
  const created = response?.created;
  const first = Array.isArray(created) ? created[0] : created;
  return first?.updatedAt ?? response?.updatedAt;
}

// Vercel omits gitBranch on an entry that applies to every branch; target and
// customEnvironmentIds are always present on the env endpoint.
function assertKnownScopeShape(entry) {
  const known =
    Array.isArray(entry?.target) &&
    Array.isArray(entry?.customEnvironmentIds) &&
    (entry.gitBranch == null || typeof entry.gitBranch === "string");
  if (known) return;
  throw new Error(
    `Vercel env entry for ${entry?.key ?? "an unnamed key"} has an unrecognised scope shape; refusing to guess. Nothing was written.`,
  );
}

export function isAllBranchesPreview(entry) {
  assertKnownScopeShape(entry);
  return (
    entry.target.includes("preview") &&
    !entry.target.includes("production") &&
    entry.gitBranch == null &&
    entry.customEnvironmentIds.length === 0
  );
}

function envPath(projectId, version, suffix = "") {
  return `/${version}/projects/${encodeURIComponent(projectId)}/env${suffix}`;
}

// The env list is paginated; a lookup that reaches the cap without a final
// page refuses to decide, since a later page could hold the entry.
const ENV_PAGE_LIMIT = 100;
const MAX_ENV_PAGES = 50;

function envListPage(projectId, until) {
  const query = `limit=${ENV_PAGE_LIMIT}${until ? `&until=${until}` : ""}`;
  return `${envPath(projectId, "v9")}?${query}`;
}

/** Every env entry named key, across all pages of the project's env list. */
async function listEntriesForKey(api, projectId, key) {
  const matches = [];
  let until;
  for (let page = 0; page < MAX_ENV_PAGES; page += 1) {
    const { envs = [], pagination } = await api.request(
      envListPage(projectId, until),
    );
    matches.push(...envs.filter((entry) => entry?.key === key));
    until = pagination?.next;
    if (!until) return matches;
  }
  throw new Error(
    `The Vercel env list for ${key} exceeds ${MAX_ENV_PAGES} pages; refusing to decide. Nothing was written.`,
  );
}

/**
 * The single all-branches Preview entry for key across every page, or null;
 * throws on two.
 */
export async function findPreviewEntry({ api, projectId, key }) {
  const entries = await listEntriesForKey(api, projectId, key);
  const candidates = entries.filter(isAllBranchesPreview);
  if (candidates.length > 1) {
    throw new Error(
      `${candidates.length} all-branches Preview entries exist for ${key}; refusing to choose. Nothing was written.`,
    );
  }
  return candidates[0] ?? null;
}

async function createPreviewEntry(api, projectId, key, value) {
  const response = await api.request(envPath(projectId, "v10"), {
    method: "POST",
    body: { key, value, type: "encrypted", target: ["preview"] },
  });
  return writeOutcome("created", createdUpdatedAt(response));
}

// An unchanged value takes its timestamp from the decrypted or listed entry;
// a write takes it from the PATCH response, when the provider supplies one.
async function updatePreviewEntry(api, projectId, entry, value) {
  const id = encodeURIComponent(entry.id);
  const current = await api.request(envPath(projectId, "v1", `/${id}`));
  if (current?.value === value) {
    return {
      status: "unchanged",
      operation: "unchanged",
      updatedAt: normalizeUpdatedAt(current?.updatedAt ?? entry?.updatedAt),
    };
  }
  const response = await api.request(envPath(projectId, "v9", `/${id}`), {
    method: "PATCH",
    body: { value },
  });
  return writeOutcome("updated", response?.updatedAt);
}

/**
 * Creates or updates key on the all-branches Preview scope. Returns the shape
 * printSummary/printFailedDetails read; a failure is a result, not a throw.
 */
export async function setPreviewEnv({ api, projectId, key, value }) {
  const result = { name: key, masked: maskFor(key, value) };
  try {
    api.registerSecret(value);
    const entry = await findPreviewEntry({ api, projectId, key });
    const outcome = entry
      ? await updatePreviewEntry(api, projectId, entry, value)
      : await createPreviewEntry(api, projectId, key, value);
    return { ...result, ...outcome };
  } catch (err) {
    return { ...result, status: "failed", error: err.message };
  }
}
