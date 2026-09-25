import { existsSync } from "fs";
import { validateCredentials } from "./e2ePreflightValidators.js";
import {
  checkGhAuth,
  checkVercelApiAccess,
  checkVercelAuth,
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

// Only mode and reason are printed; the token never is.
function printTransport({ mode, reason }) {
  const why = reason ? ` (${reason})` : "";
  console.log(`[preflight] Vercel transport: ${mode}${why}`);
}

/**
 * `env` is the run's composed configuration (the file for sync-only; fixed
 * config, pattern passwords and shell exports otherwise). Only sync-only needs
 * e2e/.env.e2e to exist. `firebaseCredentials` is the object from
 * loadFirebaseCredentials; every mode but sync-only validates it. process.env
 * is never consulted for Firebase. Every check runs before any provider write.
 * Returns the Vercel API access mode so the caller builds the transport once.
 * The mode also decides whether the CLI session is checked at all: token mode
 * (an exported VERCEL_TOKEN always wins) spawns no Vercel CLI and needs no
 * `vercel login`; only CLI mode runs `vercel whoami`.
 * No .vercel link file is read here: the owning Vercel scope is discovered
 * after preflight, through the authenticated API (connectVercelProjects).
 */
export function runPreflight({
  syncOnly,
  envFilePath,
  env,
  firebaseCredentials,
}) {
  if (syncOnly && !existsSync(envFilePath)) {
    throw new Error(
      `.env.e2e not found at ${envFilePath}.\nRemediation: The provision script reads e2e/.env.e2e. Verify the file exists at that path and contains your credentials.`,
    );
  }

  validateCredentials(env, syncOnly);

  checkGhAuth();
  const vercelAccess = checkVercelApiAccess();
  if (vercelAccess.mode === "cli") checkVercelAuth();
  printTransport(vercelAccess);

  if (!syncOnly) assertParsedFirebaseCredentials(firebaseCredentials ?? {});

  return { vercelAccess };
}
