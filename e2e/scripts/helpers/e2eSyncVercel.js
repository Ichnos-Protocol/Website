import { setPreviewEnv } from "./e2eVercelEnv.js";

/**
 * Sets each non-empty name on the project's all-branches Preview scope
 * through the Vercel REST API. `context` is { api, project } from
 * connectVercelProjects; the result shape is the one printSummary reads.
 */
export async function syncToVercel(credentials, { api, project }) {
  const results = [];
  for (const [key, value] of Object.entries(credentials)) {
    if (!value) continue;
    results.push(
      await setPreviewEnv({ api, projectId: project.projectId, key, value }),
    );
  }
  return results;
}
