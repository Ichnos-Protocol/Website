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

export function syncVariablesToGitHub(variables, repoRoot) {
  assertRepoRoot(repoRoot);
  const results = [];

  for (const [name, value] of Object.entries(variables)) {
    if (!value) continue;

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
