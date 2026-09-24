import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";

const execFileSync = vi.fn();
const spawnSync = vi.fn();
const readEnvFile = vi.fn();
const writePasswordsToEnvFile = vi.fn();
const writeUidsToEnvFile = vi.fn();
const getPasswordResetApp = vi.fn();
const upsertUser = vi.fn();
const syncToVercel = vi.fn();
const config = vi.fn();
const parse = vi.fn();

vi.mock("child_process", () => ({ execFileSync, spawnSync }));
vi.mock("dotenv", async (importOriginal) => {
  const actual = await importOriginal();
  parse.mockImplementation(actual.parse);
  return { ...actual, config, parse };
});
vi.mock("./e2eEnvFile.js", async (importOriginal) => ({
  ...(await importOriginal()),
  readEnvFile,
  writePasswordsToEnvFile,
  writeUidsToEnvFile,
}));
vi.mock("./firebaseTestSetup.js", () => ({ getPasswordResetApp, upsertUser }));
vi.mock("./e2eSyncVercel.js", () => ({ syncToVercel }));

const { prepareReset, applyReset } = await import("./e2ePasswordReset.js");
const { buildCredentialMaps, findPlaceholderPasswordNames } =
  await import("./e2eCredentials.js");
const { main } = await import("../provision-e2e-firebase-users.js");

const PROJECT = "ichnos-e2e";
const ROLE_KEYS = [
  "ADMIN",
  "USER",
  "INCOMPLETE_USER",
  "SUPER_ADMIN",
  "MANAGE_ADMIN_TARGET",
];

function e2eEnv() {
  const env = { FIREBASE_PROJECT_ID: PROJECT };
  for (const key of ROLE_KEYS) {
    env[`E2E_${key}_EMAIL`] = `e2e-${key.toLowerCase()}@ichnos-test.com`;
    env[`E2E_${key}_UID`] = `uid-${key}`;
  }
  return env;
}

function credentialFile(projectId, extra = "") {
  return [
    `FIREBASE_PROJECT_ID=${projectId}`,
    "FIREBASE_CLIENT_EMAIL=sa@ichnos-e2e.iam.gserviceaccount.com",
    'FIREBASE_PRIVATE_KEY="-----BEGIN KEY-----\\nabc\\n-----END KEY-----"',
    extra,
    "",
  ].join("\n");
}

let repoRoot;
let envFilePath;
let logged;

function writeCredentials(content) {
  writeFileSync(join(repoRoot, "server", ".env.e2e"), content, "utf8");
}

function prepare(extra = {}) {
  return prepareReset({ repoRoot, envFilePath, cwd: repoRoot, ...extra });
}

beforeEach(() => {
  vi.clearAllMocks();
  repoRoot = mkdtempSync(join(tmpdir(), "e2e-reset-"));
  mkdirSync(join(repoRoot, "server"));
  mkdirSync(join(repoRoot, "e2e"));
  envFilePath = join(repoRoot, "e2e", ".env.e2e");
  writeFileSync(envFilePath, "", "utf8");
  readEnvFile.mockReturnValue(e2eEnv());
  logged = [];
  const capture = (...args) => logged.push(args.join(" "));
  vi.spyOn(console, "log").mockImplementation(capture);
  vi.spyOn(console, "error").mockImplementation(capture);
});

afterEach(() => {
  rmSync(repoRoot, { recursive: true, force: true });
  delete process.env.DATABASE_URL;
});

function expectNothingExternal() {
  expect(getPasswordResetApp).not.toHaveBeenCalled();
  expect(upsertUser).not.toHaveBeenCalled();
  expect(execFileSync).not.toHaveBeenCalled();
  expect(spawnSync).not.toHaveBeenCalled();
  expect(writePasswordsToEnvFile).not.toHaveBeenCalled();
  expect(writeUidsToEnvFile).not.toHaveBeenCalled();
}

describe("prepareReset", () => {
  it("rejects a project mismatch naming only the two project IDs", () => {
    writeCredentials(credentialFile("ichnos-prod"));

    const error = (() => {
      try {
        prepare();
      } catch (err) {
        return err;
      }
    })();

    expect(error.message).toContain("ichnos-prod");
    expect(error.message).toContain(PROJECT);
    expect(error.message).not.toContain("sa@ichnos-e2e");
    expect(error.message).not.toContain("BEGIN KEY");
    expectNothingExternal();
  });

  it("refuses a --firebase-env path that resolves to server/.env", () => {
    writeFileSync(join(repoRoot, "server", ".env"), credentialFile(PROJECT));

    expect(() => prepare({ firebaseEnvPath: "server/.env" })).toThrowError(
      /Refusing to read Firebase credentials/,
    );
    expect(parse).not.toHaveBeenCalled();
  });

  it("names a missing credential key", () => {
    writeCredentials(`FIREBASE_PROJECT_ID=${PROJECT}\n`);

    expect(() => prepare()).toThrowError(
      /FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY/,
    );
  });

  it("names only the missing keys, never the credential file path", () => {
    writeCredentials(`FIREBASE_PROJECT_ID=${PROJECT}\n`);

    expect(() => prepare()).toThrowError(
      "Missing key(s) in the Firebase credential file: FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY",
    );
    expect(() => prepare()).toThrowError(
      expect.objectContaining({
        message: expect.not.stringContaining(repoRoot),
      }),
    );
    expectNothingExternal();
  });

  it("routes a missing credential project ID to the project guard", () => {
    writeCredentials(
      credentialFile(PROJECT).replace(/^FIREBASE_PROJECT_ID=.*\n/, ""),
    );

    expect(() => prepare()).toThrowError(
      `Firebase project mismatch: credential file is for "", e2e/.env.e2e names "${PROJECT}". Nothing was changed.`,
    );
    expectNothingExternal();
  });

  it("routes a missing E2E project ID to the project guard", () => {
    writeCredentials(credentialFile("ichnos-prod"));
    readEnvFile.mockReturnValue({
      ...e2eEnv(),
      FIREBASE_PROJECT_ID: undefined,
    });

    expect(() => prepare()).toThrowError(
      'Firebase project mismatch: credential file is for "ichnos-prod", e2e/.env.e2e names "". Nothing was changed.',
    );
    expectNothingExternal();
  });

  it("reports the project guard when the credential project ID and client email are both missing", () => {
    writeCredentials(
      credentialFile(PROJECT)
        .replace(/^FIREBASE_PROJECT_ID=.*\n/, "")
        .replace(/^FIREBASE_CLIENT_EMAIL=.*\n/m, ""),
    );

    expect(() => prepare()).toThrowError(
      `Firebase project mismatch: credential file is for "", e2e/.env.e2e names "${PROJECT}". Nothing was changed.`,
    );
    expect(() => prepare()).toThrowError(
      expect.objectContaining({
        message: expect.not.stringMatching(/FIREBASE_CLIENT_EMAIL|BEGIN KEY/),
      }),
    );
    expectNothingExternal();
  });

  it("reports the project guard when the E2E project ID and the private key are both missing", () => {
    writeCredentials(
      credentialFile("ichnos-prod").replace(/^FIREBASE_PRIVATE_KEY=.*\n/m, ""),
    );
    readEnvFile.mockReturnValue({
      ...e2eEnv(),
      FIREBASE_PROJECT_ID: undefined,
    });

    expect(() => prepare()).toThrowError(
      'Firebase project mismatch: credential file is for "ichnos-prod", e2e/.env.e2e names "". Nothing was changed.',
    );
    expect(() => prepare()).toThrowError(
      expect.objectContaining({
        message: expect.not.stringMatching(/FIREBASE_PRIVATE_KEY|sa@ichnos/),
      }),
    );
    expectNothingExternal();
  });

  it("never copies other keys of the credential file into process.env", () => {
    writeCredentials(
      credentialFile(PROJECT, "DATABASE_URL=postgres://secret@db/x"),
    );

    const { credentials } = prepare();

    expect(process.env.DATABASE_URL).toBeUndefined();
    expect(Object.keys(credentials)).toEqual([
      "projectId",
      "clientEmail",
      "privateKey",
    ]);
    expect(credentials.privateKey).toContain("\nabc\n");
    expect(config).not.toHaveBeenCalled();
  });

  it("generates six distinct long passwords that pass the guard", () => {
    writeCredentials(credentialFile(PROJECT));

    const { passwords } = prepare();
    const values = Object.values(passwords);

    expect(values).toHaveLength(6);
    expect(new Set(values).size).toBe(6);
    for (const value of values) expect(value.length).toBeGreaterThanOrEqual(32);
    expect(findPlaceholderPasswordNames({ ...e2eEnv(), ...passwords })).toEqual(
      [],
    );
  });
});

function resetArgs(passwords, order) {
  const env = { ...e2eEnv(), ...passwords };
  const syncGitHubConfig = vi.fn(() => {
    order.push("github");
    return { ghResults: [], varResults: [] };
  });
  return {
    ...buildCredentialMaps(env),
    env,
    envFilePath,
    serverDir: join(repoRoot, "server"),
    credentials: { projectId: PROJECT, clientEmail: "c", privateKey: "k" },
    passwords,
    syncGitHubConfig,
  };
}

describe("applyReset", () => {
  let passwords;
  let order;

  beforeEach(() => {
    writeCredentials(credentialFile(PROJECT));
    ({ passwords } = prepare());
    order = [];
    getPasswordResetApp.mockReturnValue({ auth: () => ({}) });
    upsertUser.mockImplementation(async (_auth, spec) => {
      order.push(`upsert:${spec.uidKey}`);
      return spec.uidKey.replace(/^E2E_(\w+)_UID$/, "uid-$1");
    });
    writePasswordsToEnvFile.mockImplementation(() => order.push("write"));
    syncToVercel.mockReturnValue([]);
  });

  it("upserts every role before writing, then syncs GitHub", async () => {
    await applyReset(resetArgs(passwords, order));

    expect(order).toEqual([
      ...ROLE_KEYS.map((key) => `upsert:E2E_${key}_UID`),
      "write",
      "github",
    ]);
    expect(writePasswordsToEnvFile).toHaveBeenCalledWith(
      envFilePath,
      passwords,
    );
  });

  it("writes nothing and syncs nothing when an upsert rejects", async () => {
    upsertUser.mockRejectedValueOnce(new Error("quota"));
    const args = resetArgs(passwords, order);

    await expect(applyReset(args)).rejects.toThrowError("quota");
    expect(writePasswordsToEnvFile).not.toHaveBeenCalled();
    expect(args.syncGitHubConfig).not.toHaveBeenCalled();
  });

  it("skips Vercel when no UID changed", async () => {
    await applyReset(resetArgs(passwords, order));

    expect(syncToVercel).not.toHaveBeenCalled();
    expect(writeUidsToEnvFile).not.toHaveBeenCalled();
  });

  it("sends only the changed role's email and UID to Vercel", async () => {
    upsertUser.mockImplementation(async (_auth, spec) =>
      spec.uidKey === "E2E_USER_UID" ? "uid-new" : "uid-unchanged",
    );
    const args = resetArgs(passwords, order);
    for (const key of ROLE_KEYS) args.env[`E2E_${key}_UID`] = "uid-unchanged";

    await applyReset(args);

    expect(writeUidsToEnvFile).toHaveBeenCalledWith(envFilePath, {
      E2E_USER_UID: "uid-new",
    });
    expect(syncToVercel).toHaveBeenCalledWith(
      {
        E2E_USER_EMAIL: "e2e-user@ichnos-test.com",
        E2E_USER_UID: "uid-new",
      },
      args.serverDir,
    );
  });

  it("never logs a generated password", async () => {
    await applyReset(resetArgs(passwords, order));

    const sent = upsertUser.mock.calls.map(([, spec]) => spec.password);
    expect(sent).toHaveLength(5);
    const output = logged.join("\n");
    for (const value of [...sent, ...Object.values(passwords)]) {
      expect(output).not.toContain(value);
    }
  });

  it("fails naming the missing role email before any Firebase call", async () => {
    const args = resetArgs(passwords, order);
    delete args.env.E2E_SUPER_ADMIN_EMAIL;

    await expect(applyReset(args)).rejects.toThrowError(
      /E2E_SUPER_ADMIN_EMAIL/,
    );
    expect(getPasswordResetApp).not.toHaveBeenCalled();
  });
});

describe("main with --reset-passwords", () => {
  it("rejects --sync-only combined with --reset-passwords before any work", async () => {
    await expect(
      main({ syncOnly: true, resetPasswords: true }),
    ).rejects.toThrowError(/cannot be combined/);
    expect(parse).not.toHaveBeenCalled();
    expectNothingExternal();
  });
});
