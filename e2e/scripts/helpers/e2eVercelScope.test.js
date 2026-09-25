import { describe, it, expect } from "vitest";

import {
  candidateScopes,
  discoverVercelScope,
  lookupProject,
  MAX_TEAM_PAGES,
} from "./e2eVercelScope.js";

const NAMES = { client: "ichnos-client", server: "ichnos-protocol_server" };
const USER = { id: "user_1", username: "alice" };

function project(name, id, accountId) {
  return { id, name, accountId };
}

function notFoundError() {
  const error = new Error("Vercel API GET /v9/projects/x failed (1): 404");
  error.status = 1;
  error.detail = "Error: Project not found (404)";
  return error;
}

/**
 * A fake Vercel: `teams` are the /v2/teams pages, `projects` maps a scope id
 * to { name: response }, where a response is a project body, an error body,
 * or an Error to throw. A name missing from a scope is a 404.
 */
function fakeVercel({ user = USER, teams = [[]], projects = {} }) {
  const requests = [];
  const record = (scopeId, path, options) =>
    requests.push({
      scopeId,
      path,
      method: options?.method ?? "GET",
      options,
    });

  const unscopedApi = {
    async request(path, options) {
      record(null, path, options);
      if (path === "/v2/user") return { user };
      const until = new URLSearchParams(path.split("?")[1]).get("until");
      const index = until ? Number(until) : 0;
      const next = index + 1 < teams.length ? String(index + 1) : null;
      return { teams: teams[index], pagination: { count: 0, next } };
    },
  };

  function scopedApiFor(scope) {
    return {
      async request(path, options) {
        record(scope.id, path, options);
        const name = decodeURIComponent(path.replace("/v9/projects/", ""));
        const response = projects[scope.id]?.[name];
        if (response === undefined) throw notFoundError();
        if (response instanceof Error) throw response;
        return response;
      },
    };
  }

  return { requests, unscopedApi, scopedApiFor };
}

function discover(vercel) {
  return discoverVercelScope({
    scopedApiFor: vercel.scopedApiFor,
    unscopedApi: vercel.unscopedApi,
    names: NAMES,
  });
}

const TEAM_A = { id: "team_a", slug: "acme" };
const TEAM_B = { id: "team_b", slug: "beta" };

function bothIn(scopeId) {
  return {
    "ichnos-client": project("ichnos-client", `prj_c_${scopeId}`, scopeId),
    "ichnos-protocol_server": project(
      "ichnos-protocol_server",
      `prj_s_${scopeId}`,
      scopeId,
    ),
  };
}

describe("discoverVercelScope", () => {
  it("resolves the one team holding both governed projects", async () => {
    const vercel = fakeVercel({
      teams: [[TEAM_A, TEAM_B]],
      projects: { team_b: bothIn("team_b") },
    });

    const { scope, projects } = await discover(vercel);

    expect(scope).toEqual({
      kind: "team",
      id: "team_b",
      label: "beta",
      cliScope: "beta",
    });
    expect(projects).toEqual({
      client: {
        projectId: "prj_c_team_b",
        orgId: "team_b",
        projectName: "ichnos-client",
      },
      server: {
        projectId: "prj_s_team_b",
        orgId: "team_b",
        projectName: "ichnos-protocol_server",
      },
    });
  });

  it("resolves the personal scope with no team id", async () => {
    const vercel = fakeVercel({
      teams: [[TEAM_A]],
      projects: { user_1: bothIn("user_1") },
    });

    const { scope, projects } = await discover(vercel);

    expect(scope).toEqual({
      kind: "personal",
      id: "user_1",
      label: "alice",
      cliScope: "alice",
    });
    expect(scope.id.startsWith("team_")).toBe(false);
    expect(projects.server.orgId).toBe("user_1");
  });

  it("accepts a bare user object from /v2/user", async () => {
    const vercel = fakeVercel({ projects: { user_1: bothIn("user_1") } });
    const bare = {
      request: async (path) =>
        path === "/v2/user" ? USER : vercel.unscopedApi.request(path),
    };

    const { scope } = await discoverVercelScope({
      scopedApiFor: vercel.scopedApiFor,
      unscopedApi: bare,
      names: NAMES,
    });

    expect(scope.id).toBe("user_1");
  });

  it("refuses without a user id", async () => {
    const vercel = fakeVercel({ user: { username: "alice" } });

    await expect(discover(vercel)).rejects.toThrowError(/no user id/);
  });

  it("refuses when no scope qualifies, listing every scope inspected", async () => {
    const vercel = fakeVercel({
      teams: [[TEAM_A, TEAM_B]],
      projects: {
        team_a: {
          "ichnos-client": project("ichnos-client", "prj_c", "team_a"),
        },
      },
    });

    const error = await discover(vercel).catch((err) => err);

    expect(error.message).toMatch(/No Vercel scope holds both/);
    expect(error.message).toMatch(
      /personal 'alice': none of the governed projects/,
    );
    expect(error.message).toMatch(/team 'acme': ichnos-client \(prj_c\)/);
    expect(error.message).toMatch(/team 'beta': none of the governed projects/);
    expect(error.message).toMatch(/Nothing was changed\.$/);
  });

  it("refuses two qualifying scopes and chooses neither", async () => {
    const vercel = fakeVercel({
      teams: [[TEAM_A, TEAM_B]],
      projects: { team_a: bothIn("team_a"), team_b: bothIn("team_b") },
    });

    const error = await discover(vercel).catch((err) => err);

    expect(error.message).toMatch(
      /hold both 'ichnos-client' and 'ichnos-protocol_server'; refusing to choose/,
    );
    for (const [label, id] of [
      ["acme", "team_a"],
      ["beta", "team_b"],
    ]) {
      expect(error.message).toContain(
        `team '${label}': ichnos-client (prj_c_${id}), ichnos-protocol_server (prj_s_${id})`,
      );
    }
    expect(error.message).not.toMatch(/personal/);
    expect(error.message).toMatch(/Nothing was changed\.$/);
  });

  it("refuses when the client and server sit in different scopes", async () => {
    const vercel = fakeVercel({
      teams: [[TEAM_A, TEAM_B]],
      projects: {
        team_a: { "ichnos-client": bothIn("team_a")["ichnos-client"] },
        team_b: {
          "ichnos-protocol_server": bothIn("team_b")["ichnos-protocol_server"],
        },
      },
    });

    await expect(discover(vercel)).rejects.toThrowError(
      /No Vercel scope holds both/,
    );
  });

  it.each([
    ["Ichnos-Client"],
    ["ichnos-client-old"],
    ["ichnos"],
    ["ichnos-protocol"],
  ])("does not qualify a lookup that returns %s", async (name) => {
    const vercel = fakeVercel({
      teams: [[TEAM_A]],
      projects: {
        team_a: {
          ...bothIn("team_a"),
          "ichnos-client": project(name, "prj_x", "team_a"),
        },
      },
    });

    const error = await discover(vercel).catch((err) => err);

    expect(error.message).toMatch(/No Vercel scope holds both/);
    expect(error.message).toMatch(/does not agree with this scope/);
  });

  it("does not qualify a project whose accountId belongs to another scope", async () => {
    const vercel = fakeVercel({
      teams: [[TEAM_A]],
      projects: {
        team_a: {
          ...bothIn("team_a"),
          "ichnos-protocol_server": project(
            "ichnos-protocol_server",
            "prj_s",
            "team_other",
          ),
        },
      },
    });

    await expect(discover(vercel)).rejects.toThrowError(
      /ichnos-protocol_server \(prj_s, does not agree with this scope\)/,
    );
  });

  it("treats a not_found body as an absence and keeps looking", async () => {
    const vercel = fakeVercel({
      teams: [[TEAM_A, TEAM_B]],
      projects: {
        team_a: { "ichnos-client": { error: { code: "not_found" } } },
        team_b: bothIn("team_b"),
      },
    });

    await expect(discover(vercel)).resolves.toMatchObject({
      scope: { id: "team_b" },
    });
  });

  it.each([
    [
      "a 401",
      Object.assign(new Error("failed (401): unauthorized"), {
        status: 401,
        detail: "unauthorized",
      }),
      /unauthorized/,
    ],
    [
      "a 403",
      Object.assign(new Error("failed (403): forbidden"), {
        status: 403,
        detail: "forbidden",
      }),
      /forbidden/,
    ],
    [
      "a 429",
      Object.assign(new Error("failed (429): rate limit"), {
        status: 429,
        detail: "rate limit exceeded",
      }),
      /rate limit/,
    ],
    ["an error body", { error: { code: "forbidden" } }, /failed: forbidden/],
    ["an unknown shape", { something: "else" }, /unrecognised response shape/],
  ])(
    "stops on %s and preserves its message",
    async (_label, response, pattern) => {
      const vercel = fakeVercel({
        teams: [[TEAM_A, TEAM_B]],
        projects: {
          user_1: { "ichnos-client": response },
          team_b: bothIn("team_b"),
        },
      });

      await expect(discover(vercel)).rejects.toThrowError(pattern);
      expect(vercel.requests.some((r) => r.scopeId === "team_a")).toBe(false);
    },
  );

  it("issues only GET requests", async () => {
    const vercel = fakeVercel({
      teams: [[TEAM_A]],
      projects: { team_a: bothIn("team_a") },
    });

    await discover(vercel);

    expect(vercel.requests.length).toBeGreaterThan(0);
    for (const { method, options } of vercel.requests) {
      expect(method).toBe("GET");
      expect(options).toBeUndefined();
    }
  });
});

describe("team pagination", () => {
  it("follows pagination.next so every team is a candidate", async () => {
    const vercel = fakeVercel({
      teams: [[TEAM_B], [TEAM_A], [{ id: "team_c", slug: "gamma" }]],
      projects: { team_c: bothIn("team_c") },
    });

    const { scope } = await discover(vercel);

    expect(scope.id).toBe("team_c");
    const teamPaths = vercel.requests
      .filter((r) => r.path.startsWith("/v2/teams"))
      .map((r) => r.path);
    expect(teamPaths).toEqual([
      "/v2/teams?limit=100",
      "/v2/teams?limit=100&until=1",
      "/v2/teams?limit=100&until=2",
    ]);
  });

  it("refuses past the page cap", async () => {
    const pages = Array.from({ length: MAX_TEAM_PAGES + 1 }, (_, i) => [
      { id: `team_${i}`, slug: `t${i}` },
    ]);
    const vercel = fakeVercel({ teams: pages });

    await expect(discover(vercel)).rejects.toThrowError(
      /exceeds 50 pages; refusing to decide/,
    );
    expect(vercel.requests.some((r) => r.path.startsWith("/v9/"))).toBe(false);
  });
});

describe("team list validation", () => {
  // `vercel api` prints an HTTP error as a JSON body and exits zero.
  const ERROR_BODIES = [
    ["401", { error: { code: "unauthorized", message: "Not authorized" } }],
    ["403", { error: { code: "forbidden", message: "Not authorized" } }],
    ["429", { error: { code: "rate_limited", message: "Rate limited" } }],
  ];

  function withTeamPages(vercel, pages) {
    return {
      ...vercel,
      unscopedApi: {
        async request(path, options) {
          if (path === "/v2/user") return vercel.unscopedApi.request(path);
          vercel.requests.push({ scopeId: null, path, method: "GET", options });
          const until = new URLSearchParams(path.split("?")[1]).get("until");
          return pages[until ? Number(until) : 0];
        },
      },
    };
  }

  function expectNoProjectWork(vercel) {
    expect(vercel.requests.some((r) => r.path.startsWith("/v9/"))).toBe(false);
    expect(vercel.requests.every((r) => r.method === "GET")).toBe(true);
  }

  it.each(ERROR_BODIES)(
    "refuses a %s-style error body on the first page",
    async (_status, body) => {
      const vercel = withTeamPages(
        fakeVercel({ projects: { user_1: bothIn("user_1") } }),
        [body],
      );

      await expect(discover(vercel)).rejects.toThrowError(
        `page 1 returned an error (${body.error.code}); refusing to decide`,
      );
      expectNoProjectWork(vercel);
    },
  );

  it.each(ERROR_BODIES)(
    "refuses a %s-style error body on a later page",
    async (_status, body) => {
      const vercel = withTeamPages(
        fakeVercel({ projects: { team_a: bothIn("team_a") } }),
        [{ teams: [TEAM_A], pagination: { count: 1, next: 1 } }, body],
      );

      await expect(discover(vercel)).rejects.toThrowError(
        `page 2 returned an error (${body.error.code})`,
      );
      expectNoProjectWork(vercel);
    },
  );

  it.each([
    ["a missing teams array", { pagination: { next: null } }, /no teams array/],
    ["a non-array teams", { teams: { id: "team_a" } }, /no teams array/],
    ["a null body", null, /is not a JSON object/],
    [
      "a non-object pagination",
      { teams: [], pagination: "next" },
      /invalid pagination/,
    ],
    [
      "a malformed cursor",
      { teams: [], pagination: { count: 0, next: { at: 1 } } },
      /invalid pagination/,
    ],
    [
      "a null pagination",
      { teams: [], pagination: null },
      /invalid pagination/,
    ],
    [
      "an array pagination",
      { teams: [], pagination: [] },
      /invalid pagination/,
    ],
    [
      "a pagination without count",
      { teams: [], pagination: { next: null } },
      /invalid pagination/,
    ],
    [
      "an empty-string cursor",
      { teams: [], pagination: { count: 0, next: "" } },
      /invalid pagination/,
    ],
  ])(
    "refuses %s instead of treating it as a last page",
    async (_l, body, pattern) => {
      const vercel = withTeamPages(
        fakeVercel({ projects: { user_1: bothIn("user_1") } }),
        [body],
      );

      await expect(discover(vercel)).rejects.toThrowError(pattern);
      expectNoProjectWork(vercel);
    },
  );

  const FULL_PAGE = Array.from({ length: 100 }, (_, i) => ({
    id: `team_${String(i).padStart(3, "0")}`,
    slug: `t${i}`,
  }));
  const TERMINAL = { teams: [TEAM_B], pagination: { count: 1, next: null } };

  it.each([
    [
      "a first page with no pagination",
      [{ teams: [TEAM_A] }],
      "page 1",
      /has no pagination/,
    ],
    [
      "a full first page with no pagination",
      [{ teams: FULL_PAGE }, TERMINAL],
      "page 1",
      /has no pagination/,
    ],
    [
      "a first page whose pagination has no next",
      [{ teams: FULL_PAGE, pagination: { count: 100 } }, TERMINAL],
      "page 1",
      /invalid pagination/,
    ],
    [
      "a later page with no pagination",
      [
        { teams: [TEAM_A], pagination: { count: 1, next: 1 } },
        { teams: [TEAM_B] },
      ],
      "page 2",
      /has no pagination/,
    ],
    [
      "a later page whose pagination has no next",
      [
        { teams: [TEAM_A], pagination: { count: 1, next: 1 } },
        { teams: [TEAM_B], pagination: { count: 1, prev: 0 } },
      ],
      "page 2",
      /invalid pagination/,
    ],
  ])(
    "refuses %s instead of treating it as a last page",
    async (_l, pages, page, pattern) => {
      const vercel = withTeamPages(
        fakeVercel({
          projects: { user_1: bothIn("user_1"), team_b: bothIn("team_b") },
        }),
        pages,
      );

      const error = await discover(vercel).catch((err) => err);

      expect(error.message).toContain(`Vercel GET /v2/teams ${page} `);
      expect(error.message).toMatch(pattern);
      expect(error.message).toMatch(/Nothing was changed\.$/);
      expectNoProjectWork(vercel);
    },
  );

  it("follows a numeric cursor, zero included, to an explicit null", async () => {
    const vercel = fakeVercel({ projects: { team_b: bothIn("team_b") } });
    const byCursor = {
      null: { teams: [TEAM_A], pagination: { count: 1, next: 0, prev: null } },
      0: TERMINAL,
    };
    const teamPaths = [];
    const unscopedApi = {
      async request(path) {
        if (path === "/v2/user") return vercel.unscopedApi.request(path);
        teamPaths.push(path);
        return byCursor[new URLSearchParams(path.split("?")[1]).get("until")];
      },
    };

    const { scope } = await discoverVercelScope({
      scopedApiFor: vercel.scopedApiFor,
      unscopedApi,
      names: NAMES,
    });

    expect(scope.id).toBe("team_b");
    expect(teamPaths).toEqual([
      "/v2/teams?limit=100",
      "/v2/teams?limit=100&until=0",
    ]);
  });
});

describe("candidateScopes", () => {
  it("keeps a Northstar account's personal scope as one candidate", async () => {
    const vercel = fakeVercel({
      user: { ...USER, version: "northstar", defaultTeamId: "team_a" },
      teams: [[TEAM_B, TEAM_A]],
    });

    const scopes = await candidateScopes({ api: vercel.unscopedApi });

    expect(scopes.map((s) => s.id)).toEqual(["user_1", "team_a", "team_b"]);
    expect(scopes.filter((s) => s.kind === "personal")).toEqual([
      { kind: "personal", id: "user_1", label: "alice", cliScope: "alice" },
    ]);
  });

  it("refuses a Northstar personal scope and a team that both qualify", async () => {
    const vercel = fakeVercel({
      user: { ...USER, version: "northstar", defaultTeamId: "team_a" },
      teams: [[TEAM_A]],
      projects: { user_1: bothIn("user_1"), team_a: bothIn("team_a") },
    });

    const error = await discover(vercel).catch((err) => err);

    expect(error.message).toMatch(/refusing to choose/);
    expect(error.message).toContain("personal 'alice'");
    expect(error.message).toContain("team 'acme'");
    expect(vercel.requests.every((r) => r.method === "GET")).toBe(true);
  });

  it("lists personal first, then teams by id, personal once", async () => {
    const vercel = fakeVercel({
      teams: [[TEAM_B, { id: "user_1", slug: "alice-team" }, TEAM_A]],
    });

    const scopes = await candidateScopes({ api: vercel.unscopedApi });

    expect(scopes.map((s) => s.id)).toEqual(["user_1", "team_a", "team_b"]);
    expect(scopes[0].kind).toBe("personal");
  });

  it("falls back to the team id when a team has no slug", async () => {
    const vercel = fakeVercel({ teams: [[{ id: "team_z" }]] });

    const scopes = await candidateScopes({ api: vercel.unscopedApi });

    expect(scopes[1]).toEqual({
      kind: "team",
      id: "team_z",
      label: "team_z",
      cliScope: "team_z",
    });
  });
});

describe("lookupProject", () => {
  it("encodes the name and reports a found project", async () => {
    const calls = [];
    const api = {
      request: async (path) => {
        calls.push(path);
        return project("ichnos-client", "prj_c", "team_a");
      },
    };

    await expect(
      lookupProject({ api, name: "ichnos-client" }),
    ).resolves.toEqual({ found: project("ichnos-client", "prj_c", "team_a") });
    expect(calls).toEqual(["/v9/projects/ichnos-client"]);
  });

  it("reports a thrown 404 as an absence", async () => {
    const api = {
      request: async () => {
        throw Object.assign(new Error("failed (404)"), { status: 404 });
      },
    };

    await expect(lookupProject({ api, name: "x" })).resolves.toEqual({
      absent: true,
    });
  });
});
