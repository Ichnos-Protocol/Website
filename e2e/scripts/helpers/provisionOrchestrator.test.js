import { describe, it, expect, vi, beforeEach } from "vitest";

const execFileSync = vi.fn();
const spawnSync = vi.fn();
const readEnvFile = vi.fn();
const writeUidsToEnvFile = vi.fn();
const writePasswordsToEnvFile = vi.fn();
const provisionFirebaseUsers = vi.fn();
const syncToGitHub = vi.fn();
const syncVariablesToGitHub = vi.fn();
const syncToVercel = vi.fn();
const FAKE_CREDENTIALS = {
  projectId: "ichnos-protocol-test",
  clientEmail: "sa@ichnos-protocol-test.iam.gserviceaccount.com",
  privateKey: "-----BEGIN KEY-----\nabc\n-----END KEY-----",
};
const loadFirebaseCredentials = vi.fn();

vi.mock("child_process", () => ({ execFileSync, spawnSync }));
vi.mock("./e2ePreflightChecks.js", async (importOriginal) => ({
  ...(await importOriginal()),
  checkGhAuth: vi.fn(),
  checkVercelAuth: vi.fn(),
  checkVercelProject: vi.fn(),
}));
// Mandatory: existsSync is mocked to true below, so an unmocked loader would
// read real credential files.
vi.mock("./e2eFirebaseCredentials.js", () => ({ loadFirebaseCredentials }));
const config = vi.fn();
vi.mock("dotenv", async (importOriginal) => ({
  ...(await importOriginal()),
  config,
}));
vi.mock("fs", async (importOriginal) => ({
  ...(await importOriginal()),
  existsSync: () => true,
}));
vi.mock("./e2eEnvFile.js", async (importOriginal) => ({
  ...(await importOriginal()),
  readEnvFile,
  writeUidsToEnvFile,
  writePasswordsToEnvFile,
}));
vi.mock("./firebaseTestSetup.js", () => ({ provisionFirebaseUsers }));
vi.mock("./e2eSyncGitHub.js", () => ({ syncToGitHub, syncVariablesToGitHub }));
vi.mock("./e2eSyncVercel.js", () => ({ syncToVercel }));

const { main } = await import("../provision-e2e-firebase-users.js");
const { RECOVERY_NOTE } = await import("./e2ePasswordReset.js");

const SECRET = "adminadmin";

// Sync-only env that passes preflight validation but omits every non-admin name.
const incompleteEnv = {
  E2E_ADMIN_EMAIL: "e2e-admin@ichnos-test.com",
  E2E_ADMIN_PASSWORD: SECRET,
  E2E_ADMIN_UID: "uid-admin",
};

const ROLES = {
  ADMIN: { localPart: "e2e-admin", password: "adminadmin" },
  USER: { localPart: "e2e-user", password: "useruser" },
  INCOMPLETE_USER: { localPart: "e2e-incomplete", password: "incomplete" },
  SUPER_ADMIN: { localPart: "e2e-superadmin", password: "superadmin" },
  MANAGE_ADMIN_TARGET: {
    localPart: "e2e-manage-target",
    password: "manage-target",
  },
};
const ROLE_KEYS = Object.keys(ROLES);
const SIGNUP_PATTERN = "signup";

const PATTERN = {
  ...Object.fromEntries(
    ROLE_KEYS.map((key) => [`E2E_${key}_PASSWORD`, ROLES[key].password]),
  ),
  E2E_SIGNUP_PASSWORD: SIGNUP_PATTERN,
};

// Full-mode env that passes every check; UIDs arrive from provisioning.
function completeEnv() {
  const env = {
    FIREBASE_API_KEY: "api-key-value",
    FIREBASE_PROJECT_ID: "ichnos-protocol-test",
    FIREBASE_AUTH_DOMAIN: "ichnos-protocol-test.firebaseapp.com",
    FIREBASE_STORAGE_BUCKET: "ichnos-protocol-test.appspot.com",
    E2E_BASE_URL: "https://client.example.com",
    E2E_API_BASE_URL: "https://server.example.com",
    E2E_SIGNUP_PASSWORD: SIGNUP_PATTERN,
  };
  for (const key of ROLE_KEYS) {
    env[`E2E_${key}_EMAIL`] = `${ROLES[key].localPart}@ichnos-test.com`;
    env[`E2E_${key}_PASSWORD`] = ROLES[key].password;
  }
  return env;
}

const WRONG = "wrong-password-value";
const STALE = "stale-password-value";

// Every console.log and console.error line, joined, for leak assertions.
function captureOutput() {
  const log = vi.spyOn(console, "log").mockImplementation(() => {});
  const err = vi.spyOn(console, "error").mockImplementation(() => {});
  return () =>
    [...log.mock.calls, ...err.mock.calls]
      .map((args) => args.join(" "))
      .join("\n");
}

function expectNothingExternal() {
  expect(execFileSync).not.toHaveBeenCalled();
  expect(spawnSync).not.toHaveBeenCalled();
  expect(provisionFirebaseUsers).not.toHaveBeenCalled();
  expect(writeUidsToEnvFile).not.toHaveBeenCalled();
  expect(writePasswordsToEnvFile).not.toHaveBeenCalled();
  expect(syncToGitHub).not.toHaveBeenCalled();
  expect(syncVariablesToGitHub).not.toHaveBeenCalled();
  expect(syncToVercel).not.toHaveBeenCalled();
}

function expectPatternRefusal(error, name, expected) {
  expect(error.message).toMatch(new RegExp(`not matching.*${name}`));
  expect(error.message).not.toContain(WRONG);
  expect(error.message).not.toContain(expected);
}

function mockSuccessfulSync() {
  provisionFirebaseUsers.mockResolvedValue(
    Object.fromEntries(ROLE_KEYS.map((k) => [`E2E_${k}_UID`, `uid-${k}`])),
  );
  syncToGitHub.mockReturnValue([]);
  syncVariablesToGitHub.mockReturnValue([]);
  syncToVercel.mockReturnValue([]);
}

describe("provision orchestrator ordering", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "log").mockImplementation(() => {});
    readEnvFile.mockReturnValue({ ...incompleteEnv });
    loadFirebaseCredentials.mockReturnValue({ ...FAKE_CREDENTIALS });
  });

  it("reports missing GitHub names in sync-only mode before any gh call", async () => {
    const run = main({ syncOnly: true });

    await expect(run).rejects.toThrowError(
      /Missing GitHub config value\(s\): .*FIREBASE_API_KEY/,
    );
    expect(execFileSync).not.toHaveBeenCalled();
    expect(spawnSync).not.toHaveBeenCalled();
  });

  it("never includes secret values in the missing-names error", async () => {
    await expect(main({ syncOnly: true })).rejects.toThrowError(
      expect.objectContaining({ message: expect.not.stringContaining(SECRET) }),
    );
  });

  it.each([
    ["sync-only", { syncOnly: true }],
    ["full pipeline", {}],
    ["reset-passwords", { resetPasswords: true }],
  ])(
    "refuses a password that differs from its pattern in %s mode",
    async (_label, options) => {
      readEnvFile.mockReturnValue({
        ...completeEnv(),
        E2E_USER_PASSWORD: WRONG,
      });

      const error = await main(options).catch((err) => err);

      expectPatternRefusal(error, "E2E_USER_PASSWORD", "useruser");
      expectNothingExternal();
    },
  );

  it("refuses a shell-exported password that differs from its pattern", async () => {
    readEnvFile.mockReturnValue(completeEnv());
    vi.stubEnv("E2E_SUPER_ADMIN_PASSWORD", WRONG);

    const error = await main({ resetPasswords: true })
      .catch((err) => err)
      .finally(() => vi.unstubAllEnvs());

    expectPatternRefusal(error, "E2E_SUPER_ADMIN_PASSWORD", "superadmin");
    expectNothingExternal();
  });

  it("refuses a role email without the e2e- prefix by variable name", async () => {
    readEnvFile.mockReturnValue({
      ...completeEnv(),
      E2E_MANAGE_ADMIN_TARGET_EMAIL: "target@ichnos-test.com",
    });

    const error = await main({}).catch((err) => err);

    expect(error.message).toMatch(
      /Invalid role email\(s\): E2E_MANAGE_ADMIN_TARGET_EMAIL/,
    );
    expect(error.message).not.toContain("target@ichnos-test.com");
    expectNothingExternal();
  });

  it("applies the pattern passwords to Firebase and the GitHub secrets in a full run", async () => {
    readEnvFile.mockReturnValue(completeEnv());
    mockSuccessfulSync();

    await main({});

    const specs = provisionFirebaseUsers.mock.calls[0][0];
    expect(
      Object.fromEntries(specs.map((spec) => [spec.email, spec.password])),
    ).toEqual(
      Object.fromEntries(
        ROLE_KEYS.map((k) => [
          `${ROLES[k].localPart}@ichnos-test.com`,
          ROLES[k].password,
        ]),
      ),
    );
    const secrets = syncToGitHub.mock.calls[0][0];
    for (const [name, value] of Object.entries(PATTERN)) {
      expect(secrets[name]).toBe(value);
    }
  });

  it("writes an exact shell override over stale file data after every upsert and before GitHub sync, with the recovery note on failure", async () => {
    readEnvFile.mockReturnValue({
      ...completeEnv(),
      E2E_USER_PASSWORD: STALE,
    });
    vi.stubEnv("E2E_USER_PASSWORD", "useruser");
    let upsertsDone = false;
    let doneAtWrite = null;
    provisionFirebaseUsers.mockImplementation(async (specs) => {
      const uids = {};
      for (const spec of specs) {
        await Promise.resolve();
        uids[spec.uidKey] = `uid-${spec.uidKey}`;
      }
      upsertsDone = true;
      return uids;
    });
    writePasswordsToEnvFile.mockImplementation(() => {
      doneAtWrite = upsertsDone;
    });
    syncVariablesToGitHub.mockReturnValue([
      { name: "E2E_USER_UID", status: "failed", error: "gh: HTTP 502" },
    ]);
    syncToGitHub.mockReturnValue([]);
    const output = captureOutput();
    const exit = vi.spyOn(process, "exit").mockImplementation((code) => {
      throw new Error(`exit ${code}`);
    });

    const error = await main({})
      .catch((err) => err)
      .finally(() => vi.unstubAllEnvs());

    expect(error.message).toBe("exit 1");
    expect(exit).toHaveBeenCalledWith(1);
    expect(doneAtWrite).toBe(true);
    expect(writePasswordsToEnvFile).toHaveBeenCalledTimes(1);
    expect(writePasswordsToEnvFile.mock.calls[0][1]).toEqual(PATTERN);
    expect(writePasswordsToEnvFile.mock.invocationCallOrder[0]).toBeLessThan(
      syncVariablesToGitHub.mock.invocationCallOrder[0],
    );
    expect(syncToVercel).not.toHaveBeenCalled();
    const text = output();
    expect(text).toContain(RECOVERY_NOTE);
    for (const value of [...Object.values(PATTERN), STALE]) {
      expect(text).not.toContain(value);
    }
  });

  it("never loads server/.env or Firebase credentials in sync-only mode", async () => {
    await expect(main({ syncOnly: true })).rejects.toThrowError();

    expect(config).not.toHaveBeenCalled();
    expect(loadFirebaseCredentials).not.toHaveBeenCalled();
  });

  it("loads Firebase credentials, never server/.env, before full-mode preflight", async () => {
    const stop = new Error("stop at credential load");
    loadFirebaseCredentials.mockImplementationOnce(() => {
      throw stop;
    });

    await expect(main({ firebaseEnvPath: "creds/.env" })).rejects.toBe(stop);

    expect(config).not.toHaveBeenCalled();
    expect(loadFirebaseCredentials).toHaveBeenCalledTimes(1);
    expect(loadFirebaseCredentials.mock.calls[0][0].firebaseEnvPath).toBe(
      "creds/.env",
    );
    expect(execFileSync).not.toHaveBeenCalled();
    expect(spawnSync).not.toHaveBeenCalled();
  });

  it("passes the loaded credentials to provisioning and never calls config in a full-mode run", async () => {
    readEnvFile.mockReturnValue(completeEnv());
    mockSuccessfulSync();

    await main({});

    expect(config).not.toHaveBeenCalled();
    expect(loadFirebaseCredentials).toHaveBeenCalledTimes(1);
    expect(provisionFirebaseUsers.mock.calls[0][1]).toEqual(FAKE_CREDENTIALS);
    expect(loadFirebaseCredentials.mock.invocationCallOrder[0]).toBeLessThan(
      provisionFirebaseUsers.mock.invocationCallOrder[0],
    );
  });

  it("never loads server/.env in reset mode and loads credentials once", async () => {
    const stop = new Error("stop at credential load");
    loadFirebaseCredentials.mockImplementationOnce(() => {
      throw stop;
    });

    await expect(
      main({ resetPasswords: true, firebaseEnvPath: "missing/.env.e2e" }),
    ).rejects.toBe(stop);

    expect(config).not.toHaveBeenCalled();
    expect(loadFirebaseCredentials).toHaveBeenCalledTimes(1);
  });
});
