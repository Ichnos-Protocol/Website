/**
 * The only module that talks to Vercel. Two transports share one request
 * shape: the `vercel api` CLI subcommand over the operator's `vercel login`
 * session, and a Bearer-token fallback used only with an explicitly exported
 * VERCEL_TOKEN. Neither reads or copies CLI auth state.
 *
 * The CLI runs without a shell, so no value is ever shell-interpolated; a
 * request body, which may hold a secret, travels in an owner-only temporary
 * file named by `--input <FILE>` and never in argv. The file is removed before
 * the transport returns, whatever the outcome.
 * Error messages pass through a scrubber that replaces every registered
 * secret before the message is built.
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

/**
 * `vercel api` ignores a teamId in the path and applies its own current
 * scope, so the team travels as --scope instead. A body goes in a temporary
 * file passed as `--input <FILE>`, the form every `vercel api` release reads.
 */
export function createCliTransport({
  run = defaultRun,
  teamId,
  tempRoot = tmpdir(),
  writeFile = writeFileSync,
} = {}) {
  return async (path, { method, body }) => {
    const args = ["api", path, "-X", method, "--raw"];
    if (isTeamId(teamId)) args.push("--scope", teamId);
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

function parseJson(text, label, secrets) {
  if (!text || !text.trim()) return {};
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(redact(`${label} returned a non-JSON response.`, secrets));
  }
}

// Fields that name or scope a request, never carry a value.
const STRUCTURAL_FIELDS = new Set(["key", "type", "target", "name", "note"]);

// Every value-bearing string of a request body, so an error never echoes one.
function bodyStrings(body) {
  if (typeof body === "string") return [body];
  if (body === null || typeof body !== "object") return [];
  return Object.entries(body)
    .filter(([field]) => !STRUCTURAL_FIELDS.has(field))
    .flatMap(([, value]) => bodyStrings(value));
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
      if (!response.ok) {
        const detail = firstLine(response.errorText) || "no detail";
        const status = response.status ?? "no status";
        throw new Error(
          redact(`${label} failed (${status}): ${detail}`, scrub),
        );
      }
      return parseJson(response.text, label, scrub);
    },
  };
}
