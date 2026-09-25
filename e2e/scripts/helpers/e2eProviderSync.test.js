import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import {
  BYPASS_SECRET_NAME,
  bypassFailures,
  syncProviders,
} from "./e2eProviderSync.js";
import { BYPASS_SCOPE } from "./e2eVercelBypass.js";

const SECRET = "GeneratedBypassValue0123456789ab";
const API_KEY = "AIzaClientWebApiKey0123";
const PROJECTS = {
  client: { projectId: "prj_c", projectName: "ichnos-client" },
  server: { projectId: "prj_s", projectName: "ichnos-protocol_server" },
};
const ALIASES = {
  prj_c: "e2e-client.ichnos-protocol.com",
  prj_s: "e2e-api.ichnos-protocol.com",
};

// One in-memory Vercel: bypass maps, env lists and aliases per project.
function fakeVercel({ refuseBypass = [], env = {} } = {}) {
  const bypass = { prj_c: {}, prj_s: {} };
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
      if (body.generate && !refuseBypass.includes(id)) {
        bypass[id][body.generate.secret] = { scope: BYPASS_SCOPE };
      }
      return {};
    }
    if (path.split("?")[0].endsWith("/env") && method === "GET") {
      return { envs: envs[id] };
    }
    if (method === "GET" && path.includes("/env/")) {
      return { value: envs[id].find((e) => path.endsWith(e.id))?.value };
    }
    if (method === "GET") return { protectionBypass: bypass[id] };
    return {};
  });
  return { request, registerSecret: vi.fn() };
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

function run(api, overrides = {}) {
  return syncProviders({
    api,
    projects: PROJECTS,
    client: { VITE_FIREBASE_API_KEY: API_KEY },
    vercel: {
      E2E_USER_EMAIL: "e2e-user@ichnos-test.com",
      E2E_USER_UID: "uid-1",
    },
    setGitHubSecrets: vi.fn((secrets) =>
      Object.keys(secrets).map((name) => ({
        name,
        status: "success",
        masked: `****${secrets[name].slice(-4)}`,
      })),
    ),
    generate: () => SECRET,
    ...overrides,
  });
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

describe("syncProviders", () => {
  it("sends the same value to both projects and then to GitHub", async () => {
    const api = fakeVercel();
    const setGitHubSecrets = vi.fn(() => [
      { name: BYPASS_SECRET_NAME, status: "success" },
    ]);

    const outcome = await run(api, { setGitHubSecrets });

    const generated = api.request.mock.calls
      .filter(([path, opts]) => path.endsWith("/protection-bypass") && opts)
      .map(([path, opts]) => [path.split("/")[3], opts.body.generate.secret]);
    expect(generated).toEqual([
      ["prj_c", SECRET],
      ["prj_s", SECRET],
    ]);
    expect(setGitHubSecrets).toHaveBeenCalledWith({
      [BYPASS_SECRET_NAME]: SECRET,
    });
    expect(outcome.bypass).toMatchObject({
      rotated: true,
      githubConfirmed: true,
      confirmedProjects: ["ichnos-client", "ichnos-protocol_server"],
    });
    expect(bypassFailures(outcome.bypass)).toEqual([]);
  });

  // Env writes, env reads and deployment calls: anything after the bypass.
  function afterBypassCalls(api) {
    return api.request.mock.calls
      .map(([path]) => path)
      .filter((path) => /\/env|\/v13\/deployments|\/v4\/aliases/.test(path));
  }

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
    "stops before any env write or redeploy on %s after both projects confirm",
    async (_label, ghResult) => {
      const api = fakeVercel();
      const setGitHubSecrets = vi.fn(() => ghResult);

      const outcome = await run(api, { setGitHubSecrets });

      expect(setGitHubSecrets).toHaveBeenCalledWith({
        [BYPASS_SECRET_NAME]: SECRET,
      });
      expect(outcome.stopped).toBe(true);
      expect(outcome.envResults).toEqual([]);
      expect(outcome.redeploys).toEqual([]);
      expect(afterBypassCalls(api)).toEqual([]);
      expect(outcome.bypass.confirmedProjects).toEqual([
        "ichnos-client",
        "ichnos-protocol_server",
      ]);
      expect(outcome.bypass.githubConfirmed).toBe(false);
      const failures = bypassFailures(outcome.bypass);
      expect(failures).toHaveLength(1);
      expect(failures[0]).toMatchObject({
        name: `${BYPASS_SECRET_NAME} (GitHub)`,
        status: "failed",
      });
      expect(failures[0].error).toMatch(/both projects hold the new value/);
      expect(failures[0].error).toMatch(/Re-run the provisioning command/);
      expect(failures[0].error).not.toMatch(/left untouched/);
      const everything = JSON.stringify([
        outcome,
        failures,
        log.mock.calls,
        err.mock.calls,
      ]);
      expect(everything).not.toContain(SECRET);
      expect(everything).not.toContain(SECRET.slice(-4));
    },
  );

  it.each([["prj_c"], ["prj_s"]])(
    "stops before any env write or redeploy when %s fails to confirm",
    async (refused) => {
      const api = fakeVercel({ refuseBypass: [refused] });
      const setGitHubSecrets = vi.fn();

      const outcome = await run(api, { setGitHubSecrets });

      expect(setGitHubSecrets).not.toHaveBeenCalled();
      expect(outcome.stopped).toBe(true);
      expect(outcome.envResults).toEqual([]);
      expect(outcome.redeploys).toEqual([]);
      expect(afterBypassCalls(api)).toEqual([]);
      expect(
        api.request.mock.calls.filter(
          ([path, opts]) =>
            opts?.method && !path.endsWith("/protection-bypass"),
        ),
      ).toEqual([]);
      expect(outcome.bypass.githubConfirmed).toBe(false);
      expect(
        outcome.bypass.results.map((r) => [r.project, r.confirmed]),
      ).toEqual([
        ["ichnos-client", refused !== "prj_c"],
        ["ichnos-protocol_server", refused !== "prj_s"],
      ]);
      const [failure] = bypassFailures(outcome.bypass);
      expect(failure.error).toMatch(/Identical state cannot be achieved/);
      expect(failure.error).toMatch(/no Preview env was written/);
      expect(JSON.stringify(outcome)).not.toContain(SECRET);
    },
  );

  it("redeploys only the project whose env changed", async () => {
    const api = fakeVercel({
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
    expect(outcome.redeploys).toEqual([
      {
        project: "ichnos-protocol_server",
        host: "e2e-api.ichnos-protocol.com",
        status: "success",
        deploymentId: "dpl_new",
      },
    ]);
  });

  it("neither generates nor sets a bypass when rotation is off", async () => {
    const api = fakeVercel();
    const generate = vi.fn();
    const setGitHubSecrets = vi.fn();

    const outcome = await run(api, {
      rotateBypass: false,
      generate,
      setGitHubSecrets,
    });

    expect(generate).not.toHaveBeenCalled();
    expect(setGitHubSecrets).not.toHaveBeenCalled();
    expect(outcome.bypass).toEqual({ rotated: false });
    expect(bypassFailures(outcome.bypass)).toEqual([]);
  });

  it("keeps the generated value out of every returned field and all output", async () => {
    const api = fakeVercel({ refuseBypass: [] });

    const outcome = await run(api);

    const text = JSON.stringify([outcome, log.mock.calls, err.mock.calls]);
    expect(text).not.toContain(SECRET);
    expect(text).not.toContain(SECRET.slice(-4));
    expect(text).not.toContain(API_KEY);
  });
});
