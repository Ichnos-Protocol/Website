import { existsSync } from "fs";
import { readEnvFile, mergeEnvPasswords } from "./e2eEnvFile.js";
import { validateCredentials } from "./e2ePreflightValidators.js";
import {
  checkGhAuth,
  checkVercelAuth,
  checkVercelProject,
  checkFirebaseEnv,
} from "./e2ePreflightChecks.js";

const PARSED_FIREBASE_KEYS = {
  projectId: "FIREBASE_PROJECT_ID",
  clientEmail: "FIREBASE_CLIENT_EMAIL",
  privateKey: "FIREBASE_PRIVATE_KEY",
};

function assertParsedFirebaseCredentials(credentials) {
  const missing = Object.entries(PARSED_FIREBASE_KEYS)
    .filter(([field]) => !credentials[field])
    .map(([, name]) => name);
  if (missing.length === 0) return;
  throw new Error(
    `Missing Firebase admin credential(s): ${missing.join(", ")}\n` +
      "Remediation: add them to the Firebase credential file passed to --reset-passwords.",
  );
}

/**
 * `exportedPasswords` is the startup snapshot of shell-exported passwords.
 * `firebaseCredentials` (reset mode) replaces the process.env Firebase check.
 */
export function runPreflight({
  syncOnly,
  envFilePath,
  serverDir,
  exportedPasswords,
  firebaseCredentials,
}) {
  if (!existsSync(envFilePath)) {
    throw new Error(
      `.env.e2e not found at ${envFilePath}.\nRemediation: The provision script reads e2e/.env.e2e. Verify the file exists at that path and contains your credentials.`,
    );
  }

  const env = mergeEnvPasswords(readEnvFile(envFilePath), exportedPasswords);
  validateCredentials(env, syncOnly);

  checkGhAuth();
  checkVercelAuth();
  checkVercelProject(serverDir);

  if (firebaseCredentials) {
    assertParsedFirebaseCredentials(firebaseCredentials);
  } else if (!syncOnly) {
    checkFirebaseEnv();
  }

  return true;
}
