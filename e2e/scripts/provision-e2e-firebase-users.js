/**
 * E2E Credential Pipeline — Orchestrator. See e2e/.env.e2e.example for usage.
 * Run from the repository root:
 *
 *   node e2e/scripts/provision-e2e-firebase-users.js [--firebase-env <path>]
 *     Full pipeline: provision Firebase users, write pattern passwords and UIDs,
 *     sync GitHub + Vercel.
 *   node e2e/scripts/provision-e2e-firebase-users.js --sync-only
 *     Push e2e/.env.e2e to GitHub and Vercel without touching Firebase.
 *   node e2e/scripts/provision-e2e-firebase-users.js --reset-passwords [--firebase-env <path>]
 *     Re-apply the six pattern passwords to the E2E Firebase project, write
 *     them to e2e/.env.e2e and push them to GitHub. An alias for the default
 *     provisioning/reset run; nothing is generated.
 *
 * Every mode but --sync-only loads the Firebase admin credentials from, in
 * order: --firebase-env <path>, server/.env.e2e, then a single
 * secrets/*ichnos-protocol-test*.json service-account file. No mode reads
 * server/.env, and every mode is locked to the ichnos-protocol-test project.
 * Shell-exported E2E_*_PASSWORD values are captured once at startup and
 * override e2e/.env.e2e. Every mode refuses a password that is not its
 * account's pattern password (AGENTS.md "Passwords and secrets").
 */
import { existsSync, realpathSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import { runPreflight } from "./helpers/e2ePreflight.js";
import {
  readEnvFile,
  captureExportedPasswords,
  mergeEnvPasswords,
  writePasswordsToEnvFile,
  writeUidsToEnvFile,
} from "./helpers/e2eEnvFile.js";
import {
  syncToGitHub,
  syncVariablesToGitHub,
} from "./helpers/e2eSyncGitHub.js";
import { syncToVercel } from "./helpers/e2eSyncVercel.js";
import {
  buildCredentialMaps,
  findMissingGitHubNames,
  findInvalidRoleEmailNames,
  findPasswordMismatchNames,
  patternPasswords,
} from "./helpers/e2eCredentials.js";
import {
  prepareReset,
  applyReset,
  RECOVERY_NOTE,
} from "./helpers/e2ePasswordReset.js";
import { loadFirebaseCredentials } from "./helpers/e2eFirebaseCredentials.js";
import { printFailedDetails, printSummary } from "./helpers/e2eReporting.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const serverDir = resolve(__dirname, "../../server");
const repoRoot = resolve(__dirname, "../..");
const envFilePath = resolve(__dirname, "../.env.e2e");

export function parseCliOptions(argv) {
  const index = argv.indexOf("--firebase-env");
  return {
    syncOnly: argv.includes("--sync-only"),
    resetPasswords: argv.includes("--reset-passwords"),
    firebaseEnvPath: index === -1 ? undefined : argv[index + 1],
  };
}

function assertGitHubConfigComplete(values) {
  const missing = findMissingGitHubNames(values);
  if (missing.length === 0) return;
  throw new Error(
    `Missing GitHub config value(s): ${missing.join(", ")}\n` +
      "Set them in the local, gitignored e2e/.env.e2e (or export the E2E_*_PASSWORD values in your shell, which take precedence) and re-run.",
  );
}

const PATTERN_REMEDIATION =
  "Remediation: clear the listed line(s) in the local, gitignored e2e/.env.e2e, " +
  "unset any shell export of them, and re-run.";

function assertPatternPasswords(env) {
  const invalidEmails = findInvalidRoleEmailNames(env);
  if (invalidEmails.length > 0) {
    throw new Error(
      `Invalid role email(s): ${invalidEmails.join(", ")}\n` +
        'A role email must begin with the "e2e-" prefix. Nothing was changed.',
    );
  }
  const names = findPasswordMismatchNames(env);
  if (names.length === 0) return;
  throw new Error(
    `Password(s) not matching the account pattern: ${names.join(", ")}\n` +
      "Each E2E_*_PASSWORD must equal its account's pattern password as defined " +
      'in AGENTS.md "Passwords and secrets"; E2E_SIGNUP_PASSWORD has its own ' +
      "fixed pattern value. Nothing was changed or synced.\n" +
      PATTERN_REMEDIATION,
  );
}

function loadLocalEnv(exportedPasswords) {
  if (!existsSync(envFilePath)) {
    throw new Error(
      `.env.e2e not found at ${envFilePath}.\nRemediation: The provision script reads e2e/.env.e2e. Verify the file exists at that path and contains your credentials.`,
    );
  }
  return mergeEnvPasswords(readEnvFile(envFilePath), exportedPasswords);
}

function syncGitHubConfig(githubVariables, github, { recoveryNote } = {}) {
  console.log("\n=== GitHub Actions Sync ===");
  const varResults = syncVariablesToGitHub(githubVariables, repoRoot);
  const ghResults = syncToGitHub(github, repoRoot);
  const hasFailed = (results) => results.some((r) => r.status === "failed");
  if (hasFailed(varResults) || hasFailed(ghResults)) {
    printSummary(ghResults, [], varResults);
    printFailedDetails("GitHub variables", varResults);
    printFailedDetails("GitHub secrets", ghResults);
    if (recoveryNote) console.error(recoveryNote);
    process.exit(1);
  }
  return { ghResults, varResults };
}

// Passwords are written only once every Firebase upsert has succeeded, and
// before GitHub sync, so e2e/.env.e2e is the recovery source if the sync fails.
async function provisionFullPipeline(
  { firebaseCreds, vercel, githubVariables },
  credentials,
  passwords,
) {
  console.log("\n=== Firebase Provisioning ===");
  const { provisionFirebaseUsers } =
    await import("./helpers/firebaseTestSetup.js");
  const uidMap = await provisionFirebaseUsers(firebaseCreds, credentials);
  writePasswordsToEnvFile(envFilePath, passwords);
  console.log("[env] pattern passwords written to .env.e2e");
  writeUidsToEnvFile(envFilePath, uidMap);
  console.log("[env] UIDs written back to .env.e2e");
  for (const [key, uid] of Object.entries(uidMap)) {
    vercel[key] = uid;
    githubVariables[key] = uid;
  }
}

function exitOnVercelFailure(vcResults) {
  if (!vcResults.some((r) => r.status === "failed")) return;
  printFailedDetails("Vercel", vcResults);
  process.exit(1);
}

function modeLabel(syncOnly, resetPasswords) {
  if (resetPasswords) return "reset-passwords";
  return syncOnly ? "sync-only" : "full pipeline";
}

export async function main(
  { syncOnly, resetPasswords, firebaseEnvPath } = parseCliOptions(process.argv),
) {
  const exportedPasswords = captureExportedPasswords();
  if (syncOnly && resetPasswords) {
    throw new Error("--sync-only and --reset-passwords cannot be combined.");
  }
  console.log(`[orchestrator] ${modeLabel(syncOnly, resetPasswords)}\n`);

  const credentials = syncOnly
    ? null
    : loadFirebaseCredentials({
        repoRoot,
        firebaseEnvPath,
        cwd: process.cwd(),
      });
  const reset = resetPasswords
    ? prepareReset({ credentials, envFilePath })
    : null;
  const fileEnv = loadLocalEnv(exportedPasswords);
  assertPatternPasswords(fileEnv);
  const applied = syncOnly
    ? {}
    : (reset?.passwords ?? patternPasswords(fileEnv));
  const env = { ...fileEnv, ...applied };
  const maps = buildCredentialMaps(env);
  const { github, githubVariables, vercel } = maps;
  // Sync-only and reset already hold every UID: report missing names before preflight runs `gh`.
  if (syncOnly || reset)
    assertGitHubConfigComplete({ ...githubVariables, ...github });

  runPreflight({
    syncOnly,
    envFilePath,
    serverDir,
    exportedPasswords: reset ? reset.passwords : exportedPasswords,
    firebaseCredentials: credentials,
  });
  console.log("[preflight] all checks passed");

  if (reset) {
    const { vcResults } = await applyReset({
      ...maps,
      env,
      envFilePath,
      serverDir,
      credentials,
      passwords: reset.passwords,
      syncGitHubConfig,
    });
    exitOnVercelFailure(vcResults);
    console.log("[done] E2E passwords reset.");
    return;
  }

  if (!syncOnly) await provisionFullPipeline(maps, credentials, applied);

  // Full pipeline: UIDs exist only after provisioning, so the check runs here.
  assertGitHubConfigComplete({ ...githubVariables, ...github });
  const { ghResults, varResults } = syncGitHubConfig(
    githubVariables,
    github,
    syncOnly ? {} : { recoveryNote: RECOVERY_NOTE },
  );

  console.log("\n=== Vercel Preview Sync ===");
  const vcResults = syncToVercel(vercel, serverDir);

  printSummary(ghResults, vcResults, varResults);
  exitOnVercelFailure(vcResults);

  console.log(
    "[reminder] Vercel Preview env changes require a new deployment or redeploy.",
  );
  console.log("[done] E2E credential pipeline complete.");
}

const invokedDirectly =
  Boolean(process.argv[1]) &&
  realpathSync(process.argv[1]) === fileURLToPath(import.meta.url);

if (invokedDirectly) {
  main().catch((err) => {
    console.error(`\n[fatal] ${err.message}`);
    process.exit(1);
  });
}
