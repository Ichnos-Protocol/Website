/**
 * Finds the one Vercel scope that owns both governed projects. Discovery is
 * read-only: it issues only GET requests, runs before any provider write, and
 * refuses rather than guesses. It has two paths.
 *
 * The account-wide search serves a Full Account token and the CLI session:
 * the signed-in user's personal account and every team are candidates, and
 * zero or several qualifying scopes stop the run. A scope qualifies only when
 * the exact-name lookup of each governed project returns that name, a project
 * id and an accountId equal to the scope's id. The accountId check is the
 * backstop that turns a wrongly scoped probe into an absence, never a false
 * match.
 *
 * The team-scoped token path serves an explicit token (mode "token") whose
 * GET /v2/user answers with a structured `forbidden`: a token scoped to one
 * team cannot read the user. It looks up both governed names through that
 * token alone and accepts them only with exact names, one shared accountId,
 * and a team_ id. It checks only the token's own team, because the token
 * cannot reach, and therefore cannot write to, a same-named project in any
 * other scope. It never reads /v2/teams.
 *
 * Transport concerns stay with the caller: `unscopedApi` reads the user and
 * their teams, and `scopedApiFor(scope)` returns an API pinned to one scope.
 */
import { isNotFoundError, isTeamId } from "./e2eVercelApi.js";

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
 * An error envelope (the CLI prints an HTTP error as a JSON body and exits
 * zero) never reaches here: createVercelApi().request throws on it. Every
 * page is still checked before it is trusted: a non-object body, a missing
 * or non-array `teams`, or a missing, incomplete or malformed pagination
 * stops discovery.
 */
function validateTeamsPage(body, page) {
  if (!isPlainObject(body)) {
    refuseTeamPage(page, "is not a JSON object");
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

/**
 * Personal first, then teams by id ascending; each scope id listed once. A
 * personal scope already read by the caller is reused, never read twice.
 */
export async function candidateScopes({ api, personal: preRead }) {
  const personal = preRead ?? (await readPersonalScope({ api }));
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
  throw new Error(
    `Vercel lookup of '${name}' returned an unrecognised response shape; refusing to guess. Nothing was changed.`,
  );
}

/**
 * { found } or { absent: true }; any other failure is rethrown. Absence comes
 * only from isNotFoundError: the adapter turns a zero-exit CLI error envelope
 * into a thrown error carrying its code, so a `not_found` code is an absence
 * and every other code fails closed.
 */
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
 * True only when an explicit token's GET /v2/user failed with a structured
 * `forbidden`. Every other failure (unauthorized, rate limits, 5xx, an
 * unstructured 403, `unknown`, a body with no user id) has no such code and
 * refuses on the account-wide path.
 */
export function isTeamTokenPath(mode, error) {
  return mode === "token" && error?.code === "forbidden";
}

function refuseTokenLookup(error) {
  const detail = typeof error?.detail === "string" ? ` (${error.detail})` : "";
  return new Error(
    `The Vercel token could read neither GET /v2/user nor the governed projects${detail}. ` +
      "Check that VERCEL_TOKEN is valid and scoped to the ichnos-protocol team with All Projects. Nothing was changed.",
  );
}

async function lookupInTokenTeam({ api, role, name }) {
  let result;
  try {
    result = await lookupProject({ api, name });
  } catch (error) {
    throw refuseTokenLookup(error);
  }
  if (result.absent) {
    throw new Error(
      `The ${role} project '${name}' is missing in the Vercel token's team. Nothing was changed.`,
    );
  }
  return result.found;
}

function assertExactProject(project, name) {
  if (project.name === name && hasText(project.id)) return;
  throw new Error(
    `The Vercel token's lookup of '${name}' did not return that exact project; refusing to guess. Nothing was changed.`,
  );
}

function sharedTeamAccount(found) {
  const projects = Object.values(found);
  const accounts = new Set(projects.map((project) => project.accountId));
  if (accounts.size !== 1) {
    const owners = projects.map((p) => `${p.id} (accountId ${p.accountId})`);
    throw new Error(
      `The governed projects belong to different accounts: ${owners.join(" and ")}. Nothing was changed.`,
    );
  }
  const [accountId] = accounts;
  if (!isTeamId(accountId)) {
    throw new Error(
      `The Vercel token did not resolve to a team: the governed projects' shared accountId '${accountId}' is not a team. Nothing was changed.`,
    );
  }
  return accountId;
}

function normaliseAll(found) {
  return Object.fromEntries(
    Object.entries(found).map(([role, project]) => [role, normalise(project)]),
  );
}

/**
 * The team-scoped token path: both governed names looked up through the
 * unscoped token API, accepted only as exact names sharing one team_ account.
 */
export async function discoverTokenTeamScope({ api, names }) {
  const found = {};
  for (const [role, name] of Object.entries(names)) {
    found[role] = await lookupInTokenTeam({ api, role, name });
    assertExactProject(found[role], name);
  }
  const accountId = sharedTeamAccount(found);
  const scope = {
    kind: "team",
    id: accountId,
    label: accountId,
    cliScope: accountId,
  };
  return { scope, projects: normaliseAll(found) };
}

async function readPersonalOrTeamPath({ mode, unscopedApi, names }) {
  try {
    return { personal: await readPersonalScope({ api: unscopedApi }) };
  } catch (error) {
    if (!isTeamTokenPath(mode, error)) throw error;
    return { team: await discoverTokenTeamScope({ api: unscopedApi, names }) };
  }
}

/**
 * The single scope that holds every governed project, with those projects
 * normalised to { projectId, orgId, projectName }. `names` maps each role to
 * its governed project name; `mode` is the caller's access mode.
 */
export async function discoverVercelScope({
  mode,
  scopedApiFor,
  unscopedApi,
  names,
}) {
  const read = await readPersonalOrTeamPath({ mode, unscopedApi, names });
  if (read.team) return read.team;
  const scopes = await candidateScopes({
    api: unscopedApi,
    personal: read.personal,
  });
  const findings = [];
  for (const scope of scopes) {
    findings.push(
      await qualifyScope({ api: scopedApiFor(scope), scope, names }),
    );
  }
  return selectQualifyingScope(findings, names);
}

function selectQualifyingScope(findings, names) {
  const qualifying = findings.filter((finding) => finding.qualifies);
  if (qualifying.length === 0) refuseNone(findings, names);
  if (qualifying.length > 1) refuseMany(qualifying, names);
  const [{ scope, found }] = qualifying;
  return { scope, projects: normaliseAll(found) };
}
