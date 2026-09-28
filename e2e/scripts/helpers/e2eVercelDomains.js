/**
 * The pre-write check of the two E2E domains. Each domain is read through the
 * already-pinned Vercel API with one GET and must name its host, follow
 * branch `main` and have a `redirect` field that is absent or `null`; any
 * other redirect value, or a provider error, stops the run before any
 * Firebase, GitHub or Vercel write. A refusal
 * names only the host, the project and the branch found, never a value.
 */
import {
  E2E_API_BASE_URL_VALUE,
  E2E_BASE_URL_VALUE,
  E2E_GIT_BRANCH,
} from "./e2eFixedConfig.js";
import { isNotFoundError } from "./e2eVercelApi.js";
import { normalizeHost } from "./e2eVercelRedeploy.js";

export function domainPath(projectId, host) {
  return `/v9/projects/${encodeURIComponent(projectId)}/domains/${encodeURIComponent(host)}`;
}

function hasNoRedirect(domain) {
  return domain.redirect == null;
}

function foundBranch(domain) {
  if (domain?.gitBranch == null) return "it follows no git branch";
  return `it follows branch ${domain.gitBranch}`;
}

function bodyProblem(domain, host) {
  if (domain?.name !== host) return "the response names another domain";
  if (!hasNoRedirect(domain)) return "it redirects";
  return null;
}

/**
 * null when the domain body names exactly host, follows E2E_GIT_BRANCH and
 * has no redirect; otherwise a short reason that always ends with the branch
 * the body follows, or says it follows none. host is already normalized, and
 * the response name must equal it character for character: a URL, a path, a
 * port, another case or a trailing dot names another domain. redirect must be
 * absent or exactly null; any other value, falsy or not, counts as a
 * redirect.
 */
export function domainMismatch(domain, host) {
  const problem = bodyProblem(domain, host);
  const branch = foundBranch(domain);
  if (problem) return `${problem}, and ${branch}`;
  if (domain.gitBranch !== E2E_GIT_BRANCH) return branch;
  return null;
}

export function domainRefusal({ host, projectName, reason }) {
  return `E2E domain ${host} on the ${projectName} Vercel project must follow branch ${E2E_GIT_BRANCH} with no redirect, but ${reason}. Nothing was changed.`;
}

function providerReason(error) {
  const detail = error?.detail ?? error?.message ?? "unknown error";
  const kind = isNotFoundError(error) ? "is not found" : "could not be read";
  return `the domain ${kind} (${detail})`;
}

async function readDomain(api, project, host) {
  try {
    return await api.request(domainPath(project.projectId, host));
  } catch (error) {
    throw new Error(
      domainRefusal({
        host,
        projectName: project.projectName,
        reason: providerReason(error),
      }),
    );
  }
}

/**
 * Reads the client and the server E2E domain and throws a refusal unless
 * both follow E2E_GIT_BRANCH. Issues GET requests only.
 */
export async function assertE2EDomainsFollowMain({ api, projects }) {
  const checks = [
    [projects.client, E2E_BASE_URL_VALUE],
    [projects.server, E2E_API_BASE_URL_VALUE],
  ];
  for (const [project, url] of checks) {
    const host = normalizeHost(url);
    const domain = await readDomain(api, project, host);
    const reason = domainMismatch(domain, host);
    if (reason) {
      throw new Error(
        domainRefusal({ host, projectName: project.projectName, reason }),
      );
    }
  }
}
