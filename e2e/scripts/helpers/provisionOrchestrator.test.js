import { describe, it, expect, vi, beforeEach } from "vitest";

const execFileSync = vi.fn();
const spawnSync = vi.fn();
const readEnvFile = vi.fn();
const writeUidsToEnvFile = vi.fn();
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
}));
vi.mock("./firebaseTestSetup.js", () => ({ provisionFirebaseUsers }));
vi.mock("./e2eSyncGitHub.js", () => ({ syncToGitHub, syncVariablesToGitHub }));
vi.mock("./e2eSyncVercel.js", () => ({ syncToVercel }));

const { main } = await import("../provision-e2e-firebase-users.js");

const SECRET = "hunter2-admin-secret";

// Sync-only env that passes preflight validation but omits every non-admin name.
const incompleteEnv = {
  E2E_ADMIN_EMAIL: "admin@test.com",
  E2E_ADMIN_PASSWORD: SECRET,
  E2E_ADMIN_UID: "uid-admin",
};

const ROLE_KEYS = [
  "ADMIN",
  "USER",
  "INCOMPLETE_USER",
  "SUPER_ADMIN",
  "MANAGE_ADMIN_TARGET",
];

// Full-mode env that passes every check; UIDs arrive from provisioning.
function completeEnv() {
  const env = {
    FIREBASE_API_KEY: "api-key-value",
    FIREBASE_PROJECT_ID: "ichnos-e2e",
    FIREBASE_AUTH_DOMAIN: "ichnos-e2e.firebaseapp.com",
    FIREBASE_STORAGE_BUCKET: "ichnos-e2e.appspot.com",
    E2E_BASE_URL: "https://client.example.com",
    E2E_API_BASE_URL: "https://server.example.com",
    E2E_SIGNUP_PASSWORD: "signup-secret-value",
  };
  for (const key of ROLE_KEYS) {
    env[`E2E_${key}_EMAIL`] = `e2e-${key.toLowerCase()}@ichnos-test.com`;
    env[`E2E_${key}_PASSWORD`] = `secret-${key.toLowerCase()}-value`;
  }
  return env;
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

  it("rejects placeholder passwords by name before any gh or vercel call", async () => {
    readEnvFile.mockReturnValue({
      ...incompleteEnv,
      E2E_ADMIN_PASSWORD: "ab12",
      E2E_MANAGE_ADMIN_TARGET_EMAIL: "e2e-target@ichnos-test.com",
      E2E_MANAGE_ADMIN_TARGET_PASSWORD: "manage",
    });

    const error = await main({ syncOnly: true }).catch((err) => err);

    expect(error.message).toMatch(
      /E2E_ADMIN_PASSWORD, E2E_MANAGE_ADMIN_TARGET_PASSWORD/,
    );
    expect(error.message).not.toContain("ab12");
    expect(error.message).not.toMatch(/\bmanage\b/);
    expect(execFileSync).not.toHaveBeenCalled();
    expect(spawnSync).not.toHaveBeenCalled();
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
    provisionFirebaseUsers.mockResolvedValue(
      Object.fromEntries(ROLE_KEYS.map((k) => [`E2E_${k}_UID`, `uid-${k}`])),
    );
    syncToGitHub.mockReturnValue([]);
    syncVariablesToGitHub.mockReturnValue([]);
    syncToVercel.mockReturnValue([]);

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
