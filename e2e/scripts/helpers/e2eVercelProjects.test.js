import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "fs";
import { join } from "path";
import { tmpdir } from "os";

import { createFakeVercelCli } from "./e2eVercelFakeCli.js";

const createTokenTransport = vi.fn();
vi.mock("./e2eVercelApi.js", async (importOriginal) => ({
  ...(await importOriginal()),
  createTokenTransport,
}));

const {
  EXPECTED_PROJECT_NAMES,
  assertLinkAgreesWithDiscovery,
  connectVercelProjects,
  readOptionalLinkedProject,
} = await import("./e2eVercelProjects.js");

const TOKEN = "vercel-token-value-123";
const USER = { id: "user_1", username: "alice" };
const TEAM = { id: "team_1", slug: "acme" };
const CLI_USER = { id: "user_1", username: "alice", email: "a@example.com" };

/** The --scope value a fake-CLI request ran with, or undefined. */
function scopeOf({ args }) {
  const at = args.indexOf("--scope");
  return at >= 0 ? args[at + 1] : undefined;
}

let root;
let world;

function link(dirName, contents) {
  const dir = join(root, dirName);
  mkdirSync(join(dir, ".vercel"), { recursive: true });
  const body =
    typeof contents === "string" ? contents : JSON.stringify(contents);
  writeFileSync(join(dir, ".vercel", "project.json"), body);
  return dir;
}

function governed(ownerId) {
  return {
    "ichnos-protocol": {
      id: "prj_c",
      name: "ichnos-protocol",
      accountId: ownerId,
    },
    "ichnos-protocol_server": {
      id: "prj_s",
      name: "ichnos-protocol_server",
      accountId: ownerId,
    },
  };
}

/**
 * A fake token transport keyed by the teamId it was built with. The unscoped
 * one answers /v2/user (world.user) and /v2/teams in the documented
 * pagination envelope; every one answers project lookups from world.projects.
 * CLI tests use createFakeVercelCli instead.
 */
function fakeTransport(key) {
  return async (path, { method }) => {
    world.requests.push({ key, path, method });
    let body;
    if (path === "/v2/user") body = { user: world.user };
    else if (path.startsWith("/v2/teams")) {
      body = {
        teams: [TEAM],
        pagination: { count: 1, next: null, prev: null },
      };
    } else {
      const name = decodeURIComponent(path.replace("/v9/projects/", ""));
      body = world.projects[key]?.[name];
    }
    if (!body) return { ok: false, status: 1, text: "", errorText: "404" };
    return { ok: true, status: 0, text: JSON.stringify(body) };
  };
}

function dirs() {
  return { serverDir: join(root, "server"), clientDir: join(root, "client") };
}

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), "vercel-projects-"));
  world = { requests: [], projects: {}, user: USER };
  createTokenTransport.mockReset();
  createTokenTransport.mockImplementation(({ teamId }) =>
    fakeTransport(teamId ?? "unscoped-or-personal"),
  );
});

afterEach(() => {
  rmSync(root, { recursive: true, force: true });
});

describe("EXPECTED_PROJECT_NAMES", () => {
  it("governs the exact client and server project names", () => {
    expect(EXPECTED_PROJECT_NAMES).toEqual({
      client: "ichnos-protocol",
      server: "ichnos-protocol_server",
    });
  });
});

describe("readOptionalLinkedProject", () => {
  it("returns null when the link file is absent", () => {
    expect(
      readOptionalLinkedProject(join(root, "client"), "ichnos-protocol"),
    ).toBeNull();
  });

  it("honours a valid link file", () => {
    const server = link("server", {
      projectId: "prj_s",
      orgId: "team_1",
      projectName: EXPECTED_PROJECT_NAMES.server,
    });

    expect(
      readOptionalLinkedProject(server, EXPECTED_PROJECT_NAMES.server),
    ).toEqual({
      projectId: "prj_s",
      orgId: "team_1",
      projectName: "ichnos-protocol_server",
    });
  });

  it.each([
    ["malformed JSON", "not-json{", /project\.json is malformed/],
    ["JSON null", "null", /project\.json is malformed/],
    [
      "a missing projectId",
      { orgId: "team_1", projectName: "ichnos-protocol_server" },
      /missing projectId or orgId/,
    ],
    [
      "a missing orgId",
      { projectId: "prj_s", projectName: "ichnos-protocol_server" },
      /missing projectId or orgId/,
    ],
    [
      "an absent projectName",
      { projectId: "prj_s", orgId: "team_1" },
      /does not contain a valid projectName/,
    ],
    [
      "a non-string projectName",
      { projectId: "prj_s", orgId: "team_1", projectName: 12345 },
      /does not contain a valid projectName/,
    ],
    [
      "an empty projectName",
      { projectId: "prj_s", orgId: "team_1", projectName: "" },
      /does not contain a valid projectName/,
    ],
    ...[
      "wrong-project",
      "ichnos-protocolserver",
      "my-server-project",
      "ichnos-protocolServer",
      "ichnos-protocol",
    ].map((projectName) => [
      `projectName '${projectName}'`,
      { projectId: "prj_s", orgId: "team_1", projectName },
      /does not match the expected server project/,
    ]),
  ])("refuses a server link with %s", (_label, contents, pattern) => {
    const server = link("server", contents);

    expect(() =>
      readOptionalLinkedProject(server, EXPECTED_PROJECT_NAMES.server),
    ).toThrow(pattern);
  });

  it.each([["ichnos-client"], ["ichnos-protocol_server"]])(
    "refuses a client link that names %s",
    (projectName) => {
      const client = link("client", {
        projectId: "prj_c",
        orgId: "team_1",
        projectName,
      });

      expect(() =>
        readOptionalLinkedProject(client, EXPECTED_PROJECT_NAMES.client),
      ).toThrow(
        new RegExp(
          `Linked Vercel project '${projectName}' does not match the expected client project 'ichnos-protocol'`,
        ),
      );
    },
  );

  it("names the optional cross-check, never `vercel link`", () => {
    const client = link("client", "null");

    expect(() =>
      readOptionalLinkedProject(client, EXPECTED_PROJECT_NAMES.client),
    ).toThrow(/optional cross-check: delete client\/\.vercel\/project\.json/);
    expect(() =>
      readOptionalLinkedProject(client, EXPECTED_PROJECT_NAMES.client),
    ).not.toThrow(/vercel link/);
  });
});

describe("assertLinkAgreesWithDiscovery", () => {
  const teamScope = { kind: "team", id: "team_1", label: "acme" };
  const personalScope = { kind: "personal", id: "user_1", label: "alice" };

  it("is a no-op without a link file", () => {
    expect(() =>
      assertLinkAgreesWithDiscovery({
        dir: join(root, "server"),
        expectedName: EXPECTED_PROJECT_NAMES.server,
        discovered: { projectId: "prj_s" },
        scope: teamScope,
      }),
    ).not.toThrow();
  });

  it("compares a team link's orgId with the team_ id", () => {
    const dir = link("server", {
      projectId: "prj_s",
      orgId: "team_1",
      projectName: EXPECTED_PROJECT_NAMES.server,
    });
    const args = {
      dir,
      expectedName: EXPECTED_PROJECT_NAMES.server,
      discovered: { projectId: "prj_s" },
    };

    expect(() =>
      assertLinkAgreesWithDiscovery({ ...args, scope: teamScope }),
    ).not.toThrow();
    expect(() =>
      assertLinkAgreesWithDiscovery({ ...args, scope: personalScope }),
    ).toThrow(/orgId 'team_1'[\s\S]*'user_1'/);
  });

  it("compares a personal link's orgId with the /v2/user owner id", () => {
    const dir = link("server", {
      projectId: "prj_s",
      orgId: "user_1",
      projectName: EXPECTED_PROJECT_NAMES.server,
    });

    expect(() =>
      assertLinkAgreesWithDiscovery({
        dir,
        expectedName: EXPECTED_PROJECT_NAMES.server,
        discovered: { projectId: "prj_s" },
        scope: personalScope,
      }),
    ).not.toThrow();
  });
});

describe("connectVercelProjects", () => {
  it("succeeds in a team scope with neither link file present", async () => {
    const cli = createFakeVercelCli({
      user: CLI_USER,
      teams: [TEAM],
      projects: { team_1: governed("team_1") },
    });

    const result = await connectVercelProjects({
      access: { mode: "cli" },
      ...dirs(),
      run: cli.run,
    });

    expect(result.projects).toEqual({
      client: {
        projectId: "prj_c",
        orgId: "team_1",
        projectName: "ichnos-protocol",
      },
      server: {
        projectId: "prj_s",
        orgId: "team_1",
        projectName: "ichnos-protocol_server",
      },
    });
    expect(typeof result.api.request).toBe("function");
    expect(typeof result.api.registerSecret).toBe("function");
    // The fake CLI answers an unknown path with a zero-exit error envelope.
    await expect(result.api.request("/probe")).rejects.toMatchObject({
      code: "not_found",
    });
    expect(cli.requests.at(-1)).toMatchObject({
      path: "/probe",
      teamId: "team_1",
    });
    expect(scopeOf(cli.requests.at(-1))).toBe("acme");
  });

  it("succeeds in the personal scope with neither link file present", async () => {
    const cli = createFakeVercelCli({
      user: CLI_USER,
      teams: [TEAM],
      projects: { user_1: governed("user_1") },
    });

    const result = await connectVercelProjects({
      access: { mode: "cli" },
      ...dirs(),
      run: cli.run,
    });

    expect(result.projects.server.orgId).toBe("user_1");
    // The fake CLI answers an unknown path with a zero-exit error envelope.
    await expect(result.api.request("/probe")).rejects.toMatchObject({
      code: "not_found",
    });
    expect(scopeOf(cli.requests.at(-1))).toBe("alice");
    expect(cli.requests.at(-1).teamId).toBeNull();
  });

  it("gives the token transport a teamId only for a team scope", async () => {
    world.projects.team_1 = governed("team_1");
    const env = { VERCEL_TOKEN: TOKEN };

    await connectVercelProjects({ access: { mode: "token" }, ...dirs(), env });

    expect(createTokenTransport.mock.calls.at(-1)[0]).toEqual({
      token: TOKEN,
      teamId: "team_1",
    });
    expect(createTokenTransport.mock.calls[0][0].teamId).toBeUndefined();
  });

  it("never runs the Vercel CLI in token mode", async () => {
    world.projects.team_1 = governed("team_1");
    const run = vi.fn();

    const result = await connectVercelProjects({
      access: { mode: "token" },
      ...dirs(),
      env: { VERCEL_TOKEN: TOKEN },
      run,
    });

    expect(result.projects.server.orgId).toBe("team_1");
    expect(run).not.toHaveBeenCalled();
  });

  it("hands the trimmed VERCEL_TOKEN to the token transport", async () => {
    world.projects.team_1 = governed("team_1");

    await connectVercelProjects({
      access: { mode: "token" },
      ...dirs(),
      env: { VERCEL_TOKEN: `  ${TOKEN}\n` },
    });

    const tokens = createTokenTransport.mock.calls.map(([arg]) => arg.token);
    expect(tokens.length).toBeGreaterThan(0);
    expect(tokens.every((token) => token === TOKEN)).toBe(true);
  });

  it("gives the token transport no teamId for the personal scope", async () => {
    world.projects["unscoped-or-personal"] = governed("user_1");

    const result = await connectVercelProjects({
      access: { mode: "token" },
      ...dirs(),
      env: { VERCEL_TOKEN: TOKEN },
    });

    expect(result.projects.client.orgId).toBe("user_1");
    expect(createTokenTransport.mock.calls.at(-1)[0].teamId).toBeUndefined();
  });

  it("passes matching link files and never writes them", async () => {
    const cli = createFakeVercelCli({
      user: CLI_USER,
      teams: [TEAM],
      projects: { team_1: governed("team_1") },
    });
    const files = [
      link("server", {
        projectId: "prj_s",
        orgId: "team_1",
        projectName: EXPECTED_PROJECT_NAMES.server,
      }),
      link("client", {
        projectId: "prj_c",
        orgId: "team_1",
        projectName: EXPECTED_PROJECT_NAMES.client,
      }),
    ].map((dir) => join(dir, ".vercel", "project.json"));
    const snapshot = () =>
      files.map((path) => [readFileSync(path, "utf8"), statSync(path).mtimeMs]);
    const before = snapshot();

    await connectVercelProjects({
      access: { mode: "cli" },
      ...dirs(),
      run: cli.run,
    });

    expect(snapshot()).toEqual(before);
  });

  it.each([
    [
      "projectName",
      { projectId: "prj_c", orgId: "team_1", projectName: "ichnos-client" },
      /client\/\.vercel\/project\.json: Linked Vercel project 'ichnos-client' does not match the expected client project 'ichnos-protocol'/,
    ],
    [
      "projectId",
      {
        projectId: "prj_stale",
        orgId: "team_1",
        projectName: "ichnos-protocol",
      },
      /client\/\.vercel\/project\.json projectId 'prj_stale' disagrees[\s\S]*'prj_c'/,
    ],
    [
      "orgId",
      { projectId: "prj_c", orgId: "team_old", projectName: "ichnos-protocol" },
      /client\/\.vercel\/project\.json orgId 'team_old' disagrees[\s\S]*'team_1'/,
    ],
  ])(
    "refuses a client link whose %s disagrees, before any write",
    async (_field, contents, pattern) => {
      world.projects.team_1 = governed("team_1");
      link("client", contents);

      const error = await connectVercelProjects({
        access: { mode: "token" },
        ...dirs(),
        env: { VERCEL_TOKEN: TOKEN },
      }).catch((err) => err);

      expect(error.message).toMatch(pattern);
      expect(error.message).not.toContain(TOKEN);
      expect(world.requests.every(({ method }) => method === "GET")).toBe(true);
    },
  );
});

describe("connectVercelProjects with a token for a Northstar account", () => {
  const PERSONAL = "unscoped-or-personal";

  function connect() {
    return connectVercelProjects({
      access: { mode: "token" },
      ...dirs(),
      env: { VERCEL_TOKEN: TOKEN },
    });
  }

  function expectGetOnly() {
    expect(world.requests.length).toBeGreaterThan(0);
    expect(world.requests.every(({ method }) => method === "GET")).toBe(true);
  }

  beforeEach(() => {
    world.user = { ...USER, version: "northstar", defaultTeamId: "team_1" };
  });

  it("probes and resolves the personal scope without a teamId", async () => {
    world.projects[PERSONAL] = governed("user_1");

    const result = await connect();

    expect(result.projects.server.orgId).toBe("user_1");
    const personal = world.requests.filter(
      ({ key, path }) => key === PERSONAL && path.startsWith("/v9/"),
    );
    expect(personal.map(({ path }) => path)).toEqual([
      "/v9/projects/ichnos-protocol",
      "/v9/projects/ichnos-protocol_server",
    ]);
    expect(createTokenTransport.mock.calls.at(-1)[0].teamId).toBeUndefined();
  });

  it("refuses when the personal scope and a team both hold the projects", async () => {
    world.projects[PERSONAL] = governed("user_1");
    world.projects.team_1 = governed("team_1");

    const error = await connect().catch((err) => err);

    expect(error.message).toMatch(/refusing to choose/);
    expect(error.message).toContain("personal 'alice'");
    expect(error.message).toContain("team 'acme'");
    expect(error.message).not.toContain(TOKEN);
    expectGetOnly();
    expect(createTokenTransport.mock.calls.at(-1)[0].teamId).toBe("team_1");
  });

  it("does not take the default team's projects for personal ones", async () => {
    // An unscoped lookup answered from the default team, as if it were current.
    world.projects[PERSONAL] = governed("team_1");
    world.projects.team_1 = governed("team_1");

    const result = await connect();

    expect(result.projects.client.orgId).toBe("team_1");
    expectGetOnly();
  });
});

describe("connectVercelProjects with a team-scoped token", () => {
  const UNSCOPED = "unscoped-or-personal";

  // A team-scoped token cannot read the user: /v2/user answers a 403
  // `forbidden` envelope; every other path goes to the governed fake.
  function forbiddenUser(key) {
    const governedTransport = fakeTransport(key);
    return async (path, options) => {
      if (path !== "/v2/user") return governedTransport(path, options);
      world.requests.push({ key, path, method: options.method });
      const text = JSON.stringify({
        error: { code: "forbidden", message: "Not authorized" },
      });
      return { ok: false, status: 403, text, errorText: text };
    };
  }

  function connect() {
    return connectVercelProjects({
      access: { mode: "token" },
      ...dirs(),
      env: { VERCEL_TOKEN: TOKEN },
    });
  }

  beforeEach(() => {
    // The token's team answers unscoped lookups as its own.
    world.projects[UNSCOPED] = governed("team_1");
    createTokenTransport.mockImplementation(({ teamId }) =>
      forbiddenUser(teamId ?? UNSCOPED),
    );
  });

  it("resolves the token's team and pins the returned API to it", async () => {
    const result = await connect();

    expect(result.projects).toEqual({
      client: {
        projectId: "prj_c",
        orgId: "team_1",
        projectName: "ichnos-protocol",
      },
      server: {
        projectId: "prj_s",
        orgId: "team_1",
        projectName: "ichnos-protocol_server",
      },
    });
    expect(createTokenTransport.mock.calls.at(-1)[0]).toEqual({
      token: TOKEN,
      teamId: "team_1",
    });
    expect(world.requests.map(({ path }) => path)).toEqual([
      "/v2/user",
      "/v9/projects/ichnos-protocol",
      "/v9/projects/ichnos-protocol_server",
    ]);
    expect(
      world.requests.some(({ path }) => path.startsWith("/v2/teams")),
    ).toBe(false);
    expect(world.requests.every(({ method }) => method === "GET")).toBe(true);
    expect(JSON.stringify(result.projects)).not.toContain(TOKEN);
  });

  it("passes a matching client link file and never writes it", async () => {
    const path = join(
      link("client", {
        projectId: "prj_c",
        orgId: "team_1",
        projectName: EXPECTED_PROJECT_NAMES.client,
      }),
      ".vercel",
      "project.json",
    );
    const before = [readFileSync(path, "utf8"), statSync(path).mtimeMs];

    await connect();

    expect([readFileSync(path, "utf8"), statSync(path).mtimeMs]).toEqual(
      before,
    );
  });

  it("refuses a client link whose orgId disagrees, before any write", async () => {
    link("client", {
      projectId: "prj_c",
      orgId: "team_old",
      projectName: EXPECTED_PROJECT_NAMES.client,
    });

    const error = await connect().catch((err) => err);

    expect(error.message).toMatch(
      /client\/\.vercel\/project\.json orgId 'team_old' disagrees with the discovered team scope 'team_1', whose value is 'team_1'/,
    );
    expect(error.message).not.toContain(TOKEN);
    expect(world.requests.every(({ method }) => method === "GET")).toBe(true);
  });
});

describe("connectVercelProjects token redaction", () => {
  function echoingTransport(status) {
    return async () => {
      const text = JSON.stringify({
        error: { code: `bad_${TOKEN}`, message: `token ${TOKEN} rejected` },
      });
      return { ok: false, status, text, errorText: `${text} ${TOKEN}` };
    };
  }

  it("never exposes the token through an unscoped API error", async () => {
    createTokenTransport.mockImplementation(() => echoingTransport(403));

    const error = await connectVercelProjects({
      access: { mode: "token" },
      ...dirs(),
      env: { VERCEL_TOKEN: ` ${TOKEN} ` },
    }).catch((err) => err);

    expect(JSON.stringify({ ...error, message: error.message })).not.toContain(
      TOKEN,
    );
  });

  it("never exposes the token through a scoped API error", async () => {
    createTokenTransport.mockImplementation(({ teamId }) =>
      teamId ? echoingTransport(403) : fakeTransport("unscoped-or-personal"),
    );

    const error = await connectVercelProjects({
      access: { mode: "token" },
      ...dirs(),
      env: { VERCEL_TOKEN: TOKEN },
    }).catch((err) => err);

    expect(error.code).toBe("unknown");
    expect(JSON.stringify({ ...error, message: error.message })).not.toContain(
      TOKEN,
    );
  });

  it("never exposes the token through the returned API", async () => {
    world.projects.team_1 = governed("team_1");
    createTokenTransport.mockImplementation(({ teamId }) => {
      const governedTransport = fakeTransport(teamId ?? "unscoped-or-personal");
      return (path, options) =>
        path === "/probe"
          ? echoingTransport(500)(path, options)
          : governedTransport(path, options);
    });
    const result = await connectVercelProjects({
      access: { mode: "token" },
      ...dirs(),
      env: { VERCEL_TOKEN: TOKEN },
    });

    const error = await result.api.request("/probe").catch((err) => err);

    expect(error.status).toBe(500);
    expect(JSON.stringify({ ...error, message: error.message })).not.toContain(
      TOKEN,
    );
  });
});

describe("connectVercelProjects over the CLI session", () => {
  const OTHER = { id: "team_0", slug: "other" };
  const HOME = { id: "team_9", slug: "alice-home" };
  const ACCOUNT_PATHS = ["/v2/user", "/v2/teams?limit=100"];

  function accountReads(cli) {
    return cli.requests.filter(({ path }) => ACCOUNT_PATHS.includes(path));
  }

  function connect(cli) {
    return connectVercelProjects({
      access: { mode: "cli" },
      ...dirs(),
      run: cli.run,
    });
  }

  it("clears an existing current team for a legacy personal-scope account", async () => {
    const cli = createFakeVercelCli({
      user: CLI_USER,
      teams: [OTHER],
      currentTeam: "team_0",
      projects: {
        user_1: governed("user_1"),
        team_0: governed("team_0"),
      },
    });

    const error = await connect(cli).catch((err) => err);

    // Both scopes hold the projects: seen only because personal lookups
    // ran with the current team cleared, not inherited as team_0.
    expect(error.message).toMatch(/refusing to choose/);
    expect(error.message).toContain("personal 'alice'");
    expect(error.message).toContain("team 'other'");
    expect(cli.requests.every((request) => scopeOf(request))).toBe(true);
    for (const request of accountReads(cli)) {
      expect(request.teamId).toBeNull();
    }
  });

  it("resolves the legacy personal scope with its username while a team is current", async () => {
    const cli = createFakeVercelCli({
      user: CLI_USER,
      teams: [OTHER],
      currentTeam: "team_0",
      projects: { user_1: governed("user_1") },
    });

    const result = await connect(cli);

    expect(result.projects.client.orgId).toBe("user_1");
    expect(cli.requests.every((request) => scopeOf(request))).toBe(true);
    const personal = cli.requests.filter((r) => scopeOf(r) === "alice");
    expect(personal.length).toBeGreaterThan(0);
    expect(personal.every(({ teamId }) => teamId === null)).toBe(true);
    // The fake CLI answers an unknown path with a zero-exit error envelope.
    await expect(result.api.request("/probe")).rejects.toMatchObject({
      code: "not_found",
    });
    expect(cli.requests.at(-1)).toMatchObject({ teamId: null });
  });

  it("discovers a team that is not the current team", async () => {
    const cli = createFakeVercelCli({
      user: CLI_USER,
      teams: [OTHER, TEAM],
      currentTeam: "team_0",
      projects: { team_1: governed("team_1") },
    });

    const result = await connect(cli);

    expect(result.projects.server.orgId).toBe("team_1");
    const lookups = cli.requests.filter((r) => r.path.startsWith("/v9/"));
    expect(new Set(lookups.map(({ teamId }) => teamId))).toEqual(
      new Set([null, "team_0", "team_1"]),
    );
    // The fake CLI answers an unknown path with a zero-exit error envelope.
    await expect(result.api.request("/probe")).rejects.toMatchObject({
      code: "not_found",
    });
    expect(cli.requests.at(-1)).toMatchObject({ teamId: "team_1" });
  });

  it.each([
    ["only a team holds the projects", { team_9: governed("team_9") }],
    [
      "the personal scope and a team both hold them",
      { user_1: governed("user_1"), team_9: governed("team_9") },
    ],
  ])(
    "refuses a Northstar account whose personal scope it cannot probe, when %s",
    async (_label, projects) => {
      const cli = createFakeVercelCli({
        user: { ...CLI_USER, version: "northstar", defaultTeamId: "team_9" },
        teams: [HOME, OTHER],
        currentTeam: "team_9",
        projects,
      });

      const error = await connect(cli).catch((err) => err);

      expect(error.message).toMatch(
        /cannot probe the personal scope 'alice' of this Northstar account/,
      );
      expect(error.message).toMatch(/Export VERCEL_TOKEN/);
      expect(error.message).toMatch(/Nothing was changed.$/);
      const personalScopes = cli.calls.filter(
        (args) => args[args.indexOf("--scope") + 1] === "alice",
      );
      expect(personalScopes).toHaveLength(1); // the refused probe only
      expect(cli.requests.length).toBeGreaterThan(0);
      expect(cli.requests.every(({ method }) => method === "GET")).toBe(true);
      expect(cli.requests.every((request) => scopeOf(request))).toBe(true);
      for (const request of accountReads(cli)) {
        expect(request.teamId).toBe("team_0");
      }
      expect(cli.requests.some((r) => r.path.startsWith("/v9/"))).toBe(false);
    },
  );

  it("refuses before any lookup when the CLI session is not signed in", async () => {
    const run = vi.fn(() => ({
      status: 1,
      stdout: "",
      stderr: "Error: No existing credentials found.\n",
    }));

    await expect(
      connectVercelProjects({ access: { mode: "cli" }, ...dirs(), run }),
    ).rejects.toThrowError(/whoami failed/);
    expect(run).toHaveBeenCalledTimes(1);
  });
});
