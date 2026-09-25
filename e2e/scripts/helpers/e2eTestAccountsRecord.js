/**
 * secrets/test-accounts.md: the gitignored record of every test account and
 * every infrastructure secret (AGENTS.md "Passwords and secrets"). Test-tier
 * passwords are recorded; infrastructure secrets are recorded by name, where
 * they are applied and when they were last set, never by value. Every
 * application of a secret is listed, one row per store. The record is written
 * only to a path git ignores.
 */
import { spawnSync } from "child_process";
import { mkdirSync, writeFileSync } from "fs";
import { dirname } from "path";

const GITHUB_SECRET = "github";
export const VERCEL_SETTING = "vercel";
export const CLIENT_API_KEY_NAME = "VITE_FIREBASE_API_KEY";
const E2E_WORKFLOW = "GitHub Actions secret, read by e2e.yml";
const SYNC_WORKFLOW = "GitHub Actions secret, read by sync-staging.yml";

function e2eSecret(name, tier = "Test") {
  return { name, appliedWhere: E2E_WORKFLOW, tier, store: GITHUB_SECRET };
}

// Names, locations and tiers only: the shape has no value field.
export const INFRASTRUCTURE_SECRETS = [
  e2eSecret("FIREBASE_API_KEY"),
  e2eSecret("E2E_SIGNUP_PASSWORD"),
  e2eSecret("E2E_ADMIN_PASSWORD"),
  e2eSecret("E2E_USER_PASSWORD"),
  e2eSecret("E2E_INCOMPLETE_USER_PASSWORD"),
  e2eSecret("E2E_SUPER_ADMIN_PASSWORD"),
  e2eSecret("E2E_MANAGE_ADMIN_TARGET_PASSWORD"),
  e2eSecret("VERCEL_AUTOMATION_BYPASS_SECRET"),
  e2eSecret("NEON_API_KEY", "Production"),
  e2eSecret("NEON_PROJECT_ID", "Production"),
  {
    name: "SYNC_PAT",
    appliedWhere: SYNC_WORKFLOW,
    tier: "Production",
    store: GITHUB_SECRET,
  },
  {
    name: "VERCEL_DEPLOY_HOOK_STAGING_CLIENT",
    appliedWhere: SYNC_WORKFLOW,
    tier: "Test",
    store: GITHUB_SECRET,
  },
  {
    name: "VERCEL_DEPLOY_HOOK_STAGING_SERVER",
    appliedWhere: SYNC_WORKFLOW,
    tier: "Test",
    store: GITHUB_SECRET,
  },
  {
    name: "VERCEL_AUTOMATION_BYPASS_SECRET",
    appliedWhere:
      "Vercel Protection Bypass for Automation, on both the client and the server project",
    tier: "Test",
    store: VERCEL_SETTING,
  },
  {
    name: CLIENT_API_KEY_NAME,
    appliedWhere:
      "Vercel env var on the all-branches Preview environment of the ichnos-client project",
    tier: "Test",
    store: VERCEL_SETTING,
  },
];

const UNKNOWN_LAST_SET = "unknown — not set by this run";

/**
 * The secret names a syncToGitHub() run confirmed, the only names the record
 * may date with this run. A failed or absent result is not confirmed.
 */
export function confirmedSecretNames(ghResults = []) {
  return ghResults.filter((r) => r.status === "success").map((r) => r.name);
}

function defaultCheckIgnore(recordPath, repoRoot) {
  return spawnSync("git", ["check-ignore", "--", recordPath], {
    cwd: repoRoot,
    encoding: "utf8",
  });
}

/** Throws, naming the path, unless git ignores exactly this path. */
export function assertRecordPathIgnored(
  recordPath,
  { repoRoot, runCheckIgnore = defaultCheckIgnore } = {},
) {
  const result = runCheckIgnore(recordPath, repoRoot);
  if (result?.status === 0) return;
  throw new Error(
    `Refusing to write the test-accounts record to ${recordPath}: git does not ignore that path.\n` +
      "Remediation: keep secrets/ in the root .gitignore, then re-run. Nothing was written.",
  );
}

function row(cells) {
  return `| ${cells.join(" | ")} |`;
}

function accountRows({ accounts, uidMap, project, command, date }) {
  return accounts.map((a) =>
    row([
      a.email,
      a.displayName,
      a.password,
      uidMap[a.uidKey] ?? "",
      project,
      date,
      `\`${command}\``,
    ]),
  );
}

function signupRow({ project, command, date }) {
  return row([
    "`e2e-consortium-<token>@example.com`",
    "Signup accounts `signUpAs` creates during a run",
    "signup",
    "none: a new account per test",
    project,
    date,
    `\`${command}\``,
  ]);
}

/**
 * A provider-store row (not GitHub), from the caller's provenance entry
 * matched by name and store: "set" means this run wrote it, "read" carries
 * the provider's own timestamp, anything else is unknown. The state is never
 * inferred here from a value match.
 */
function providerLastSet(secret, { command, date, providerProvenance }) {
  const entry = providerProvenance.find(
    (p) => p.name === secret.name && p.store === secret.store,
  );
  if (entry?.state === "set") return [date, `\`${command}\``];
  if (entry?.state === "read" && entry.timestamp) {
    return [entry.timestamp, "Vercel env metadata (not this run)"];
  }
  return [UNKNOWN_LAST_SET, ""];
}

function lastSetCells(secret, run) {
  const { command, date, setNow, secretMetadata } = run;
  if (secret.store !== GITHUB_SECRET) return providerLastSet(secret, run);
  if (setNow.includes(secret.name)) return [date, `\`${command}\``];
  const updatedAt = secretMetadata[secret.name];
  if (updatedAt) return [updatedAt, "`gh secret list` (not this run)"];
  return [UNKNOWN_LAST_SET, ""];
}

function secretRows(run) {
  return INFRASTRUCTURE_SECRETS.map((secret) =>
    row([
      secret.name,
      secret.tier,
      secret.appliedWhere,
      ...lastSetCells(secret, run),
    ]),
  );
}

const PRODUCTION_SECTION = [
  "## Production tier",
  "",
  "Production values are never copied into this file. They are held in the",
  "production Vercel project settings, in the provider consoles (Firebase,",
  "Neon, GitHub) and in the owner's password manager.",
];

/** The whole record as markdown. Takes no infrastructure secret value. */
export function buildTestAccountsRecord({
  accounts,
  uidMap,
  project,
  command,
  date,
  setNow = [],
  secretMetadata = {},
  providerProvenance = [],
}) {
  const run = {
    project,
    command,
    date,
    setNow,
    secretMetadata,
    providerProvenance,
  };
  return [
    "# Test accounts and infrastructure secrets",
    "",
    `Generated on ${date} (UTC) by \`${command}\`. Do not edit by hand.`,
    "",
    "## Test accounts",
    "",
    row(["Email", "Role", "Password", "UID", "Project", "Date", "Command"]),
    row(Array(7).fill("---")),
    ...accountRows({ accounts, uidMap, ...run }),
    signupRow(run),
    "",
    "## Infrastructure secrets",
    "",
    row(["Secret", "Tier", "Where it is applied", "Last set", "Set by"]),
    row(Array(5).fill("---")),
    ...secretRows(run),
    "",
    ...PRODUCTION_SECTION,
    "",
  ].join("\n");
}

/** Ignore check first; only then the directory and the file. */
export function writeTestAccountsRecord(
  recordPath,
  recordInput,
  { repoRoot, runCheckIgnore } = {},
) {
  assertRecordPathIgnored(recordPath, { repoRoot, runCheckIgnore });
  mkdirSync(dirname(recordPath), { recursive: true });
  writeFileSync(recordPath, buildTestAccountsRecord(recordInput), "utf8");
  console.log(`[record] test-accounts record written to ${recordPath}`);
}
