import { describe, it, expect, vi, beforeEach } from "vitest";

import {
  jsonEqual,
  providerCode,
  SIGN_IN_ENDPOINT,
  syncFirebaseAccounts,
} from "./e2eFirebaseAccountSync.js";

const PASSWORD = "sentinel-password-value";
const API_KEY = "sentinel-api-key-value";
const ID_TOKEN = "sentinel-id-token-value";
const REFRESH_TOKEN = "sentinel-refresh-token-value";
const SECRETS = [PASSWORD, API_KEY, ID_TOKEN, REFRESH_TOKEN];

const ROLES = ["USER", "ADMIN", "SUPERADMIN", "SIGNUP", "OTHER"];
const SPECS = ROLES.map((role, i) => ({
  email: `e2e-${role.toLowerCase()}@ichnos-test.com`,
  password: `${PASSWORD}-${i}`,
  displayName: `E2E ${role}`,
  claims: i === 1 ? { admin: true, meta: { level: 1, tags: ["a"] } } : {},
  uidKey: `E2E_${role}_UID`,
}));

function existingUser(spec, overrides = {}) {
  return {
    uid: `uid-${spec.uidKey}`,
    email: spec.email,
    displayName: spec.displayName,
    disabled: false,
    customClaims: spec.claims,
    ...overrides,
  };
}

function fakeAuth(users = {}) {
  return {
    getUserByEmail: vi.fn(async (email) => {
      const spec = SPECS.find((s) => s.email === email);
      if (users[email] === null) {
        throw Object.assign(new Error("no user"), {
          code: "auth/user-not-found",
        });
      }
      return users[email] ?? existingUser(spec);
    }),
    createUser: vi.fn(async ({ email }) => ({ uid: `new-${email}` })),
    updateUser: vi.fn(async () => ({})),
    setCustomUserClaims: vi.fn(async () => undefined),
  };
}

function jsonResponse(ok, body) {
  return { ok, json: vi.fn(async () => body) };
}

const SUCCESS_BODY = { idToken: ID_TOKEN, refreshToken: REFRESH_TOKEN };

function errorBody(message) {
  return { error: { code: 400, message } };
}

// Resolves success for every email except those mapped to a response.
function fakeFetch(byEmail = {}) {
  return vi.fn(async (_url, init) => {
    const { email } = JSON.parse(init.body);
    return byEmail[email] ?? jsonResponse(true, SUCCESS_BODY);
  });
}

let log;

function output() {
  return log.mock.calls.map((args) => args.join(" ")).join("\n");
}

function expectNoWrites(auth) {
  expect(auth.createUser).not.toHaveBeenCalled();
  expect(auth.updateUser).not.toHaveBeenCalled();
  expect(auth.setCustomUserClaims).not.toHaveBeenCalled();
}

function expectNoSecrets(text) {
  for (const secret of SECRETS) expect(text).not.toContain(secret);
}

function run(auth, fetchImpl, specs = SPECS) {
  return syncFirebaseAccounts({ auth, specs, apiKey: API_KEY, fetchImpl });
}

beforeEach(() => {
  vi.restoreAllMocks();
  log = vi.spyOn(console, "log").mockImplementation(() => {});
});

describe("jsonEqual", () => {
  it("ignores object key order", () => {
    expect(
      jsonEqual({ a: 1, b: { c: 2, d: 3 } }, { b: { d: 3, c: 2 }, a: 1 }),
    ).toBe(true);
  });

  it("compares arrays by index and rejects extra keys or type changes", () => {
    expect(jsonEqual([1, 2], [2, 1])).toBe(false);
    expect(jsonEqual({ a: 1 }, { a: 1, b: 2 })).toBe(false);
    expect(jsonEqual({ a: [] }, { a: {} })).toBe(false);
    expect(jsonEqual(null, {})).toBe(false);
  });
});

describe("providerCode", () => {
  it("returns the leading token before any detail", () => {
    expect(providerCode(errorBody("TOO_MANY_ATTEMPTS_TRY_LATER : wait"))).toBe(
      "TOO_MANY_ATTEMPTS_TRY_LATER",
    );
    expect(providerCode(errorBody("WEAK_PASSWORD:detail"))).toBe(
      "WEAK_PASSWORD",
    );
  });

  it("returns UNKNOWN when no message is present", () => {
    expect(providerCode({})).toBe("UNKNOWN");
    expect(providerCode(null)).toBe("UNKNOWN");
  });
});

describe("syncFirebaseAccounts", () => {
  it("writes nothing when every account already matches", async () => {
    const auth = fakeAuth();
    const fetchImpl = fakeFetch();

    const { uidMap, results } = await run(auth, fetchImpl);

    expectNoWrites(auth);
    expect(results.map((r) => r.status)).toEqual(Array(5).fill("unchanged"));
    expect(log.mock.calls.at(-1)[0]).toBe("[firebase] 5 unchanged");
    expect(uidMap).toEqual(
      Object.fromEntries(SPECS.map((s) => [s.uidKey, `uid-${s.uidKey}`])),
    );
    expectNoSecrets(JSON.stringify(results));
    expectNoSecrets(output());
  });

  it("sends the sign-in probe to Identity Toolkit with the key in the query", async () => {
    const fetchImpl = fakeFetch();

    await run(fakeAuth(), fetchImpl, [SPECS[0]]);

    const [url, init] = fetchImpl.mock.calls[0];
    expect(url).toBe(`${SIGN_IN_ENDPOINT}?key=${API_KEY}`);
    expect(init.method).toBe("POST");
    expect(init.headers).toEqual({ "Content-Type": "application/json" });
    expect(JSON.parse(init.body)).toEqual({
      email: SPECS[0].email,
      password: SPECS[0].password,
      returnSecureToken: true,
    });
  });

  it.each(["INVALID_LOGIN_CREDENTIALS", "INVALID_PASSWORD"])(
    "updates only the password when sign-in returns %s",
    async (code) => {
      const auth = fakeAuth();
      const spec = SPECS[2];
      const fetchImpl = fakeFetch({
        [spec.email]: jsonResponse(false, errorBody(code)),
      });

      const { results } = await run(auth, fetchImpl);

      expect(auth.updateUser).toHaveBeenCalledTimes(1);
      expect(auth.updateUser).toHaveBeenCalledWith(`uid-${spec.uidKey}`, {
        password: spec.password,
      });
      expect(auth.setCustomUserClaims).not.toHaveBeenCalled();
      expect(results[2]).toEqual({
        email: spec.email,
        uidKey: spec.uidKey,
        uid: `uid-${spec.uidKey}`,
        status: "updated",
        fields: ["password"],
      });
      expect(output()).toContain(
        `[firebase] updated: ${spec.email} (password)`,
      );
      expect(log.mock.calls.at(-1)[0]).toBe(
        "[firebase] 1 updated, 4 unchanged",
      );
      expectNoSecrets(JSON.stringify(results));
      expectNoSecrets(output());
    },
  );

  it("updates only the display name when it alone differs", async () => {
    const spec = SPECS[0];
    const auth = fakeAuth({
      [spec.email]: existingUser(spec, { displayName: "Old name" }),
    });

    await run(auth, fakeFetch());

    expect(auth.updateUser).toHaveBeenCalledTimes(1);
    const [uid, payload] = auth.updateUser.mock.calls[0];
    expect(uid).toBe(`uid-${spec.uidKey}`);
    expect(payload).toEqual({ displayName: spec.displayName });
    expect(payload).not.toHaveProperty("password");
    expect(auth.setCustomUserClaims).not.toHaveBeenCalled();
  });

  it("treats claims with the same keys in another order as equal", async () => {
    const spec = SPECS[1];
    const reordered = { meta: { tags: ["a"], level: 1 }, admin: true };
    const auth = fakeAuth({
      [spec.email]: existingUser(spec, { customClaims: reordered }),
    });

    await run(auth, fakeFetch());

    expectNoWrites(auth);
  });

  it.each([
    ["an extra key", { admin: true, meta: { level: 1, tags: ["a"] }, x: 1 }],
    ["a nested change", { admin: true, meta: { level: 2, tags: ["a"] } }],
    ["no claims at all", undefined],
  ])("sets only the claims when they differ by %s", async (_label, claims) => {
    const spec = SPECS[1];
    const auth = fakeAuth({
      [spec.email]: existingUser(spec, { customClaims: claims }),
    });

    const { results } = await run(auth, fakeFetch());

    expect(auth.setCustomUserClaims).toHaveBeenCalledTimes(1);
    expect(auth.setCustomUserClaims).toHaveBeenCalledWith(
      `uid-${spec.uidKey}`,
      spec.claims,
    );
    expect(auth.updateUser).not.toHaveBeenCalled();
    expect(results[1].fields).toEqual(["claims"]);
  });

  it("sends password and display name in one update when both differ", async () => {
    const spec = SPECS[3];
    const auth = fakeAuth({
      [spec.email]: existingUser(spec, { displayName: "Old name" }),
    });
    const fetchImpl = fakeFetch({
      [spec.email]: jsonResponse(false, errorBody("INVALID_LOGIN_CREDENTIALS")),
    });

    const { results } = await run(auth, fetchImpl);

    expect(auth.updateUser).toHaveBeenCalledTimes(1);
    expect(auth.updateUser).toHaveBeenCalledWith(`uid-${spec.uidKey}`, {
      password: spec.password,
      displayName: spec.displayName,
    });
    expect(results[3].fields).toEqual(["password", "displayName"]);
  });

  it("creates a missing account with its claims and no sign-in probe", async () => {
    const spec = SPECS[4];
    const auth = fakeAuth({ [spec.email]: null });
    const fetchImpl = fakeFetch();

    const { uidMap, results } = await run(auth, fetchImpl);

    expect(auth.createUser).toHaveBeenCalledWith({
      email: spec.email,
      password: spec.password,
      displayName: spec.displayName,
    });
    expect(auth.setCustomUserClaims).toHaveBeenCalledWith(
      `new-${spec.email}`,
      spec.claims,
    );
    expect(auth.createUser.mock.invocationCallOrder[0]).toBeLessThan(
      auth.setCustomUserClaims.mock.invocationCallOrder[0],
    );
    expect(auth.updateUser).not.toHaveBeenCalled();
    const probed = fetchImpl.mock.calls.map(([, init]) =>
      JSON.parse(init.body),
    );
    expect(probed.map((b) => b.email)).not.toContain(spec.email);
    expect(results[4].status).toBe("created");
    expect(uidMap[spec.uidKey]).toBe(`new-${spec.email}`);
    expect(uidMap[SPECS[0].uidKey]).toBe(`uid-${SPECS[0].uidKey}`);
    expect(log.mock.calls.at(-1)[0]).toBe("[firebase] 1 created, 4 unchanged");
    expectNoSecrets(JSON.stringify(results));
    expectNoSecrets(output());
  });

  it("stops before any write when the fifth account is disabled", async () => {
    const spec = SPECS[4];
    const auth = fakeAuth({
      [spec.email]: existingUser(spec, { disabled: true }),
    });
    // The first account would otherwise be updated.
    const fetchImpl = fakeFetch({
      [SPECS[0].email]: jsonResponse(false, errorBody("INVALID_PASSWORD")),
    });

    await expect(run(auth, fetchImpl)).rejects.toThrowError(
      expect.objectContaining({
        message: expect.stringContaining(`${spec.email} is disabled`),
      }),
    );
    expectNoWrites(auth);
  });

  it.each([
    ["TOO_MANY_ATTEMPTS_TRY_LATER", "TOO_MANY_ATTEMPTS_TRY_LATER : later"],
    ["USER_DISABLED", "USER_DISABLED"],
    ["OPERATION_NOT_ALLOWED", "OPERATION_NOT_ALLOWED"],
    ["SOMETHING_NEW", "SOMETHING_NEW: detail"],
  ])(
    "stops before any write when sign-in returns %s",
    async (code, message) => {
      const spec = SPECS[4];
      const auth = fakeAuth();
      const fetchImpl = fakeFetch({
        [SPECS[0].email]: jsonResponse(false, errorBody("INVALID_PASSWORD")),
        [spec.email]: jsonResponse(false, errorBody(message)),
      });

      const error = await run(auth, fetchImpl).catch((err) => err);

      expect(error.message).toBe(
        `Sign-in check for ${spec.email} failed (${code}). Nothing was changed in Firebase.`,
      );
      expectNoSecrets(error.message);
      expectNoSecrets(output());
      expectNoWrites(auth);
    },
  );

  it("reports a missing provider message as UNKNOWN", async () => {
    const spec = SPECS[4];
    const auth = fakeAuth();
    const fetchImpl = fakeFetch({ [spec.email]: jsonResponse(false, {}) });

    await expect(run(auth, fetchImpl)).rejects.toThrowError(
      expect.objectContaining({
        message: expect.stringContaining(`${spec.email} failed (UNKNOWN)`),
      }),
    );
    expectNoWrites(auth);
  });

  it("reports a rejected fetch with a fixed label, not the underlying message", async () => {
    const spec = SPECS[4];
    const auth = fakeAuth();
    const base = fakeFetch();
    const fetchImpl = vi.fn(async (url, init) => {
      if (JSON.parse(init.body).email !== spec.email) return base(url, init);
      throw new Error(`connect failed for ${url} with ${PASSWORD}`);
    });

    const error = await run(auth, fetchImpl).catch((err) => err);

    expect(error.message).toBe(
      `Sign-in check for ${spec.email} failed (network error). Nothing was changed in Firebase.`,
    );
    expectNoSecrets(error.message);
    expectNoWrites(auth);
  });

  it("reports a non-JSON body with a fixed label", async () => {
    const spec = SPECS[4];
    const auth = fakeAuth();
    const fetchImpl = fakeFetch({
      [spec.email]: {
        ok: false,
        json: vi.fn(async () => {
          throw new SyntaxError(`Unexpected token in ${API_KEY}`);
        }),
      },
    });

    const error = await run(auth, fetchImpl).catch((err) => err);

    expect(error.message).toContain(`${spec.email} failed (non-JSON response)`);
    expectNoSecrets(error.message);
    expectNoWrites(auth);
  });

  it("rethrows a read error other than user-not-found before any write", async () => {
    const auth = fakeAuth();
    const readError = Object.assign(new Error("quota exceeded"), {
      code: "auth/internal-error",
    });
    auth.getUserByEmail.mockImplementation(async (email) => {
      if (email === SPECS[4].email) throw readError;
      return existingUser(
        SPECS.find((s) => s.email === email),
        {
          displayName: "Old name",
        },
      );
    });

    await expect(run(auth, fakeFetch())).rejects.toBe(readError);
    expectNoWrites(auth);
  });
});
