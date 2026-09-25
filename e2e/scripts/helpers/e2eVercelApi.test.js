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
  redact,
  resolveVercelCommand,
  supportsVercelApi,
  withTeam,
} from "./e2eVercelApi.js";

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
