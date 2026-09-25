import { execFileSync } from "child_process";

import { supportsVercelApi } from "./e2eVercelApi.js";

function fail(message, remediation) {
  throw new Error(`${message}\nRemediation: ${remediation}`);
}

export function checkGhAuth() {
  try {
    execFileSync("gh", ["auth", "status"], { stdio: "pipe", shell: true });
  } catch {
    fail(
      "GitHub CLI is not authenticated.",
      "Run `gh auth login` to authenticate the GitHub CLI.",
    );
  }
}

export function checkVercelAuth() {
  try {
    execFileSync("vercel", ["whoami"], { stdio: "pipe", shell: true });
  } catch {
    fail(
      "Vercel CLI is not authenticated.",
      "Run `vercel login` to authenticate the Vercel CLI.",
    );
  }
}

/**
 * How the run reaches the Vercel REST API: the `vercel api` subcommand over
 * the `vercel login` session, else an exported VERCEL_TOKEN. Neither means the
 * run stops here, naming the missing token.
 */
export function checkVercelApiAccess({
  supports = supportsVercelApi,
  env = process.env,
} = {}) {
  if (supports()) return { mode: "cli" };
  if (env.VERCEL_TOKEN) return { mode: "token" };
  fail(
    "The installed Vercel CLI has no `vercel api` subcommand and VERCEL_TOKEN is not set.",
    "Update the CLI with `npm i -g vercel@latest`, or export VERCEL_TOKEN (a Vercel access token for the team that owns both projects), then re-run.",
  );
}
