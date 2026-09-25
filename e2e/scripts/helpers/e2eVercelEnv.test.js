import { describe, it, expect, vi } from "vitest";

import {
  findPreviewEntry,
  isAllBranchesPreview,
  normalizeUpdatedAt,
  setPreviewEnv,
} from "./e2eVercelEnv.js";

const KEY = "E2E_USER_UID";

function entry(overrides) {
  return {
    id: "env_all",
    key: KEY,
    target: ["preview"],
    customEnvironmentIds: [],
    ...overrides,
  };
}

const PRODUCTION = entry({ id: "env_prod", target: ["production"] });
const STAGING = entry({ id: "env_staging", gitBranch: "staging" });
const MAIN = entry({ id: "env_main", gitBranch: "main" });
const CUSTOM = entry({ id: "env_custom", customEnvironmentIds: ["env_x"] });
const OVERRIDES = [PRODUCTION, STAGING, MAIN, CUSTOM];

// envs is one page, or { first, <cursor>: page } for a paginated list. A
// decrypted entry is a value, or the whole GET body when it is an object.
function fakeApi(envs, decrypted = {}) {
  const pages = Array.isArray(envs) ? { first: { envs } } : envs;
  const request = vi.fn(async (path, { method = "GET" } = {}) => {
    if (method !== "GET") return {};
    const [base, query] = path.split("?");
    if (base.endsWith("/env")) {
      return pages[new URLSearchParams(query).get("until") ?? "first"];
    }
    const id = base.split("/").pop();
    const body = decrypted[id];
    return body && typeof body === "object" ? body : { value: body };
  });
  return { request, registerSecret: vi.fn() };
}

function listCalls(api) {
  return api.request.mock.calls
    .map(([path]) => path)
    .filter((path) => path.split("?")[0].endsWith("/env"));
}

function writeCalls(api) {
  return api.request.mock.calls.filter(([, opts]) => opts?.method);
}

describe("isAllBranchesPreview", () => {
  it("selects only the all-branches Preview entry", () => {
    expect(isAllBranchesPreview(entry())).toBe(true);
    for (const override of OVERRIDES) {
      expect(isAllBranchesPreview(override)).toBe(false);
    }
    expect(
      isAllBranchesPreview(entry({ target: ["preview", "production"] })),
    ).toBe(false);
  });

  it("throws on an unknown scope shape", () => {
    expect(() =>
      isAllBranchesPreview(entry({ customEnvironmentIds: undefined })),
    ).toThrow(/unrecognised scope shape/);
    expect(() => isAllBranchesPreview(entry({ target: "preview" }))).toThrow(
      /unrecognised scope shape/,
    );
  });
});

describe("setPreviewEnv", () => {
  it("never selects or touches production or branch-scoped entries", async () => {
    const api = fakeApi([...OVERRIDES, entry()], { env_all: "old" });

    const result = await setPreviewEnv({
      api,
      projectId: "prj_s",
      key: KEY,
      value: "new-uid-value",
    });

    expect(result.status).toBe("success");
    const paths = api.request.mock.calls.map(([path]) => path).join("\n");
    for (const id of ["env_prod", "env_staging", "env_main", "env_custom"]) {
      expect(paths).not.toContain(id);
    }
    const [[path, opts]] = writeCalls(api);
    expect(path).toBe("/v9/projects/prj_s/env/env_all");
    expect(opts).toEqual({ method: "PATCH", body: { value: "new-uid-value" } });
  });

  it("writes nothing when the value is unchanged", async () => {
    const api = fakeApi([entry()], { env_all: "same-uid-value" });

    const result = await setPreviewEnv({
      api,
      projectId: "prj_s",
      key: KEY,
      value: "same-uid-value",
    });

    expect(result).toMatchObject({ name: KEY, status: "unchanged" });
    expect(writeCalls(api)).toHaveLength(0);
  });

  it("creates an all-branches Preview entry with no branch scope", async () => {
    const api = fakeApi(OVERRIDES);

    const result = await setPreviewEnv({
      api,
      projectId: "prj_c",
      key: KEY,
      value: "created-uid-value",
    });

    expect(result.status).toBe("success");
    const [[path, opts]] = writeCalls(api);
    expect(path).toBe("/v10/projects/prj_c/env");
    expect(opts.method).toBe("POST");
    expect(opts.body).toEqual({
      key: KEY,
      value: "created-uid-value",
      type: "encrypted",
      target: ["preview"],
    });
    expect(opts.body).not.toHaveProperty("gitBranch");
    expect(opts.body).not.toHaveProperty("customEnvironmentIds");
  });

  it("fails before any write on two all-branches candidates", async () => {
    const api = fakeApi([entry(), entry({ id: "env_all_2" })]);

    await expect(
      findPreviewEntry({ api, projectId: "prj_s", key: KEY }),
    ).rejects.toThrowError(
      /2 all-branches Preview entries exist for E2E_USER_UID/,
    );
    const result = await setPreviewEnv({
      api,
      projectId: "prj_s",
      key: KEY,
      value: "v",
    });
    expect(result.status).toBe("failed");
    expect(writeCalls(api)).toHaveLength(0);
  });

  it("fails before any write on an unknown shape", async () => {
    const api = fakeApi([entry({ customEnvironmentIds: undefined })]);

    await expect(
      findPreviewEntry({ api, projectId: "prj_s", key: KEY }),
    ).rejects.toThrowError(/unrecognised scope shape/);
    expect(writeCalls(api)).toHaveLength(0);
  });

  it("masks the value in its result", async () => {
    const api = fakeApi([entry()], { env_all: "old" });

    const result = await setPreviewEnv({
      api,
      projectId: "prj_s",
      key: "VITE_FIREBASE_API_KEY",
      value: "AIzaSecretApiKeyValue",
    });

    expect(JSON.stringify(result)).not.toContain("AIzaSecretApiKeyValue");
    expect(api.registerSecret).toHaveBeenCalledWith("AIzaSecretApiKeyValue");
  });
});

describe("setPreviewEnv outcome metadata", () => {
  const API_KEY = "AIzaSecretApiKeyValue";
  const EPOCH_MS = 1758784500000;
  const EPOCH_ISO = new Date(EPOCH_MS).toISOString();

  function run(api, key = KEY, value = "uid-value") {
    return setPreviewEnv({ api, projectId: "prj_s", key, value });
  }

  it("reports a create as created, with no timestamp", async () => {
    const result = await run(fakeApi([]));

    expect(result).toMatchObject({ status: "success", operation: "created" });
    expect(result.updatedAt).toBeUndefined();
  });

  it("reports a changed value as updated, with no timestamp", async () => {
    const api = fakeApi([entry({ updatedAt: EPOCH_MS })], {
      env_all: { value: "old", updatedAt: EPOCH_MS },
    });

    const result = await run(api);

    expect(result).toMatchObject({ status: "success", operation: "updated" });
    expect(result.updatedAt).toBeUndefined();
  });

  it("reports an unchanged value with the decrypted entry's updatedAt", async () => {
    const api = fakeApi([entry({ updatedAt: 1 })], {
      env_all: { value: "uid-value", updatedAt: EPOCH_MS },
    });

    const result = await run(api);

    expect(result).toMatchObject({
      status: "unchanged",
      operation: "unchanged",
      updatedAt: EPOCH_ISO,
    });
  });

  it("falls back to the listed entry's updatedAt", async () => {
    const api = fakeApi([entry({ updatedAt: String(EPOCH_MS) })], {
      env_all: "uid-value",
    });

    expect((await run(api)).updatedAt).toBe(EPOCH_ISO);
  });

  it("leaves the timestamp undefined when neither carries one", async () => {
    const api = fakeApi([entry()], { env_all: "uid-value" });

    const result = await run(api);

    expect(result.operation).toBe("unchanged");
    expect(result.updatedAt).toBeUndefined();
  });

  it("carries no operation or timestamp on a failure", async () => {
    const api = fakeApi([entry(), entry({ id: "env_all_2" })]);

    const result = await run(api);

    expect(result.status).toBe("failed");
    expect(result).not.toHaveProperty("operation");
    expect(result).not.toHaveProperty("updatedAt");
  });

  it("masks a secret-named key fully and leaks no id, value or branch", async () => {
    const listed = entry({ key: "VITE_FIREBASE_API_KEY", gitBranch: null });
    const api = fakeApi([listed], {
      env_all: { value: API_KEY, updatedAt: EPOCH_MS },
    });

    const result = await run(api, "VITE_FIREBASE_API_KEY", API_KEY);
    const serialized = JSON.stringify(result);

    expect(result.masked).toBe("****");
    expect(serialized).not.toContain(API_KEY);
    expect(serialized).not.toContain(API_KEY.slice(-4));
    expect(serialized).not.toContain("env_all");
    expect(result).not.toHaveProperty("value");
    expect(result).not.toHaveProperty("id");
    expect(result).not.toHaveProperty("gitBranch");
  });
});

describe("normalizeUpdatedAt", () => {
  const ISO = "2026-09-20T08:15:00.000Z";
  const MS = Date.parse(ISO);

  it("reads a number or an all-digit string as epoch milliseconds", () => {
    expect(normalizeUpdatedAt(MS)).toBe(ISO);
    expect(normalizeUpdatedAt(String(MS))).toBe(ISO);
  });

  it("keeps a string Date parses, as ISO", () => {
    expect(normalizeUpdatedAt(ISO)).toBe(ISO);
  });

  it.each([undefined, null, "", "  ", "not a date", NaN, Infinity, {}])(
    "yields undefined for %s",
    (raw) => {
      expect(normalizeUpdatedAt(raw)).toBeUndefined();
    },
  );
});

describe("findPreviewEntry pagination", () => {
  it("finds the target on a later page and updates it, not creates", async () => {
    const api = fakeApi(
      {
        first: { envs: OVERRIDES, pagination: { next: 222 } },
        222: { envs: [entry()], pagination: { next: null } },
      },
      { env_all: "old" },
    );

    const result = await setPreviewEnv({
      api,
      projectId: "prj_s",
      key: KEY,
      value: "new-uid-value",
    });

    expect(listCalls(api)).toEqual([
      "/v9/projects/prj_s/env?limit=100",
      "/v9/projects/prj_s/env?limit=100&until=222",
    ]);
    expect(result.status).toBe("success");
    const [[path, opts]] = writeCalls(api);
    expect(path).toBe("/v9/projects/prj_s/env/env_all");
    expect(opts.method).toBe("PATCH");
  });

  it("refuses duplicate all-branches candidates split across pages", async () => {
    const api = fakeApi({
      first: { envs: [entry()], pagination: { next: 333 } },
      333: { envs: [entry({ id: "env_all_2" })], pagination: {} },
    });

    const result = await setPreviewEnv({
      api,
      projectId: "prj_s",
      key: KEY,
      value: "v",
    });

    expect(result.status).toBe("failed");
    expect(result.error).toMatch(
      /2 all-branches Preview entries exist for E2E_USER_UID/,
    );
    expect(writeCalls(api)).toHaveLength(0);
  });

  it("fails closed with no write when the page cap is reached", async () => {
    const request = vi.fn(async () => ({
      envs: [],
      pagination: { next: 1 },
    }));
    const api = { request, registerSecret: vi.fn() };

    const result = await setPreviewEnv({
      api,
      projectId: "prj_s",
      key: KEY,
      value: "v",
    });

    expect(result.status).toBe("failed");
    expect(result.error).toMatch(/exceeds 50 pages; refusing to decide/);
    expect(request).toHaveBeenCalledTimes(50);
    expect(writeCalls(api)).toHaveLength(0);
  });
});
