/**
 * --reset-passwords: generate six fresh E2E passwords, apply them to the E2E
 * Firebase project, write them to e2e/.env.e2e and push them to GitHub.
 *
 * prepareReset runs before anything external (Firebase, gh, vercel, writes).
 * The Firebase admin credentials arrive already loaded by the shared loader
 * (e2eFirebaseCredentials.js), which refuses server/.env and any project other
 * than ichnos-protocol-test; they never reach process.env.
 */
import { randomBytes } from "node:crypto";
import { existsSync } from "fs";

import {
  ROLES,
  passwordNames,
  findPlaceholderPasswordNames,
} from "./e2eCredentials.js";
import {
  readEnvFile,
  writePasswordsToEnvFile,
  writeUidsToEnvFile,
} from "./e2eEnvFile.js";
import { getTestApp, upsertUser } from "./firebaseTestSetup.js";
import { syncToVercel } from "./e2eSyncVercel.js";
import { printSummary } from "./e2eReporting.js";

function assertProjectMatch(credentials, envFilePath) {
  const e2eProjectId = existsSync(envFilePath)
    ? readEnvFile(envFilePath).FIREBASE_PROJECT_ID
    : undefined;
  if (e2eProjectId && e2eProjectId === credentials.projectId) return;
  throw new Error(
    `Firebase project mismatch: credential file is for "${credentials.projectId ?? ""}", ` +
      `e2e/.env.e2e names "${e2eProjectId ?? ""}". Nothing was changed.`,
  );
}

function generatePasswords() {
  const names = passwordNames();
  const passwords = Object.fromEntries(
    names.map((name) => [name, randomBytes(24).toString("base64url")]),
  );
  if (new Set(Object.values(passwords)).size !== names.length) {
    throw new Error(`Expected ${names.length} distinct generated passwords.`);
  }
  const placeholders = findPlaceholderPasswordNames(passwords);
  if (placeholders.length > 0) {
    throw new Error(`Generated password(s) failed the guard: ${placeholders}`);
  }
  return passwords;
}

export function prepareReset({ credentials, envFilePath }) {
  assertProjectMatch(credentials, envFilePath);
  return { credentials, passwords: generatePasswords() };
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

const RECOVERY_NOTE =
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
