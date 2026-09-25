/**
 * The two Vercel projects the E2E pipeline writes to, resolved read-only: a
 * .vercel/project.json link file is read and never written. The names are
 * the governed ones (CLAUDE.md §16): the client project is exactly
 * "ichnos-client"; any other name, "ichnos-protocol" included, is refused.
 */
import { existsSync, readFileSync } from "fs";
import { basename, join } from "path";

import {
  createCliTransport,
  createTokenTransport,
  createVercelApi,
} from "./e2eVercelApi.js";

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

function relink(label, expectedName) {
  return `Run \`cd ${label} && vercel link\` and select the '${expectedName}' project.`;
}

function parseLinkFile(path, label, expectedName) {
  let parsed;
  try {
    parsed = JSON.parse(readFileSync(path, "utf8"));
  } catch {
    parsed = undefined;
  }
  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
    fail(
      `${label}/.vercel/project.json is malformed.`,
      relink(label, expectedName),
    );
  }
  return parsed;
}

function assertLinkName(projectJson, label, expectedName) {
  const { projectName } = projectJson;
  if (!projectName || typeof projectName !== "string") {
    fail(
      `${label}/.vercel/project.json does not contain a valid projectName.`,
      `Run \`cd ${label} && vercel link\` with the latest Vercel CLI to re-link the ${label} project.`,
    );
  }
  if (projectName !== expectedName) {
    fail(
      `Linked Vercel project '${projectName}' does not match the expected ${label} project '${expectedName}'.`,
      relink(label, expectedName),
    );
  }
}

/**
 * Fail-closed read of <dir>/.vercel/project.json: missing, then malformed,
 * then missing projectId/orgId, then an invalid or mismatched projectName.
 */
export function readLinkedProject(dir, expectedName) {
  const label = basename(dir);
  const path = linkFilePath(dir);
  if (!existsSync(path)) {
    fail(
      `${label}/.vercel/project.json not found.`,
      relink(label, expectedName),
    );
  }
  const projectJson = parseLinkFile(path, label, expectedName);
  if (!projectJson.projectId || !projectJson.orgId) {
    fail(
      `${label}/.vercel/project.json is missing projectId or orgId.`,
      relink(label, expectedName),
    );
  }
  assertLinkName(projectJson, label, expectedName);
  const { projectId, orgId, projectName } = projectJson;
  return { projectId, orgId, projectName };
}

function assertFound(found, expectedName, expectedId) {
  const name = found?.name;
  if (name === expectedName && (!expectedId || found.id === expectedId)) {
    return;
  }
  throw new Error(
    `Vercel project mismatch: expected '${expectedName}', found '${name ?? ""}'. Nothing was changed.`,
  );
}

async function readProject(api, idOrName, expectedName) {
  try {
    return await api.request(`/v9/projects/${encodeURIComponent(idOrName)}`);
  } catch (err) {
    throw new Error(
      `Cannot read the Vercel project '${expectedName}': ${err.message}\n` +
        "Remediation: re-link the project with `vercel link` so its link file names the owning team, then re-run.",
    );
  }
}

/**
 * The link file first, confirmed against the provider; without one, an
 * exact-name lookup. Any mismatch throws naming both names.
 */
export async function resolveProject({ api, dir, expectedName }) {
  if (existsSync(linkFilePath(dir))) {
    const linked = readLinkedProject(dir, expectedName);
    const found = await readProject(api, linked.projectId, expectedName);
    assertFound(found, expectedName, linked.projectId);
    return linked;
  }
  const found = await readProject(api, expectedName, expectedName);
  assertFound(found, expectedName);
  return {
    projectId: found.id,
    orgId: found.accountId,
    projectName: found.name,
  };
}

function buildTransport(access, teamId, env) {
  if (access.mode === "token") {
    return createTokenTransport({ token: env.VERCEL_TOKEN, teamId });
  }
  return createCliTransport({ teamId });
}

/**
 * Builds the API once, scoped to the server link file's team, and resolves
 * both projects. Both must belong to that one team.
 */
export async function connectVercelProjects({
  access,
  serverDir,
  clientDir,
  env = process.env,
}) {
  const { orgId } = readLinkedProject(serverDir, EXPECTED_PROJECT_NAMES.server);
  const api = createVercelApi({
    transport: buildTransport(access, orgId, env),
  });
  const server = await resolveProject({
    api,
    dir: serverDir,
    expectedName: EXPECTED_PROJECT_NAMES.server,
  });
  const client = await resolveProject({
    api,
    dir: clientDir,
    expectedName: EXPECTED_PROJECT_NAMES.client,
  });
  if (client.orgId !== server.orgId) {
    throw new Error(
      `The client and server Vercel projects belong to different teams. Nothing was changed.`,
    );
  }
  return { api, projects: { client, server } };
}
