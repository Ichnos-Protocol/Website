import { describe, it, expect } from "vitest";
import {
  buildCredentialMaps,
  findMissingGitHubNames,
  expectedPasswordFor,
  findInvalidRoleEmailNames,
  findPasswordMismatchNames,
  passwordNames,
  patternPasswords,
  envFileNames,
  fixedE2EConfig,
  ROLES,
} from "./e2eCredentials.js";
import { E2E_FIREBASE_PROJECT_ID } from "./e2eFirebaseCredentials.js";

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

const EMAILS = {
  E2E_ADMIN_EMAIL: "e2e-admin@ichnos-test.com",
  E2E_USER_EMAIL: "e2e-user@ichnos-test.com",
  E2E_INCOMPLETE_USER_EMAIL: "e2e-incomplete@ichnos-test.com",
  E2E_SUPER_ADMIN_EMAIL: "e2e-superadmin@ichnos-test.com",
  E2E_MANAGE_ADMIN_TARGET_EMAIL: "e2e-manage-target@ichnos-test.com",
};

const PATTERN = {
  E2E_ADMIN_PASSWORD: "adminadmin",
  E2E_USER_PASSWORD: "useruser",
  E2E_INCOMPLETE_USER_PASSWORD: "incomplete",
  E2E_SUPER_ADMIN_PASSWORD: "superadmin",
  E2E_MANAGE_ADMIN_TARGET_PASSWORD: "manage-target",
  E2E_SIGNUP_PASSWORD: "signup",
};

describe("passwordNames", () => {
  it("lists the five role passwords, then the signup password", () => {
    expect(passwordNames()).toEqual([
      "E2E_ADMIN_PASSWORD",
      "E2E_USER_PASSWORD",
      "E2E_INCOMPLETE_USER_PASSWORD",
      "E2E_SUPER_ADMIN_PASSWORD",
      "E2E_MANAGE_ADMIN_TARGET_PASSWORD",
      "E2E_SIGNUP_PASSWORD",
    ]);
  });
});

describe("expectedPasswordFor and patternPasswords", () => {
  it.each(Object.entries(PATTERN))("derives %s as %s", (name, value) => {
    expect(expectedPasswordFor(name, EMAILS)).toBe(value);
  });

  it("builds the six pattern values keyed in passwordNames() order", () => {
    const passwords = patternPasswords(EMAILS);

    expect(passwords).toEqual(PATTERN);
    expect(Object.keys(passwords)).toEqual(passwordNames());
  });

  it("doubles a 5-character role word and keeps a 6-character one", () => {
    const values = {
      E2E_USER_EMAIL: "e2e-abcde@ichnos-test.com",
      E2E_ADMIN_EMAIL: "e2e-abcdef@ichnos-test.com",
    };

    expect(expectedPasswordFor("E2E_USER_PASSWORD", values)).toBe("abcdeabcde");
    expect(expectedPasswordFor("E2E_ADMIN_PASSWORD", values)).toBe("abcdef");
  });

  it.each([
    "admin@ichnos-test.com",
    "xe2e-admin@ichnos-test.com",
    "e2e-@ichnos-test.com",
    "E2E-admin@ichnos-test.com",
    "E2e-admin@ichnos-test.com",
    " e2e-admin@ichnos-test.com",
    "\te2e-admin@ichnos-test.com",
  ])("refuses the role email %j by variable name only", (email) => {
    const values = { ...EMAILS, E2E_ADMIN_EMAIL: email };
    const localPart = email.split("@")[0].trim();

    expect(() =>
      expectedPasswordFor("E2E_ADMIN_PASSWORD", values),
    ).toThrowError(
      expect.objectContaining({
        message: expect.stringMatching(/E2E_ADMIN_EMAIL.*E2E_ADMIN_PASSWORD/),
      }),
    );
    expect(() =>
      expectedPasswordFor("E2E_ADMIN_PASSWORD", values),
    ).toThrowError(
      expect.objectContaining({
        message: expect.not.stringMatching(
          new RegExp(`${localPart}@|adminadmin|ichnos-test`),
        ),
      }),
    );
  });

  it("returns undefined for an absent email and omits it from the map", () => {
    const values = { ...EMAILS };
    delete values.E2E_USER_EMAIL;

    expect(expectedPasswordFor("E2E_USER_PASSWORD", values)).toBeUndefined();
    expect(patternPasswords(values)).not.toHaveProperty("E2E_USER_PASSWORD");
    expect(Object.keys(patternPasswords(values))).toHaveLength(5);
  });
});

describe("findPasswordMismatchNames", () => {
  it("returns an empty list for the six pattern values", () => {
    expect(findPasswordMismatchNames({ ...EMAILS, ...PATTERN })).toEqual([]);
  });

  it("returns the one wrong name and neither the supplied nor the expected value", () => {
    const values = { ...EMAILS, ...PATTERN, E2E_USER_PASSWORD: "hunter22" };
    const names = findPasswordMismatchNames(values);

    expect(names).toEqual(["E2E_USER_PASSWORD"]);
    expect(names.join(" ")).not.toContain("hunter22");
    expect(names.join(" ")).not.toContain("useruser");
  });

  it("compares strictly, without trimming or case folding", () => {
    const values = {
      ...EMAILS,
      ...PATTERN,
      E2E_ADMIN_PASSWORD: " adminadmin",
      E2E_SIGNUP_PASSWORD: "Signup",
    };

    expect(findPasswordMismatchNames(values)).toEqual([
      "E2E_ADMIN_PASSWORD",
      "E2E_SIGNUP_PASSWORD",
    ]);
  });

  it("returns several mismatches in passwordNames() order", () => {
    const values = {
      ...EMAILS,
      E2E_SIGNUP_PASSWORD: "x",
      E2E_MANAGE_ADMIN_TARGET_PASSWORD: "x",
      E2E_ADMIN_PASSWORD: "x",
    };

    expect(findPasswordMismatchNames(values)).toEqual([
      "E2E_ADMIN_PASSWORD",
      "E2E_MANAGE_ADMIN_TARGET_PASSWORD",
      "E2E_SIGNUP_PASSWORD",
    ]);
  });

  it("ignores missing and empty values", () => {
    expect(
      findPasswordMismatchNames({ ...EMAILS, E2E_ADMIN_PASSWORD: "" }),
    ).toEqual([]);
    expect(findPasswordMismatchNames({ E2E_USER_PASSWORD: "x" })).toEqual([]);
  });

  it("skips a password whose email is invalid instead of throwing", () => {
    const values = {
      ...EMAILS,
      E2E_ADMIN_EMAIL: "admin@ichnos-test.com",
      E2E_ADMIN_PASSWORD: "x",
    };

    expect(findPasswordMismatchNames(values)).toEqual([]);
  });
});

describe("findInvalidRoleEmailNames", () => {
  it("returns only the offending email variable names", () => {
    const values = {
      ...EMAILS,
      E2E_USER_EMAIL: "user@ichnos-test.com",
      E2E_SUPER_ADMIN_EMAIL: "e2e-@ichnos-test.com",
    };
    const names = findInvalidRoleEmailNames(values);

    expect(names).toEqual(["E2E_USER_EMAIL", "E2E_SUPER_ADMIN_EMAIL"]);
    expect(names.join(" ")).not.toContain("ichnos-test");
  });

  it("refuses an uppercase prefix and a whitespace-prefixed local part by name only", () => {
    const values = {
      ...EMAILS,
      E2E_ADMIN_EMAIL: "E2E-admin@ichnos-test.com",
      E2E_USER_EMAIL: " e2e-user@ichnos-test.com",
      E2E_ADMIN_PASSWORD: "adminadmin",
      E2E_USER_PASSWORD: "useruser",
    };
    const names = findInvalidRoleEmailNames(values);

    expect(names).toEqual(["E2E_ADMIN_EMAIL", "E2E_USER_EMAIL"]);
    expect(names.join(" ")).not.toMatch(/ichnos-test|adminadmin|useruser/i);
    expect(findPasswordMismatchNames(values)).toEqual([]);
  });

  it("ignores absent emails and accepts the canonical ones", () => {
    expect(findInvalidRoleEmailNames(EMAILS)).toEqual([]);
    expect(findInvalidRoleEmailNames({})).toEqual([]);
  });
});

describe("fixed E2E configuration", () => {
  it("fixes the five role emails", () => {
    expect(ROLES.map((r) => r.email)).toEqual(Object.values(EMAILS));
    const fixed = fixedE2EConfig();
    for (const [name, email] of Object.entries(EMAILS)) {
      expect(fixed[name]).toBe(email);
    }
  });

  it("reuses the project ID the credential loader is locked to", () => {
    expect(fixedE2EConfig().FIREBASE_PROJECT_ID).toBe(E2E_FIREBASE_PROJECT_ID);
  });

  it("derives the six pattern passwords from the fixed emails", () => {
    expect(patternPasswords(fixedE2EConfig())).toEqual(PATTERN);
  });

  it("lists exactly the names findMissingGitHubNames reports for an empty env", () => {
    expect(envFileNames()).toEqual(findMissingGitHubNames({}));
  });
});
