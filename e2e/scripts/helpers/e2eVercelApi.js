/**
 * The only module that talks to Vercel. Two transports share one request
 * shape: the `vercel api` CLI subcommand over the operator's `vercel login`
 * session, the default when no token is exported, and a Bearer-token
 * transport that an explicitly exported VERCEL_TOKEN selects. The token is an
 * operator override, not a fallback: when it is set the CLI is never spawned.
 * Neither transport reads or copies CLI auth state.
 *
 * The CLI runs without a shell, so no value is ever shell-interpolated; a
 * request body, which may hold a secret, travels in an owner-only temporary
 * file named by `--input <FILE>` and never in argv. The file is removed before
 * the transport returns, whatever the outcome.
 * Error messages pass through a scrubber that replaces every registered
 * secret before the message is built.
 *
 * The CLI transport takes an optional `scope`, passed verbatim as `--scope`,
 * so a caller that has discovered the owning team or personal account pins
 * it instead of inheriting the CLI's current scope. `vercel api` appends the
 * CLI's current team to every request that carries no `--scope`, so
 * resolveCliAccountScope finds the `--scope` value that keeps account-level
 * reads off that inherited team. A failed request throws
 * an error carrying its status, redacted detail and path; every detail is
 * redacted before it is cut to its first line and 200 characters, and
 * isNotFoundError classifies it: only an unambiguous not-found is an
 * absence, never an auth or rate-limit failure.
 *
 * The CLI prints an HTTP error as a JSON `{ error }` envelope and exits zero,
 * so `request` owns that case: any plain-object body with its own `error`
 * field, on a success or a failure status alike, throws a structured, redacted error carrying `code`, `status`,
 * `detail` and `path`. No consumer ever receives an error envelope as data.
 */
import { spawnSync } from "child_process";
import { existsSync, mkdtempSync, rmSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";

const VERCEL_BIN_WIN32 = "vercel.cmd";
export const VERCEL_BIN =
  process.platform === "win32" ? VERCEL_BIN_WIN32 : "vercel";
const VERCEL_API_BASE = "https://api.vercel.com";
// The JavaScript entry the npm shim runs: node_modules/vercel/dist/vc.js.
const SHIM_ENTRY = ["node_modules", "vercel", "dist", "vc.js"];
const REDACTED = "****";

/**
 * The command that runs the Vercel CLI without a shell. Node refuses to spawn
 * a .cmd shim without one (EINVAL), so on Windows the shim's own entry script
 * is run with this Node binary; null when no shim is on PATH.
 */
export function resolveVercelCommand({
  platform = process.platform,
  pathEnv = process.env.PATH ?? process.env.Path ?? "",
  exists = existsSync,
  nodePath = process.execPath,
} = {}) {
  if (platform !== "win32") return { command: "vercel", prefix: [] };
  for (const dir of pathEnv.split(";").filter(Boolean)) {
    if (!exists(join(dir, VERCEL_BIN_WIN32))) continue;
    const entry = join(dir, ...SHIM_ENTRY);
    if (exists(entry)) return { command: nodePath, prefix: [entry] };
  }
  return null;
}

function defaultRun(args) {
  const cli = resolveVercelCommand();
  if (!cli) {
    return { status: null, stdout: "", stderr: "Vercel CLI not found." };
  }
  return spawnSync(cli.command, [...cli.prefix, ...args], {
    encoding: "utf8",
  });
}

/** True when the installed CLI has `vercel api` with --method and --input. */
export function supportsVercelApi({ run = defaultRun } = {}) {
  const result = run(["api", "--help"]);
  const text = `${result?.stdout ?? ""}${result?.stderr ?? ""}`;
  return /--method/.test(text) && /--input/.test(text);
}

export function isTeamId(orgId) {
  return typeof orgId === "string" && orgId.startsWith("team_");
}

/** Appends teamId=<orgId> to a request path when the org is a team. */
export function withTeam(path, teamId) {
  if (!isTeamId(teamId)) return path;
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}teamId=${encodeURIComponent(teamId)}`;
}

const INPUT_FILE_LABEL = "<request body file>";

/**
 * Writes body to body.json in a fresh owner-only directory; the caller removes
 * the directory once the write succeeds. If serialization or the write throws,
 * a partial file may exist, so the directory is removed here before rethrowing.
 * The path is random and never printed.
 */
function writeBodyFile(body, tempRoot, writeFile) {
  const dir = mkdtempSync(join(tempRoot, "ichnos-vercel-"));
  const path = join(dir, "body.json");
  try {
    writeFile(path, JSON.stringify(body), { mode: 0o600, flag: "wx" });
  } catch (error) {
    rmSync(dir, { recursive: true, force: true });
    throw error;
  }
  return { dir, path };
}

function toResponse(result, bodyFile) {
  const errorText = result?.stderr || result?.error?.message || "";
  return {
    ok: result?.status === 0,
    status: result?.status ?? null,
    text: result?.stdout ?? "",
    errorText: bodyFile
      ? errorText.split(bodyFile.path).join(INPUT_FILE_LABEL)
      : errorText,
  };
}

function scopeArgs(scope, teamId) {
  if (typeof scope === "string" && scope) return ["--scope", scope];
  return isTeamId(teamId) ? ["--scope", teamId] : [];
}

/**
 * `vercel api` ignores a teamId in the path and applies its own current
 * scope, so the scope travels as --scope instead: an explicit `scope` (a
 * team slug or the personal username) verbatim, else a `team_` id. A body
 * goes in a temporary file passed as `--input <FILE>`, the form every
 * `vercel api` release reads.
 */
export function createCliTransport({
  run = defaultRun,
  teamId,
  scope,
  tempRoot = tmpdir(),
  writeFile = writeFileSync,
} = {}) {
  return async (path, { method, body }) => {
    const args = [
      "api",
      path,
      "-X",
      method,
      "--raw",
      ...scopeArgs(scope, teamId),
    ];
    const bodyFile =
      body === undefined ? null : writeBodyFile(body, tempRoot, writeFile);
    try {
      if (bodyFile) args.push("--input", bodyFile.path);
      return toResponse(run(args), bodyFile);
    } finally {
      if (bodyFile) rmSync(bodyFile.dir, { recursive: true, force: true });
    }
  };
}

// The CLI's refusal of a personal --scope for a Northstar account.
const NORTHSTAR_SCOPE_REFUSAL =
  /cannot set your Personal Account as the scope/i;

function cliFailure(what, result) {
  const detail = firstLine(result?.stderr || result?.error?.message);
  return new Error(
    `Vercel CLI ${what} failed (${result?.status ?? "no status"}): ${detail || "no detail"}. ` +
      "Run `vercel login` or export VERCEL_TOKEN, then re-run. Nothing was changed.",
  );
}

function runCliJson(run, args, what) {
  const result = run(args);
  if (result?.status !== 0) throw cliFailure(what, result);
  try {
    return JSON.parse(result.stdout);
  } catch {
    throw new Error(`Vercel CLI ${what} returned a non-JSON response.`);
  }
}

/** The signed-in username; `vercel whoami` reads it with no team applied. */
export function readCliUsername({ run = defaultRun } = {}) {
  const who = runCliJson(run, ["whoami", "--format", "json"], "whoami");
  if (typeof who?.username !== "string" || !who.username) {
    throw new Error(
      "Vercel CLI whoami returned no username; refusing to guess the account. Nothing was changed.",
    );
  }
  return who.username;
}

/** The lowest team id `vercel teams ls` lists; it reads with no team applied. */
function readFirstCliTeamId(run) {
  const list = runCliJson(run, ["teams", "ls", "--format", "json"], "teams ls");
  const ids = (Array.isArray(list?.teams) ? list.teams : [])
    .map((team) => team?.id)
    .filter(isTeamId)
    .sort();
  if (ids.length === 0) {
    throw new Error(
      "Vercel CLI teams ls returned no team for this Northstar account; refusing to inherit the current team. Nothing was changed.",
    );
  }
  return ids[0];
}

/**
 * The `--scope` value for account-level reads (GET /v2/user, /v2/teams) over
 * the CLI session. A legacy account takes its own username, which makes the
 * CLI drop its current team. A Northstar account's CLI refuses a personal
 * scope, so the reads are pinned to an explicitly named team the account
 * belongs to, and `northstar: true` tells the caller that this session
 * cannot probe the personal scope. Either way no read inherits the current
 * team.
 */
export function resolveCliAccountScope({ run = defaultRun } = {}) {
  const username = readCliUsername({ run });
  const probe = run([
    "api",
    "/v2/user",
    "-X",
    "GET",
    "--raw",
    "--scope",
    username,
  ]);
  if (probe?.status === 0) return { cliScope: username, northstar: false };
  const text = `${probe?.stdout ?? ""}${probe?.stderr ?? ""}`;
  if (!NORTHSTAR_SCOPE_REFUSAL.test(text)) {
    throw cliFailure("personal-scope probe", probe);
  }
  return { cliScope: readFirstCliTeamId(run), northstar: true };
}

/**
 * The refusal when the CLI session cannot probe a personal scope: a Northstar
 * account's CLI refuses a personal --scope, and a request without one reads
 * the current team. Discovery stops rather than skip the candidate.
 */
export function cliPersonalScopeRefusal(label) {
  return new Error(
    `The Vercel CLI cannot probe the personal scope '${label}' of this Northstar account: it refuses a personal --scope, and without one it reads the current team. ` +
      "Refusing to decide without that scope. Export VERCEL_TOKEN, whose requests without a teamId reach the personal scope, then re-run. Nothing was changed.",
  );
}

export function createTokenTransport({ token, fetchImpl = fetch, teamId }) {
  return async (path, { method, body }) => {
    const headers = { Authorization: `Bearer ${token}` };
    if (body !== undefined) headers["Content-Type"] = "application/json";
    const response = await fetchImpl(
      `${VERCEL_API_BASE}${withTeam(path, teamId)}`,
      {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
      },
    );
    const text = await response.text();
    return { ok: response.ok, status: response.status, text, errorText: text };
  };
}

/** Replaces every registered secret substring in text. */
export function redact(text, secrets) {
  let out = String(text ?? "");
  for (const secret of secrets) {
    if (secret) out = out.split(secret).join(REDACTED);
  }
  return out;
}

function firstLine(text) {
  return String(text ?? "")
    .trim()
    .split("\n")[0]
    .slice(0, 200);
}

/**
 * Redacts before it cuts: truncating first could split a secret at the
 * cutoff and leave a fragment the scrubber no longer recognizes.
 */
function redactedFirstLine(text, secrets) {
  return firstLine(redact(text, secrets));
}

// A failure body that is not JSON is not an envelope, so it never throws here.
function tryParseJson(text) {
  try {
    return text && text.trim() ? JSON.parse(text) : undefined;
  } catch {
    return undefined;
  }
}

function parseJson(text, label, secrets) {
  if (!text || !text.trim()) return {};
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(redact(`${label} returned a non-JSON response.`, secrets));
  }
}

// Fields that name or scope a request, never carry a value. gitBranch names a
// scope, so the literal branch name is never registered as a secret and error
// text around words containing it stays readable.
const STRUCTURAL_FIELDS = new Set([
  "key",
  "type",
  "target",
  "name",
  "note",
  "gitBranch",
]);

// Every value-bearing string of a request body, so an error never echoes one.
function bodyStrings(body) {
  if (typeof body === "string") return [body];
  if (body === null || typeof body !== "object") return [];
  return Object.entries(body)
    .filter(([field]) => !STRUCTURAL_FIELDS.has(field))
    .flatMap(([, value]) => bodyStrings(value));
}

const NOT_FOUND_SIGNATURE = /\b404\b|not_found/i;
const AUTH_OR_QUOTA_MARKERS =
  /\b(401|403|429)\b|forbidden|unauthorized|rate limit/i;

/**
 * True only for an unambiguous not-found. A structured code is authoritative:
 * `not_found` is true and every other code (forbidden, unauthorized, rate
 * limits, "unknown") is false, whatever the status, failing closed. Only an
 * error with no structured code, such as a token-transport failure, falls
 * back to a 404 status, then to its detail: 404 or not_found named and none
 * of the auth or quota markers. A failure is never hidden as an absence.
 */
export function isNotFoundError(error) {
  if (typeof error?.code === "string") return error.code === "not_found";
  if (error?.status === 404) return true;
  const detail = typeof error?.detail === "string" ? error.detail : "";
  return (
    NOT_FOUND_SIGNATURE.test(detail) && !AUTH_OR_QUOTA_MARKERS.test(detail)
  );
}

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

/** The shared failure builder: every text it sets is redacted. */
function buildRequestError({ label, path, status, detail, code, scrub }) {
  const safeDetail = redact(detail || "no detail", scrub);
  const error = new Error(
    redact(`${label} failed (${status ?? "no status"}): ${safeDetail}`, scrub),
  );
  error.status = status ?? null;
  error.detail = safeDetail;
  error.path = redact(path, scrub);
  if (code !== undefined) error.code = code;
  return error;
}

function requestError(label, path, response, scrub) {
  return buildRequestError({
    label,
    path,
    status: response.status ?? null,
    detail: redactedFirstLine(response.errorText, scrub),
    scrub,
  });
}

// A CLI zero exit is not an HTTP status, so it maps to null, never to 404.
function httpStatus(status) {
  return Number.isFinite(status) && status >= 100 ? status : null;
}

function envelopeDetail(envelope, code, scrub) {
  const text =
    typeof envelope?.message === "string"
      ? envelope.message
      : typeof envelope === "string"
        ? envelope
        : code;
  return redactedFirstLine(`${code}: ${text}`, scrub);
}

// A provider code that holds a registered or body value is replaced whole.
function envelopeCode(envelope, scrub) {
  const code = typeof envelope?.code === "string" ? envelope.code : "unknown";
  return redact(code, scrub) === code ? code : "unknown";
}

function envelopeError(label, path, response, body, scrub) {
  const code = envelopeCode(body.error, scrub);
  return buildRequestError({
    label,
    path,
    status: httpStatus(response.status),
    detail: envelopeDetail(body.error, code, scrub),
    code,
    scrub,
  });
}

export function createVercelApi({ transport, secrets = [] }) {
  const registered = new Set(secrets.filter(Boolean));
  return {
    registerSecret(value) {
      if (value) registered.add(value);
    },
    async request(path, { method = "GET", body } = {}) {
      const label = `Vercel API ${method} ${path.split("?")[0]}`;
      const response = await transport(path, { method, body });
      const scrub = [...registered, ...bodyStrings(body)];
      const parsed = response.ok
        ? parseJson(response.text, label, scrub)
        : tryParseJson(response.text);
      // An envelope's structured code is authoritative on any status, so a
      // non-2xx `forbidden` answered with 404 is never read as an absence.
      if (isPlainObject(parsed) && Object.hasOwn(parsed, "error")) {
        throw envelopeError(label, path, response, parsed, scrub);
      }
      if (!response.ok) throw requestError(label, path, response, scrub);
      return parsed;
    },
  };
}
