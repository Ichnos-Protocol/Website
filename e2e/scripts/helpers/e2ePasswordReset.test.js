import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { tmpdir } from "os";

const execFileSync = vi.fn();
const spawnSync = vi.fn();
const readEnvFile = vi.fn();
const writePasswordsToEnvFile = vi.fn();
const writeUidsToEnvFile = vi.fn();
const getTestApp = vi.fn();
const upsertUser = vi.fn();
const syncToVercel = vi.fn();
const parse = vi.fn();

vi.mock("child_process", () => ({ execFileSync, spawnSync }));
vi.mock("dotenv", async (importOriginal) => {
  const actual = await importOriginal();
  parse.mockImplementation(actual.parse);
  return { ...actual, parse };
});
vi.mock("./e2eEnvFile.js", async (importOriginal) => ({
  ...(await importOriginal()),
  readEnvFile,
  writePasswordsToEnvFile,
  writeUidsToEnvFile,
}));
vi.mock("./firebaseTestSetup.js", () => ({ getTestApp, upsertUser }));
vi.mock("./e2eSyncVercel.js", () => ({ syncToVercel }));

const { prepareReset, applyReset } = await import("./e2ePasswordReset.js");
const { buildCredentialMaps, passwordNames } =
  await import("./e2eCredentials.js");
const { main } = await import("../provision-e2e-firebase-users.js");

const PROJECT = "ichnos-protocol-test";
const ROLE_LOCAL_PARTS = {
  ADMIN: "e2e-admin",
  USER: "e2e-user",
  INCOMPLETE_USER: "e2e-incomplete",
  SUPER_ADMIN: "e2e-superadmin",
  MANAGE_ADMIN_TARGET: "e2e-manage-target",
};
const ROLE_KEYS = Object.keys(ROLE_LOCAL_PARTS);

const PATTERN = {
  E2E_ADMIN_PASSWORD: "adminadmin",
  E2E_USER_PASSWORD: "useruser",
  E2E_INCOMPLETE_USER_PASSWORD: "incomplete",
  E2E_SUPER_ADMIN_PASSWORD: "superadmin",
  E2E_MANAGE_ADMIN_TARGET_PASSWORD: "manage-target",
  E2E_SIGNUP_PASSWORD: "signup",
};

function e2eEnv() {
  const env = { FIREBASE_PROJECT_ID: PROJECT };
  for (const key of ROLE_KEYS) {
    env[`E2E_${key}_EMAIL`] = `${ROLE_LOCAL_PARTS[key]}@ichnos-test.com`;
    env[`E2E_${key}_UID`] = `uid-${key}`;
  }
  return env;
}

const CREDENTIALS = {
  projectId: PROJECT,
  clientEmail: "sa@ichnos-protocol-test.iam.gserviceaccount.com",
  privateKey: "-----BEGIN KEY-----\nabc\n-----END KEY-----",
};

let repoRoot;
let envFilePath;
let logged;

function prepare() {
  return prepareReset({ credentials: CREDENTIALS, envFilePath });
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
});

function expectNothingExternal() {
  expect(getTestApp).not.toHaveBeenCalled();
  expect(upsertUser).not.toHaveBeenCalled();
  expect(execFileSync).not.toHaveBeenCalled();
  expect(spawnSync).not.toHaveBeenCalled();
  expect(writePasswordsToEnvFile).not.toHaveBeenCalled();
  expect(writeUidsToEnvFile).not.toHaveBeenCalled();
}

describe("prepareReset", () => {
  it("rejects a stale e2e/.env.e2e project naming only the two project IDs", () => {
    readEnvFile.mockReturnValue({
      ...e2eEnv(),
      FIREBASE_PROJECT_ID: "ichnos-e2e",
    });

    expect(() => prepare()).toThrowError(
      `Firebase project mismatch: credential file is for "${PROJECT}", e2e/.env.e2e names "ichnos-e2e". Nothing was changed.`,
    );
    expect(() => prepare()).toThrowError(
      expect.objectContaining({
        message: expect.not.stringMatching(/sa@ichnos|BEGIN KEY/),
      }),
    );
    expectNothingExternal();
  });

  it("routes a missing E2E project ID to the project guard", () => {
    readEnvFile.mockReturnValue({
      ...e2eEnv(),
      FIREBASE_PROJECT_ID: undefined,
    });

    expect(() => prepare()).toThrowError(
      `Firebase project mismatch: credential file is for "${PROJECT}", e2e/.env.e2e names "". Nothing was changed.`,
    );
    expectNothingExternal();
  });

  it("returns exactly the six pattern passwords keyed by passwordNames()", () => {
    const { passwords } = prepare();

    expect(passwords).toEqual(PATTERN);
    expect(Object.keys(passwords)).toEqual(passwordNames());
    expectNothingExternal();
  });

  it("refuses a role email without the e2e- prefix after the project guard", () => {
    readEnvFile.mockReturnValue({
      ...e2eEnv(),
      E2E_USER_EMAIL: "user@ichnos-test.com",
    });

    expect(() => prepare()).toThrowError(
      expect.objectContaining({
        message: expect.stringMatching(/E2E_USER_EMAIL/),
      }),
    );
    expect(() => prepare()).toThrowError(
      expect.objectContaining({
        message: expect.not.stringMatching(/useruser|user@ichnos/),
      }),
    );
    expectNothingExternal();
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
    ({ passwords } = prepare());
    order = [];
    getTestApp.mockReturnValue({ auth: () => ({}) });
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
    expect(writePasswordsToEnvFile).toHaveBeenCalledWith(envFilePath, PATTERN);
    const sent = Object.fromEntries(
      upsertUser.mock.calls.map(([, spec]) => [spec.uidKey, spec.password]),
    );
    expect(sent).toEqual(
      Object.fromEntries(
        ROLE_KEYS.map((key) => [
          `E2E_${key}_UID`,
          PATTERN[`E2E_${key}_PASSWORD`],
        ]),
      ),
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

  it("never logs a pattern password", async () => {
    await applyReset(resetArgs(passwords, order));

    const sent = upsertUser.mock.calls.map(([, spec]) => spec.password);
    expect(sent).toHaveLength(5);
    const output = logged.join("\n");
    for (const value of [...sent, ...Object.values(PATTERN)]) {
      expect(output).not.toContain(value);
    }
  });

  it("fails naming the missing role email before any Firebase call", async () => {
    const args = resetArgs(passwords, order);
    delete args.env.E2E_SUPER_ADMIN_EMAIL;

    await expect(applyReset(args)).rejects.toThrowError(
      /E2E_SUPER_ADMIN_EMAIL/,
    );
    expect(getTestApp).not.toHaveBeenCalled();
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

describe("pattern passwords are never random", () => {
  it("imports neither randomBytes nor node:crypto in the password sources", () => {
    const here = dirname(fileURLToPath(import.meta.url));
    const sources = [
      join(here, "e2eCredentials.js"),
      join(here, "e2ePasswordReset.js"),
      join(here, "..", "provision-e2e-firebase-users.js"),
    ];

    for (const file of sources) {
      expect(readFileSync(file, "utf8")).not.toMatch(/randomBytes|node:crypto/);
    }
  });
});
