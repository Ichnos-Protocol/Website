/**
 * E2E Credential Pipeline — Orchestrator. Run from the repository root:
 *
 *   node e2e/scripts/provision-e2e-firebase-users.js [--firebase-env <path>]
 *     Full pipeline: provision the five role accounts in Firebase, read the
 *     E2E project's web config (API key, auth domain, storage bucket) from
 *     Firebase, generate e2e/.env.e2e and secrets/test-accounts.md, sync
 *     GitHub, converge the automation bypass on both Vercel projects (reuse
 *     the value both already share, generate one only when none is shared,
 *     set it in GitHub once both confirm it, and revoke older keys only after
 *     GitHub confirms), set the all-branches Preview env on both projects and
 *     redeploy each preview whose env changed.
 *   node e2e/scripts/provision-e2e-firebase-users.js --sync-only
 *     Push e2e/.env.e2e as it stands to GitHub and the Vercel Preview env
 *     without touching Firebase. It neither reads the web config nor
 *     converges the bypass. The only mode that requires the file; it writes nothing.
 *   node e2e/scripts/provision-e2e-firebase-users.js --reset-passwords [--firebase-env <path>]
 *     Re-apply the six pattern passwords to the E2E Firebase project,
 *     regenerate both files and push the passwords to GitHub. An alias for the
 *     default provisioning/reset run; nothing is random.
 *
 * e2e/.env.e2e is a generated file. The emails, URLs and project come from
 * code (e2eFixedConfig.js), the passwords from the account pattern, the UIDs
 * from Firebase; only the three public web-config values are carried over
 * from an earlier file. It is written whole, after every upsert and before any
 * sync, with a header naming the date and the command as the operator gave it.
 * secrets/test-accounts.md is written next, only once git confirms the path is
 * ignored, with no secret marked as set by this run; it is rewritten after the
 * GitHub secret sync to date only the secrets that sync confirmed.
 *
 * Every mode but --sync-only loads the Firebase admin credentials from, in
 * order: --firebase-env <path>, server/.env.e2e, then a single
 * secrets/*ichnos-protocol-test*.json service-account file. No mode reads
 * server/.env, and every mode is locked to the ichnos-protocol-test project;
 * an existing e2e/.env.e2e naming another project is refused before any
 * Firebase call. Shell-exported E2E_*_PASSWORD values are captured once at
 * startup, and every mode refuses a password that is not its account's
 * pattern password (AGENTS.md "Passwords and secrets"). The provisioning modes
 * check every password in e2e/.env.e2e and in the shell before any provider
 * call, although they write the pattern passwords themselves.
 *
 * Vercel traffic goes through the Vercel REST API: the `vercel api`
 * subcommand over the `vercel login` session, or, when the installed CLI
 * lacks it, an exported VERCEL_TOKEN. The only manual steps are `gh auth
 * login`, `vercel login` and, in that last case, the VERCEL_TOKEN export.
 */
import { existsSync, realpathSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, relative, resolve } from "path";
import { runPreflight } from "./helpers/e2ePreflight.js";
import {
  readEnvFile,
  captureExportedPasswords,
  mergeEnvPasswords,
  readPreservedWebConfig,
  utcDate,
  writeEnvFile,
} from "./helpers/e2eEnvFile.js";
import {
  listGitHubSecretMetadata,
  syncToGitHub,
  syncVariablesToGitHub,
} from "./helpers/e2eSyncGitHub.js";
import {
  confirmedSecretNames,
  VERCEL_SETTING,
  writeTestAccountsRecord,
} from "./helpers/e2eTestAccountsRecord.js";
import { connectVercelProjects } from "./helpers/e2eVercelProjects.js";
import { fetchWebConfig } from "./helpers/e2eFirebaseWebConfig.js";
import {
  BYPASS_SECRET_NAME,
  bypassFailures,
  syncProviders,
} from "./helpers/e2eProviderSync.js";
import {
  buildCredentialMaps,
  findMissingGitHubNames,
  findInvalidRoleEmailNames,
  findPasswordMismatchNames,
  fixedE2EConfig,
  passwordNames,
  patternPasswords,
  ROLES,
} from "./helpers/e2eCredentials.js";
import {
  prepareReset,
  applyReset,
  RECOVERY_NOTE,
} from "./helpers/e2ePasswordReset.js";
import {
  assertEnvFileProjectMatch,
  loadFirebaseCredentials,
} from "./helpers/e2eFirebaseCredentials.js";
import {
  printBypass,
  printFailedDetails,
  printRedeploys,
  printSummary,
} from "./helpers/e2eReporting.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const serverDir = resolve(__dirname, "../../server");
const clientDir = resolve(__dirname, "../../client");
const repoRoot = resolve(__dirname, "../..");
const envFilePath = resolve(__dirname, "../.env.e2e");
const recordPath = resolve(repoRoot, "secrets", "test-accounts.md");
const SCRIPT_PATH = "e2e/scripts/provision-e2e-firebase-users.js";

/** argv is process.argv; args keeps the operator's tokens in their order. */
export function parseCliOptions(argv, cwd = process.cwd()) {
  const args = argv.slice(2);
  const index = args.indexOf("--firebase-env");
  return {
    syncOnly: args.includes("--sync-only"),
    resetPasswords: args.includes("--reset-passwords"),
    firebaseEnvPath: index === -1 ? undefined : args[index + 1],
    args,
    scriptPath: argv[1]
      ? relative(cwd, argv[1]).split("\\").join("/")
      : SCRIPT_PATH,
  };
}

const SAFE_TOKEN = /^[\w\-./:=@%+,]+$/;

// POSIX single quoting; a token with no single quote replays in PowerShell too.
function quoteToken(token) {
  if (SAFE_TOKEN.test(token)) return token;
  return `'${token.split("'").join(`'"'"'`)}'`;
}

/** The replayable command for the given argument tokens, in their order. */
export function commandLine(args = [], scriptPath = SCRIPT_PATH) {
  return ["node", scriptPath, ...args].map(quoteToken).join(" ");
}

// A main() call without raw tokens (tests, programmatic use) records the
// flags its options stand for.
function argsFromOptions({ syncOnly, resetPasswords, firebaseEnvPath }) {
  const args = [];
  if (syncOnly) args.push("--sync-only");
  if (resetPasswords) args.push("--reset-passwords");
  if (firebaseEnvPath) args.push("--firebase-env", firebaseEnvPath);
  return args;
}

function runCommand(options) {
  if (options.command) return options.command;
  const args = options.args ?? argsFromOptions(options);
  return commandLine(args, options.scriptPath);
}

function assertGitHubConfigComplete(values) {
  const missing = findMissingGitHubNames(values);
  if (missing.length === 0) return;
  throw new Error(
    `Missing GitHub config value(s): ${missing.join(", ")}\n` +
      "e2e/.env.e2e is generated: re-run the provisioning command once the missing values can be supplied (the default run reads the web config from Firebase; --reset-passwords carries it over from an earlier file).",
  );
}

const PATTERN_REMEDIATION =
  "Remediation: unset any shell export of the listed name(s) and delete any " +
  "listed line from e2e/.env.e2e (the provisioning command regenerates it); " +
  "for --sync-only, regenerate e2e/.env.e2e with the provisioning command. " +
  "Then re-run.";

function refusePasswordNames(names) {
  throw new Error(
    `Password(s) not matching the account pattern: ${names.join(", ")}\n` +
      "Each E2E_*_PASSWORD must equal its account's pattern password as defined " +
      'in AGENTS.md "Passwords and secrets"; E2E_SIGNUP_PASSWORD has its own ' +
      "fixed pattern value. Nothing was changed or synced.\n" +
      PATTERN_REMEDIATION,
  );
}

function suppliedPasswords(source) {
  return Object.fromEntries(
    passwordNames()
      .filter((name) => source[name])
      .map((name) => [name, source[name]]),
  );
}

// The provisioning modes derive their passwords, so a stale file or shell
// value would otherwise pass unseen. Each source is checked on its own against
// the canonical emails; the error names variables, never a value.
function assertSuppliedPasswords(fileEnv, exportedPasswords) {
  const fixed = fixedE2EConfig();
  const sources = [
    ["e2e/.env.e2e", fileEnv],
    ["shell export", exportedPasswords],
  ];
  const refused = sources.flatMap(([label, source]) =>
    findPasswordMismatchNames({ ...fixed, ...suppliedPasswords(source) }).map(
      (name) => `${name} (${label})`,
    ),
  );
  if (refused.length > 0) refusePasswordNames(refused);
}

function assertPatternPasswords(env) {
  const invalidEmails = findInvalidRoleEmailNames(env);
  if (invalidEmails.length > 0) {
    throw new Error(
      `Invalid role email(s): ${invalidEmails.join(", ")}\n` +
        'A role email must begin with the "e2e-" prefix. Nothing was changed.',
    );
  }
  const names = findPasswordMismatchNames(env);
  if (names.length > 0) refusePasswordNames(names);
}

// --sync-only pushes the file as it stands, so it alone requires the file.
function readLocalEnv(syncOnly) {
  if (existsSync(envFilePath)) return readEnvFile(envFilePath);
  if (!syncOnly) return {};
  throw new Error(
    `.env.e2e not found at ${envFilePath}.\nRemediation: --sync-only pushes e2e/.env.e2e as it stands. Run the provisioning command without --sync-only to generate it.`,
  );
}

function pickUids(fileEnv) {
  return Object.fromEntries(
    ROLES.map((r) => `E2E_${r.key}_UID`)
      .filter((name) => fileEnv[name])
      .map((name) => [name, fileEnv[name]]),
  );
}

// Both supplied password sources are refused first if either differs from the
// pattern. Then fixed config, the carried-over web config and UIDs, the pattern
// passwords, and last the export snapshot, so the shell keeps precedence.
function composeRunEnv(fileEnv, exportedPasswords) {
  assertSuppliedPasswords(fileEnv, exportedPasswords);
  const base = {
    ...fixedE2EConfig(),
    ...readPreservedWebConfig(envFilePath),
    ...pickUids(fileEnv),
  };
  const withPasswords = { ...base, ...patternPasswords(base) };
  return mergeEnvPasswords(withPasswords, exportedPasswords);
}

// Both files are written after every upsert and before any provider sync, so
// they are the recovery source when a sync fails. Nothing is set yet, so the
// record marks no secret as set by this run: each row carries the prior
// `gh secret list` metadata or the unknown state.
function writeGeneratedFiles({ env, uidMap, firebaseCreds }, run) {
  writeEnvFile(envFilePath, { ...env, ...uidMap }, run);
  console.log("[env] e2e/.env.e2e generated");
  run.record = {
    accounts: firebaseCreds,
    uidMap,
    project: env.FIREBASE_PROJECT_ID,
    command: run.command,
    date: utcDate(run.now),
    setNow: [],
    secretMetadata: listGitHubSecretMetadata(repoRoot),
  };
  writeTestAccountsRecord(recordPath, run.record, { repoRoot });
}

// Rewrites the record from the actual per-secret outcomes: only the names the
// sync confirmed carry this run's date; the rest keep the prior metadata.
function refreshRecord(run, ghResults, providerSetNow = []) {
  if (!run?.record) return;
  run.ghResults = ghResults;
  const setNow = confirmedSecretNames(ghResults);
  writeTestAccountsRecord(
    recordPath,
    { ...run.record, setNow, providerSetNow },
    { repoRoot },
  );
}

// The Vercel-store bypass row is dated only when this run wrote the value to
// at least one project and the convergence completed (both projects, GitHub,
// revocation). A steady-state run writes nothing to Vercel, so the row keeps
// its prior provenance. The GitHub row is dated when GitHub confirmed.
function refreshRecordAfterProviders(run, bypass) {
  if (!run?.record || !bypass.attempted) return;
  const wroteVercel = bypass.complete && bypass.results.some((r) => r.added);
  const providerSetNow = wroteVercel
    ? [{ name: BYPASS_SECRET_NAME, store: VERCEL_SETTING }]
    : [];
  const ghResults = [...(run.ghResults ?? []), ...(bypass.ghResults ?? [])];
  refreshRecord(run, ghResults, providerSetNow);
}

function syncGitHubConfig(githubVariables, github, { recoveryNote, run } = {}) {
  // A first run has UIDs only after provisioning, so the check runs here.
  assertGitHubConfigComplete({ ...githubVariables, ...github });
  console.log("\n=== GitHub Actions Sync ===");
  const varResults = syncVariablesToGitHub(githubVariables, repoRoot);
  const ghResults = syncToGitHub(github, repoRoot);
  refreshRecord(run, ghResults);
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

// The web config comes from Firebase, not from an earlier file: it replaces
// the carried-over values in the env file, the GitHub variables and secret.
async function applyWebConfig(maps, credentials, env) {
  const { getTestApp } = await import("./helpers/firebaseTestSetup.js");
  const webConfig = await fetchWebConfig({
    app: getTestApp(credentials),
    projectId: credentials.projectId,
  });
  Object.assign(env, webConfig);
  maps.githubVariables.FIREBASE_AUTH_DOMAIN = webConfig.FIREBASE_AUTH_DOMAIN;
  maps.githubVariables.FIREBASE_STORAGE_BUCKET =
    webConfig.FIREBASE_STORAGE_BUCKET;
  maps.github.FIREBASE_API_KEY = webConfig.FIREBASE_API_KEY;
  console.log("[firebase] web config read from the E2E project");
}

async function provisionFullPipeline(maps, credentials, env, run) {
  console.log("\n=== Firebase Provisioning ===");
  const { provisionFirebaseUsers } =
    await import("./helpers/firebaseTestSetup.js");
  const uidMap = await provisionFirebaseUsers(maps.firebaseCreds, credentials);
  await applyWebConfig(maps, credentials, env);
  writeGeneratedFiles({ ...maps, env, uidMap }, run);
  for (const [key, uid] of Object.entries(uidMap)) {
    maps.vercel[key] = uid;
    maps.githubVariables[key] = uid;
  }
}

function exitOnVercelFailure(vcResults) {
  if (!vcResults.some((r) => r.status === "failed")) return;
  printFailedDetails("Vercel", vcResults);
  process.exit(1);
}

function redeployFailures(redeploys) {
  return redeploys
    .filter((r) => r.status === "failed")
    .map((r) => ({
      name: `redeploy ${r.project}`,
      status: "failed",
      error: r.reason,
    }));
}

async function syncVercel(vercelContext, { env, vercel, syncOnly, run }) {
  console.log("\n=== Vercel Sync ===");
  const outcome = await syncProviders({
    ...vercelContext,
    client: { VITE_FIREBASE_API_KEY: env.FIREBASE_API_KEY },
    vercel,
    setGitHubSecrets: (secrets) => syncToGitHub(secrets, repoRoot),
    converge: !syncOnly,
  });
  refreshRecordAfterProviders(run, outcome.bypass);
  return outcome;
}

function reportVercel({ ghResults, varResults }, outcome) {
  printSummary(ghResults, outcome.envResults, varResults);
  printRedeploys(outcome.redeploys);
  printBypass(outcome.bypass);
  console.log("");
  exitOnVercelFailure([
    ...outcome.envResults,
    ...redeployFailures(outcome.redeploys),
    ...bypassFailures(outcome.bypass),
  ]);
}

function modeLabel(syncOnly, resetPasswords) {
  if (resetPasswords) return "reset-passwords";
  return syncOnly ? "sync-only" : "full pipeline";
}

export async function main(options = parseCliOptions(process.argv)) {
  const { syncOnly, resetPasswords, firebaseEnvPath } = options;
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
  const fileEnv = readLocalEnv(syncOnly);
  if (credentials) assertEnvFileProjectMatch(fileEnv, credentials);
  const reset = resetPasswords
    ? prepareReset({ credentials, envFilePath })
    : null;
  const env = syncOnly
    ? mergeEnvPasswords(fileEnv, exportedPasswords)
    : composeRunEnv(fileEnv, exportedPasswords);
  assertPatternPasswords(env);
  const maps = buildCredentialMaps(env);
  const { github, githubVariables, vercel } = maps;
  // Sync-only already holds every UID: report missing names before preflight runs `gh`.
  if (syncOnly) assertGitHubConfigComplete({ ...githubVariables, ...github });

  const { vercelAccess } = runPreflight({
    syncOnly,
    envFilePath,
    env,
    serverDir,
    clientDir,
    firebaseCredentials: credentials,
  });
  // Resolved once, read-only, before any provider write.
  const vercelContext = await connectVercelProjects({
    access: vercelAccess,
    serverDir,
    clientDir,
  });
  console.log("[preflight] all checks passed");

  const run = { command: runCommand(options), now: new Date() };
  if (reset) {
    const { vcResults } = await applyReset({
      ...maps,
      env,
      vercelContext: {
        api: vercelContext.api,
        project: vercelContext.projects.server,
      },
      credentials,
      syncGitHubConfig: (variables, secrets, opts) =>
        syncGitHubConfig(variables, secrets, { ...opts, run }),
      writeGeneratedFiles: (uidMap) =>
        writeGeneratedFiles({ ...maps, env, uidMap }, run),
    });
    exitOnVercelFailure(vcResults);
    console.log("[done] E2E passwords reset.");
    return;
  }

  if (!syncOnly) await provisionFullPipeline(maps, credentials, env, run);

  const gitHub = syncGitHubConfig(
    githubVariables,
    github,
    syncOnly ? {} : { recoveryNote: RECOVERY_NOTE, run },
  );

  const outcome = await syncVercel(vercelContext, {
    env,
    vercel,
    syncOnly,
    run,
  });
  reportVercel(gitHub, outcome);
  if (syncOnly) {
    console.log(
      "[bypass] not converged: --sync-only never touches the bypass.",
    );
  }
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
