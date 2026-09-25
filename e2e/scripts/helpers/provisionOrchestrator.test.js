import { describe, it, expect, vi, beforeEach } from "vitest";
import { fileURLToPath, pathToFileURL } from "url";

const execFileSync = vi.fn();
const spawnSync = vi.fn();
const existsSync = vi.fn(() => true);
// Names of every other fs function called, in order.
const fsCalls = vi.hoisted(() => []);
const readEnvFile = vi.fn();
const readPreservedWebConfig = vi.fn();
const writeEnvFile = vi.fn();
const writeTestAccountsRecord = vi.fn();
const provisionFirebaseUsers = vi.fn();
const getTestApp = vi.fn(() => ({ auth: () => ({}) }));
const upsertUser = vi.fn(async (_auth, spec) =>
  spec.uidKey.replace(/^E2E_(\w+)_UID$/, "uid-$1"),
);
const syncToGitHub = vi.fn();
const syncVariablesToGitHub = vi.fn();
const listGitHubSecretMetadata = vi.fn(() => ({}));
const syncToVercel = vi.fn();
const syncProviders = vi.fn();
const fetchWebConfig = vi.fn();
const connectVercelProjects = vi.fn();
const VERCEL_CONTEXT = {
  api: { request: vi.fn(), registerSecret: vi.fn() },
  projects: {
    client: { projectId: "prj_client", projectName: "ichnos-client" },
    server: { projectId: "prj_server", projectName: "ichnos-protocol_server" },
  },
};
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
  checkOptionalVercelProject: vi.fn(),
  checkVercelApiAccess: vi.fn(() => ({ mode: "cli" })),
}));
vi.mock("./e2eVercelProjects.js", async (importOriginal) => ({
  ...(await importOriginal()),
  connectVercelProjects,
}));
vi.mock("./e2eFirebaseWebConfig.js", () => ({ fetchWebConfig }));
vi.mock("./e2eProviderSync.js", async (importOriginal) => ({
  ...(await importOriginal()),
  syncProviders,
}));
// Mandatory: the loader is mocked so no real credential file is ever read.
vi.mock("./e2eFirebaseCredentials.js", async (importOriginal) => ({
  ...(await importOriginal()),
  loadFirebaseCredentials,
}));
const config = vi.fn();
vi.mock("dotenv", async (importOriginal) => ({
  ...(await importOriginal()),
  config,
}));
// Every fs function is tracked, so a test can prove that no filesystem
// method ran, whichever one it would have been.
vi.mock("fs", async (importOriginal) => {
  const actual = await importOriginal();
  const tracked = Object.entries(actual)
    .filter(([name, fn]) => typeof fn === "function" && /^[a-z]/.test(name))
    .map(([name, fn]) => [
      name,
      (...args) => {
        fsCalls.push(name);
        return fn(...args);
      },
    ]);
  return { ...actual, ...Object.fromEntries(tracked), existsSync };
});
vi.mock("./e2eEnvFile.js", async (importOriginal) => ({
  ...(await importOriginal()),
  readEnvFile,
  readPreservedWebConfig,
  writeEnvFile,
}));
vi.mock("./e2eTestAccountsRecord.js", async (importOriginal) => ({
  ...(await importOriginal()),
  writeTestAccountsRecord,
}));
vi.mock("./firebaseTestSetup.js", () => ({
  getTestApp,
  provisionFirebaseUsers,
  upsertUser,
}));
vi.mock("./e2eSyncGitHub.js", () => ({
  listGitHubSecretMetadata,
  syncToGitHub,
  syncVariablesToGitHub,
}));
vi.mock("./e2eSyncVercel.js", () => ({ syncToVercel }));

const {
  main,
  commandLine,
  isDirectInvocation,
  parseCliOptions,
  SYNC_RECOVERY_HINT,
} = await import("../provision-e2e-firebase-users.js");
const { envFileNames } = await import("./e2eCredentials.js");

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

const WEB_CONFIG = {
  FIREBASE_API_KEY: "api-key-value",
  FIREBASE_AUTH_DOMAIN: "ichnos-protocol-test.firebaseapp.com",
  FIREBASE_STORAGE_BUCKET: "ichnos-protocol-test.appspot.com",
};

// A prior e2e/.env.e2e that passes every check; UIDs arrive from provisioning.
function completeEnv() {
  const env = {
    ...WEB_CONFIG,
    FIREBASE_PROJECT_ID: "ichnos-protocol-test",
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

const UIDS = Object.fromEntries(
  ROLE_KEYS.map((k) => [`E2E_${k}_UID`, `uid-${k}`]),
);

const PRIOR_METADATA = { E2E_USER_PASSWORD: "2026-08-01T09:00:00Z" };
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
  expect(getTestApp).not.toHaveBeenCalled();
  expect(upsertUser).not.toHaveBeenCalled();
  expect(execFileSync).not.toHaveBeenCalled();
  expect(spawnSync).not.toHaveBeenCalled();
  expect(provisionFirebaseUsers).not.toHaveBeenCalled();
  expect(writeEnvFile).not.toHaveBeenCalled();
  expect(writeTestAccountsRecord).not.toHaveBeenCalled();
  expect(listGitHubSecretMetadata).not.toHaveBeenCalled();
  expect(syncToGitHub).not.toHaveBeenCalled();
  expect(syncVariablesToGitHub).not.toHaveBeenCalled();
  expect(syncToVercel).not.toHaveBeenCalled();
  expect(connectVercelProjects).not.toHaveBeenCalled();
  expect(fetchWebConfig).not.toHaveBeenCalled();
  expect(syncProviders).not.toHaveBeenCalled();
}

function expectPatternRefusal(error, name, expected) {
  expect(error.message).toMatch(new RegExp(`not matching.*${name}`));
  expect(error.message).not.toContain(WRONG);
  expect(error.message).not.toContain(expected);
}

const CONFIRMED_BYPASS = {
  attempted: true,
  generated: true,
  steadyState: false,
  results: [
    {
      project: "ichnos-client",
      heldBefore: false,
      added: true,
      confirmed: true,
      revoked: 1,
      preserved: 0,
    },
    {
      project: "ichnos-protocol_server",
      heldBefore: false,
      added: true,
      confirmed: true,
      revoked: 1,
      preserved: 0,
    },
  ],
  confirmedProjects: ["ichnos-client", "ichnos-protocol_server"],
  githubConfirmed: true,
  revocationComplete: true,
  complete: true,
  failure: null,
  ghResults: [
    {
      name: "VERCEL_AUTOMATION_BYPASS_SECRET",
      status: "success",
      masked: "****",
    },
  ],
};

function providerOutcome(bypass = CONFIRMED_BYPASS) {
  return { envResults: [], bypass, redeploys: [] };
}

function mockSuccessfulSync() {
  provisionFirebaseUsers.mockResolvedValue({ ...UIDS });
  syncToGitHub.mockReturnValue([]);
  syncVariablesToGitHub.mockReturnValue([]);
  syncToVercel.mockReturnValue([]);
  syncProviders.mockImplementation(async ({ converge }) =>
    providerOutcome(converge ? CONFIRMED_BYPASS : { attempted: false }),
  );
}

function order(mock) {
  return mock.mock.invocationCallOrder[0];
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, "log").mockImplementation(() => {});
  existsSync.mockReturnValue(true);
  readEnvFile.mockReturnValue({ ...incompleteEnv });
  readPreservedWebConfig.mockReturnValue({ ...WEB_CONFIG });
  listGitHubSecretMetadata.mockReturnValue({});
  loadFirebaseCredentials.mockReturnValue({ ...FAKE_CREDENTIALS });
  connectVercelProjects.mockResolvedValue(VERCEL_CONTEXT);
  fetchWebConfig.mockResolvedValue({ ...WEB_CONFIG });
});

describe("provision orchestrator ordering", () => {
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

  it("refuses a file password that differs from its pattern in sync-only mode", async () => {
    readEnvFile.mockReturnValue({ ...completeEnv(), E2E_USER_PASSWORD: WRONG });

    const error = await main({ syncOnly: true }).catch((err) => err);

    expectPatternRefusal(error, "E2E_USER_PASSWORD", "useruser");
    expectNothingExternal();
  });

  it.each([
    ["sync-only", { syncOnly: true }],
    ["full pipeline", {}],
  ])(
    "refuses a shell-exported password that differs from its pattern in %s mode",
    async (_label, options) => {
      readEnvFile.mockReturnValue(completeEnv());
      vi.stubEnv("E2E_SUPER_ADMIN_PASSWORD", WRONG);

      const error = await main(options)
        .catch((err) => err)
        .finally(() => vi.unstubAllEnvs());

      expectPatternRefusal(error, "E2E_SUPER_ADMIN_PASSWORD", "superadmin");
      expectNothingExternal();
    },
  );

  it("refuses a stale file password with no shell override before any provider call", async () => {
    readEnvFile.mockReturnValue({
      ...completeEnv(),
      E2E_USER_PASSWORD: STALE,
    });

    const error = await main({}).catch((err) => err);

    expect(error.message).toMatch(
      /not matching.*E2E_USER_PASSWORD \(e2e\/\.env\.e2e\)/,
    );
    expect(error.message).not.toContain(STALE);
    expect(error.message).not.toContain("useruser");
    expectNothingExternal();
  });

  it("refuses a stale file password even when the shell exports the pattern value", async () => {
    readEnvFile.mockReturnValue({
      ...completeEnv(),
      E2E_ADMIN_PASSWORD: STALE,
    });
    vi.stubEnv("E2E_ADMIN_PASSWORD", "adminadmin");

    const error = await main({})
      .catch((err) => err)
      .finally(() => vi.unstubAllEnvs());

    expect(error.message).toMatch(/not matching.*E2E_ADMIN_PASSWORD/);
    expectNothingExternal();
  });

  it("refuses a sync-only role email without the e2e- prefix by variable name", async () => {
    readEnvFile.mockReturnValue({
      ...completeEnv(),
      E2E_MANAGE_ADMIN_TARGET_EMAIL: "target@ichnos-test.com",
    });

    const error = await main({ syncOnly: true }).catch((err) => err);

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

  it("writes the whole env file after every upsert and before GitHub sync, with the recovery note on failure", async () => {
    readEnvFile.mockReturnValue(completeEnv());
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
    writeEnvFile.mockImplementation(() => {
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
    expect(writeEnvFile).toHaveBeenCalledTimes(1);
    const written = writeEnvFile.mock.calls[0][1];
    for (const [name, value] of Object.entries(PATTERN)) {
      expect(written[name]).toBe(value);
    }
    expect(order(writeEnvFile)).toBeLessThan(order(syncVariablesToGitHub));
    expect(syncProviders).not.toHaveBeenCalled();
    const text = output();
    expect(text).toContain(SYNC_RECOVERY_HINT);
    for (const value of Object.values(PATTERN)) {
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
    expect(order(loadFirebaseCredentials)).toBeLessThan(
      order(provisionFirebaseUsers),
    );
  });
});

describe("generated e2e/.env.e2e and test-accounts record", () => {
  it("writes both files after every upsert and before every provider sync", async () => {
    readEnvFile.mockReturnValue(completeEnv());
    mockSuccessfulSync();

    await main({});

    expect(order(provisionFirebaseUsers)).toBeLessThan(order(writeEnvFile));
    expect(order(writeEnvFile)).toBeLessThan(order(writeTestAccountsRecord));
    const lastWrite = order(writeTestAccountsRecord);
    for (const sync of [syncVariablesToGitHub, syncToGitHub, syncProviders]) {
      expect(lastWrite).toBeLessThan(order(sync));
    }
  });

  it("writes the fixed config, the pattern passwords and the returned UIDs with the exact command", async () => {
    readEnvFile.mockReturnValue(completeEnv());
    mockSuccessfulSync();

    await main(
      parseCliOptions(
        [
          "node",
          "/repo/e2e/scripts/provision-e2e-firebase-users.js",
          "--firebase-env",
          "creds/.env.e2e",
        ],
        "/repo",
      ),
    );

    const [path, values, run] = writeEnvFile.mock.calls[0];
    expect(path.replace(/\\/g, "/")).toMatch(/e2e\/\.env\.e2e$/);
    expect(values.E2E_BASE_URL).toBe("https://e2e-client.ichnos-protocol.com");
    expect(values.E2E_ADMIN_EMAIL).toBe("e2e-admin@ichnos-test.com");
    for (const [name, value] of Object.entries({ ...PATTERN, ...UIDS })) {
      expect(values[name]).toBe(value);
    }
    for (const name of envFileNames()) expect(values[name]).toBeTruthy();
    expect(run.command).toBe(
      "node e2e/scripts/provision-e2e-firebase-users.js --firebase-env creds/.env.e2e",
    );
    expect(run.now).toBeInstanceOf(Date);
    const [recordPath, record] = writeTestAccountsRecord.mock.calls[0];
    expect(recordPath.replace(/\\/g, "/")).toMatch(
      /secrets\/test-accounts\.md$/,
    );
    expect(record.command).toBe(run.command);
    expect(record.uidMap).toEqual(UIDS);
    expect(record.project).toBe("ichnos-protocol-test");
  });

  it("starts without e2e/.env.e2e in a full run and stops on the missing web config after writing", async () => {
    existsSync.mockReturnValue(false);
    readPreservedWebConfig.mockReturnValue({});
    listGitHubSecretMetadata.mockReturnValue({ ...PRIOR_METADATA });
    mockSuccessfulSync();
    fetchWebConfig.mockResolvedValue({});

    const error = await main({}).catch((err) => err);

    expect(readEnvFile).not.toHaveBeenCalled();
    expect(provisionFirebaseUsers).toHaveBeenCalled();
    expect(order(provisionFirebaseUsers)).toBeLessThan(order(writeEnvFile));
    expect(writeEnvFile).toHaveBeenCalledTimes(1);
    expect(writeTestAccountsRecord).toHaveBeenCalledTimes(1);
    const record = writeTestAccountsRecord.mock.calls[0][1];
    expect(record.setNow).toEqual([]);
    expect(record.secretMetadata).toEqual(PRIOR_METADATA);
    expect(error.message).toMatch(
      /Missing GitHub config value\(s\): FIREBASE_AUTH_DOMAIN, FIREBASE_STORAGE_BUCKET, FIREBASE_API_KEY/,
    );
    expect(syncToGitHub).not.toHaveBeenCalled();
    expect(syncVariablesToGitHub).not.toHaveBeenCalled();
    expect(syncToVercel).not.toHaveBeenCalled();
    expect(syncProviders).not.toHaveBeenCalled();
  });

  it("dates only the secrets GitHub confirmed after a partial failure", async () => {
    readEnvFile.mockReturnValue(completeEnv());
    listGitHubSecretMetadata.mockReturnValue({ ...PRIOR_METADATA });
    mockSuccessfulSync();
    syncToGitHub.mockReturnValue([
      { name: "E2E_ADMIN_PASSWORD", status: "success" },
      { name: "E2E_USER_PASSWORD", status: "failed", error: "gh: HTTP 502" },
      { name: "FIREBASE_API_KEY", status: "failed", error: "gh: HTTP 502" },
    ]);
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(process, "exit").mockImplementation((code) => {
      throw new Error(`exit ${code}`);
    });

    const error = await main({}).catch((err) => err);

    expect(error.message).toBe("exit 1");
    const calls = writeTestAccountsRecord.mock.calls;
    expect(calls).toHaveLength(2);
    expect(calls[0][1].setNow).toEqual([]);
    expect(order(writeTestAccountsRecord)).toBeLessThan(order(syncToGitHub));
    const refreshed = calls[1][1];
    expect(refreshed.setNow).toEqual(["E2E_ADMIN_PASSWORD"]);
    expect(refreshed.secretMetadata).toEqual(PRIOR_METADATA);
    expect(writeTestAccountsRecord.mock.invocationCallOrder[1]).toBeGreaterThan(
      order(syncToGitHub),
    );
    expect(syncProviders).not.toHaveBeenCalled();
  });

  it("refreshes the record with every confirmed secret before completing", async () => {
    readEnvFile.mockReturnValue(completeEnv());
    mockSuccessfulSync();
    syncToGitHub.mockImplementation((secrets) =>
      Object.keys(secrets).map((name) => ({ name, status: "success" })),
    );

    await main({});

    const calls = writeTestAccountsRecord.mock.calls;
    expect(calls).toHaveLength(3);
    expect(calls[0][1].setNow).toEqual([]);
    const secrets = Object.keys(syncToGitHub.mock.calls[0][0]);
    expect(calls[1][1].setNow).toEqual(secrets);
    expect(calls[1][1].setNow).toContain("E2E_ADMIN_PASSWORD");
    expect(calls[2][1].setNow).toEqual([
      ...secrets,
      "VERCEL_AUTOMATION_BYPASS_SECRET",
    ]);
    expect(calls[2][1].providerSetNow).toEqual([
      { name: "VERCEL_AUTOMATION_BYPASS_SECRET", store: "vercel" },
    ]);
    expect(order(syncProviders)).toBeLessThan(
      writeTestAccountsRecord.mock.invocationCallOrder[2],
    );
  });

  it("leaves the Vercel bypass row undated after a steady-state run while dating the GitHub row", async () => {
    readEnvFile.mockReturnValue(completeEnv());
    mockSuccessfulSync();
    syncToGitHub.mockImplementation((secrets) =>
      Object.keys(secrets).map((name) => ({ name, status: "success" })),
    );
    const held = { heldBefore: true, added: false, confirmed: true };
    syncProviders.mockResolvedValue(
      providerOutcome({
        ...CONFIRMED_BYPASS,
        generated: false,
        steadyState: true,
        results: [
          { ...held, project: "ichnos-client", revoked: 0, preserved: 0 },
          {
            ...held,
            project: "ichnos-protocol_server",
            revoked: 0,
            preserved: 0,
          },
        ],
      }),
    );

    await main({});

    const last = writeTestAccountsRecord.mock.calls.at(-1)[1];
    expect(last.providerSetNow).toEqual([]);
    expect(last.setNow).toContain("VERCEL_AUTOMATION_BYPASS_SECRET");
  });

  it("still refuses a missing file in sync-only mode", async () => {
    existsSync.mockReturnValue(false);

    await expect(main({ syncOnly: true })).rejects.toThrowError(
      /\.env\.e2e not found/,
    );
    expectNothingExternal();
  });

  it("writes neither file in sync-only mode", async () => {
    readEnvFile.mockReturnValue({ ...completeEnv(), ...UIDS });
    mockSuccessfulSync();

    await main({ syncOnly: true });

    expect(writeEnvFile).not.toHaveBeenCalled();
    expect(writeTestAccountsRecord).not.toHaveBeenCalled();
    expect(syncToGitHub).toHaveBeenCalledTimes(1);
  });

  it("refuses an existing file naming another project before any Firebase call", async () => {
    readEnvFile.mockReturnValue({
      ...completeEnv(),
      FIREBASE_PROJECT_ID: "other-project",
    });

    await expect(main({})).rejects.toThrowError(
      /Firebase project mismatch: .*"other-project"/,
    );
    expectNothingExternal();
  });

  it("writes nothing when an upsert rejects", async () => {
    readEnvFile.mockReturnValue(completeEnv());
    provisionFirebaseUsers.mockRejectedValue(new Error("quota"));

    await expect(main({})).rejects.toThrowError("quota");

    expect(writeEnvFile).not.toHaveBeenCalled();
    expect(writeTestAccountsRecord).not.toHaveBeenCalled();
    expect(syncToGitHub).not.toHaveBeenCalled();
    expect(syncVariablesToGitHub).not.toHaveBeenCalled();
    expect(fetchWebConfig).not.toHaveBeenCalled();
    expect(syncProviders).not.toHaveBeenCalled();
  });

  it("prints none of the pattern passwords in a full run", async () => {
    readEnvFile.mockReturnValue(completeEnv());
    mockSuccessfulSync();
    const output = captureOutput();

    await main({});

    const text = output();
    for (const value of Object.values(PATTERN)) {
      expect(text).not.toContain(value);
    }
  });
});

describe("web config and provider sync", () => {
  const FRESH_WEB_CONFIG = {
    FIREBASE_API_KEY: "fresh-firebase-api-key-value",
    FIREBASE_AUTH_DOMAIN: "fresh.firebaseapp.com",
    FIREBASE_STORAGE_BUCKET: "fresh.firebasestorage.app",
  };

  it("orders upserts, web config, env file, record, GitHub, then providers", async () => {
    readEnvFile.mockReturnValue(completeEnv());
    mockSuccessfulSync();

    await main({});

    const sequence = [
      provisionFirebaseUsers,
      fetchWebConfig,
      writeEnvFile,
      writeTestAccountsRecord,
      syncVariablesToGitHub,
      syncToGitHub,
      syncProviders,
    ].map(order);
    expect(sequence).toEqual([...sequence].sort((a, b) => a - b));
    expect(order(connectVercelProjects)).toBeLessThan(
      order(provisionFirebaseUsers),
    );
  });

  it("reads the web config from the locked project and writes it everywhere", async () => {
    readEnvFile.mockReturnValue(completeEnv());
    mockSuccessfulSync();
    fetchWebConfig.mockResolvedValue({ ...FRESH_WEB_CONFIG });

    await main({});

    const [{ projectId }] = fetchWebConfig.mock.calls[0];
    expect(projectId).toBe("ichnos-protocol-test");
    expect(getTestApp).toHaveBeenCalledWith(FAKE_CREDENTIALS);
    const written = writeEnvFile.mock.calls[0][1];
    for (const [name, value] of Object.entries(FRESH_WEB_CONFIG)) {
      expect(written[name]).toBe(value);
    }
    const variables = syncVariablesToGitHub.mock.calls[0][0];
    expect(variables.FIREBASE_AUTH_DOMAIN).toBe("fresh.firebaseapp.com");
    expect(variables.FIREBASE_STORAGE_BUCKET).toBe("fresh.firebasestorage.app");
    expect(syncToGitHub.mock.calls[0][0].FIREBASE_API_KEY).toBe(
      FRESH_WEB_CONFIG.FIREBASE_API_KEY,
    );
    const [args] = syncProviders.mock.calls[0];
    expect(args.client).toEqual({
      VITE_FIREBASE_API_KEY: FRESH_WEB_CONFIG.FIREBASE_API_KEY,
    });
    expect(args.converge).toBe(true);
    expect(args.projects).toBe(VERCEL_CONTEXT.projects);
  });

  it("starts without e2e/.env.e2e in a full run and completes from Firebase", async () => {
    existsSync.mockReturnValue(false);
    readPreservedWebConfig.mockReturnValue({});
    mockSuccessfulSync();

    await main({});

    expect(readEnvFile).not.toHaveBeenCalled();
    expect(writeEnvFile.mock.calls[0][1].FIREBASE_API_KEY).toBe(
      WEB_CONFIG.FIREBASE_API_KEY,
    );
    expect(syncProviders).toHaveBeenCalledTimes(1);
  });

  it("writes nothing when the web config cannot be read", async () => {
    readEnvFile.mockReturnValue(completeEnv());
    mockSuccessfulSync();
    fetchWebConfig.mockRejectedValue(new Error("found 2 web apps"));

    await expect(main({})).rejects.toThrowError("found 2 web apps");

    expect(writeEnvFile).not.toHaveBeenCalled();
    expect(syncToGitHub).not.toHaveBeenCalled();
    expect(syncProviders).not.toHaveBeenCalled();
  });

  it("neither reads the web config nor converges the bypass in sync-only mode", async () => {
    readEnvFile.mockReturnValue({ ...completeEnv(), ...UIDS });
    mockSuccessfulSync();
    const output = captureOutput();

    await main({ syncOnly: true });

    expect(fetchWebConfig).not.toHaveBeenCalled();
    expect(getTestApp).not.toHaveBeenCalled();
    const [args] = syncProviders.mock.calls[0];
    expect(args.converge).toBe(false);
    expect(args.client).toEqual({
      VITE_FIREBASE_API_KEY: WEB_CONFIG.FIREBASE_API_KEY,
    });
    expect(output()).toMatch(/not converged/);
  });

  it("exits non-zero and leaves the bypass rows undated when a project is unconfirmed", async () => {
    readEnvFile.mockReturnValue(completeEnv());
    mockSuccessfulSync();
    const unconfirmed = {
      attempted: true,
      generated: true,
      steadyState: false,
      results: [
        {
          project: "ichnos-client",
          heldBefore: false,
          added: true,
          confirmed: false,
          reason: "the project does not hold the value this run selected",
          revoked: 0,
          preserved: 0,
        },
        {
          project: "ichnos-protocol_server",
          heldBefore: false,
          added: false,
          confirmed: false,
          reason: "not attempted: another project failed first",
          revoked: 0,
          preserved: 0,
        },
      ],
      confirmedProjects: [],
      githubConfirmed: false,
      revocationComplete: false,
      complete: false,
      failure: { stage: "add", reason: "a project does not hold the value" },
    };
    syncProviders.mockResolvedValue(providerOutcome(unconfirmed));
    const output = captureOutput();
    vi.spyOn(process, "exit").mockImplementation((code) => {
      throw new Error(`exit ${code}`);
    });

    const error = await main({}).catch((err) => err);

    expect(error.message).toBe("exit 1");
    const last = writeTestAccountsRecord.mock.calls.at(-1)[1];
    expect(last.providerSetNow).toEqual([]);
    expect(last.setNow).not.toContain("VERCEL_AUTOMATION_BYPASS_SECRET");
    expect(output()).toMatch(/Identical state cannot be achieved/);
  });

  it("exits non-zero when a redeploy finds no deployment for the E2E host", async () => {
    readEnvFile.mockReturnValue(completeEnv());
    mockSuccessfulSync();
    syncProviders.mockResolvedValue({
      ...providerOutcome(),
      redeploys: [
        {
          project: "ichnos-protocol_server",
          host: "e2e-api.ichnos-protocol.com",
          status: "failed",
          reason: "no deployment serves e2e-api.ichnos-protocol.com",
        },
      ],
    });
    const output = captureOutput();
    vi.spyOn(process, "exit").mockImplementation((code) => {
      throw new Error(`exit ${code}`);
    });

    const error = await main({}).catch((err) => err);

    expect(error.message).toBe("exit 1");
    expect(output()).toMatch(/no deployment serves e2e-api/);
  });

  it("prints no pattern password or web API key in a full run", async () => {
    readEnvFile.mockReturnValue(completeEnv());
    mockSuccessfulSync();
    fetchWebConfig.mockResolvedValue({ ...FRESH_WEB_CONFIG });
    const output = captureOutput();

    await main({});

    const text = output();
    for (const value of Object.values(PATTERN)) {
      expect(text).not.toContain(value);
    }
    expect(text).not.toContain(FRESH_WEB_CONFIG.FIREBASE_API_KEY);
  });
});

describe("commandLine", () => {
  const SCRIPT = "node e2e/scripts/provision-e2e-firebase-users.js";

  function fromArgv(args, cwd = "/repo") {
    const argv = ["node", "/repo/e2e/scripts/provision-e2e-firebase-users.js"];
    const options = parseCliOptions([...argv, ...args], cwd);
    return commandLine(options.args, options.scriptPath);
  }

  it("names the script and each token as given", () => {
    expect(commandLine()).toBe(SCRIPT);
    expect(fromArgv([])).toBe(SCRIPT);
    expect(fromArgv(["--sync-only"])).toBe(`${SCRIPT} --sync-only`);
    expect(fromArgv(["--firebase-env", "a/.env"])).toBe(
      `${SCRIPT} --firebase-env a/.env`,
    );
  });

  it("keeps a given flag order", () => {
    expect(commandLine(["--firebase-env", "a/.env", "--x"])).toBe(
      `${SCRIPT} --firebase-env a/.env --x`,
    );
    expect(commandLine(["--x", "--firebase-env", "a/.env"])).toBe(
      `${SCRIPT} --x --firebase-env a/.env`,
    );
    expect(
      parseCliOptions(["node", "s.js", "--firebase-env", "a/.env"]),
    ).toMatchObject({ syncOnly: false, firebaseEnvPath: "a/.env" });
    expect(parseCliOptions(["node", "s.js", "--sync-only"])).toMatchObject({
      syncOnly: true,
      firebaseEnvPath: undefined,
    });
  });

  it("quotes a path containing spaces so the command replays", () => {
    const args = ["--firebase-env", "My Creds/.env.e2e"];

    expect(fromArgv(args)).toBe(`${SCRIPT} --firebase-env 'My Creds/.env.e2e'`);
    expect(commandLine(["--firebase-env", "it's/.env"])).toBe(
      `${SCRIPT} --firebase-env 'it'"'"'s/.env'`,
    );
  });

  it("records the script path relative to the working directory", () => {
    expect(fromArgv([], "/repo/e2e")).toBe(
      "node scripts/provision-e2e-firebase-users.js",
    );
  });

  it("records an injected command verbatim in the generated files", async () => {
    readEnvFile.mockReturnValue(completeEnv());
    mockSuccessfulSync();

    await main({ command: "node custom.js --flag" });

    expect(writeEnvFile.mock.calls[0][2].command).toBe("node custom.js --flag");
    expect(writeTestAccountsRecord.mock.calls[0][1].command).toBe(
      "node custom.js --flag",
    );
  });
});

describe("parseCliOptions", () => {
  const COMMAND = "node e2e/scripts/provision-e2e-firebase-users.js";
  const parse = (...args) => parseCliOptions(["node", "s.js", ...args]);
  const naming = (pattern) =>
    expect.objectContaining({
      message: expect.stringMatching(pattern),
    });

  // The retired reset flag; the only place its name survives.
  const RETIRED_FLAG = "--reset-passwords";

  it("refuses the retired reset flag as unknown, naming the supported command", () => {
    const supported = naming(
      new RegExp(`Unknown flag: ${RETIRED_FLAG}[\\s\\S]*${COMMAND}`),
    );

    expect(() => parse(RETIRED_FLAG)).toThrowError(supported);
    expect(() => parse(RETIRED_FLAG)).toThrowError(
      naming(/--sync-only[\s\S]*--firebase-env <path>/),
    );
  });

  it("refuses an arbitrary unknown flag", () => {
    expect(() => parse("--sync-only", "--verbose")).toThrowError(
      naming(/Unknown flag: --verbose/),
    );
  });

  it("refuses a positional argument without echoing it", () => {
    const token = "hunter2-secret";

    expect(() => parse(token)).toThrowError(
      naming(/Unexpected argument at position 1/),
    );
    expect(() => parse(token)).toThrowError(
      expect.objectContaining({ message: expect.not.stringContaining(token) }),
    );
  });

  it("refuses a duplicate --sync-only", () => {
    expect(() => parse("--sync-only", "--sync-only")).toThrowError(
      naming(/--sync-only was given more than once/),
    );
  });

  it("refuses a duplicate --firebase-env", () => {
    expect(() =>
      parse("--firebase-env", "a/.env", "--firebase-env", "b/.env"),
    ).toThrowError(naming(/--firebase-env was given more than once/));
  });

  it.each([
    ["no value", []],
    ["an empty value", [""]],
    ["another flag", ["--sync-only"]],
  ])("refuses --firebase-env followed by %s", (_label, rest) => {
    expect(() => parse("--firebase-env", ...rest)).toThrowError(
      naming(/--firebase-env needs a path value/),
    );
  });

  it("refuses --sync-only with --firebase-env", () => {
    expect(() => parse("--sync-only", "--firebase-env", "a/.env")).toThrowError(
      naming(/--sync-only loads no Firebase credentials/),
    );
  });

  it("stops before main does any work", () => {
    const argv = ["node", "s.js", RETIRED_FLAG];

    expect(() => main(parseCliOptions(argv))).toThrowError(/Unknown flag/);
    expect(console.log).not.toHaveBeenCalled();
    expect(loadFirebaseCredentials).not.toHaveBeenCalled();
    expect(existsSync).not.toHaveBeenCalled();
    expect(readEnvFile).not.toHaveBeenCalled();
    expectNothingExternal();
  });

  it("rejects a direct invocation in the parser before any filesystem call", async () => {
    const scriptFile = fileURLToPath(
      new URL("../provision-e2e-firebase-users.js", import.meta.url),
    );
    const savedArgv = process.argv;
    const exit = vi.spyOn(process, "exit").mockImplementation(() => {});
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.resetModules();
    fsCalls.length = 0;
    process.argv = ["node", scriptFile, RETIRED_FLAG];
    try {
      await import("../provision-e2e-firebase-users.js");
      await vi.waitFor(() => expect(exit).toHaveBeenCalled());
    } finally {
      process.argv = savedArgv;
    }
    const exitCodes = exit.mock.calls.map(([code]) => code);
    exit.mockRestore();

    expect(exitCodes).toEqual([1]);
    expect(error).toHaveBeenCalledWith(
      expect.stringMatching(/\[fatal\] Unknown flag: --reset-passwords/),
    );
    expect(fsCalls).toEqual([]);
    expect(existsSync).not.toHaveBeenCalled();
    expect(console.log).not.toHaveBeenCalled();
    expect(loadFirebaseCredentials).not.toHaveBeenCalled();
    expectNothingExternal();
  });
});

describe("isDirectInvocation", () => {
  const moduleFile = fileURLToPath(
    new URL("../provision-e2e-firebase-users.js", import.meta.url),
  );
  const moduleUrl = pathToFileURL(moduleFile).href;

  it("matches the module path without touching the filesystem", () => {
    fsCalls.length = 0;

    expect(isDirectInvocation(moduleFile, moduleUrl)).toBe(true);
    expect(isDirectInvocation(`${moduleFile}.other`, moduleUrl)).toBe(false);
    expect(isDirectInvocation(undefined, moduleUrl)).toBe(false);
    expect(fsCalls).toEqual([]);
    expect(existsSync).not.toHaveBeenCalled();
  });

  it("compares Windows paths case-insensitively", () => {
    expect(
      isDirectInvocation(moduleFile.toUpperCase(), moduleUrl, "win32"),
    ).toBe(true);
  });
});
