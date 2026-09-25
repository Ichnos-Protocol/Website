/**
 * Vercel Protection Bypass for Automation, set to one caller-generated value
 * on both projects. The value is an infrastructure secret, not an E2E account
 * password, so the account-password pattern does not apply to it. No result,
 * log line or thrown message carries the value or any other bypass key.
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

function staleAutomationKeys(map, secret) {
  return Object.entries(map)
    .filter(([key, entry]) => key !== secret && entry?.scope === BYPASS_SCOPE)
    .map(([key]) => key);
}

function countPreserved(map) {
  return Object.values(map).filter((entry) => entry?.scope !== BYPASS_SCOPE)
    .length;
}

async function revokeKeys(api, project, keys) {
  for (const key of keys) {
    api.registerSecret(key);
    await api.request(bypassPath(project), {
      method: "PATCH",
      body: { revoke: { secret: key, regenerate: false } },
    });
  }
}

/**
 * Sets the caller's value, confirms it by reading the project back, then
 * revokes every other automation-bypass key. Entries of any other scope are
 * left untouched.
 */
export async function syncBypassOnProject({ api, project, secret }) {
  const name = project.projectName;
  await api.request(bypassPath(project), {
    method: "PATCH",
    body: { generate: { secret, note: BYPASS_NOTE } },
  });
  const map = await readBypassMap(api, project);
  if (map[secret]?.scope !== BYPASS_SCOPE) {
    return {
      project: name,
      confirmed: false,
      reason: "the project does not hold the value this run generated",
      revoked: 0,
      preserved: countPreserved(map),
    };
  }
  const stale = staleAutomationKeys(map, secret);
  await revokeKeys(api, project, stale);
  return {
    project: name,
    confirmed: true,
    revoked: stale.length,
    preserved: countPreserved(map),
  };
}

/**
 * Runs both projects in order and reports each. It never writes GitHub and
 * claims no atomicity: a partial failure is reported per project.
 */
export async function syncBypassSecret({ api, projects, secret }) {
  api.registerSecret(secret);
  const results = [];
  for (const project of projects) {
    try {
      results.push(await syncBypassOnProject({ api, project, secret }));
    } catch (err) {
      results.push({
        project: project.projectName,
        confirmed: false,
        reason: err.message,
        revoked: 0,
        preserved: 0,
      });
    }
  }
  return results;
}
