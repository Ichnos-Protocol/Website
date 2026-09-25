import { describe, it, expect, vi, beforeEach } from "vitest";

const spawnSync = vi.fn();
const mkdirSync = vi.fn();
const writeFileSync = vi.fn();

vi.mock("child_process", () => ({ spawnSync }));
vi.mock("fs", () => ({ mkdirSync, writeFileSync }));

const {
  INFRASTRUCTURE_SECRETS,
  assertRecordPathIgnored,
  buildTestAccountsRecord,
  confirmedSecretNames,
  writeTestAccountsRecord,
} = await import("./e2eTestAccountsRecord.js");
const { buildCredentialMaps, fixedE2EConfig, patternPasswords } =
  await import("./e2eCredentials.js");

const RECORD_PATH = "/fixture/repo/secrets/test-accounts.md";
const REPO_ROOT = "/fixture/repo";
const COMMAND = "node e2e/scripts/provision-e2e-firebase-users.js";
const DATE = "2026-09-25";
const API_KEY_FIXTURE = "AIza-fixture-api-key-value";

function accounts() {
  const fixed = fixedE2EConfig();
  const env = {
    ...fixed,
    ...patternPasswords(fixed),
    FIREBASE_API_KEY: API_KEY_FIXTURE,
  };
  return buildCredentialMaps(env).firebaseCreds;
}

function uidMap() {
  return Object.fromEntries(
    accounts().map((a) => [a.uidKey, `uid-${a.uidKey}`]),
  );
}

function recordInput(overrides = {}) {
  return {
    accounts: accounts(),
    uidMap: uidMap(),
    project: "ichnos-protocol-test",
    command: COMMAND,
    date: DATE,
    setNow: ["FIREBASE_API_KEY", "E2E_ADMIN_PASSWORD"],
    secretMetadata: { NEON_API_KEY: "2026-08-01T09:00:00Z" },
    ...overrides,
  };
}

function lineFor(record, name) {
  return record.split("\n").find((line) => line.startsWith(`| ${name} |`));
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, "log").mockImplementation(() => {});
});

describe("assertRecordPathIgnored", () => {
  it("passes when git check-ignore exits 0", () => {
    const runCheckIgnore = vi.fn(() => ({ status: 0 }));

    assertRecordPathIgnored(RECORD_PATH, {
      repoRoot: REPO_ROOT,
      runCheckIgnore,
    });

    expect(runCheckIgnore).toHaveBeenCalledWith(RECORD_PATH, REPO_ROOT);
  });

  it("runs git check-ignore on the exact path by default", () => {
    spawnSync.mockReturnValueOnce({ status: 0 });

    assertRecordPathIgnored(RECORD_PATH, { repoRoot: REPO_ROOT });

    expect(spawnSync).toHaveBeenCalledWith(
      "git",
      ["check-ignore", "--", RECORD_PATH],
      expect.objectContaining({ cwd: REPO_ROOT }),
    );
  });
});

describe("writeTestAccountsRecord", () => {
  it("refuses a path git does not ignore and writes nothing", () => {
    const runCheckIgnore = vi.fn(() => ({ status: 1 }));

    expect(() =>
      writeTestAccountsRecord(RECORD_PATH, recordInput(), {
        repoRoot: REPO_ROOT,
        runCheckIgnore,
      }),
    ).toThrowError(/secrets\/test-accounts\.md: git does not ignore/);
    expect(runCheckIgnore).toHaveBeenCalledTimes(1);
    expect(mkdirSync).not.toHaveBeenCalled();
    expect(writeFileSync).not.toHaveBeenCalled();
  });

  it("checks the ignore rule before creating the directory and writing", () => {
    const runCheckIgnore = vi.fn(() => ({ status: 0 }));

    writeTestAccountsRecord(RECORD_PATH, recordInput(), {
      repoRoot: REPO_ROOT,
      runCheckIgnore,
    });

    expect(runCheckIgnore.mock.invocationCallOrder[0]).toBeLessThan(
      mkdirSync.mock.invocationCallOrder[0],
    );
    expect(mkdirSync.mock.invocationCallOrder[0]).toBeLessThan(
      writeFileSync.mock.invocationCallOrder[0],
    );
    expect(writeFileSync.mock.calls[0][0]).toBe(RECORD_PATH);
    expect(writeFileSync.mock.calls[0][1]).toBe(
      buildTestAccountsRecord(recordInput()),
    );
  });
});

describe("buildTestAccountsRecord", () => {
  it("lists every role account with email, role, pattern password, UID and project", () => {
    const record = buildTestAccountsRecord(recordInput());

    for (const account of accounts()) {
      const line = lineFor(record, account.email);
      expect(line).toContain(account.displayName);
      expect(line).toContain(`| ${account.password} |`);
      expect(line).toContain(`uid-${account.uidKey}`);
      expect(line).toContain("ichnos-protocol-test");
      expect(line).toContain(DATE);
      expect(line).toContain(COMMAND);
    }
  });

  it("describes the signUpAs account pattern with its signup password", () => {
    const record = buildTestAccountsRecord(recordInput());

    const line = lineFor(record, "`e2e-consortium-<token>@example.com`");
    expect(line).toContain("| signup |");
    expect(line).toContain("signUpAs");
  });

  it("names every infrastructure secret and where it is applied", () => {
    const record = buildTestAccountsRecord(recordInput());

    for (const secret of INFRASTRUCTURE_SECRETS) {
      expect(record).toContain(`| ${secret.name} |`);
      expect(record).toContain(secret.appliedWhere);
    }
    expect(record).toMatch(/SYNC_PAT.*sync-staging\.yml/);
    expect(record).toMatch(
      /VERCEL_AUTOMATION_BYPASS_SECRET.*Protection Bypass for Automation/,
    );
  });

  it("never writes an infrastructure secret value", () => {
    const record = buildTestAccountsRecord(recordInput());

    expect(record).not.toContain(API_KEY_FIXTURE);
  });

  it("dates a secret this run set with the run's date and command", () => {
    const line = lineFor(
      buildTestAccountsRecord(recordInput()),
      "FIREBASE_API_KEY",
    );

    expect(line).toContain(DATE);
    expect(line).toContain(COMMAND);
  });

  it("shows gh updatedAt for a secret this run did not set, and unknown without metadata", () => {
    const record = buildTestAccountsRecord(recordInput());

    expect(lineFor(record, "NEON_API_KEY")).toContain("2026-08-01T09:00:00Z");
    expect(lineFor(record, "SYNC_PAT")).toContain(
      "unknown — not set by this run",
    );
  });

  it("dates no secret as set when setNow is empty, before any sync", () => {
    const record = buildTestAccountsRecord(recordInput({ setNow: [] }));

    expect(lineFor(record, "FIREBASE_API_KEY")).toContain(
      "unknown — not set by this run",
    );
    expect(lineFor(record, "E2E_ADMIN_PASSWORD")).not.toContain(COMMAND);
    expect(lineFor(record, "NEON_API_KEY")).toContain("2026-08-01T09:00:00Z");
  });

  it("never names a production project or domain", () => {
    const record = buildTestAccountsRecord(recordInput());

    expect(record).not.toMatch(/ichnos-protocol(?!-test)/);
    expect(record).toMatch(/## Production tier/);
  });

  it("touches no real file or process", () => {
    buildTestAccountsRecord(recordInput());

    expect(spawnSync).not.toHaveBeenCalled();
    expect(mkdirSync).not.toHaveBeenCalled();
    expect(writeFileSync).not.toHaveBeenCalled();
  });
});

describe("the Vercel-store bypass row", () => {
  function vercelRow(record) {
    return record
      .split("\n")
      .find(
        (line) =>
          line.startsWith("| VERCEL_AUTOMATION_BYPASS_SECRET |") &&
          line.includes("Vercel Protection Bypass"),
      );
  }

  it("stays undated when the bypass was not confirmed", () => {
    const record = buildTestAccountsRecord(
      recordInput({ setNow: [], providerSetNow: [] }),
    );

    expect(vercelRow(record)).toContain("unknown — not set by this run");
  });

  it("carries this run's date and command once confirmed", () => {
    const record = buildTestAccountsRecord(
      recordInput({
        setNow: ["VERCEL_AUTOMATION_BYPASS_SECRET"],
        providerSetNow: [
          { name: "VERCEL_AUTOMATION_BYPASS_SECRET", store: "vercel" },
        ],
      }),
    );

    expect(vercelRow(record)).toContain(DATE);
    expect(vercelRow(record)).toContain(COMMAND);
    expect(lineFor(record, "VERCEL_AUTOMATION_BYPASS_SECRET")).toContain(DATE);
  });

  it("ignores a provider write recorded for another store", () => {
    const record = buildTestAccountsRecord(
      recordInput({
        providerSetNow: [
          { name: "VERCEL_AUTOMATION_BYPASS_SECRET", store: "github" },
        ],
      }),
    );

    expect(vercelRow(record)).toContain("unknown — not set by this run");
  });
});

describe("confirmedSecretNames", () => {
  it("keeps only the names syncToGitHub confirmed", () => {
    const names = confirmedSecretNames([
      { name: "E2E_ADMIN_PASSWORD", status: "success" },
      { name: "E2E_USER_PASSWORD", status: "failed", error: "HTTP 502" },
      { name: "FIREBASE_API_KEY", status: "success" },
    ]);

    expect(names).toEqual(["E2E_ADMIN_PASSWORD", "FIREBASE_API_KEY"]);
  });

  it("confirms nothing without results", () => {
    expect(confirmedSecretNames()).toEqual([]);
    expect(confirmedSecretNames([])).toEqual([]);
  });
});
