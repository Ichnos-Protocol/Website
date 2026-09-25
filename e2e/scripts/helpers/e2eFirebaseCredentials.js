/**
 * The single source of Firebase admin credentials for the E2E scripts.
 *
 * Source precedence: --firebase-env <path>, then server/.env.e2e, then the one
 * secrets/*ichnos-protocol-test*.json service-account file. server/.env and any
 * alias of it are always refused, and a project ID other than
 * E2E_FIREBASE_PROJECT_ID is refused before any key is used. Credentials are
 * returned as a plain object and never reach process.env.
 */
import { existsSync, readFileSync, readdirSync, realpathSync } from "fs";
import { basename, extname, resolve } from "path";
import { parse } from "dotenv";

export const E2E_FIREBASE_PROJECT_ID = "ichnos-protocol-test";

const DEFAULT_CREDENTIAL_PATH = "server/.env.e2e";
const REFUSED_SERVER_ENV_PATH = "server/.env";
const SECRETS_DIR = "secrets";
// FIREBASE_PROJECT_ID is not listed: the project guard owns a missing project
// ID and runs first, so a combined omission still reports the project guard.
const REQUIRED_CREDENTIAL_KEYS = {
  clientEmail: "FIREBASE_CLIENT_EMAIL",
  privateKey: "FIREBASE_PRIVATE_KEY",
};

function normalizePath(path) {
  const resolved = resolve(path);
  return process.platform === "win32" ? resolved.toLowerCase() : resolved;
}

// The filesystem target, following symlinks and junctions; null when the path
// does not exist, so a missing file never matches another missing file.
function canonicalPath(path) {
  try {
    return normalizePath(realpathSync.native(path));
  } catch {
    return null;
  }
}

function isServerEnvPath(credentialPath, refused) {
  if (normalizePath(credentialPath) === normalizePath(refused)) return true;
  const target = canonicalPath(credentialPath);
  return target !== null && target === canonicalPath(refused);
}

function assertNotServerEnv(credentialPath, repoRoot) {
  const refused = resolve(repoRoot, REFUSED_SERVER_ENV_PATH);
  if (!isServerEnvPath(credentialPath, refused)) return;
  throw new Error(
    `Refusing to read Firebase credentials from ${credentialPath}.\n` +
      "Remediation: put the E2E project's admin credentials in server/.env.e2e (or pass another file with --firebase-env).",
  );
}

function isTestServiceAccountName(name) {
  return name.endsWith(".json") && name.includes(E2E_FIREBASE_PROJECT_ID);
}

// Filters by filename only, so a non-matching file is never opened.
function findSecretsFile(repoRoot) {
  const dir = resolve(repoRoot, SECRETS_DIR);
  if (!existsSync(dir)) return null;
  const matches = readdirSync(dir).filter(isTestServiceAccountName);
  if (matches.length > 1) {
    throw new Error(
      `Found ${matches.length} Firebase service-account files in secrets/: ` +
        `${matches.map((name) => basename(name)).join(", ")}. Keep exactly one, or pass --firebase-env.`,
    );
  }
  return matches.length === 1 ? resolve(dir, matches[0]) : null;
}

function noSourceError() {
  return new Error(
    "No Firebase admin credentials found for the E2E project.\n" +
      "Remediation: provide them in one of, in order of precedence:\n" +
      "  1. a file passed with --firebase-env <path>\n" +
      "  2. server/.env.e2e\n" +
      `  3. a single secrets/*${E2E_FIREBASE_PROJECT_ID}*.json service-account file`,
  );
}

function resolveCredentialSource({ repoRoot, firebaseEnvPath, cwd }) {
  if (firebaseEnvPath) {
    const explicit = resolve(cwd, firebaseEnvPath);
    assertNotServerEnv(explicit, repoRoot);
    if (!existsSync(explicit)) {
      throw new Error(`Firebase credential file not found: ${explicit}`);
    }
    return explicit;
  }
  const fallback = resolve(repoRoot, DEFAULT_CREDENTIAL_PATH);
  if (existsSync(fallback)) return fallback;
  const secretsFile = findSecretsFile(repoRoot);
  if (secretsFile) return secretsFile;
  throw noSourceError();
}

function parseServiceAccount(content) {
  const json = JSON.parse(content);
  return {
    projectId: json.project_id,
    clientEmail: json.client_email,
    privateKey: json.private_key,
  };
}

function parseDotenvCredentials(content) {
  const parsed = parse(content);
  return {
    projectId: parsed.FIREBASE_PROJECT_ID,
    clientEmail: parsed.FIREBASE_CLIENT_EMAIL,
    privateKey: parsed.FIREBASE_PRIVATE_KEY,
  };
}

function parseCredentialFile(credentialPath) {
  const content = readFileSync(credentialPath, "utf8");
  return extname(credentialPath).toLowerCase() === ".json"
    ? parseServiceAccount(content)
    : parseDotenvCredentials(content);
}

export function assertE2EProjectId(projectId) {
  if (projectId === E2E_FIREBASE_PROJECT_ID) return;
  throw new Error(
    `Refusing Firebase project "${projectId ?? ""}": E2E provisioning is locked to "${E2E_FIREBASE_PROJECT_ID}". Nothing was changed.`,
  );
}

function assertCredentialKeys(credentials) {
  const missing = Object.entries(REQUIRED_CREDENTIAL_KEYS)
    .filter(([field]) => !credentials[field])
    .map(([, key]) => key);
  if (missing.length === 0) return;
  throw new Error(
    `Missing key(s) in the Firebase credential file: ${missing.join(", ")}`,
  );
}

function normalizePrivateKey(credentials) {
  return {
    ...credentials,
    privateKey: credentials.privateKey.replace(/\\n/g, "\n"),
  };
}

export function loadFirebaseCredentials({ repoRoot, firebaseEnvPath, cwd }) {
  const source = resolveCredentialSource({ repoRoot, firebaseEnvPath, cwd });
  assertNotServerEnv(source, repoRoot);
  const parsed = parseCredentialFile(source);
  assertE2EProjectId(parsed.projectId);
  assertCredentialKeys(parsed);
  return normalizePrivateKey(parsed);
}
