import { describe, it, expect } from "vitest";
import {
  buildCredentialMaps,
  findMissingGitHubNames,
} from "./e2eCredentials.js";

describe("buildCredentialMaps", () => {
  it("returns empty maps when no credentials are set", () => {
    const { github, vercel, firebaseCreds } = buildCredentialMaps({});

    expect(github).toEqual({});
    expect(vercel).toEqual({});
    expect(firebaseCreds).toEqual([]);
  });

  it("builds maps for admin-only input", () => {
    const env = {
      E2E_ADMIN_EMAIL: "admin@test.com",
      E2E_ADMIN_PASSWORD: "pass123",
      E2E_ADMIN_UID: "uid-admin",
    };

    const { github, vercel, firebaseCreds } = buildCredentialMaps(env);

    expect(github).toEqual({
      E2E_ADMIN_PASSWORD: "pass123",
    });
    expect(vercel).toEqual({
      E2E_ADMIN_EMAIL: "admin@test.com",
      E2E_ADMIN_UID: "uid-admin",
    });
    expect(firebaseCreds).toHaveLength(1);
    expect(firebaseCreds[0]).toEqual({
      email: "admin@test.com",
      password: "pass123",
      displayName: "E2E Admin",
      claims: { admin: true },
      uidKey: "E2E_ADMIN_UID",
    });
  });

  it("includes optional roles when their email is present", () => {
    const env = {
      E2E_ADMIN_EMAIL: "admin@test.com",
      E2E_ADMIN_PASSWORD: "adminpass",
      E2E_ADMIN_UID: "uid-admin",
      E2E_USER_EMAIL: "user@test.com",
      E2E_USER_PASSWORD: "userpass",
      E2E_USER_UID: "uid-user",
      E2E_SUPER_ADMIN_EMAIL: "super@test.com",
      E2E_SUPER_ADMIN_PASSWORD: "superpass",
      E2E_SUPER_ADMIN_UID: "uid-super",
    };

    const { github, vercel, firebaseCreds } = buildCredentialMaps(env);

    expect(Object.keys(github)).toEqual([
      "E2E_ADMIN_PASSWORD",
      "E2E_USER_PASSWORD",
      "E2E_SUPER_ADMIN_PASSWORD",
    ]);
    expect(Object.keys(vercel)).toEqual([
      "E2E_ADMIN_EMAIL",
      "E2E_ADMIN_UID",
      "E2E_USER_EMAIL",
      "E2E_USER_UID",
      "E2E_SUPER_ADMIN_EMAIL",
      "E2E_SUPER_ADMIN_UID",
    ]);
    expect(firebaseCreds).toHaveLength(3);
  });

  it("skips roles whose email is not set", () => {
    const env = {
      E2E_ADMIN_EMAIL: "admin@test.com",
      E2E_ADMIN_PASSWORD: "adminpass",
      E2E_ADMIN_UID: "uid-admin",
      E2E_USER_PASSWORD: "userpass",
      E2E_USER_UID: "uid-user",
    };

    const { github, vercel, firebaseCreds } = buildCredentialMaps(env);

    expect(github).not.toHaveProperty("E2E_USER_EMAIL");
    expect(vercel).not.toHaveProperty("E2E_USER_EMAIL");
    expect(firebaseCreds).toHaveLength(1);
  });

  it("maps UID keys correctly for Vercel payloads", () => {
    const env = {
      E2E_ADMIN_EMAIL: "a@t.com",
      E2E_ADMIN_PASSWORD: "p",
      E2E_ADMIN_UID: "uid-a",
      E2E_SUPER_ADMIN_EMAIL: "sa@t.com",
      E2E_SUPER_ADMIN_PASSWORD: "sp",
      E2E_SUPER_ADMIN_UID: "uid-sa",
    };

    const { vercel, firebaseCreds } = buildCredentialMaps(env);

    expect(vercel.E2E_ADMIN_UID).toBe("uid-a");
    expect(vercel.E2E_SUPER_ADMIN_UID).toBe("uid-sa");
    expect(firebaseCreds[0].uidKey).toBe("E2E_ADMIN_UID");
    expect(firebaseCreds[1].uidKey).toBe("E2E_SUPER_ADMIN_UID");
  });

  it("stores correct claims per role", () => {
    const env = {
      E2E_ADMIN_EMAIL: "a@t.com",
      E2E_ADMIN_PASSWORD: "p",
      E2E_ADMIN_UID: "u1",
      E2E_USER_EMAIL: "u@t.com",
      E2E_USER_PASSWORD: "p",
      E2E_USER_UID: "u2",
      E2E_SUPER_ADMIN_EMAIL: "sa@t.com",
      E2E_SUPER_ADMIN_PASSWORD: "p",
      E2E_SUPER_ADMIN_UID: "u3",
    };

    const { firebaseCreds } = buildCredentialMaps(env);

    const admin = firebaseCreds.find((c) => c.email === "a@t.com");
    const user = firebaseCreds.find((c) => c.email === "u@t.com");
    const superAdmin = firebaseCreds.find((c) => c.email === "sa@t.com");

    expect(admin.claims).toEqual({ admin: true });
    expect(user.claims).toEqual({});
    expect(superAdmin.claims).toEqual({ admin: true, superAdmin: true });
  });

  it("handles undefined password and UID gracefully", () => {
    const env = { E2E_ADMIN_EMAIL: "admin@test.com" };

    const { github, vercel, firebaseCreds } = buildCredentialMaps(env);

    expect(github.E2E_ADMIN_PASSWORD).toBeUndefined();
    expect(vercel.E2E_ADMIN_UID).toBeUndefined();
    expect(firebaseCreds[0].password).toBeUndefined();
  });
});

const VARIABLE_NAMES = [
  "FIREBASE_PROJECT_ID",
  "FIREBASE_AUTH_DOMAIN",
  "FIREBASE_STORAGE_BUCKET",
  "E2E_ADMIN_EMAIL",
  "E2E_ADMIN_UID",
  "E2E_USER_EMAIL",
  "E2E_USER_UID",
  "E2E_INCOMPLETE_USER_EMAIL",
  "E2E_INCOMPLETE_USER_UID",
  "E2E_SUPER_ADMIN_EMAIL",
  "E2E_SUPER_ADMIN_UID",
  "E2E_MANAGE_ADMIN_TARGET_EMAIL",
  "E2E_MANAGE_ADMIN_TARGET_UID",
  "E2E_BASE_URL",
  "E2E_API_BASE_URL",
];

const SECRET_NAMES = [
  "FIREBASE_API_KEY",
  "E2E_ADMIN_PASSWORD",
  "E2E_USER_PASSWORD",
  "E2E_INCOMPLETE_USER_PASSWORD",
  "E2E_SUPER_ADMIN_PASSWORD",
  "E2E_MANAGE_ADMIN_TARGET_PASSWORD",
  "E2E_SIGNUP_PASSWORD",
];

const FULL_ENV = Object.fromEntries(
  [...VARIABLE_NAMES, ...SECRET_NAMES].map((name) => [
    name,
    `value-of-${name}`,
  ]),
);

describe("buildCredentialMaps GitHub partition", () => {
  it("routes every variable name to githubVariables and none to github", () => {
    const { github, githubVariables } = buildCredentialMaps(FULL_ENV);

    expect(Object.keys(githubVariables).sort()).toEqual(
      [...VARIABLE_NAMES].sort(),
    );
    for (const name of VARIABLE_NAMES) {
      expect(github).not.toHaveProperty(name);
    }
  });

  it("routes every secret name to github and none to githubVariables", () => {
    const { github, githubVariables } = buildCredentialMaps(FULL_ENV);

    expect(Object.keys(github).sort()).toEqual([...SECRET_NAMES].sort());
    for (const name of SECRET_NAMES) {
      expect(githubVariables).not.toHaveProperty(name);
    }
  });

  it("never routes a password or the Firebase API key to githubVariables", () => {
    const { githubVariables } = buildCredentialMaps(FULL_ENV);
    const names = Object.keys(githubVariables);

    expect(names.filter((n) => n.endsWith("_PASSWORD"))).toEqual([]);
    expect(names).not.toContain("FIREBASE_API_KEY");
  });

  it("carries the env values into githubVariables", () => {
    const { githubVariables } = buildCredentialMaps(FULL_ENV);

    expect(githubVariables.E2E_BASE_URL).toBe("value-of-E2E_BASE_URL");
    expect(githubVariables.E2E_ADMIN_UID).toBe("value-of-E2E_ADMIN_UID");
  });
});

describe("findMissingGitHubNames", () => {
  it("returns an empty list for a complete env", () => {
    expect(findMissingGitHubNames(FULL_ENV)).toEqual([]);
  });

  it("returns the names of missing or empty values only", () => {
    const env = { ...FULL_ENV, E2E_USER_UID: "" };
    delete env.E2E_SIGNUP_PASSWORD;

    const missing = findMissingGitHubNames(env);

    expect(missing).toEqual(["E2E_USER_UID", "E2E_SIGNUP_PASSWORD"]);
    for (const value of Object.values(env)) {
      expect(missing).not.toContain(value);
    }
  });
});
