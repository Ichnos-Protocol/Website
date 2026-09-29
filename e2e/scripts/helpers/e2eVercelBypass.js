/**
 * Vercel Protection Bypass for Automation, converged onto one value on both
 * projects. It reuses an automation-scope value both projects already hold
 * and generates one only when none is shared; it never rotates a value both
 * projects share. Reading, adding, confirming and revoking are separate
 * phases: confirmation re-reads every project after all adds, and the caller
 * confirms GitHub before any older key is revoked. Nothing here revokes on
 * its own. The value is a random infrastructure secret, not an E2E
 * account password, so the account-password pattern does not apply to it. No
 * result, log line or thrown message carries the value or any other bypass
 * key.
 */
import { randomInt as cryptoRandomInt } from "crypto";

export const BYPASS_SCOPE = "automation-bypass";
export const BYPASS_SECRET_LENGTH = 32;
const ALPHABET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
const BYPASS_NOTE = "E2E automation (provision-e2e-firebase-users.js)";

/** 32 characters of [A-Za-z0-9]; randomInt(max) is unbiased. */
export function generateBypassSecret(randomInt = cryptoRandomInt) {
  return Array.from(
    { length: BYPASS_SECRET_LENGTH },
    () => ALPHABET[randomInt(ALPHABET.length)],
  ).join("");
}

function bypassPath(project) {
  return `/v1/projects/${encodeURIComponent(project.projectId)}/protection-bypass`;
}

async function readBypassMap(api, project) {
  const found = await api.request(
    `/v9/projects/${encodeURIComponent(project.projectId)}`,
  );
  return found?.protectionBypass ?? {};
}

function countPreserved(map) {
  return Object.values(map).filter((entry) => entry?.scope !== BYPASS_SCOPE)
    .length;
}

/**
 * Reads one project's bypass map. Every key is registered for scrubbing
 * before this returns, so later error text cannot carry it.
 */
export async function readAutomationBypass({ api, project }) {
  const map = await readBypassMap(api, project);
  for (const key of Object.keys(map)) api.registerSecret(key);
  return {
    project: project.projectName,
    keys: Object.keys(map).filter((key) => map[key]?.scope === BYPASS_SCOPE),
    preserved: countPreserved(map),
  };
}

/**
 * The lexicographically smallest automation key every project holds, or a
 * newly generated value when no key is shared.
 */
export function selectBypassValue(states, generate) {
  const [first, ...rest] = states;
  const shared = (first?.keys ?? []).filter((key) =>
    rest.every((state) => state.keys.includes(key)),
  );
  if (shared.length > 0)
    return { secret: [...shared].sort()[0], generated: false };
  return { secret: generate(), generated: true };
}

function notPresent(row, stage, reason) {
  return { ...row, present: false, stage, reason };
}

/**
 * Issues the add on one project that lacks the value and reads it back, so
 * the caller can stop before patching the next project. A project that
 * already holds the value receives no request. `added` records that the
 * PATCH resolved and stays true when the readback after it throws: that
 * failure carries stage "confirm", a readback without the value stage "add".
 * This readback only gates further adds; confirmBypassOnProjects is the
 * confirmation.
 */
export async function addBypassValue({ api, project, state, secret }) {
  const name = project.projectName;
  if (state.keys.includes(secret)) {
    return { project: name, heldBefore: true, added: false, present: true };
  }
  await api.request(bypassPath(project), {
    method: "PATCH",
    body: { generate: { secret, note: BYPASS_NOTE } },
  });
  const added = { project: name, heldBefore: false, added: true };
  try {
    const after = await readAutomationBypass({ api, project });
    if (after.keys.includes(secret)) return { ...added, present: true };
    const reason = "the project does not hold the value this run selected";
    return notPresent(added, "add", reason);
  } catch (err) {
    const reason = `the add was accepted but its readback failed: ${err.message}`;
    return notPresent(added, "confirm", reason);
  }
}

function notAdded(project, state, secret, reason) {
  const row = {
    project: project.projectName,
    heldBefore: state.keys.includes(secret),
    added: false,
  };
  return notPresent(row, "add", reason);
}

/**
 * Adds the value to each project in order and stops issuing adds once one
 * project does not hold it, so a client failure never patches the server. A
 * PATCH that throws reports added: false; one that resolved keeps added:
 * true. It never confirms, never revokes and never writes GitHub.
 */
export async function addBypassToProjects({ api, projects, states, secret }) {
  api.registerSecret(secret);
  const results = [];
  for (const [index, project] of projects.entries()) {
    const state = states[index];
    if (results.some((r) => !r.present)) {
      const reason = "not attempted: another project failed first";
      results.push(notAdded(project, state, secret, reason));
      continue;
    }
    try {
      results.push(await addBypassValue({ api, project, state, secret }));
    } catch (err) {
      results.push(notAdded(project, state, secret, err.message));
    }
  }
  return results;
}

async function confirmOne(api, project, secret) {
  const name = project.projectName;
  try {
    const { keys, preserved } = await readAutomationBypass({ api, project });
    if (keys.includes(secret)) {
      return { project: name, confirmed: true, preserved, keys };
    }
    const reason =
      "the final readback does not hold the value this run selected";
    return { project: name, confirmed: false, preserved, keys, reason };
  } catch (err) {
    const reason = `the final readback failed: ${err.message}`;
    return { project: name, confirmed: false, preserved: 0, keys: [], reason };
  }
}

/**
 * The confirmation: a fresh read of every project, taken after all adds. A
 * project is confirmed only when this read holds the value, and its keys are
 * the only list revocation may act on. A read that throws leaves the project
 * unconfirmed with no keys; every project is read either way.
 */
export async function confirmBypassOnProjects({ api, projects, secret }) {
  const finals = [];
  for (const project of projects) {
    finals.push(await confirmOne(api, project, secret));
  }
  return finals;
}

/**
 * Revokes every automation key other than the selected one; entries of any
 * other scope never appear in keys. The keys come from the final
 * confirmation read, which registered them.
 */
export async function revokeOtherAutomationKeys(
  { api, project, keys, secret },
  progress = { revoked: 0 },
) {
  for (const key of keys.filter((k) => k !== secret)) {
    await api.request(bypassPath(project), {
      method: "PATCH",
      body: { revoke: { secret: key, regenerate: false } },
    });
    progress.revoked += 1;
  }
  return progress.revoked;
}

/**
 * Revokes the older keys on every project, attempting each even when another
 * fails, and reports each with its count. results are the final
 * confirmation reads, in project order.
 */
export async function revokeStaleBypass({ api, projects, results, secret }) {
  const outcomes = [];
  for (const [index, project] of projects.entries()) {
    const progress = { revoked: 0 };
    const keys = results[index].keys;
    try {
      await revokeOtherAutomationKeys({ api, project, keys, secret }, progress);
      outcomes.push({
        project: project.projectName,
        revoked: progress.revoked,
        revokeFailed: false,
      });
    } catch (err) {
      outcomes.push({
        project: project.projectName,
        revoked: progress.revoked,
        revokeFailed: true,
        reason: err.message,
      });
    }
  }
  return outcomes;
}
