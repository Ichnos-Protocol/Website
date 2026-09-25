import { existsSync } from "fs";
import { readEnvFile, mergeEnvPasswords } from "./e2eEnvFile.js";
import { validateCredentials } from "./e2ePreflightValidators.js";
import {
  checkGhAuth,
  checkVercelAuth,
  checkVercelProject,
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
      "Remediation: add them to the Firebase credential file (--firebase-env, server/.env.e2e or the secrets/ service-account file).",
  );
}

/**
 * `exportedPasswords` is the startup snapshot of shell-exported passwords.
 * `firebaseCredentials` is the object from loadFirebaseCredentials; every mode
 * but sync-only validates it. process.env is never consulted for Firebase.
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

  if (!syncOnly) assertParsedFirebaseCredentials(firebaseCredentials ?? {});

  return true;
}
