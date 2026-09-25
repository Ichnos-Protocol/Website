/**
 * The provider sync that follows the GitHub variable/secret sync: the
 * automation bypass on both Vercel projects (then GitHub, only when both
 * confirm), the client and server all-branches Preview env, and a redeploy of
 * each project whose env actually changed. A bypass that either project fails
 * to confirm stops the run before any env write or redeploy, and so does a
 * GitHub secret write that does not succeed after both projects confirm: the
 * Vercel projects may already hold the new value, and rerunning the
 * provisioning command is the recovery. Every boundary is injected.
 */
import {
  E2E_API_BASE_URL_VALUE,
  E2E_BASE_URL_VALUE,
} from "./e2eFixedConfig.js";
import { generateBypassSecret, syncBypassSecret } from "./e2eVercelBypass.js";
import { redeployProject } from "./e2eVercelRedeploy.js";
import { syncToVercel } from "./e2eSyncVercel.js";

export const BYPASS_SECRET_NAME = "VERCEL_AUTOMATION_BYPASS_SECRET";

// The GitHub result keeps name and status only: no masked tail of the value.
function scrubGitHubResults(results, secret) {
  return (results ?? []).map(({ name, status, error }) => ({
    name,
    status,
    masked: "****",
    ...(error && { error: String(error).split(secret).join("****") }),
  }));
}

async function rotateBypass({ api, projects, setGitHubSecrets, generate }) {
  const secret = generate();
  const results = await syncBypassSecret({
    api,
    projects: [projects.client, projects.server],
    secret,
  });
  const confirmedProjects = results
    .filter((r) => r.confirmed)
    .map((r) => r.project);
  if (confirmedProjects.length !== results.length) {
    return {
      rotated: true,
      results,
      confirmedProjects,
      githubConfirmed: false,
    };
  }
  const ghResults = scrubGitHubResults(
    setGitHubSecrets({ [BYPASS_SECRET_NAME]: secret }),
    secret,
  );
  const githubConfirmed = ghResults.some(
    (r) => r.name === BYPASS_SECRET_NAME && r.status === "success",
  );
  return {
    rotated: true,
    results,
    confirmedProjects,
    githubConfirmed,
    ghResults,
  };
}

function changed(results) {
  return results.some((r) => r.status === "success");
}

function bypassUnconfirmed(bypass) {
  if (!bypass.rotated) return false;
  const projectsUnconfirmed =
    bypass.confirmedProjects.length !== bypass.results.length;
  return projectsUnconfirmed || bypass.githubConfirmed !== true;
}

/**
 * Redeploys each project whose results hold a written value, matched by the
 * exact E2E alias. A project absent from projects needs no results passed.
 */
export async function redeployChanged({
  api,
  projects,
  clientResults = [],
  serverResults = [],
}) {
  const redeploys = [];
  if (changed(clientResults)) {
    redeploys.push(
      await redeployProject({
        api,
        project: projects.client,
        url: E2E_BASE_URL_VALUE,
      }),
    );
  }
  if (changed(serverResults)) {
    redeploys.push(
      await redeployProject({
        api,
        project: projects.server,
        url: E2E_API_BASE_URL_VALUE,
      }),
    );
  }
  return redeploys;
}

/**
 * `client` and `vercel` are the Preview maps for the client and the server
 * project. With rotateBypass false the bypass is left as it is. An
 * unconfirmed bypass returns stopped: true with the per-project bypass state,
 * no env result and no redeploy. The bypass is unconfirmed when either project
 * fails its readback, or when both confirm but the GitHub secret write does
 * not succeed; the projects may then already hold the new value, and rerunning
 * the provisioning command is the recovery.
 */
export async function syncProviders({
  api,
  projects,
  client = {},
  vercel = {},
  setGitHubSecrets,
  rotateBypass: rotate = true,
  generate = generateBypassSecret,
}) {
  const bypass = rotate
    ? await rotateBypass({ api, projects, setGitHubSecrets, generate })
    : { rotated: false };
  if (bypassUnconfirmed(bypass)) {
    return { envResults: [], bypass, redeploys: [], stopped: true };
  }
  const clientResults = await syncToVercel(client, {
    api,
    project: projects.client,
  });
  const serverResults = await syncToVercel(vercel, {
    api,
    project: projects.server,
  });
  const redeploys = await redeployChanged({
    api,
    projects,
    clientResults,
    serverResults,
  });
  return {
    envResults: [...clientResults, ...serverResults],
    bypass,
    redeploys,
    stopped: false,
  };
}

/** The bypass outcome as failed result rows, for the combined failure exit. */
export function bypassFailures(bypass) {
  if (!bypass?.rotated) return [];
  const failed = bypass.results
    .filter((r) => !r.confirmed)
    .map((r) => ({
      name: `${BYPASS_SECRET_NAME} (${r.project})`,
      status: "failed",
      error: `${r.reason}. Identical state cannot be achieved; GitHub was left untouched, no Preview env was written and nothing was redeployed. Re-run the provisioning command.`,
    }));
  if (failed.length > 0) return failed;
  if (bypass.githubConfirmed) return [];
  return [
    {
      name: `${BYPASS_SECRET_NAME} (GitHub)`,
      status: "failed",
      error:
        "both projects hold the new value but the GitHub secret was not set. Re-run the provisioning command.",
    },
  ];
}
