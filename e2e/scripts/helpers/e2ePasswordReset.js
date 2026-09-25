/**
 * --reset-passwords: re-apply the six pattern passwords, derived from the
 * account emails (AGENTS.md "Passwords and secrets"), to the E2E Firebase
 * project, write them to e2e/.env.e2e and push them to GitHub. Nothing is
 * generated; this is another name for the default provisioning/reset run.
 *
 * prepareReset runs before anything external (Firebase, gh, vercel, writes).
 * The Firebase admin credentials arrive already loaded by the shared loader
 * (e2eFirebaseCredentials.js), which refuses server/.env and any project other
 * than ichnos-protocol-test; they never reach process.env.
 */
import { existsSync } from "fs";

import { ROLES, patternPasswords } from "./e2eCredentials.js";
import {
  readEnvFile,
  writePasswordsToEnvFile,
  writeUidsToEnvFile,
} from "./e2eEnvFile.js";
import { getTestApp, upsertUser } from "./firebaseTestSetup.js";
import { syncToVercel } from "./e2eSyncVercel.js";
import { printSummary } from "./e2eReporting.js";

function readLocalEnv(envFilePath) {
  return existsSync(envFilePath) ? readEnvFile(envFilePath) : {};
}

function assertProjectMatch(credentials, fileEnv) {
  const e2eProjectId = fileEnv.FIREBASE_PROJECT_ID;
  if (e2eProjectId && e2eProjectId === credentials.projectId) return;
  throw new Error(
    `Firebase project mismatch: credential file is for "${credentials.projectId ?? ""}", ` +
      `e2e/.env.e2e names "${e2eProjectId ?? ""}". Nothing was changed.`,
  );
}

export function prepareReset({ credentials, envFilePath }) {
  const fileEnv = readLocalEnv(envFilePath);
  assertProjectMatch(credentials, fileEnv);
  return { credentials, passwords: patternPasswords(fileEnv) };
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
  envFilePath,
  serverDir,
  firebaseCreds,
  githubVariables,
  github,
  vercel,
  credentials,
  passwords,
  syncGitHubConfig,
}) {
  assertRoleEmails(env);
  console.log("\n=== Firebase Password Reset ===");
  const uidMap = await upsertAll(credentials, firebaseCreds);
  const changedUids = collectChangedUids(env, uidMap);

  writePasswordsToEnvFile(envFilePath, passwords);
  if (Object.keys(changedUids).length > 0) {
    writeUidsToEnvFile(envFilePath, changedUids);
  }
  console.log("[env] new passwords written to .env.e2e");
  Object.assign(githubVariables, changedUids);

  const { ghResults, varResults } = syncGitHubConfig(githubVariables, github, {
    recoveryNote: RECOVERY_NOTE,
  });
  const vcResults = syncChangedToVercel(changedUids, vercel, serverDir);
  printSummary(ghResults, vcResults, varResults);
  return { ghResults, vcResults, varResults };
}
