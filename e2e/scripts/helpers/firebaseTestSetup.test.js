import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const admin = vi.hoisted(() => ({
  apps: [],
  initializeApp: vi.fn(),
  credential: { cert: vi.fn() },
}));

vi.mock("firebase-admin", () => ({ default: admin }));

const { getTestApp, provisionFirebaseUsers, setupFirebaseTestUsers } =
  await import("./firebaseTestSetup.js");

const TEST_PROJECT = "ichnos-protocol-test";
const APP_NAME = "test-setup";
const SENTINEL_EMAIL = "sentinel-sa@ichnos-protocol.iam.gserviceaccount.com";
const SENTINEL_KEY = "-----BEGIN SENTINEL KEY-----";
const FIREBASE_ENV_KEYS = [
  "FIREBASE_PROJECT_ID",
  "FIREBASE_CLIENT_EMAIL",
  "FIREBASE_PRIVATE_KEY",
  "FIREBASE_STORAGE_BUCKET",
  "E2E_USER_EMAIL",
  "E2E_USER_PASSWORD",
];

function credentials(projectId) {
  return { projectId, clientEmail: "sa@x", privateKey: "key" };
}

function expectNoInitialization() {
  expect(admin.initializeApp).not.toHaveBeenCalled();
  expect(admin.credential.cert).not.toHaveBeenCalled();
}

let savedEnv;

beforeEach(() => {
  vi.clearAllMocks();
  admin.apps.length = 0;
  admin.credential.cert.mockImplementation((cert) => ({ cert }));
  admin.initializeApp.mockImplementation((_options, name) => {
    const app = { name, auth: () => ({}) };
    admin.apps.push(app);
    return app;
  });
  savedEnv = Object.fromEntries(
    FIREBASE_ENV_KEYS.map((key) => [key, process.env[key]]),
  );
  for (const key of FIREBASE_ENV_KEYS) delete process.env[key];
  vi.spyOn(console, "log").mockImplementation(() => {});
});

afterEach(() => {
  for (const [key, value] of Object.entries(savedEnv)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
});

describe("getTestApp", () => {
  it.each([
    ["the production project", "ichnos-protocol"],
    ["an empty project ID", ""],
    ["a missing project ID", undefined],
    ["a lookalike project ID", "ichnos-protocol-test-x"],
  ])("refuses %s without initializing an app", (_label, projectId) => {
    expect(() => getTestApp(credentials(projectId))).toThrowError(
      /locked to "ichnos-protocol-test"/,
    );
    expectNoInitialization();
  });

  it("initializes the test project once under the expected app name", () => {
    const app = getTestApp(credentials(TEST_PROJECT));
    const again = getTestApp(credentials(TEST_PROJECT));

    expect(app.name).toBe(APP_NAME);
    expect(again).toBe(app);
    expect(admin.initializeApp).toHaveBeenCalledTimes(1);
    expect(admin.initializeApp.mock.calls[0][1]).toBe(APP_NAME);
    expect(admin.credential.cert).toHaveBeenCalledWith(
      credentials(TEST_PROJECT),
    );
  });

  it("refuses a wrong project even when an app is already cached", () => {
    admin.apps.push({ name: APP_NAME, auth: () => ({}) });

    expect(() => getTestApp(credentials("ichnos-protocol"))).toThrowError(
      /Refusing Firebase project "ichnos-protocol"/,
    );
    expectNoInitialization();
  });

  it("refuses a non-test FIREBASE_PROJECT_ID from process.env", async () => {
    process.env.FIREBASE_PROJECT_ID = "ichnos-protocol";
    process.env.E2E_USER_EMAIL = "e2e-user@ichnos-test.com";
    process.env.E2E_USER_PASSWORD = "secret-user-value";

    await expect(setupFirebaseTestUsers()).rejects.toThrowError(
      /Refusing Firebase project "ichnos-protocol"/,
    );
    await expect(provisionFirebaseUsers([])).rejects.toThrowError(
      /locked to "ichnos-protocol-test"/,
    );
    expectNoInitialization();
  });

  it("names both project IDs and never the client email or private key", () => {
    process.env.FIREBASE_PROJECT_ID = "ichnos-protocol";
    process.env.FIREBASE_CLIENT_EMAIL = SENTINEL_EMAIL;
    process.env.FIREBASE_PRIVATE_KEY = SENTINEL_KEY;

    const error = (() => {
      try {
        getTestApp();
      } catch (err) {
        return err;
      }
    })();

    expect(error.message).toContain('"ichnos-protocol"');
    expect(error.message).toContain(`"${TEST_PROJECT}"`);
    expect(error.message).not.toContain(SENTINEL_EMAIL);
    expect(error.message).not.toContain(SENTINEL_KEY);
    expectNoInitialization();
  });
});
