import { existsSync } from "fs";
import { execFileSync } from "child_process";

import { supportsVercelApi } from "./e2eVercelApi.js";
import {
  EXPECTED_PROJECT_NAMES,
  linkFilePath,
  readLinkedProject,
} from "./e2eVercelProjects.js";

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

/** Fail-closed check of <dir>/.vercel/project.json against expectedName. */
export function checkVercelProject(
  dir,
  expectedName = EXPECTED_PROJECT_NAMES.server,
) {
  readLinkedProject(dir, expectedName);
}

/**
 * The client link file is optional: when present it must name the client
 * project; when absent the project is resolved by exact name later.
 */
export function checkOptionalVercelProject(dir, expectedName) {
  if (!existsSync(linkFilePath(dir))) return;
  checkVercelProject(dir, expectedName);
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
