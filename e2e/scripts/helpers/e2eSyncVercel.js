import { setPreviewEnvScopes } from "./e2eVercelEnv.js";

/**
 * Sets each non-empty name on both managed Preview scopes of the project,
 * all-branches and branch `main`, through the Vercel REST API. `context` is
 * { api, project } from connectVercelProjects; the result is the flat list of
 * per-scope rows printSummary reads.
 */
export async function syncToVercel(credentials, { api, project }) {
  const results = [];
  for (const [key, value] of Object.entries(credentials)) {
    if (!value) continue;
    results.push(
      ...(await setPreviewEnvScopes({
        api,
        projectId: project.projectId,
        key,
        value,
      })),
    );
  }
  return results;
}
