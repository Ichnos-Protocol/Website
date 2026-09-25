/**
 * One Vercel environment variable on the all-branches Preview scope: no git
 * branch, no custom environment, not Production. Branch-scoped overrides and
 * Production entries are never selected, read or written. An unchanged value
 * is not written.
 */
import { maskValue } from "./e2eEnvFile.js";

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
  await api.request(envPath(projectId, "v10"), {
    method: "POST",
    body: { key, value, type: "encrypted", target: ["preview"] },
  });
  return "success";
}

async function updatePreviewEntry(api, projectId, entry, value) {
  const id = encodeURIComponent(entry.id);
  const current = await api.request(envPath(projectId, "v1", `/${id}`));
  if (current?.value === value) return "unchanged";
  await api.request(envPath(projectId, "v9", `/${id}`), {
    method: "PATCH",
    body: { value },
  });
  return "success";
}

/**
 * Creates or updates key on the all-branches Preview scope. Returns the shape
 * printSummary/printFailedDetails read; a failure is a result, not a throw.
 */
export async function setPreviewEnv({ api, projectId, key, value }) {
  const result = { name: key, masked: maskValue(value) };
  try {
    api.registerSecret(value);
    const entry = await findPreviewEntry({ api, projectId, key });
    const status = entry
      ? await updatePreviewEntry(api, projectId, entry, value)
      : await createPreviewEntry(api, projectId, key, value);
    return { ...result, status };
  } catch (err) {
    return { ...result, status: "failed", error: err.message };
  }
}
