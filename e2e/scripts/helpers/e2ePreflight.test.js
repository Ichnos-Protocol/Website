import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { execFileSync, spawnSync } from "child_process";

vi.mock("child_process", () => ({
  execFileSync: vi.fn(() => ""),
  spawnSync: vi.fn(() => ({ status: 0, stdout: "", stderr: "" })),
}));
// The probe runs through the mocked spawnSync on every platform, so a spawned
// `vercel api --help` is recorded rather than resolved against PATH.
vi.mock("./e2eVercelApi.js", async (importOriginal) => {
  const original = await importOriginal();
  const { spawnSync: spawn } = await import("child_process");
  return {
    ...original,
    supportsVercelApi: vi.fn(() =>
      original.supportsVercelApi({ run: (args) => spawn("vercel", args) }),
    ),
  };
});
vi.mock("./e2ePreflightValidators.js", () => ({
  validateCredentials: vi.fn(),
}));

const { runPreflight } = await import("./e2ePreflight.js");
const { supportsVercelApi } = await import("./e2eVercelApi.js");

const TOKEN = "tok_preflight_secret";
const CREDENTIALS = {
  projectId: "ichnos-protocol-test",
  clientEmail: "sa@ichnos-protocol-test.iam.gserviceaccount.com",
  privateKey: "-----BEGIN KEY-----\nabc\n-----END KEY-----",
};

function spawnedArgv() {
  return [...execFileSync.mock.calls, ...spawnSync.mock.calls].map(
    ([command, args]) => [command, ...(args ?? [])].join(" "),
  );
}

function preflight() {
  return runPreflight({
    syncOnly: false,
    envFilePath: "unused",
    env: { E2E_ADMIN_EMAIL: "admin@example.test" },
    firebaseCredentials: CREDENTIALS,
  });
}

describe("runPreflight transport selection", () => {
  let log;

  beforeEach(() => {
    execFileSync.mockClear();
    spawnSync.mockClear();
    supportsVercelApi.mockClear();
    log = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    log.mockRestore();
  });

  it("spawns no Vercel CLI in token mode and still checks gh", () => {
    vi.stubEnv("VERCEL_TOKEN", TOKEN);

    const { vercelAccess } = preflight();

    expect(vercelAccess.mode).toBe("token");
    expect(supportsVercelApi).not.toHaveBeenCalled();
    const argv = spawnedArgv();
    expect(argv).toContain("gh auth status");
    expect(argv.some((line) => /vercel/i.test(line))).toBe(false);
    const printed = log.mock.calls.map((call) => call.join(" ")).join("\n");
    expect(printed).toContain("Vercel transport: token");
    expect(printed).toContain("explicit VERCEL_TOKEN");
    expect(printed).not.toContain(TOKEN);
  });

  it("checks the CLI session with `vercel whoami` in CLI mode", () => {
    vi.stubEnv("VERCEL_TOKEN", "");
    spawnSync.mockReturnValue({
      status: 0,
      stdout: "--method <METHOD> --input <FILE>",
      stderr: "",
    });

    const { vercelAccess } = preflight();

    expect(vercelAccess.mode).toBe("cli");
    expect(spawnedArgv()).toEqual(
      expect.arrayContaining(["vercel api --help", "vercel whoami"]),
    );
    const printed = log.mock.calls.map((call) => call.join(" ")).join("\n");
    expect(printed).toContain("Vercel transport: cli");
  });
});
