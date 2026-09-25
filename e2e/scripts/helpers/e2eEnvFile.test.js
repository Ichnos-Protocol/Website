import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import {
  captureExportedPasswords,
  mergeEnvPasswords,
  readPreservedWebConfig,
  writeEnvFile,
} from "./e2eEnvFile.js";
import {
  envFileNames,
  fixedE2EConfig,
  patternPasswords,
} from "./e2eCredentials.js";

describe("mergeEnvPasswords", () => {
  const savedEnv = {};

  beforeEach(() => {
    savedEnv.ADMIN = process.env.E2E_ADMIN_PASSWORD;
    savedEnv.USER = process.env.E2E_USER_PASSWORD;
    delete process.env.E2E_ADMIN_PASSWORD;
    delete process.env.E2E_USER_PASSWORD;
  });

  afterEach(() => {
    if (savedEnv.ADMIN !== undefined) {
      process.env.E2E_ADMIN_PASSWORD = savedEnv.ADMIN;
    } else {
      delete process.env.E2E_ADMIN_PASSWORD;
    }
    if (savedEnv.USER !== undefined) {
      process.env.E2E_USER_PASSWORD = savedEnv.USER;
    } else {
      delete process.env.E2E_USER_PASSWORD;
    }
  });

  it("returns file env unchanged when no passwords in process.env", () => {
    const fileEnv = { E2E_ADMIN_EMAIL: "a@test.com", FIREBASE_API_KEY: "key" };
    const result = mergeEnvPasswords(fileEnv, captureExportedPasswords());
    expect(result).toEqual(fileEnv);
  });

  it("merges shell-exported password into file env", () => {
    process.env.E2E_ADMIN_PASSWORD = "shell-pass";
    const fileEnv = { E2E_ADMIN_EMAIL: "a@test.com" };
    const result = mergeEnvPasswords(fileEnv, captureExportedPasswords());
    expect(result.E2E_ADMIN_PASSWORD).toBe("shell-pass");
    expect(result.E2E_ADMIN_EMAIL).toBe("a@test.com");
  });

  it("shell password overrides file password", () => {
    process.env.E2E_ADMIN_PASSWORD = "shell-pass";
    const fileEnv = {
      E2E_ADMIN_EMAIL: "a@test.com",
      E2E_ADMIN_PASSWORD: "file-pass",
    };
    const result = mergeEnvPasswords(fileEnv, captureExportedPasswords());
    expect(result.E2E_ADMIN_PASSWORD).toBe("shell-pass");
  });

  it("does not merge non-password keys from process.env", () => {
    process.env.E2E_ADMIN_PASSWORD = "shell-pass";
    const fileEnv = { E2E_ADMIN_EMAIL: "a@test.com" };
    const result = mergeEnvPasswords(fileEnv, captureExportedPasswords());
    expect(result).not.toHaveProperty("PATH");
    expect(result).not.toHaveProperty("HOME");
  });

  it("merges multiple password keys", () => {
    process.env.E2E_ADMIN_PASSWORD = "admin-pass";
    process.env.E2E_USER_PASSWORD = "user-pass";
    const fileEnv = { E2E_ADMIN_EMAIL: "a@test.com" };
    const result = mergeEnvPasswords(fileEnv, captureExportedPasswords());
    expect(result.E2E_ADMIN_PASSWORD).toBe("admin-pass");
    expect(result.E2E_USER_PASSWORD).toBe("user-pass");
  });

  it("does not mutate the original file env object", () => {
    process.env.E2E_ADMIN_PASSWORD = "shell-pass";
    const fileEnv = { E2E_ADMIN_EMAIL: "a@test.com" };
    mergeEnvPasswords(fileEnv, captureExportedPasswords());
    expect(fileEnv).not.toHaveProperty("E2E_ADMIN_PASSWORD");
  });

  it("ignores empty-string password in process.env", () => {
    process.env.E2E_ADMIN_PASSWORD = "";
    const fileEnv = { E2E_ADMIN_PASSWORD: "file-pass" };
    const result = mergeEnvPasswords(fileEnv, captureExportedPasswords());
    expect(result.E2E_ADMIN_PASSWORD).toBe("file-pass");
  });

  it("honours the snapshot and ignores process.env writes made after it", () => {
    process.env.E2E_ADMIN_PASSWORD = "snapshot-pass";
    const snapshot = captureExportedPasswords();
    process.env.E2E_USER_PASSWORD = "late-pass";
    const fileEnv = { E2E_USER_PASSWORD: "file-user-pass" };
    const result = mergeEnvPasswords(fileEnv, snapshot);
    expect(result.E2E_ADMIN_PASSWORD).toBe("snapshot-pass");
    expect(result.E2E_USER_PASSWORD).toBe("file-user-pass");
  });

  it("reads nothing from process.env when no snapshot is passed", () => {
    process.env.E2E_ADMIN_PASSWORD = "shell-pass";
    const result = mergeEnvPasswords({ E2E_ADMIN_PASSWORD: "file-pass" });
    expect(result.E2E_ADMIN_PASSWORD).toBe("file-pass");
  });
});

const COMMAND = "node e2e/scripts/provision-e2e-firebase-users.js";
const NOW = new Date("2026-09-24T23:30:00Z");
const WEB_CONFIG = {
  FIREBASE_API_KEY: "api-key-fixture",
  FIREBASE_AUTH_DOMAIN: "ichnos-protocol-test.firebaseapp.com",
  FIREBASE_STORAGE_BUCKET: "ichnos-protocol-test.appspot.com",
};
const UIDS = {
  E2E_ADMIN_UID: "uid-a",
  E2E_USER_UID: "uid-u",
  E2E_INCOMPLETE_USER_UID: "uid-i",
  E2E_SUPER_ADMIN_UID: "uid-s",
  E2E_MANAGE_ADMIN_TARGET_UID: "uid-m",
};

function generatedValues(webConfig) {
  const fixed = fixedE2EConfig();
  return { ...fixed, ...webConfig, ...patternPasswords(fixed), ...UIDS };
}

function keyLines(content) {
  return content.split("\n").filter((line) => line && !line.startsWith("#"));
}

describe("writeEnvFile", () => {
  let tmpDir;
  let tmpFile;

  beforeEach(() => {
    tmpDir = mkdtempSync(join(tmpdir(), "e2e-env-"));
    tmpFile = join(tmpDir, ".env.e2e");
  });

  afterEach(() => {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  function generate() {
    const values = generatedValues(readPreservedWebConfig(tmpFile));
    writeEnvFile(tmpFile, values, { command: COMMAND, now: NOW });
    return readFileSync(tmpFile, "utf8");
  }

  it("emits exactly the envFileNames() keys, in that order, with one trailing newline", () => {
    const content = generate();

    const names = keyLines(content).map((line) => line.split("=")[0]);
    expect(names).toEqual(envFileNames());
    expect(content.endsWith("\n")).toBe(true);
    expect(content.endsWith("\n\n")).toBe(false);
  });

  it("writes the fixed emails, URLs and project, the pattern passwords and the UIDs", () => {
    const content = generate();

    const fixed = fixedE2EConfig();
    const expected = { ...fixed, ...patternPasswords(fixed), ...UIDS };
    for (const [name, value] of Object.entries(expected)) {
      expect(keyLines(content)).toContain(`${name}=${value}`);
    }
  });

  it("names the injected UTC date and the exact command in the header", () => {
    const content = generate();

    const header = content.split("\n").slice(0, 2);
    expect(header[0]).toBe(`# Generated on 2026-09-24 (UTC) by: ${COMMAND}`);
    expect(header[1]).toMatch(/do not edit by hand/);
  });

  it("carries the three web-config values over from an earlier file", () => {
    const prior = Object.entries(WEB_CONFIG).map(([k, v]) => `${k}=${v}`);
    writeFileSync(tmpFile, `${prior.join("\n")}\n`, "utf8");

    const lines = keyLines(generate());

    for (const [name, value] of Object.entries(WEB_CONFIG)) {
      expect(lines).toContain(`${name}=${value}`);
    }
  });

  it("emits the web-config names empty when no earlier file exists", () => {
    const lines = keyLines(generate());

    for (const name of Object.keys(WEB_CONFIG)) {
      expect(lines).toContain(`${name}=`);
    }
  });

  it("drops an unrelated stale line from an earlier file", () => {
    writeFileSync(
      tmpFile,
      "STALE_NAME=stale-value\nE2E_ADMIN_PASSWORD=old\n",
      "utf8",
    );

    const content = generate();

    expect(content).not.toContain("STALE_NAME");
    expect(content).not.toContain("E2E_ADMIN_PASSWORD=old\n");
  });
});

describe("readPreservedWebConfig", () => {
  it("returns {} for a missing file without throwing", () => {
    expect(
      readPreservedWebConfig(join(tmpdir(), "no-such-dir", ".env")),
    ).toEqual({});
  });
});
