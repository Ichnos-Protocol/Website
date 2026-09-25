import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import {
  BYPASS_SECRET_NAME,
  bypassFailures,
  syncProviders,
} from "./e2eProviderSync.js";
import { BYPASS_SCOPE } from "./e2eVercelBypass.js";

const SECRET = "GeneratedBypassValue0123456789ab";
const HELD = "HeldBypassValueAAAAAAAAAAAAAAAA1";
const HELD_LATER = "HeldBypassValueZZZZZZZZZZZZZZZZ2";
const STALE = "StaleBypassValueQQQQQQQQQQQQQQQ3";
const API_KEY = "AIzaClientWebApiKey0123";
const PROJECTS = {
  client: { projectId: "prj_c", projectName: "ichnos-client" },
  server: { projectId: "prj_s", projectName: "ichnos-protocol_server" },
};
const ALIASES = {
  prj_c: "e2e-client.ichnos-protocol.com",
  prj_s: "e2e-api.ichnos-protocol.com",
};
const BOTH = ["ichnos-client", "ichnos-protocol_server"];

function automation(...keys) {
  return Object.fromEntries(keys.map((key) => [key, { scope: BYPASS_SCOPE }]));
}

function bypassRequest({ bypass, id, body, refuseBypass, failRevoke }) {
  if (body.generate && !refuseBypass.includes(id)) {
    bypass[id][body.generate.secret] = { scope: BYPASS_SCOPE };
  }
  if (body.revoke) {
    if (failRevoke.includes(id)) throw new Error("Vercel API PATCH failed");
    delete bypass[id][body.revoke.secret];
  }
  return {};
}

// One in-memory Vercel: seedable bypass maps, env lists and aliases per project.
function fakeVercel({
  refuseBypass = [],
  failRevoke = [],
  env = {},
  bypass: seeded = {},
} = {}) {
  const bypass = { prj_c: {}, prj_s: {}, ...structuredClone(seeded) };
  const envs = { prj_c: [], prj_s: [], ...env };
  const request = vi.fn(async (path, { method = "GET", body } = {}) => {
    const id =
      new URLSearchParams(path.split("?")[1]).get("projectId") ??
      path.split("/")[3];
    if (path.startsWith("/v4/aliases")) {
      return { aliases: [{ alias: ALIASES[id], deploymentId: `dpl_${id}` }] };
    }
    if (path.startsWith("/v13/deployments/")) {
      const deploymentId = path.split("/")[3];
      return {
        id: deploymentId,
        projectId: deploymentId.slice(4),
        target: null,
      };
    }
    if (path.startsWith("/v13/deployments")) return { id: "dpl_new" };
    if (path.endsWith("/protection-bypass")) {
      return bypassRequest({ bypass, id, body, refuseBypass, failRevoke });
    }
    if (path.split("?")[0].endsWith("/env") && method === "GET") {
      return { envs: envs[id] };
    }
    if (method === "GET" && path.includes("/env/")) {
      return { value: envs[id].find((e) => path.endsWith(e.id))?.value };
    }
    if (method === "GET") return { protectionBypass: { ...bypass[id] } };
    return {};
  });
  return { request, registerSecret: vi.fn(), bypass };
}

function previewEntry(key, value) {
  return {
    id: `env_${key}`,
    key,
    value,
    target: ["preview"],
    customEnvironmentIds: [],
  };
}

function githubSuccess() {
  return vi.fn((secrets) =>
    Object.keys(secrets).map((name) => ({
      name,
      status: "success",
      masked: `****${secrets[name].slice(-4)}`,
    })),
  );
}

function run(api, overrides = {}) {
  return syncProviders({
    api,
    projects: PROJECTS,
    client: { VITE_FIREBASE_API_KEY: API_KEY },
    vercel: {
      E2E_USER_EMAIL: "e2e-user@ichnos-test.com",
      E2E_USER_UID: "uid-1",
    },
    setGitHubSecrets: githubSuccess(),
    generate: () => SECRET,
    ...overrides,
  });
}

function bypassPatches(api) {
  return api.request.mock.calls
    .filter(([path, opts]) => path.endsWith("/protection-bypass") && opts)
    .map(([path, opts]) => [path.split("/")[3], opts.body]);
}

function revokePatches(api) {
  return bypassPatches(api)
    .filter(([, body]) => body.revoke)
    .map(([id, body]) => [id, body.revoke.secret]);
}

// Env writes, env reads and deployment calls: anything after the bypass.
function afterBypassCalls(api) {
  return api.request.mock.calls
    .map(([path]) => path)
    .filter((path) => /\/env|\/v13\/deployments|\/v4\/aliases/.test(path));
}

function everything(outcome) {
  return JSON.stringify([
    outcome,
    bypassFailures(outcome.bypass),
    log.mock.calls,
    err.mock.calls,
  ]);
}

let log;
let err;

beforeEach(() => {
  log = vi.spyOn(console, "log").mockImplementation(() => {});
  err = vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  log.mockRestore();
  err.mockRestore();
});

describe("syncProviders: convergence", () => {
  it("generates one value on a first run, adds it to both, writes GitHub, then revokes", async () => {
    const api = fakeVercel({
      bypass: { prj_c: automation(STALE), prj_s: {} },
    });
    const generate = vi.fn(() => SECRET);
    const setGitHubSecrets = githubSuccess();

    const outcome = await run(api, { generate, setGitHubSecrets });

    expect(generate).toHaveBeenCalledTimes(1);
    const adds = bypassPatches(api)
      .filter(([, body]) => body.generate)
      .map(([id, body]) => [id, body.generate.secret]);
    expect(adds).toEqual([
      ["prj_c", SECRET],
      ["prj_s", SECRET],
    ]);
    expect(setGitHubSecrets).toHaveBeenCalledTimes(1);
    expect(setGitHubSecrets).toHaveBeenCalledWith({
      [BYPASS_SECRET_NAME]: SECRET,
    });
    expect(revokePatches(api)).toEqual([["prj_c", STALE]]);
    const ghOrder = setGitHubSecrets.mock.invocationCallOrder[0];
    const revokeCall = api.request.mock.calls.findIndex(
      ([, opts]) => opts?.body?.revoke,
    );
    expect(api.request.mock.invocationCallOrder[revokeCall]).toBeGreaterThan(
      ghOrder,
    );
    expect(outcome.bypass).toMatchObject({
      attempted: true,
      generated: true,
      steadyState: false,
      complete: true,
      githubConfirmed: true,
      revocationComplete: true,
      confirmedProjects: BOTH,
      failure: null,
    });
    expect(outcome.stopped).toBe(false);
    expect(afterBypassCalls(api).length).toBeGreaterThan(0);
    expect(bypassFailures(outcome.bypass)).toEqual([]);
    expect(everything(outcome)).not.toContain(SECRET);
    expect(everything(outcome)).not.toContain(STALE);
  });

  it("changes nothing on Vercel in steady state and writes GitHub once", async () => {
    const api = fakeVercel({
      bypass: { prj_c: automation(HELD), prj_s: automation(HELD) },
    });
    const generate = vi.fn(() => SECRET);
    const setGitHubSecrets = githubSuccess();

    const outcome = await run(api, { generate, setGitHubSecrets });

    expect(generate).not.toHaveBeenCalled();
    expect(bypassPatches(api)).toEqual([]);
    expect(setGitHubSecrets).toHaveBeenCalledTimes(1);
    expect(setGitHubSecrets).toHaveBeenCalledWith({
      [BYPASS_SECRET_NAME]: HELD,
    });
    expect(outcome.bypass).toMatchObject({
      attempted: true,
      generated: false,
      steadyState: true,
      complete: true,
    });
    expect(outcome.bypass.results.map((r) => r.heldBefore)).toEqual([
      true,
      true,
    ]);
    expect(outcome.stopped).toBe(false);
    expect(outcome.envResults.length).toBeGreaterThan(0);
    const text = everything(outcome);
    expect(text).not.toContain(HELD);
    expect(text).not.toContain(HELD.slice(-4));
  });

  it("selects the smaller of two shared keys and revokes the larger on both", async () => {
    const api = fakeVercel({
      bypass: {
        prj_c: automation(HELD_LATER, HELD),
        prj_s: automation(HELD, HELD_LATER),
      },
    });
    const setGitHubSecrets = githubSuccess();

    const outcome = await run(api, { setGitHubSecrets });

    expect(setGitHubSecrets).toHaveBeenCalledWith({
      [BYPASS_SECRET_NAME]: HELD,
    });
    expect(revokePatches(api)).toEqual([
      ["prj_c", HELD_LATER],
      ["prj_s", HELD_LATER],
    ]);
    expect(outcome.bypass).toMatchObject({
      generated: false,
      steadyState: false,
      complete: true,
    });
    const text = everything(outcome);
    expect(text).not.toContain(HELD);
    expect(text).not.toContain(HELD_LATER);
  });

  it("stops without GitHub, revocation or env when the server add fails after the client add", async () => {
    const api = fakeVercel({
      refuseBypass: ["prj_s"],
      bypass: { prj_c: automation(STALE), prj_s: automation(HELD) },
    });
    const setGitHubSecrets = vi.fn();

    const outcome = await run(api, { setGitHubSecrets });

    expect(Object.keys(api.bypass.prj_c).sort()).toEqual(
      [SECRET, STALE].sort(),
    );
    expect(Object.keys(api.bypass.prj_s)).toEqual([HELD]);
    expect(setGitHubSecrets).not.toHaveBeenCalled();
    expect(revokePatches(api)).toEqual([]);
    expect(afterBypassCalls(api)).toEqual([]);
    expect(outcome.stopped).toBe(true);
    expect(outcome.envResults).toEqual([]);
    expect(outcome.clientResults).toEqual([]);
    expect(outcome.serverResults).toEqual([]);
    expect(outcome.redeploys).toEqual([]);
    expect(outcome.bypass.failure.stage).toBe("add");
    expect(outcome.bypass.githubConfirmed).toBe(false);
    expect(
      outcome.bypass.results.map((r) => [r.project, r.present, r.confirmed]),
    ).toEqual([
      ["ichnos-client", true, false],
      ["ichnos-protocol_server", false, false],
    ]);
    expect(outcome.bypass.confirmedProjects).toEqual([]);
    const failures = bypassFailures(outcome.bypass);
    expect(failures).toHaveLength(1);
    expect(failures[0].name).toBe(
      `${BYPASS_SECRET_NAME} (ichnos-protocol_server)`,
    );
    expect(failures[0].error).toMatch(/Identical state cannot be achieved/);
    expect(failures[0].error).toMatch(/no key was revoked/);
    expect(failures[0].error).toMatch(/no Preview env was written/);
    const text = everything(outcome);
    expect(text).not.toContain(SECRET);
    expect(text).not.toContain(STALE);
    expect(text).not.toContain(HELD);
  });

  it.each([
    [
      "a failed GitHub row",
      [
        {
          name: BYPASS_SECRET_NAME,
          status: "failed",
          error: `write refused for ${SECRET}`,
        },
      ],
    ],
    ["an empty GitHub result", []],
  ])(
    "revokes nothing and stops before any env write on %s",
    async (_label, ghResult) => {
      const api = fakeVercel({
        bypass: { prj_c: automation(STALE), prj_s: automation(HELD) },
      });
      const setGitHubSecrets = vi.fn(() => ghResult);

      const outcome = await run(api, { setGitHubSecrets });

      expect(setGitHubSecrets).toHaveBeenCalledWith({
        [BYPASS_SECRET_NAME]: SECRET,
      });
      expect(revokePatches(api)).toEqual([]);
      expect(api.bypass.prj_c[STALE]).toBeDefined();
      expect(api.bypass.prj_s[HELD]).toBeDefined();
      expect(outcome.stopped).toBe(true);
      expect(outcome.envResults).toEqual([]);
      expect(outcome.redeploys).toEqual([]);
      expect(afterBypassCalls(api)).toEqual([]);
      expect(outcome.bypass.confirmedProjects).toEqual(BOTH);
      expect(outcome.bypass.githubConfirmed).toBe(false);
      expect(outcome.bypass.failure.stage).toBe("github");
      const failures = bypassFailures(outcome.bypass);
      expect(failures).toHaveLength(1);
      expect(failures[0]).toMatchObject({
        name: `${BYPASS_SECRET_NAME} (GitHub)`,
        status: "failed",
      });
      expect(failures[0].error).toMatch(/both projects hold the value/);
      expect(failures[0].error).toMatch(/Re-run the provisioning command/);
      expect(failures[0].error).not.toMatch(/left untouched/);
      const text = everything(outcome);
      expect(text).not.toContain(SECRET);
      expect(text).not.toContain(SECRET.slice(-4));
      expect(text).not.toContain(STALE);
      expect(text).not.toContain(HELD);
    },
  );

  it("stops before any env write when revocation fails on one project", async () => {
    const api = fakeVercel({
      failRevoke: ["prj_s"],
      bypass: {
        prj_c: automation(HELD, STALE),
        prj_s: automation(HELD, STALE),
      },
    });

    const outcome = await run(api);

    expect(outcome.stopped).toBe(true);
    expect(afterBypassCalls(api)).toEqual([]);
    expect(outcome.bypass).toMatchObject({
      githubConfirmed: true,
      revocationComplete: false,
      complete: false,
      failure: { stage: "revoke" },
    });
    expect(outcome.bypass.results[0]).toMatchObject({ revoked: 1 });
    expect(outcome.bypass.results[1]).toMatchObject({
      revoked: 0,
      revokeFailed: true,
    });
    const failures = bypassFailures(outcome.bypass);
    expect(failures).toHaveLength(1);
    expect(failures[0].name).toBe(
      `${BYPASS_SECRET_NAME} (ichnos-protocol_server)`,
    );
    expect(failures[0].error).toMatch(/older automation key remains/);
    const text = everything(outcome);
    expect(text).not.toContain(HELD);
    expect(text).not.toContain(STALE);
  });

  it.each([
    [
      "loses the shared key",
      (bypass) => {
        delete bypass.prj_s[HELD];
      },
    ],
    [
      "fails",
      () => {
        throw new Error("Vercel API GET failed (503)");
      },
    ],
  ])(
    "stops at confirmation when the server's final read %s after the initial read",
    async (_label, onFinalRead) => {
      const api = fakeVercel({
        bypass: {
          prj_c: automation(HELD, STALE),
          prj_s: automation(HELD),
        },
      });
      const base = api.request.getMockImplementation();
      let serverReads = 0;
      api.request.mockImplementation(async (path, opts) => {
        if (path === "/v9/projects/prj_s" && ++serverReads === 2) {
          onFinalRead(api.bypass);
        }
        return base(path, opts);
      });
      const setGitHubSecrets = vi.fn();

      const outcome = await run(api, { setGitHubSecrets });

      expect(serverReads).toBe(2);
      expect(bypassPatches(api)).toEqual([]);
      expect(setGitHubSecrets).not.toHaveBeenCalled();
      expect(revokePatches(api)).toEqual([]);
      expect(api.bypass.prj_c[STALE]).toBeDefined();
      expect(afterBypassCalls(api)).toEqual([]);
      expect(outcome.stopped).toBe(true);
      expect(outcome.envResults).toEqual([]);
      expect(outcome.redeploys).toEqual([]);
      expect(outcome.bypass).toMatchObject({
        githubConfirmed: false,
        revocationComplete: false,
        confirmedProjects: ["ichnos-client"],
        failure: { stage: "confirm" },
      });
      expect(outcome.bypass.results[1]).toMatchObject({
        heldBefore: true,
        added: false,
        confirmed: false,
      });
      const failures = bypassFailures(outcome.bypass);
      expect(failures).toHaveLength(1);
      expect(failures[0].name).toBe(
        `${BYPASS_SECRET_NAME} (ichnos-protocol_server)`,
      );
      expect(failures[0].error).toMatch(/final readback/);
      expect(failures[0].error).toMatch(/add request not issued/);
      expect(failures[0].error).toMatch(/GitHub was left untouched/);
      const text = everything(outcome);
      expect(text).not.toContain(HELD);
      expect(text).not.toContain(STALE);
    },
  );

  it("reports added: true at the confirm stage when the add lands and its readback throws", async () => {
    const api = fakeVercel({
      bypass: { prj_c: automation(STALE), prj_s: automation(HELD) },
    });
    const base = api.request.getMockImplementation();
    let clientReads = 0;
    api.request.mockImplementation(async (path, opts) => {
      if (path === "/v9/projects/prj_c" && ++clientReads === 2) {
        throw new Error("Vercel API GET failed (503)");
      }
      return base(path, opts);
    });
    const setGitHubSecrets = vi.fn();

    const outcome = await run(api, { setGitHubSecrets });

    expect(api.bypass.prj_c[SECRET]).toBeDefined();
    expect(bypassPatches(api).map(([id]) => id)).toEqual(["prj_c"]);
    expect(setGitHubSecrets).not.toHaveBeenCalled();
    expect(afterBypassCalls(api)).toEqual([]);
    expect(outcome.stopped).toBe(true);
    expect(outcome.bypass.failure.stage).toBe("confirm");
    expect(outcome.bypass.confirmedProjects).toEqual([]);
    expect(
      outcome.bypass.results.map((r) => [r.project, r.added, r.confirmed]),
    ).toEqual([
      ["ichnos-client", true, false],
      ["ichnos-protocol_server", false, false],
    ]);
    const failures = bypassFailures(outcome.bypass);
    expect(failures[0].name).toBe(`${BYPASS_SECRET_NAME} (ichnos-client)`);
    expect(failures[0].error).toMatch(/add was accepted/);
    expect(failures[0].error).toMatch(/add request accepted/);
    const text = everything(outcome);
    expect(text).not.toContain(SECRET);
    expect(text).not.toContain(STALE);
    expect(text).not.toContain(HELD);
  });

  it("reports a read failure with nothing changed", async () => {
    const api = fakeVercel();
    const base = api.request.getMockImplementation();
    api.request.mockImplementation(async (path, opts) => {
      if (path.startsWith("/v9/projects/")) throw new Error("read failed");
      return base(path, opts);
    });
    const setGitHubSecrets = vi.fn();

    const outcome = await run(api, { setGitHubSecrets });

    expect(outcome.stopped).toBe(true);
    expect(outcome.bypass).toMatchObject({
      results: [],
      confirmedProjects: [],
      failure: { stage: "read" },
    });
    expect(setGitHubSecrets).not.toHaveBeenCalled();
    expect(bypassPatches(api)).toEqual([]);
    const [failure] = bypassFailures(outcome.bypass);
    expect(failure.name).toBe(`${BYPASS_SECRET_NAME} (Vercel)`);
    expect(failure.error).toMatch(/nothing was changed/);
  });
});

describe("syncProviders: env and redeploy", () => {
  it("redeploys only the project whose env changed", async () => {
    const api = fakeVercel({
      bypass: { prj_c: automation(HELD), prj_s: automation(HELD) },
      env: {
        prj_c: [previewEntry("VITE_FIREBASE_API_KEY", API_KEY)],
        prj_s: [previewEntry("E2E_USER_EMAIL", "e2e-user@ichnos-test.com")],
      },
    });

    const outcome = await run(api);

    expect(outcome.envResults.map((r) => [r.name, r.status])).toEqual([
      ["VITE_FIREBASE_API_KEY", "unchanged"],
      ["E2E_USER_EMAIL", "unchanged"],
      ["E2E_USER_UID", "success"],
    ]);
    expect(outcome.clientResults.map((r) => r.name)).toEqual([
      "VITE_FIREBASE_API_KEY",
    ]);
    expect(outcome.serverResults.map((r) => r.name)).toEqual([
      "E2E_USER_EMAIL",
      "E2E_USER_UID",
    ]);
    expect(outcome.envResults).toEqual([
      ...outcome.clientResults,
      ...outcome.serverResults,
    ]);
    expect(outcome.redeploys).toEqual([
      {
        project: "ichnos-protocol_server",
        host: "e2e-api.ichnos-protocol.com",
        status: "success",
        deploymentId: "dpl_new",
      },
    ]);
  });

  it("neither generates nor sets a bypass when convergence is off", async () => {
    const api = fakeVercel();
    const generate = vi.fn();
    const setGitHubSecrets = vi.fn();

    const outcome = await run(api, {
      converge: false,
      generate,
      setGitHubSecrets,
    });

    expect(generate).not.toHaveBeenCalled();
    expect(setGitHubSecrets).not.toHaveBeenCalled();
    expect(bypassPatches(api)).toEqual([]);
    expect(outcome.bypass).toEqual({ attempted: false });
    expect(bypassFailures(outcome.bypass)).toEqual([]);
    expect(outcome.stopped).toBe(false);
    expect(outcome.envResults.length).toBeGreaterThan(0);
  });

  it("keeps the generated value out of every returned field and all output", async () => {
    const api = fakeVercel({ bypass: { prj_c: automation(STALE) } });

    const outcome = await run(api);

    const text = everything(outcome);
    expect(text).not.toContain(SECRET);
    expect(text).not.toContain(SECRET.slice(-4));
    expect(text).not.toContain(STALE);
    expect(text).not.toContain(STALE.slice(-4));
    expect(text).not.toContain(API_KEY);
    expect(text).not.toContain(API_KEY.slice(-4));
  });
});
