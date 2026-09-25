import { existsSync } from "fs";
import { validateCredentials } from "./e2ePreflightValidators.js";
import {
  checkGhAuth,
  checkOptionalVercelProject,
  checkVercelApiAccess,
  checkVercelAuth,
  checkVercelProject,
} from "./e2ePreflightChecks.js";
import { EXPECTED_PROJECT_NAMES } from "./e2eVercelProjects.js";

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
 * `env` is the run's composed configuration (the file for sync-only; fixed
 * config, pattern passwords and shell exports otherwise). Only sync-only needs
 * e2e/.env.e2e to exist. `firebaseCredentials` is the object from
 * loadFirebaseCredentials; every mode but sync-only validates it. process.env
 * is never consulted for Firebase. Every check runs before any provider write.
 * Returns the Vercel API access mode so the caller builds the transport once.
 */
export function runPreflight({
  syncOnly,
  envFilePath,
  env,
  serverDir,
  clientDir,
  firebaseCredentials,
}) {
  if (syncOnly && !existsSync(envFilePath)) {
    throw new Error(
      `.env.e2e not found at ${envFilePath}.\nRemediation: The provision script reads e2e/.env.e2e. Verify the file exists at that path and contains your credentials.`,
    );
  }

  validateCredentials(env, syncOnly);

  checkGhAuth();
  checkVercelAuth();
  checkVercelProject(serverDir, EXPECTED_PROJECT_NAMES.server);
  if (clientDir) {
    checkOptionalVercelProject(clientDir, EXPECTED_PROJECT_NAMES.client);
  }
  const vercelAccess = checkVercelApiAccess();

  if (!syncOnly) assertParsedFirebaseCredentials(firebaseCredentials ?? {});

  return { vercelAccess };
}
