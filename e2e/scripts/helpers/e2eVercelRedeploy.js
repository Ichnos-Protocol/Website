/**
 * Redeploys the one deployment that serves an E2E URL, found by an exact
 * alias match within the project. Never falls back to the latest deployment.
 */
const ALIAS_PAGE_LIMIT = 100;
const MAX_ALIAS_PAGES = 50;

/** Lowercase hostname of a URL or bare host; port and trailing dot removed. */
export function normalizeHost(url) {
  const withScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(url)
    ? url
    : `https://${url}`;
  return new URL(withScheme).hostname.toLowerCase().replace(/\.$/, "");
}

// An alias is a bare hostname; any other character (a port, a path) makes it
// a different alias, never a match.
function canonicalAlias(alias) {
  return String(alias ?? "")
    .toLowerCase()
    .replace(/\.$/, "");
}

function aliasPage(projectId, until) {
  const query = `projectId=${encodeURIComponent(projectId)}&limit=${ALIAS_PAGE_LIMIT}`;
  return `/v4/aliases?${query}${until ? `&until=${until}` : ""}`;
}

/** The deployment id the exact alias points at, or null. */
export async function findDeploymentForAlias({ api, projectId, url }) {
  const host = normalizeHost(url);
  let until;
  for (let page = 0; page < MAX_ALIAS_PAGES; page += 1) {
    const { aliases = [], pagination } = await api.request(
      aliasPage(projectId, until),
    );
    const hit = aliases.find((a) => canonicalAlias(a?.alias) === host);
    if (hit) return hit.deploymentId ?? hit.deployment?.id ?? null;
    until = pagination?.next;
    if (!until) return null;
  }
  return null;
}

/**
 * Why deployment is not a Preview deployment of project, or null when it
 * unambiguously is. Vercel reports a Preview deployment as target null; a
 * missing target field, any other target or a custom environment is refused.
 */
export function previewMismatch(deployment, { projectId, deploymentId }) {
  if (deployment?.id !== deploymentId) {
    return "the deployment metadata names a different deployment";
  }
  if (deployment.projectId !== projectId) {
    return "the deployment belongs to a different project";
  }
  if (!("target" in deployment)) return "the deployment target is unknown";
  if (deployment.target === "production") {
    return "the deployment is a Production deployment";
  }
  if (deployment.target !== null && deployment.target !== "preview") {
    return `the deployment target '${deployment.target}' is not Preview`;
  }
  if (deployment.customEnvironment) {
    return "the deployment belongs to a custom environment";
  }
  return null;
}

async function readDeployment(api, deploymentId) {
  return api.request(`/v13/deployments/${encodeURIComponent(deploymentId)}`);
}

/**
 * A redeploy inherits every setting of the deployment it copies. The copied
 * deployment must be a Preview deployment of this project, and the body has no
 * target, which is the Preview form of the create call; forceNew skips
 * deduplication so the new env is built in.
 */
export async function redeployProject({ api, project, url }) {
  const base = { project: project.projectName, host: normalizeHost(url) };
  try {
    const { projectId } = project;
    const deploymentId = await findDeploymentForAlias({ api, projectId, url });
    if (!deploymentId) {
      return {
        ...base,
        status: "failed",
        reason: `no deployment serves ${base.host}`,
      };
    }
    const deployment = await readDeployment(api, deploymentId);
    const mismatch = previewMismatch(deployment, { projectId, deploymentId });
    if (mismatch) {
      return {
        ...base,
        status: "failed",
        reason: `${mismatch}; refusing to redeploy ${base.host}. Nothing was deployed.`,
      };
    }
    const created = await api.request("/v13/deployments?forceNew=1", {
      method: "POST",
      body: { name: project.projectName, deploymentId },
    });
    return { ...base, status: "success", deploymentId: created?.id ?? null };
  } catch (err) {
    return { ...base, status: "failed", reason: err.message };
  }
}
