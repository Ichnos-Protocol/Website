/**
 * The two Vercel projects the E2E pipeline writes to. The owning scope is
 * discovered through the authenticated Vercel API (e2eVercelScope.js), so
 * `vercel link` is not a prerequisite. A .vercel/project.json link file is an
 * optional cross-check: read, never written, and when present it must agree
 * with the discovered project and scope. The names are the governed ones
 * (CLAUDE.md §16): the client project is exactly "ichnos-client"; any other
 * name, "ichnos-protocol" included, is refused.
 */
import { existsSync, readFileSync } from "fs";
import { basename, join } from "path";

import {
  cliPersonalScopeRefusal,
  createCliTransport,
  createTokenTransport,
  createVercelApi,
  resolveCliAccountScope,
} from "./e2eVercelApi.js";
import { discoverVercelScope } from "./e2eVercelScope.js";

export const EXPECTED_PROJECT_NAMES = {
  client: "ichnos-client",
  server: "ichnos-protocol_server",
};

function fail(message, remediation) {
  throw new Error(`${message}\nRemediation: ${remediation}`);
}

export function linkFilePath(dir) {
  return join(dir, ".vercel", "project.json");
}

function optionalLink(label) {
  return `The link file is an optional cross-check: delete ${label}/.vercel/project.json or point it at the discovered project, then re-run.`;
}

function parseLinkFile(path, label) {
  let parsed;
  try {
    parsed = JSON.parse(readFileSync(path, "utf8"));
  } catch {
    parsed = undefined;
  }
  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
    fail(`${label}/.vercel/project.json is malformed.`, optionalLink(label));
  }
  return parsed;
}

function assertLinkName(projectJson, label, expectedName) {
  const { projectName } = projectJson;
  if (!projectName || typeof projectName !== "string") {
    fail(
      `${label}/.vercel/project.json does not contain a valid projectName.`,
      optionalLink(label),
    );
  }
  if (projectName !== expectedName) {
    fail(
      `${label}/.vercel/project.json: Linked Vercel project '${projectName}' does not match the expected ${label} project '${expectedName}'. Nothing was changed.`,
      optionalLink(label),
    );
  }
}

/**
 * Fail-closed read of an optional <dir>/.vercel/project.json: null when
 * absent; otherwise malformed, then missing projectId/orgId, then an invalid
 * or mismatched projectName.
 */
export function readOptionalLinkedProject(dir, expectedName) {
  const label = basename(dir);
  const path = linkFilePath(dir);
  if (!existsSync(path)) return null;
  const projectJson = parseLinkFile(path, label);
  if (!projectJson.projectId || !projectJson.orgId) {
    fail(
      `${label}/.vercel/project.json is missing projectId or orgId.`,
      optionalLink(label),
    );
  }
  assertLinkName(projectJson, label, expectedName);
  const { projectId, orgId, projectName } = projectJson;
  return { projectId, orgId, projectName };
}

/**
 * A present link file must name the discovered project, its id and the
 * discovered scope's id: the team_ id for a team, and for the personal scope
 * the owner id from GET /v2/user, which is also its projects' accountId.
 */
export function assertLinkAgreesWithDiscovery({
  dir,
  expectedName,
  discovered,
  scope,
}) {
  const linked = readOptionalLinkedProject(dir, expectedName);
  if (!linked) return;
  const label = basename(dir);
  const checks = [
    ["projectName", linked.projectName, expectedName],
    ["projectId", linked.projectId, discovered.projectId],
    ["orgId", linked.orgId, scope.id],
  ];
  for (const [field, linkedValue, discoveredValue] of checks) {
    if (linkedValue === discoveredValue) continue;
    fail(
      `${label}/.vercel/project.json ${field} '${linkedValue}' disagrees with the discovered ${scope.kind} scope '${scope.label}', whose value is '${discoveredValue}'. Nothing was changed.`,
      optionalLink(label),
    );
  }
}

/**
 * A transport pinned to scope, or for account-level reads when scope is null.
 * The token transport carries teamId only for a team, so it reaches the
 * personal scope of any account. The CLI transport always passes --scope,
 * because `vercel api` otherwise applies the CLI's current team: the scope's
 * own value, or for account-level reads the accountScope from
 * resolveCliAccountScope. A Northstar CLI session cannot reach its personal
 * scope, so asking for it throws before any lookup.
 */
function buildTransport({ access, env, run, accountScope }, scope) {
  if (access.mode === "token") {
    const teamId = scope?.kind === "team" ? scope.id : undefined;
    return createTokenTransport({ token: env.VERCEL_TOKEN, teamId });
  }
  if (scope?.kind === "personal" && accountScope.northstar) {
    throw cliPersonalScopeRefusal(scope.label);
  }
  const cliScope = scope ? scope.cliScope : accountScope.cliScope;
  return createCliTransport({ run, scope: cliScope });
}

/**
 * Discovers the one scope holding both governed projects, cross-checks any
 * link files against it, and returns an API pinned to that scope. Discovery
 * requires both projects to share one scope. Every step is read-only. `run`
 * replaces the Vercel CLI runner, for tests.
 */
export async function connectVercelProjects({
  access,
  serverDir,
  clientDir,
  env = process.env,
  run,
}) {
  const accountScope =
    access.mode === "token" ? null : resolveCliAccountScope({ run });
  const context = { access, env, run, accountScope };
  const { scope, projects } = await discoverVercelScope({
    unscopedApi: createVercelApi({ transport: buildTransport(context, null) }),
    scopedApiFor: (candidate) =>
      createVercelApi({ transport: buildTransport(context, candidate) }),
    names: EXPECTED_PROJECT_NAMES,
  });
  for (const [role, dir] of [
    ["server", serverDir],
    ["client", clientDir],
  ]) {
    if (!dir) continue;
    assertLinkAgreesWithDiscovery({
      dir,
      expectedName: EXPECTED_PROJECT_NAMES[role],
      discovered: projects[role],
      scope,
    });
  }
  const api = createVercelApi({ transport: buildTransport(context, scope) });
  return {
    api,
    projects: { client: projects.client, server: projects.server },
  };
}
