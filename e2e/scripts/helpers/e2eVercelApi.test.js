import {
  existsSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "fs";
import { tmpdir } from "os";
import { dirname, join } from "path";
import { afterEach, beforeEach, describe, it, expect, vi } from "vitest";

import {
  createCliTransport,
  createTokenTransport,
  createVercelApi,
  isNotFoundError,
  readCliUsername,
  redact,
  resolveCliAccountScope,
  resolveVercelCommand,
  supportsVercelApi,
  withTeam,
} from "./e2eVercelApi.js";
import { createFakeVercelCli } from "./e2eVercelFakeCli.js";

const TEAM = "team_abc123";
const SECRET = "Q7wErTy12345678901234567890abcdE";

function okRun(stdout = "{}") {
  return vi.fn(() => ({ status: 0, stdout, stderr: "" }));
}

describe("createCliTransport", () => {
  let tempRoot;

  beforeEach(() => {
    tempRoot = mkdtempSync(join(tmpdir(), "vercel-api-test-"));
  });

  afterEach(() => {
    rmSync(tempRoot, { recursive: true, force: true });
  });

  // Models `vercel api --input <FILE>`: the CLI reads the named file.
  function fileReadingRun(result = { status: 0, stdout: "{}", stderr: "" }) {
    const seen = {};
    const run = vi.fn((args) => {
      const path = args[args.indexOf("--input") + 1];
      seen.path = path;
      seen.body = JSON.parse(readFileSync(path, "utf8"));
      seen.mode = statSync(path).mode & 0o777;
      return typeof result === "function" ? result(path) : result;
    });
    return { run, seen };
  }

  it("sends a GET with no body and no input file", async () => {
    const run = okRun('{"name":"p"}');
    const transport = createCliTransport({ run, teamId: TEAM, tempRoot });

    await transport("/v9/projects/p", { method: "GET" });

    const [args] = run.mock.calls[0];
    expect(args).toEqual([
      "api",
      "/v9/projects/p",
      "-X",
      "GET",
      "--raw",
      "--scope",
      TEAM,
    ]);
  });

  it("sends a body in an input file, never in argv, and removes it", async () => {
    const { run, seen } = fileReadingRun();
    const transport = createCliTransport({ run, teamId: TEAM, tempRoot });
    const body = { generate: { secret: SECRET } };

    await transport("/v1/projects/p/protection-bypass", {
      method: "PATCH",
      body,
    });

    const [args] = run.mock.calls[0];
    expect(args).not.toContain("-");
    expect(args.join(" ")).not.toContain(SECRET);
    expect(seen.body).toEqual(body);
    expect(seen.path.startsWith(tempRoot)).toBe(true);
    expect(existsSync(seen.path)).toBe(false);
    expect(existsSync(dirname(seen.path))).toBe(false);
  });

  it.skipIf(process.platform === "win32")(
    "writes the input file owner-only",
    async () => {
      const { run, seen } = fileReadingRun();
      await createCliTransport({ run, tempRoot })("/x", {
        method: "POST",
        body: { value: SECRET },
      });

      expect(seen.mode).toBe(0o600);
    },
  );

  it("removes the input file when the CLI fails", async () => {
    const { run, seen } = fileReadingRun((path) => ({
      status: 1,
      stdout: "",
      stderr: `Error: cannot read ${path}`,
    }));
    const transport = createCliTransport({ run, tempRoot });

    const response = await transport("/x", {
      method: "POST",
      body: { value: SECRET },
    });

    expect(response.ok).toBe(false);
    expect(response.errorText).not.toContain(seen.path);
    expect(response.errorText).toContain("<request body file>");
    expect(existsSync(dirname(seen.path))).toBe(false);
  });

  it("removes the input file when the CLI throws", async () => {
    const { run, seen } = fileReadingRun(() => {
      throw new Error("spawn failed");
    });
    const transport = createCliTransport({ run, tempRoot });

    await expect(
      transport("/x", { method: "POST", body: { value: SECRET } }),
    ).rejects.toThrowError("spawn failed");
    expect(existsSync(dirname(seen.path))).toBe(false);
  });

  // Writes the first half of the data for real, then fails like a full disk.
  function partialWrite() {
    const seen = {};
    const writeFile = vi.fn((path, data, options) => {
      seen.path = path;
      writeFileSync(path, data.slice(0, data.length / 2), options);
      seen.partial = readFileSync(path, "utf8");
      throw new Error("ENOSPC: no space left on device, write");
    });
    return { writeFile, seen };
  }

  it("removes a partially written input file when the write fails", async () => {
    const { writeFile, seen } = partialWrite();
    const run = okRun();
    const transport = createCliTransport({ run, tempRoot, writeFile });

    const failure = transport("/x", {
      method: "POST",
      body: { value: SECRET },
    });

    await expect(failure).rejects.toThrowError("ENOSPC");
    await expect(failure).rejects.not.toThrowError(SECRET);
    expect(seen.partial.length).toBeGreaterThan(0);
    expect(existsSync(seen.path)).toBe(false);
    expect(existsSync(dirname(seen.path))).toBe(false);
    expect(readdirSync(tempRoot)).toEqual([]);
    expect(run).not.toHaveBeenCalled();
  });

  it("removes the new directory when the body cannot be serialized", async () => {
    const run = okRun();
    const transport = createCliTransport({ run, tempRoot });
    const body = { value: SECRET, size: 1n };

    const failure = transport("/x", { method: "POST", body });

    await expect(failure).rejects.toThrowError(TypeError);
    await expect(failure).rejects.not.toThrowError(SECRET);
    expect(readdirSync(tempRoot)).toEqual([]);
    expect(run).not.toHaveBeenCalled();
  });

  it("adds no scope for a personal org id", async () => {
    const run = okRun();
    await createCliTransport({ run, teamId: "user_1" })("/v2/user", {
      method: "GET",
    });

    expect(run.mock.calls[0][0]).not.toContain("--scope");
  });

  it("passes an explicit scope verbatim", async () => {
    const run = okRun();
    await createCliTransport({ run, scope: "ichnos-team" })("/v2/user", {
      method: "GET",
    });

    const args = run.mock.calls[0][0];
    expect(
      args.slice(args.indexOf("--scope"), args.indexOf("--scope") + 2),
    ).toEqual(["--scope", "ichnos-team"]);
  });

  it("prefers the explicit scope over a team id", async () => {
    const run = okRun();
    await createCliTransport({ run, scope: "someone", teamId: TEAM })("/x", {
      method: "GET",
    });

    const args = run.mock.calls[0][0];
    expect(args.filter((arg) => arg === "--scope")).toHaveLength(1);
    expect(args).toContain("someone");
    expect(args).not.toContain(TEAM);
  });

  it("adds no scope when neither a scope nor a team id is given", async () => {
    const run = okRun();
    await createCliTransport({ run })("/v2/teams", { method: "GET" });

    expect(run.mock.calls[0][0]).not.toContain("--scope");
  });
});

describe("withTeam", () => {
  it("appends teamId only for team_ org ids", () => {
    expect(withTeam("/v9/projects/p", TEAM)).toBe(
      `/v9/projects/p?teamId=${TEAM}`,
    );
    expect(withTeam("/v4/aliases?limit=1", TEAM)).toBe(
      `/v4/aliases?limit=1&teamId=${TEAM}`,
    );
    expect(withTeam("/v9/projects/p", "user_1")).toBe("/v9/projects/p");
    expect(withTeam("/v9/projects/p", undefined)).toBe("/v9/projects/p");
  });
});

describe("createTokenTransport", () => {
  it("uses the Bearer token and the team-scoped URL", async () => {
    const fetchImpl = vi.fn(async () => ({
      ok: true,
      status: 200,
      text: async () => "{}",
    }));
    const transport = createTokenTransport({
      token: "tok",
      fetchImpl,
      teamId: TEAM,
    });

    await transport("/v10/projects/p/env", {
      method: "POST",
      body: { key: "K", value: "v" },
    });

    const [url, init] = fetchImpl.mock.calls[0];
    expect(url).toBe(
      `https://api.vercel.com/v10/projects/p/env?teamId=${TEAM}`,
    );
    expect(init.method).toBe("POST");
    expect(init.headers.Authorization).toBe("Bearer tok");
    expect(JSON.parse(init.body)).toEqual({ key: "K", value: "v" });
  });
});

describe("createVercelApi", () => {
  it("parses JSON on success", async () => {
    const api = createVercelApi({
      transport: async () => ({ ok: true, status: 0, text: '{"a":1}' }),
    });

    await expect(api.request("/x")).resolves.toEqual({ a: 1 });
  });

  it("throws without the body or a registered secret on failure", async () => {
    const api = createVercelApi({
      transport: async () => ({
        ok: false,
        status: 1,
        text: "",
        errorText: `Error: invalid secret ${SECRET} and plain-body-value (400)`,
      }),
    });
    api.registerSecret(SECRET);

    const error = await api
      .request("/v1/projects/p/protection-bypass", {
        method: "PATCH",
        body: { generate: { secret: SECRET }, other: "plain-body-value" },
      })
      .catch((err) => err);

    expect(error.message).toMatch(/PATCH \/v1\/projects\/p\/protection-bypass/);
    expect(error.message).not.toContain(SECRET);
    expect(error.message).not.toContain("plain-body-value");
  });

  it("attaches the status, redacted detail and path to the thrown error", async () => {
    const api = createVercelApi({
      transport: async () => ({
        ok: false,
        status: 404,
        text: "",
        errorText: `not_found: project missing for ${SECRET}\nsecond line`,
      }),
    });
    api.registerSecret(SECRET);

    const error = await api.request("/v9/projects/p").catch((err) => err);

    expect(error.status).toBe(404);
    expect(error.path).toBe("/v9/projects/p");
    expect(error.detail).toMatch(/^not_found: project missing for \*\*\*\*$/);
    expect(JSON.stringify({ ...error, message: error.message })).not.toContain(
      SECRET,
    );
  });
});

describe("createVercelApi error-envelope guard", () => {
  // The CLI prints an HTTP error as a JSON body and exits zero.
  function envelopeApi(body, { status = 0 } = {}) {
    const text = typeof body === "string" ? body : JSON.stringify(body);
    return createVercelApi({
      transport: async () => ({ ok: true, status, text }),
    });
  }

  it("throws a structured error for a zero-exit envelope", async () => {
    const api = envelopeApi({
      error: { code: "forbidden", message: "Not authorized\nmore" },
    });

    const error = await api
      .request("/v9/projects/p?teamId=team_1")
      .catch((err) => err);

    expect(error).toBeInstanceOf(Error);
    expect(error.code).toBe("forbidden");
    expect(error.status).toBeNull();
    expect(error.detail).toBe("forbidden: Not authorized");
    expect(error.path).toBe("/v9/projects/p?teamId=team_1");
    expect(error.message).toMatch(
      /^Vercel API GET \/v9\/projects\/p failed \(no status\): forbidden/,
    );
  });

  it.each([
    ["a missing code", { error: { message: "boom" } }, "unknown: boom"],
    ["a numeric code", { error: { code: 403 } }, "unknown: unknown"],
    ["a string error", { error: "boom" }, "unknown: boom"],
    ["a null error", { error: null }, "unknown: unknown"],
    ["a numeric error", { error: 7 }, "unknown: unknown"],
    ["an array error", { error: ["boom"] }, "unknown: unknown"],
  ])("throws with code unknown for %s", async (_label, body, detail) => {
    const error = await envelopeApi(body)
      .request("/v2/user")
      .catch((err) => err);

    expect(error).toBeInstanceOf(Error);
    expect(error.code).toBe("unknown");
    expect(error.status).toBeNull();
    expect(error.detail).toBe(detail);
  });

  it("returns an ordinary body, and an array, untouched", async () => {
    await expect(envelopeApi({ id: "x" }).request("/a")).resolves.toEqual({
      id: "x",
    });
    await expect(envelopeApi([{ error: 1 }]).request("/a")).resolves.toEqual([
      { error: 1 },
    ]);
  });

  it("scrubs registered secrets and request-body values from every field", async () => {
    const api = envelopeApi({
      error: {
        code: "bad_request",
        message: `invalid ${SECRET} and plain-body-value`,
      },
    });
    api.registerSecret(SECRET);

    const error = await api
      .request(`/v1/projects/p/${SECRET}`, {
        method: "PATCH",
        body: { generate: { secret: SECRET }, other: "plain-body-value" },
      })
      .catch((err) => err);

    expect(error.code).toBe("bad_request");
    const everything = JSON.stringify({
      ...error,
      message: error.message,
    });
    expect(everything).not.toContain(SECRET);
    expect(everything).not.toContain("plain-body-value");
    expect(error.detail).toBe("bad_request: invalid **** and ****");
  });

  it.each([
    ["equals a registered API key", SECRET, SECRET],
    ["contains a registered API key", `bad_${SECRET}_code`, SECRET],
    ["equals a bypass value", "bypass-value-123", "bypass-value-123"],
    ["contains a bypass value", "x-bypass-value-123", "bypass-value-123"],
    ["equals a request-body value", "plain-body-value", "plain-body-value"],
    ["contains a request-body value", "e_plain-body-value", "plain-body-value"],
  ])("replaces a code that %s with unknown", async (_label, code, leaked) => {
    const api = envelopeApi({ error: { code, message: "rejected" } });
    api.registerSecret(SECRET);
    api.registerSecret("bypass-value-123");

    const error = await api
      .request("/v10/projects/p/env", {
        method: "POST",
        body: { value: "plain-body-value" },
      })
      .catch((err) => err);

    expect(error.code).toBe("unknown");
    expect(error.detail).toBe("unknown: rejected");
    expect(isNotFoundError(error)).toBe(false);
    const everything = JSON.stringify({ ...error, message: error.message });
    expect(everything).not.toContain(leaked);
  });

  it("keeps the numeric status of a token-transport 200 envelope", async () => {
    const error = await envelopeApi(
      { error: { code: "not_found", message: "Project not found" } },
      { status: 200 },
    )
      .request("/v9/projects/p")
      .catch((err) => err);

    expect(error.status).toBe(200);
    expect(error.code).toBe("not_found");
    expect(isNotFoundError(error)).toBe(true);
  });

  it("classifies a zero-exit forbidden envelope as a failure, not an absence", async () => {
    const error = await envelopeApi({
      error: { code: "forbidden", message: "Project not found (404)" },
    })
      .request("/v9/projects/p")
      .catch((err) => err);

    expect(isNotFoundError(error)).toBe(false);
  });
});

describe("createVercelApi non-2xx envelopes", () => {
  function failureApi(body, status) {
    const text = JSON.stringify(body);
    return createVercelApi({
      transport: async () => ({ ok: false, status, text, errorText: text }),
    });
  }

  it("treats a 404 token response with a forbidden code as a failure, not an absence", async () => {
    const error = await failureApi(
      { error: { code: "forbidden", message: "Not authorized" } },
      404,
    )
      .request("/v9/projects/p")
      .catch((err) => err);

    expect(error.code).toBe("forbidden");
    expect(error.status).toBe(404);
    expect(error.detail).toBe("forbidden: Not authorized");
    expect(isNotFoundError(error)).toBe(false);
  });

  it("keeps a not_found code as an absence with its HTTP status", async () => {
    const error = await failureApi(
      { error: { code: "not_found", message: "Project not found" } },
      404,
    )
      .request("/v9/projects/p")
      .catch((err) => err);

    expect(error.code).toBe("not_found");
    expect(error.status).toBe(404);
    expect(isNotFoundError(error)).toBe(true);
  });

  it.each([
    ["a non-JSON body", "Bad Gateway"],
    ["a JSON body without an error field", '{"message":"x"}'],
    ["a JSON array", '[{"error":1}]'],
  ])("keeps the transport error for %s", async (_label, text) => {
    const api = createVercelApi({
      transport: async () => ({
        ok: false,
        status: 502,
        text,
        errorText: text,
      }),
    });

    const error = await api.request("/v9/projects/p").catch((err) => err);

    expect(error.code).toBeUndefined();
    expect(error.status).toBe(502);
    expect(error.detail).toBe(text);
  });
});

describe("createVercelApi redaction before truncation", () => {
  const TOKEN = "vercel-token-value-123";

  function everything(error) {
    return JSON.stringify({ ...error, message: error.message });
  }

  it("scrubs a secret that crosses the 200-character cutoff of a transport error", async () => {
    const errorText = `${"x".repeat(190)}${SECRET} tail`;
    const api = createVercelApi({
      transport: async () => ({ ok: false, status: 500, text: "", errorText }),
      secrets: [SECRET],
    });

    const error = await api.request("/v2/user").catch((err) => err);

    expect(error.detail).toBe(`${"x".repeat(190)}**** tail`);
    expect(everything(error)).not.toContain(SECRET.slice(0, 10));
  });

  it("scrubs a secret that crosses the 200-character cutoff of an envelope message", async () => {
    const message = `${"y".repeat(180)}${SECRET}`;
    const api = createVercelApi({
      transport: async () => ({
        ok: true,
        status: 0,
        text: JSON.stringify({ error: { code: "bad_request", message } }),
      }),
      secrets: [SECRET],
    });

    const error = await api.request("/v2/user").catch((err) => err);

    expect(error.detail).toBe(`bad_request: ${"y".repeat(180)}****`);
    expect(everything(error)).not.toContain(SECRET.slice(0, 5));
  });

  it.each([
    ["code", { code: `bad_${TOKEN}`, message: "rejected" }],
    ["message", { code: "forbidden", message: `token ${TOKEN} rejected` }],
  ])(
    "never echoes the Vercel token through an envelope %s",
    async (_label, body) => {
      const text = JSON.stringify({ error: body });
      const api = createVercelApi({
        transport: async () => ({
          ok: false,
          status: 403,
          text,
          errorText: text,
        }),
        secrets: [TOKEN],
      });

      const error = await api.request("/v2/user").catch((err) => err);

      expect(everything(error)).not.toContain(TOKEN);
      expect(isNotFoundError(error)).toBe(false);
    },
  );
});

describe("isNotFoundError", () => {
  it("is true for a 404 status", () => {
    expect(isNotFoundError({ status: 404, detail: "" })).toBe(true);
  });

  it.each([
    ["Error: Project not found (404)"],
    ['{"error":{"code":"not_found","message":"Project not found"}}'],
  ])("is true for the not-found detail %s", (detail) => {
    expect(isNotFoundError({ status: 1, detail })).toBe(true);
  });

  it.each([
    [401, "Error: unauthorized (401)"],
    [403, "Error: forbidden (403)"],
    [429, "Error: rate limit exceeded (429)"],
    [1, "Error: not_found or forbidden (403)"],
    [1, "Error: 404 after rate limit"],
    [1, ""],
    [1, "Error: something else"],
    [null, undefined],
  ])("is false for status %s and detail %s", (status, detail) => {
    expect(isNotFoundError({ status, detail })).toBe(false);
  });

  it("is true for a structured not_found code, whatever the status", () => {
    expect(isNotFoundError({ code: "not_found", status: null })).toBe(true);
    expect(isNotFoundError({ code: "not_found", status: 403 })).toBe(true);
  });

  it("checks the code first, the status second, the detail last", () => {
    // A code wins over the status and the detail; status 404 needs no code.
    expect(
      isNotFoundError({ code: "forbidden", status: null, detail: "404" }),
    ).toBe(false);
    expect(isNotFoundError({ status: 404, detail: "forbidden" })).toBe(true);
    expect(isNotFoundError({ status: null, detail: "not_found" })).toBe(true);
  });

  it.each([["forbidden"], ["unauthorized"], ["rate_limited"], ["unknown"]])(
    "fails closed for the structured code %s even with status 404",
    (code) => {
      expect(isNotFoundError({ code, status: 404, detail: "404" })).toBe(false);
    },
  );

  it.each([["forbidden"], ["unauthorized"], ["rate_limited"], ["unknown"]])(
    "fails closed for the structured code %s",
    (code) => {
      expect(
        isNotFoundError({ code, status: null, detail: `${code}: not_found` }),
      ).toBe(false);
    },
  );

  it("is false for a missing error", () => {
    expect(isNotFoundError(undefined)).toBe(false);
  });
});

describe("redact", () => {
  it("replaces every registered substring", () => {
    expect(redact(`a ${SECRET} b ${SECRET}`, [SECRET])).toBe("a **** b ****");
  });
});

describe("supportsVercelApi", () => {
  it("is true when the help lists --method and --input", () => {
    const run = okRun("  -X, --method <METHOD>\n  --input <FILE>\n");

    expect(supportsVercelApi({ run })).toBe(true);
    expect(run.mock.calls[0][0]).toEqual(["api", "--help"]);
  });

  it("is false on an old CLI without the api subcommand", () => {
    const run = vi.fn(() => ({
      status: 2,
      stdout: "",
      stderr: "Error: Unknown command api",
    }));

    expect(supportsVercelApi({ run })).toBe(false);
  });
});

describe("resolveVercelCommand", () => {
  it("runs `vercel` directly outside Windows", () => {
    expect(resolveVercelCommand({ platform: "linux" })).toEqual({
      command: "vercel",
      prefix: [],
    });
  });

  it("runs the shim's entry script with node on Windows, never the .cmd", () => {
    const exists = (path) => path.startsWith("C:\\npm");
    const cli = resolveVercelCommand({
      platform: "win32",
      pathEnv: "C:\\other;C:\\npm",
      exists,
      nodePath: "C:\\node\\node.exe",
    });

    expect(cli.command).toBe("C:\\node\\node.exe");
    expect(cli.prefix[0]).toMatch(
      /node_modules[\\/]vercel[\\/]dist[\\/]vc\.js$/,
    );
  });

  it("is null when no shim is on PATH", () => {
    expect(
      resolveVercelCommand({
        platform: "win32",
        pathEnv: "C:\\a",
        exists: () => false,
      }),
    ).toBeNull();
  });
});

describe("readCliUsername", () => {
  it("reads the username from `vercel whoami --format json`", () => {
    const cli = createFakeVercelCli({
      user: { id: "user_1", username: "alice" },
      currentTeam: "team_other",
    });

    expect(readCliUsername({ run: cli.run })).toBe("alice");
    expect(cli.calls).toEqual([["whoami", "--format", "json"]]);
  });

  it("refuses when the CLI session is not signed in", () => {
    const run = vi.fn(() => ({
      status: 1,
      stdout: "",
      stderr: "Error: No existing credentials found.\n",
    }));

    expect(() => readCliUsername({ run })).toThrowError(
      /whoami failed \(1\): Error: No existing credentials found\.[\s\S]*vercel login/,
    );
  });

  it("refuses a whoami answer with no username", () => {
    expect(() =>
      readCliUsername({ run: okRun('{"email":"a@b.c"}') }),
    ).toThrowError(/returned no username/);
  });
});

describe("resolveCliAccountScope", () => {
  const LEGACY = { id: "user_1", username: "alice", email: "a@example.com" };
  const NORTHSTAR = {
    ...LEGACY,
    version: "northstar",
    defaultTeamId: "team_home",
  };
  const TEAMS = [
    { id: "team_other", slug: "other" },
    { id: "team_home", slug: "alice-home" },
  ];

  async function teamsRequest(cli, scope) {
    await createCliTransport({ run: cli.run, scope })("/v2/teams?limit=100", {
      method: "GET",
    });
    return cli.requests.at(-1);
  }

  it("models a CLI request without --scope inheriting the current team", async () => {
    const cli = createFakeVercelCli({
      user: LEGACY,
      teams: TEAMS,
      currentTeam: "team_other",
    });

    expect((await teamsRequest(cli, undefined)).teamId).toBe("team_other");
  });

  it("clears an existing current team for a legacy account with its username", async () => {
    const cli = createFakeVercelCli({
      user: LEGACY,
      teams: TEAMS,
      currentTeam: "team_other",
    });

    const account = resolveCliAccountScope({ run: cli.run });

    expect(account).toEqual({ cliScope: "alice", northstar: false });
    expect(cli.calls[1]).toEqual([
      "api",
      "/v2/user",
      "-X",
      "GET",
      "--raw",
      "--scope",
      "alice",
    ]);
    expect((await teamsRequest(cli, account.cliScope)).teamId).toBeNull();
  });

  it("pins a Northstar account to a named team, never its personal scope or the current team", async () => {
    const cli = createFakeVercelCli({
      user: NORTHSTAR,
      teams: TEAMS,
      currentTeam: "team_other",
    });

    const account = resolveCliAccountScope({ run: cli.run });

    expect(account).toEqual({ cliScope: "team_home", northstar: true });
    expect(cli.calls.map((args) => args[0])).toEqual([
      "whoami",
      "api",
      "teams",
    ]);
    expect(cli.calls[2]).toEqual(["teams", "ls", "--format", "json"]);
    expect(cli.requests).toEqual([]);
    expect((await teamsRequest(cli, account.cliScope)).teamId).toBe(
      "team_home",
    );
  });

  it("refuses a Northstar account that belongs to no team", () => {
    const cli = createFakeVercelCli({ user: NORTHSTAR, currentTeam: null });

    expect(() => resolveCliAccountScope({ run: cli.run })).toThrowError(
      /no team for this Northstar account; refusing to inherit the current team/,
    );
    expect(cli.requests).toEqual([]);
  });

  it("refuses any other probe failure instead of falling back to the current team", () => {
    const run = vi
      .fn()
      .mockReturnValueOnce({ status: 0, stdout: '{"username":"alice"}' })
      .mockReturnValueOnce({
        status: 1,
        stdout: "",
        stderr:
          "Error: Rate limited. Too many requests to the same endpoint: /teams\n",
      });

    expect(() => resolveCliAccountScope({ run })).toThrowError(
      /personal-scope probe failed \(1\): Error: Rate limited/,
    );
    expect(run).toHaveBeenCalledTimes(2);
  });
});
