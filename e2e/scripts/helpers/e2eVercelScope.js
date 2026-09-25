/**
 * Finds the one Vercel scope (the signed-in user's personal account or one of
 * their teams) that owns both governed projects. Discovery is read-only: it
 * issues only GET requests, runs before any provider write, and refuses
 * rather than guesses. Zero or several qualifying scopes stop the run.
 *
 * A scope qualifies only when the exact-name lookup of each governed project
 * returns that name, a project id and an accountId equal to the scope's id.
 * The accountId check is the backstop that turns a wrongly scoped probe into
 * an absence, never a false match.
 *
 * Transport concerns stay with the caller: `unscopedApi` reads the user and
 * their teams, and `scopedApiFor(scope)` returns an API pinned to one scope.
 */
import { isNotFoundError } from "./e2eVercelApi.js";

const TEAM_PAGE_LIMIT = 100;
export const MAX_TEAM_PAGES = 50;

function hasText(value) {
  return typeof value === "string" && value.length > 0;
}

/**
 * The personal scope from GET /v2/user, as { user } or the bare user. It is
 * always a candidate, Northstar accounts included: a transport that cannot
 * probe it must refuse, never skip it.
 */
export async function readPersonalScope({ api }) {
  const response = await api.request("/v2/user");
  const user = response?.user ?? response;
  if (!hasText(user?.id)) {
    throw new Error(
      "Vercel GET /v2/user returned no user id; refusing to guess the personal scope. Nothing was changed.",
    );
  }
  const username = hasText(user.username) ? user.username : null;
  return {
    kind: "personal",
    id: user.id,
    label: username ?? user.id,
    cliScope: username ?? user.id,
  };
}

function toTeamScope(team) {
  if (!hasText(team?.id)) {
    throw new Error(
      "Vercel GET /v2/teams returned a team without an id; refusing to guess. Nothing was changed.",
    );
  }
  const name = hasText(team.slug) ? team.slug : team.id;
  return { kind: "team", id: team.id, label: name, cliScope: name };
}

function teamsPage(until) {
  const cursor =
    until === undefined ? "" : `&until=${encodeURIComponent(until)}`;
  const query = `limit=${TEAM_PAGE_LIMIT}${cursor}`;
  return `/v2/teams?${query}`;
}

function refuseTeamPage(page, reason) {
  throw new Error(
    `Vercel GET /v2/teams page ${page + 1} ${reason}; refusing to decide on an incomplete team list. Nothing was changed.`,
  );
}

function isCursor(value) {
  return hasText(value) || Number.isFinite(value);
}

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

/**
 * The documented envelope: { count, next, prev }, where next is a cursor or
 * an explicit null on the last page. An absent next is missing metadata, not
 * a last page.
 */
function isPagination(pagination) {
  if (!isPlainObject(pagination)) return false;
  if (!Number.isFinite(pagination.count)) return false;
  if (!Object.hasOwn(pagination, "next")) return false;
  if (pagination.next !== null && !isCursor(pagination.next)) return false;
  const { prev } = pagination;
  return prev === undefined || prev === null || isCursor(prev);
}

/**
 * The CLI prints an HTTP error as a JSON body and exits zero, so every page
 * is checked before it is trusted: an error body, a missing or non-array
 * `teams`, or a missing, incomplete or malformed pagination stops discovery.
 */
function validateTeamsPage(body, page) {
  if (!isPlainObject(body)) {
    refuseTeamPage(page, "is not a JSON object");
  }
  if (body.error !== undefined) {
    const code = hasText(body.error?.code) ? body.error.code : "unknown";
    refuseTeamPage(page, `returned an error (${code})`);
  }
  if (!Array.isArray(body.teams)) refuseTeamPage(page, "has no teams array");
  if (body.pagination === undefined) refuseTeamPage(page, "has no pagination");
  if (!isPagination(body.pagination)) {
    refuseTeamPage(page, "has an invalid pagination");
  }
  return { teams: body.teams, next: body.pagination.next };
}

/**
 * Every team scope across all pages of GET /v2/teams. Each cursor is
 * followed; only an explicit null next ends the list.
 */
export async function listTeamScopes({ api }) {
  const scopes = [];
  let until;
  for (let page = 0; page < MAX_TEAM_PAGES; page += 1) {
    const body = await api.request(teamsPage(until));
    const { teams, next } = validateTeamsPage(body, page);
    scopes.push(...teams.map(toTeamScope));
    if (next === null) return scopes;
    until = next;
  }
  throw new Error(
    `The Vercel team list exceeds ${MAX_TEAM_PAGES} pages; refusing to decide. Nothing was changed.`,
  );
}

/** Personal first, then teams by id ascending; each scope id listed once. */
export async function candidateScopes({ api }) {
  const personal = await readPersonalScope({ api });
  const teams = (await listTeamScopes({ api })).sort((a, b) =>
    a.id < b.id ? -1 : a.id > b.id ? 1 : 0,
  );
  const seen = new Set();
  return [personal, ...teams].filter((scope) => {
    if (seen.has(scope.id)) return false;
    seen.add(scope.id);
    return true;
  });
}

function classifyBody(body, name) {
  if (hasText(body?.id) && hasText(body?.name)) return { found: body };
  const code = body?.error?.code;
  if (code === "not_found") return { absent: true };
  if (code) {
    throw new Error(
      `Vercel lookup of '${name}' failed: ${code}. Nothing was changed.`,
    );
  }
  throw new Error(
    `Vercel lookup of '${name}' returned an unrecognised response shape; refusing to guess. Nothing was changed.`,
  );
}

/** { found } or { absent: true }; any other failure is rethrown. */
export async function lookupProject({ api, name }) {
  let body;
  try {
    body = await api.request(`/v9/projects/${encodeURIComponent(name)}`);
  } catch (error) {
    if (isNotFoundError(error)) return { absent: true };
    throw error;
  }
  return classifyBody(body, name);
}

function agrees(project, name, scope) {
  return (
    project?.name === name &&
    hasText(project?.id) &&
    project?.accountId === scope.id
  );
}

/** Looks up every governed name in one scope and reports what agreed. */
export async function qualifyScope({ api, scope, names }) {
  const found = {};
  const agreed = {};
  for (const [role, name] of Object.entries(names)) {
    const result = await lookupProject({ api, name });
    found[role] = result.found ?? null;
    agreed[role] = agrees(result.found, name, scope);
  }
  const qualifies = Object.values(agreed).every(Boolean);
  return { scope, found, agreed, qualifies };
}

function describeFinding({ scope, found, agreed }, names) {
  const parts = Object.entries(names)
    .filter(([role]) => found[role])
    .map(([role, name]) => {
      const note = agreed[role] ? "" : ", does not agree with this scope";
      return `${name} (${found[role].id}${note})`;
    });
  const summary = parts.length
    ? parts.join(", ")
    : "none of the governed projects";
  return `${scope.kind} '${scope.label}': ${summary}`;
}

function normalise(project) {
  return {
    projectId: project.id,
    orgId: project.accountId,
    projectName: project.name,
  };
}

function refuseNone(findings, names) {
  const wanted = Object.values(names).map((name) => `'${name}'`);
  const lines = findings.map((finding) => describeFinding(finding, names));
  throw new Error(
    `No Vercel scope holds both ${wanted.join(" and ")}. Scopes inspected:\n` +
      `${lines.map((line) => `  - ${line}`).join("\n")}\nNothing was changed.`,
  );
}

function refuseMany(qualifying, names) {
  const wanted = Object.values(names)
    .map((name) => `'${name}'`)
    .join(" and ");
  const lines = qualifying.map((finding) => describeFinding(finding, names));
  throw new Error(
    `Several Vercel scopes hold both ${wanted}; refusing to choose. Qualifying scopes:\n` +
      `${lines.map((line) => `  - ${line}`).join("\n")}\nNothing was changed.`,
  );
}

/**
 * The single scope that holds every governed project, with those projects
 * normalised to { projectId, orgId, projectName }. `names` maps each role to
 * its governed project name.
 */
export async function discoverVercelScope({
  scopedApiFor,
  unscopedApi,
  names,
}) {
  const scopes = await candidateScopes({ api: unscopedApi });
  const findings = [];
  for (const scope of scopes) {
    findings.push(
      await qualifyScope({ api: scopedApiFor(scope), scope, names }),
    );
  }
  const qualifying = findings.filter((finding) => finding.qualifies);
  if (qualifying.length === 0) refuseNone(findings, names);
  if (qualifying.length > 1) refuseMany(qualifying, names);
  const [{ scope, found }] = qualifying;
  const projects = Object.fromEntries(
    Object.entries(found).map(([role, project]) => [role, normalise(project)]),
  );
  return { scope, projects };
}
