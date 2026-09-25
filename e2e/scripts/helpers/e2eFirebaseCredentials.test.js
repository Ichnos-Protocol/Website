import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mkdtempSync, mkdirSync, rmSync, symlinkSync, writeFileSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";

const { readFileSync, parse } = vi.hoisted(() => ({
  readFileSync: vi.fn(),
  parse: vi.fn(),
}));

vi.mock("fs", async (importOriginal) => {
  const actual = await importOriginal();
  readFileSync.mockImplementation(actual.readFileSync);
  return { ...actual, readFileSync };
});
vi.mock("dotenv", async (importOriginal) => {
  const actual = await importOriginal();
  parse.mockImplementation(actual.parse);
  return { ...actual, parse };
});

const { loadFirebaseCredentials, E2E_FIREBASE_PROJECT_ID } =
  await import("./e2eFirebaseCredentials.js");

const PROJECT = "ichnos-protocol-test";
const CLIENT_EMAIL = "sa@ichnos-protocol-test.iam.gserviceaccount.com";

function dotenvFile(projectId, clientEmail = CLIENT_EMAIL, extra = "") {
  return [
    `FIREBASE_PROJECT_ID=${projectId}`,
    `FIREBASE_CLIENT_EMAIL=${clientEmail}`,
    'FIREBASE_PRIVATE_KEY="-----BEGIN KEY-----\\nabc\\n-----END KEY-----"',
    extra,
    "",
  ].join("\n");
}

function serviceAccount(projectId, clientEmail = CLIENT_EMAIL) {
  return JSON.stringify({
    type: "service_account",
    project_id: projectId,
    client_email: clientEmail,
    private_key: "-----BEGIN KEY-----\nabc\n-----END KEY-----",
  });
}

let repoRoot;

function write(relativePath, content) {
  writeFileSync(join(repoRoot, relativePath), content, "utf8");
}

function load(extra = {}) {
  return loadFirebaseCredentials({ repoRoot, cwd: repoRoot, ...extra });
}

function readPaths() {
  return readFileSync.mock.calls.map(([path]) => String(path));
}

beforeEach(() => {
  vi.clearAllMocks();
  repoRoot = mkdtempSync(join(tmpdir(), "e2e-creds-"));
  mkdirSync(join(repoRoot, "server"));
});

afterEach(() => {
  rmSync(repoRoot, { recursive: true, force: true });
  delete process.env.DATABASE_URL;
});

describe("loadFirebaseCredentials source precedence", () => {
  it("exports the test project constant", () => {
    expect(E2E_FIREBASE_PROJECT_ID).toBe(PROJECT);
  });

  it("prefers --firebase-env over server/.env.e2e and secrets/", () => {
    mkdirSync(join(repoRoot, "secrets"));
    write("explicit.env", dotenvFile(PROJECT, "explicit@x"));
    write("server/.env.e2e", dotenvFile(PROJECT, "fallback@x"));
    write(`secrets/${PROJECT}-sa.json`, serviceAccount(PROJECT, "json@x"));

    expect(load({ firebaseEnvPath: "explicit.env" }).clientEmail).toBe(
      "explicit@x",
    );
  });

  it("prefers server/.env.e2e over secrets/", () => {
    mkdirSync(join(repoRoot, "secrets"));
    write("server/.env.e2e", dotenvFile(PROJECT, "fallback@x"));
    write(`secrets/${PROJECT}-sa.json`, serviceAccount(PROJECT, "json@x"));

    expect(load().clientEmail).toBe("fallback@x");
  });

  it("uses a single secrets/ service-account file when nothing else exists", () => {
    mkdirSync(join(repoRoot, "secrets"));
    write(`secrets/${PROJECT}-sa.json`, serviceAccount(PROJECT, "json@x"));

    expect(load()).toEqual({
      projectId: PROJECT,
      clientEmail: "json@x",
      privateKey: "-----BEGIN KEY-----\nabc\n-----END KEY-----",
    });
  });

  it("fails on a missing --firebase-env file instead of falling through", () => {
    write("server/.env.e2e", dotenvFile(PROJECT));

    expect(() => load({ firebaseEnvPath: "missing.env" })).toThrowError(
      /Firebase credential file not found/,
    );
  });

  it("names the three sources when none exists", () => {
    expect(() => load()).toThrowError(
      /--firebase-env <path>[\s\S]*server\/\.env\.e2e[\s\S]*secrets\/\*ichnos-protocol-test\*\.json/,
    );
    expect(readFileSync).not.toHaveBeenCalled();
  });
});

describe("loadFirebaseCredentials secrets/ selection", () => {
  it("refuses a service account for another project naming only the two IDs", () => {
    mkdirSync(join(repoRoot, "secrets"));
    write(
      `secrets/${PROJECT}-sa.json`,
      serviceAccount("ichnos-protocol", "prod@x"),
    );

    expect(() => load()).toThrowError(
      `Refusing Firebase project "ichnos-protocol": E2E provisioning is locked to "${PROJECT}". Nothing was changed.`,
    );
    expect(() => load()).toThrowError(
      expect.objectContaining({
        message: expect.not.stringMatching(/prod@x|BEGIN KEY|secrets/),
      }),
    );
  });

  it("refuses two matching files, naming the basenames, with nothing read", () => {
    mkdirSync(join(repoRoot, "secrets"));
    write(`secrets/${PROJECT}-a.json`, serviceAccount(PROJECT));
    write(`secrets/${PROJECT}-b.json`, serviceAccount(PROJECT));

    expect(() => load()).toThrowError(`${PROJECT}-a.json, ${PROJECT}-b.json`);
    expect(readFileSync).not.toHaveBeenCalled();
  });

  it("never opens a non-matching file in secrets/", () => {
    mkdirSync(join(repoRoot, "secrets"));
    write(
      "secrets/ichnos-protocol-prod.json",
      serviceAccount("ichnos-protocol"),
    );
    write(`secrets/${PROJECT}.txt`, "not json");
    write(`secrets/${PROJECT}-sa.json`, serviceAccount(PROJECT));

    load();

    const read = readPaths();
    expect(read).toHaveLength(1);
    expect(read[0]).toMatch(/ichnos-protocol-test-sa\.json$/);
  });
});

describe("loadFirebaseCredentials server/.env refusal", () => {
  it("refuses server/.env passed literally", () => {
    write("server/.env", dotenvFile(PROJECT));

    expect(() => load({ firebaseEnvPath: "server/.env" })).toThrowError(
      /Refusing to read Firebase credentials/,
    );
    expect(readFileSync).not.toHaveBeenCalled();
    expect(parse).not.toHaveBeenCalled();
  });

  it("refuses an alias whose target is server/.env", () => {
    write("server/.env", dotenvFile(PROJECT));
    // A junction needs no privilege on Windows; elsewhere it is a symlink.
    symlinkSync(join(repoRoot, "server"), join(repoRoot, "alias"), "junction");

    expect(() => load({ firebaseEnvPath: "alias/.env" })).toThrowError(
      /Refusing to read Firebase credentials/,
    );
    expect(readFileSync).not.toHaveBeenCalled();
    expect(parse).not.toHaveBeenCalled();
  });

  it("refuses the literal server/.env path when the file is missing", () => {
    expect(() => load({ firebaseEnvPath: "server/.env" })).toThrowError(
      /Refusing to read Firebase credentials/,
    );
    expect(parse).not.toHaveBeenCalled();
  });
});

describe("loadFirebaseCredentials parsing", () => {
  it("returns only the three keys and never touches process.env", () => {
    write(
      "server/.env.e2e",
      dotenvFile(PROJECT, CLIENT_EMAIL, "DATABASE_URL=postgres://secret@db/x"),
    );

    const credentials = load();

    expect(process.env.DATABASE_URL).toBeUndefined();
    expect(Object.keys(credentials)).toEqual([
      "projectId",
      "clientEmail",
      "privateKey",
    ]);
    expect(credentials.privateKey).toContain("\nabc\n");
  });

  it("refuses a dotenv file for another project", () => {
    write("server/.env.e2e", dotenvFile("ichnos-protocol"));

    expect(() => load()).toThrowError(
      /Refusing Firebase project "ichnos-protocol"/,
    );
  });

  it("routes a missing project ID to the project guard", () => {
    write(
      "server/.env.e2e",
      dotenvFile(PROJECT).replace(/^FIREBASE_PROJECT_ID=.*\n/, ""),
    );

    expect(() => load()).toThrowError(/Refusing Firebase project ""/);
  });

  it("names a missing key without the credential file path", () => {
    write("server/.env.e2e", `FIREBASE_PROJECT_ID=${PROJECT}\n`);

    expect(() => load()).toThrowError(
      "Missing key(s) in the Firebase credential file: FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY",
    );
    expect(() => load()).toThrowError(
      expect.objectContaining({
        message: expect.not.stringContaining(repoRoot),
      }),
    );
  });
});
