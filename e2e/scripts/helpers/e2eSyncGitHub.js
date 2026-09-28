import { spawnSync } from "child_process";
import { maskValue } from "./e2eEnvFile.js";

function assertRepoRoot(repoRoot) {
  if (!repoRoot) {
    throw new Error(
      "repoRoot is required: pass the repository root directory so gh can locate the repo context.",
    );
  }
}

function buildResult(name, result, display) {
  return {
    name,
    status: result.status === 0 ? "success" : "failed",
    ...display,
    ...(result.status !== 0 && {
      error:
        result.stderr ||
        result.error?.message ||
        "Unknown error: process exited with non-zero status",
    }),
  };
}

export function syncToGitHub(credentials, repoRoot) {
  assertRepoRoot(repoRoot);
  const results = [];

  for (const [secretName, secretValue] of Object.entries(credentials)) {
    if (!secretValue) continue;

    const result = spawnSync("gh", ["secret", "set", secretName], {
      input: secretValue,
      encoding: "utf8",
      cwd: repoRoot,
      shell: true,
    });

    results.push(
      buildResult(secretName, result, { masked: maskValue(secretValue) }),
    );
  }

  return results;
}

const VARIABLE_READ_BACK_WARNING =
  "[github] variable read-back failed; rewriting all variables.";

function isVariableEntry(entry) {
  return (
    entry !== null &&
    typeof entry === "object" &&
    !Array.isArray(entry) &&
    typeof entry.name === "string" &&
    entry.name.trim() !== "" &&
    typeof entry.value === "string"
  );
}

function parseVariableList(stdout) {
  let entries;
  try {
    entries = JSON.parse(stdout);
  } catch {
    return null;
  }
  if (!Array.isArray(entries)) return null;
  const current = new Map();
  for (const entry of entries) {
    if (!isVariableEntry(entry) || current.has(entry.name)) return null;
    current.set(entry.name, entry.value);
  }
  return current;
}

/**
 * Variable name → current value, from `gh variable list`. null when the call
 * fails or any part of the output is malformed; the output is never logged.
 */
function readRepoVariables(repoRoot) {
  const result = spawnSync("gh", ["variable", "list", "--json", "name,value"], {
    encoding: "utf8",
    cwd: repoRoot,
  });
  if (result?.status !== 0) return null;
  return parseVariableList(result.stdout);
}

export function syncVariablesToGitHub(variables, repoRoot) {
  assertRepoRoot(repoRoot);
  const results = [];
  const current = readRepoVariables(repoRoot);
  if (current === null) console.warn(VARIABLE_READ_BACK_WARNING);

  for (const [name, value] of Object.entries(variables)) {
    if (!value) continue;
    if (current?.has(name) && current.get(name) === value) {
      results.push({ name, status: "unchanged", value });
      continue;
    }

    // No `shell` on purpose: the value travels as one argv element and is never shell-interpolated.
    const result = spawnSync("gh", ["variable", "set", name, "--body", value], {
      encoding: "utf8",
      cwd: repoRoot,
    });

    results.push(buildResult(name, result, { value }));
  }

  return results;
}

function parseSecretList(stdout) {
  try {
    return Object.fromEntries(
      JSON.parse(stdout).map(({ name, updatedAt }) => [name, updatedAt]),
    );
  } catch {
    return {};
  }
}

/**
 * Secret name → ISO last-updated date, from `gh secret list`. Names and dates
 * only; gh never returns a value. Best effort: {} on any failure.
 */
export function listGitHubSecretMetadata(repoRoot) {
  assertRepoRoot(repoRoot);
  const result = spawnSync(
    "gh",
    ["secret", "list", "--json", "name,updatedAt"],
    { encoding: "utf8", cwd: repoRoot },
  );
  if (result?.status !== 0) return {};
  return parseSecretList(result.stdout);
}
