/**
 * --reset-passwords: re-apply the six pattern passwords, derived from the
 * account emails (AGENTS.md "Passwords and secrets"), to the E2E Firebase
 * project, regenerate e2e/.env.e2e and secrets/test-accounts.md and push the
 * passwords to GitHub. Nothing is random; this is another name for the default
 * provisioning/reset run. e2e/.env.e2e is optional: the emails are fixed in code.
 *
 * prepareReset runs before anything external (Firebase, gh, vercel, writes).
 * The Firebase admin credentials arrive already loaded by the shared loader
 * (e2eFirebaseCredentials.js), which refuses server/.env and any project other
 * than ichnos-protocol-test; they never reach process.env.
 */
import { existsSync } from "fs";

import { ROLES, fixedE2EConfig, patternPasswords } from "./e2eCredentials.js";
import { readEnvFile } from "./e2eEnvFile.js";
import { assertEnvFileProjectMatch } from "./e2eFirebaseCredentials.js";
import { getTestApp, upsertUser } from "./firebaseTestSetup.js";
import { syncToVercel } from "./e2eSyncVercel.js";
import { printSummary } from "./e2eReporting.js";

function readLocalEnv(envFilePath) {
  return existsSync(envFilePath) ? readEnvFile(envFilePath) : {};
}

export function prepareReset({ credentials, envFilePath }) {
  assertEnvFileProjectMatch(readLocalEnv(envFilePath), credentials);
  return { credentials, passwords: patternPasswords(fixedE2EConfig()) };
}

function assertRoleEmails(env) {
  const missing = ROLES.map((r) => `E2E_${r.key}_EMAIL`).filter(
    (name) => !env[name],
  );
  if (missing.length === 0) return;
  throw new Error(
    `Missing role email(s) for --reset-passwords: ${missing.join(", ")}`,
  );
}

async function upsertAll(credentials, firebaseCreds) {
  const auth = getTestApp(credentials).auth();
  const uidMap = {};
  for (const spec of firebaseCreds) {
    uidMap[spec.uidKey] = await upsertUser(auth, spec);
  }
  return uidMap;
}

function collectChangedUids(env, uidMap) {
  return Object.fromEntries(
    Object.entries(uidMap).filter(([key, uid]) => env[key] !== uid),
  );
}

function buildVercelChanges(changedUids, vercel) {
  const changes = {};
  for (const [uidKey, uid] of Object.entries(changedUids)) {
    const emailKey = uidKey.replace(/_UID$/, "_EMAIL");
    changes[emailKey] = vercel[emailKey];
    changes[uidKey] = uid;
  }
  return changes;
}

// Also printed by the default provisioning run when GitHub sync fails.
export const RECOVERY_NOTE =
  "[recovery] Firebase and e2e/.env.e2e already hold the new passwords; " +
  "e2e/.env.e2e is now the source of truth. Re-run with --sync-only to push " +
  "it to GitHub without touching Firebase.";

function syncChangedToVercel(changedUids, vercel, serverDir) {
  console.log("\n=== Vercel Preview Sync ===");
  if (Object.keys(changedUids).length === 0) {
    console.log("[vercel] no UID changed — skipping Vercel sync");
    return [];
  }
  return syncToVercel(buildVercelChanges(changedUids, vercel), serverDir);
}

export async function applyReset({
  env,
  serverDir,
  firebaseCreds,
  githubVariables,
  github,
  vercel,
  credentials,
  syncGitHubConfig,
  writeGeneratedFiles,
}) {
  assertRoleEmails(env);
  console.log("\n=== Firebase Password Reset ===");
  const uidMap = await upsertAll(credentials, firebaseCreds);
  const changedUids = collectChangedUids(env, uidMap);

  // Whole-file e2e/.env.e2e and the record, after every upsert, before any sync.
  writeGeneratedFiles(uidMap);
  Object.assign(githubVariables, changedUids);

  const { ghResults, varResults } = syncGitHubConfig(githubVariables, github, {
    recoveryNote: RECOVERY_NOTE,
  });
  const vcResults = syncChangedToVercel(changedUids, vercel, serverDir);
  printSummary(ghResults, vcResults, varResults);
  return { ghResults, vcResults, varResults };
}
