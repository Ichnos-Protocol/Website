/**
 * The provider sync that follows the GitHub variable/secret sync: the
 * automation bypass converged onto one value on both Vercel projects, the
 * client and server all-branches Preview env, and a redeploy of each project
 * whose env actually changed. Convergence passes three gates in order: a
 * fresh read of both projects, taken after every add, confirms the value,
 * GitHub confirms its secret, and every older automation key that final read
 * found is revoked. Revocation happens only after GitHub confirms.
 * A run that fails any gate stops before any env write or redeploy, and
 * rerunning the provisioning command is the recovery. Every boundary is
 * injected.
 */
import {
  E2E_API_BASE_URL_VALUE,
  E2E_BASE_URL_VALUE,
} from "./e2eFixedConfig.js";
import {
  addBypassToProjects,
  confirmBypassOnProjects,
  generateBypassSecret,
  readAutomationBypass,
  revokeStaleBypass,
  selectBypassValue,
} from "./e2eVercelBypass.js";
import { redeployProject } from "./e2eVercelRedeploy.js";
import { syncToVercel } from "./e2eSyncVercel.js";

export const BYPASS_SECRET_NAME = "VERCEL_AUTOMATION_BYPASS_SECRET";
const RERUN = "Re-run the provisioning command.";

// The GitHub result keeps name and status only: no masked tail of the value.
function scrubGitHubResults(results, secret) {
  return (results ?? []).map(({ name, status, error }) => ({
    name,
    status,
    masked: "****",
    ...(error && { error: String(error).split(secret).join("****") }),
  }));
}

// Per-project rows without the key lists, which hold secret values.
function publicRows(results, revokes = []) {
  return results.map(({ keys: _keys, ...row }, index) => ({
    ...row,
    revoked: revokes[index]?.revoked ?? 0,
    ...(revokes[index]?.revokeFailed && {
      revokeFailed: true,
      reason: revokes[index].reason,
    }),
  }));
}

function failed(outcome, stage, reason) {
  return { ...outcome, complete: false, failure: { stage, reason } };
}

async function readStates(api, list) {
  const states = [];
  for (const project of list) {
    states.push(await readAutomationBypass({ api, project }));
  }
  return states;
}

function writeGitHub(setGitHubSecrets, secret) {
  const ghResults = scrubGitHubResults(
    setGitHubSecrets({ [BYPASS_SECRET_NAME]: secret }),
    secret,
  );
  const githubConfirmed = ghResults.some(
    (r) => r.name === BYPASS_SECRET_NAME && r.status === "success",
  );
  return { ghResults, githubConfirmed };
}

function isSteadyState(generated, rows) {
  return (
    !generated &&
    !rows.some((r) => r.added) &&
    rows.reduce((sum, r) => sum + r.revoked, 0) === 0
  );
}

async function revokeAndFinish({ api, list, results, secret, outcome }) {
  const revokes = await revokeStaleBypass({
    api,
    projects: list,
    results,
    secret,
  });
  const rows = publicRows(results, revokes);
  const revocationComplete = revokes.every((r) => !r.revokeFailed);
  const done = { ...outcome, results: rows, revocationComplete };
  if (!revocationComplete) {
    return failed(done, "revoke", "an older automation key was not revoked");
  }
  const steadyState = isSteadyState(outcome.generated, rows);
  return { ...done, steadyState, complete: true, failure: null };
}

const NOT_STARTED = {
  attempted: true,
  generated: false,
  steadyState: false,
  results: [],
  confirmedProjects: [],
  githubConfirmed: false,
  revocationComplete: false,
};

// The add phase stopped: no final read ran, so no project is confirmed.
function stopAtAdd(adds, generated, failure) {
  const rows = publicRows(adds.map((add) => ({ ...add, confirmed: false })));
  const reason =
    failure.stage === "confirm"
      ? "a project's readback failed after its add was accepted"
      : "a project does not hold the selected value";
  return failed(
    { ...NOT_STARTED, generated, results: rows },
    failure.stage,
    reason,
  );
}

// Final reads of both projects; confirmation and revocation keys come only
// from these, never from the initial read or the add phase.
async function confirmFinal({ api, list, adds, secret, generated }) {
  const finals = await confirmBypassOnProjects({ api, projects: list, secret });
  const results = adds.map((add, index) => ({ ...add, ...finals[index] }));
  const confirmedProjects = finals
    .filter((r) => r.confirmed)
    .map((r) => r.project);
  const rows = publicRows(results);
  const outcome = {
    ...NOT_STARTED,
    generated,
    results: rows,
    confirmedProjects,
  };
  return { results, outcome, confirmed: finals.every((r) => r.confirmed) };
}

// Read, select, add; re-read both to confirm; then GitHub; then revoke.
async function convergeBypass({ api, projects, setGitHubSecrets, generate }) {
  const list = [projects.client, projects.server];
  let states;
  try {
    states = await readStates(api, list);
  } catch (err) {
    return failed(NOT_STARTED, "read", err.message);
  }
  const { secret, generated } = selectBypassValue(states, generate);
  const adds = await addBypassToProjects({
    api,
    projects: list,
    states,
    secret,
  });
  const addFailure = adds.find((r) => !r.present);
  if (addFailure) return stopAtAdd(adds, generated, addFailure);
  const final = await confirmFinal({ api, list, adds, secret, generated });
  const { results, outcome: added } = final;
  if (!final.confirmed) {
    return failed(added, "confirm", "a final readback did not confirm");
  }
  const github = writeGitHub(setGitHubSecrets, secret);
  const outcome = { ...added, ...github };
  if (!github.githubConfirmed) {
    return failed(outcome, "github", "the GitHub secret was not set");
  }
  return revokeAndFinish({ api, list, results, secret, outcome });
}

function changed(results) {
  return results.some((r) => r.status === "success");
}

function bypassIncomplete(bypass) {
  return bypass.attempted && !bypass.complete;
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
 * project. With converge false the bypass is left as it is. An incomplete
 * convergence returns stopped: true with the per-project bypass state, no env
 * result and no redeploy. Convergence is incomplete when the maps cannot be
 * read, when either project fails to take the add or its readback fails,
 * when the final read of either project fails or lacks the value (GitHub is
 * then not written), when GitHub does not confirm its secret (nothing is then
 * revoked), or when an older key fails to revoke. Rerunning the provisioning
 * command converges from whatever state the run left.
 */
export async function syncProviders({
  api,
  projects,
  client = {},
  vercel = {},
  setGitHubSecrets,
  converge = true,
  generate = generateBypassSecret,
}) {
  const bypass = converge
    ? await convergeBypass({ api, projects, setGitHubSecrets, generate })
    : { attempted: false };
  if (bypassIncomplete(bypass)) {
    return {
      envResults: [],
      clientResults: [],
      serverResults: [],
      bypass,
      redeploys: [],
      stopped: true,
    };
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
    clientResults,
    serverResults,
    bypass,
    redeploys,
    stopped: false,
  };
}

function failureRow(name, error) {
  return { name: `${BYPASS_SECRET_NAME} (${name})`, status: "failed", error };
}

function addFailures(bypass) {
  return bypass.results
    .filter((r) => !r.present)
    .map((r) =>
      failureRow(
        r.project,
        `${r.reason}. Identical state cannot be achieved; GitHub was left untouched, no key was revoked, no Preview env was written and nothing was redeployed. ${RERUN}`,
      ),
    );
}

// A readback that threw after an accepted add, or a final read that failed
// or lacked the value. `added` says whether this run patched the project.
function confirmFailures(bypass) {
  return bypass.results
    .filter((r) => !r.confirmed && r.reason)
    .map((r) =>
      failureRow(
        r.project,
        `${r.reason}. The value was not confirmed by readback (add request ${r.added ? "accepted" : "not issued"} on this project); GitHub was left untouched, no key was revoked, no Preview env was written and nothing was redeployed. ${RERUN}`,
      ),
    );
}

function revokeFailures(bypass) {
  return bypass.results
    .filter((r) => r.revokeFailed)
    .map((r) =>
      failureRow(
        r.project,
        `${r.reason}. The value is set on both projects and in GitHub, but an older automation key remains; no Preview env was written and nothing was redeployed. Re-running the provisioning command converges.`,
      ),
    );
}

/** The bypass outcome as failed result rows, for the combined failure exit. */
export function bypassFailures(bypass) {
  if (!bypass?.attempted || bypass.complete) return [];
  const stage = bypass.failure?.stage;
  if (stage === "read") {
    return [
      failureRow(
        "Vercel",
        `the bypass maps could not be read (${bypass.failure.reason}); nothing was changed on either project or in GitHub. ${RERUN}`,
      ),
    ];
  }
  if (stage === "add") return addFailures(bypass);
  if (stage === "confirm") return confirmFailures(bypass);
  if (stage === "github") {
    return [
      failureRow(
        "GitHub",
        `both projects hold the value but the GitHub secret was not set; no key was revoked. ${RERUN}`,
      ),
    ];
  }
  if (stage === "revoke") return revokeFailures(bypass);
  return [];
}
