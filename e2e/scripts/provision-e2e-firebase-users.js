/** E2E Credential Pipeline — Orchestrator. See e2e/.env.e2e.example for usage. */
import { existsSync, realpathSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import { config } from "dotenv";
import { runPreflight } from "./helpers/e2ePreflight.js";
import {
  readEnvFile,
  mergeEnvPasswords,
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
} from "./helpers/e2eCredentials.js";
import { printFailedDetails, printSummary } from "./helpers/e2eReporting.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const serverDir = resolve(__dirname, "../../server");
const repoRoot = resolve(__dirname, "../..");
const envFilePath = resolve(__dirname, "../.env.e2e");
const serverEnvPath = resolve(serverDir, ".env");

config({ path: serverEnvPath });

function assertGitHubConfigComplete(values) {
  const missing = findMissingGitHubNames(values);
  if (missing.length === 0) return;
  throw new Error(
    `Missing GitHub config value(s): ${missing.join(", ")}\n` +
      "Set them in the local, gitignored e2e/.env.e2e (or export the E2E_*_PASSWORD values in your shell, which take precedence) and re-run.",
  );
}

function loadLocalEnv() {
  if (!existsSync(envFilePath)) {
    throw new Error(
      `.env.e2e not found at ${envFilePath}.\nRemediation: The provision script reads e2e/.env.e2e. Verify the file exists at that path and contains your credentials.`,
    );
  }
  return mergeEnvPasswords(readEnvFile(envFilePath));
}

function syncGitHubConfig(githubVariables, github) {
  console.log("\n=== GitHub Actions Sync ===");
  const varResults = syncVariablesToGitHub(githubVariables, repoRoot);
  const ghResults = syncToGitHub(github, repoRoot);
  const hasFailed = (results) => results.some((r) => r.status === "failed");
  if (hasFailed(varResults) || hasFailed(ghResults)) {
    printSummary(ghResults, [], varResults);
    printFailedDetails("GitHub variables", varResults);
    printFailedDetails("GitHub secrets", ghResults);
    process.exit(1);
  }
  return { ghResults, varResults };
}

export async function main({
  syncOnly = process.argv.includes("--sync-only"),
} = {}) {
  const mode = syncOnly ? "sync-only" : "full pipeline";
  console.log(`[orchestrator] ${mode}\n`);

  const env = loadLocalEnv();
  const { github, githubVariables, vercel, firebaseCreds } =
    buildCredentialMaps(env);
  // Sync-only already has every UID: report missing names before preflight runs `gh`.
  if (syncOnly) assertGitHubConfigComplete({ ...githubVariables, ...github });

  runPreflight({ syncOnly, envFilePath, serverDir });
  console.log("[preflight] all checks passed");

  if (!syncOnly) {
    console.log("\n=== Firebase Provisioning ===");
    const { provisionFirebaseUsers } =
      await import("./helpers/firebaseTestSetup.js");
    const uidMap = await provisionFirebaseUsers(firebaseCreds);
    writeUidsToEnvFile(envFilePath, uidMap);
    console.log("[env] UIDs written back to .env.e2e");
    for (const [key, uid] of Object.entries(uidMap)) {
      vercel[key] = uid;
      githubVariables[key] = uid;
    }
  }

  // Full pipeline: UIDs exist only after provisioning, so the check runs here.
  assertGitHubConfigComplete({ ...githubVariables, ...github });
  const { ghResults, varResults } = syncGitHubConfig(githubVariables, github);

  console.log("\n=== Vercel Preview Sync ===");
  const vcResults = syncToVercel(vercel, serverDir);
  const vcFailed = vcResults.some((r) => r.status === "failed");

  printSummary(ghResults, vcResults, varResults);

  if (vcFailed) {
    printFailedDetails("Vercel", vcResults);
    process.exit(1);
  }

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
