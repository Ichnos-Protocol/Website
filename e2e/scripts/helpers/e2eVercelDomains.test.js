import { describe, it, expect, vi } from "vitest";

import { createVercelApi } from "./e2eVercelApi.js";
import {
  assertE2EDomainsFollowMain,
  domainMismatch,
  domainPath,
  domainRefusal,
} from "./e2eVercelDomains.js";

const CLIENT_HOST = "e2e-client.ichnos-protocol.com";
const SERVER_HOST = "e2e-api.ichnos-protocol.com";
const PROJECTS = {
  client: { projectId: "prj_c", projectName: "ichnos-protocol" },
  server: { projectId: "prj_s", projectName: "ichnos-protocol_server" },
};

function domain(name, overrides) {
  return { name, gitBranch: "main", redirect: null, ...overrides };
}

// domains maps a host to its GET body, or to an Error the request throws.
function fakeApi(domains) {
  const request = vi.fn(async (path) => {
    const host = decodeURIComponent(path.split("/").pop());
    const body = domains[host];
    if (body instanceof Error) throw body;
    return body;
  });
  return { request, registerSecret: vi.fn() };
}

function healthy() {
  return {
    [CLIENT_HOST]: domain(CLIENT_HOST),
    [SERVER_HOST]: domain(SERVER_HOST),
  };
}

describe("domainPath", () => {
  it("percent-encodes the project id and the host", () => {
    expect(domainPath("prj/c", "a b.example.com")).toBe(
      "/v9/projects/prj%2Fc/domains/a%20b.example.com",
    );
  });
});

describe("domainMismatch", () => {
  it.each([
    ["the exact host on main with no redirect", domain(CLIENT_HOST), null],
    [
      "an upper-case name",
      domain("E2E-Client.Ichnos-Protocol.com"),
      "the response names another domain, and it follows branch main",
    ],
    [
      "a name with a trailing dot",
      domain(`${CLIENT_HOST}.`),
      "the response names another domain, and it follows branch main",
    ],
    [
      "a full URL as the name",
      domain(`https://${CLIENT_HOST}`),
      "the response names another domain, and it follows branch main",
    ],
    [
      "a name with a path",
      domain(`${CLIENT_HOST}/path`),
      "the response names another domain, and it follows branch main",
    ],
    [
      "a name with a port",
      domain(`${CLIENT_HOST}:443`),
      "the response names another domain, and it follows branch main",
    ],
    [
      "a malformed name",
      domain("http://[::1"),
      "the response names another domain, and it follows branch main",
    ],
    [
      "a non-string name",
      domain(42),
      "the response names another domain, and it follows branch main",
    ],
    [
      "an absent redirect field",
      { name: CLIENT_HOST, gitBranch: "main" },
      null,
    ],
    [
      "a false redirect",
      domain(CLIENT_HOST, { redirect: false }),
      "it redirects, and it follows branch main",
    ],
    [
      "an empty-string redirect",
      domain(CLIENT_HOST, { redirect: "" }),
      "it redirects, and it follows branch main",
    ],
    [
      "a zero redirect",
      domain(CLIENT_HOST, { redirect: 0 }),
      "it redirects, and it follows branch main",
    ],
    [
      "a staging branch",
      domain(CLIENT_HOST, { gitBranch: "staging" }),
      "it follows branch staging",
    ],
    [
      "a missing gitBranch",
      { name: CLIENT_HOST, redirect: null },
      "it follows no git branch",
    ],
    [
      "a redirect",
      domain(CLIENT_HOST, { redirect: "ichnos-protocol.com" }),
      "it redirects, and it follows branch main",
    ],
    [
      "another domain",
      domain("e2e-api.ichnos-protocol.com"),
      "the response names another domain, and it follows branch main",
    ],
    [
      "a redirect on staging",
      domain(CLIENT_HOST, { redirect: "x.example.com", gitBranch: "staging" }),
      "it redirects, and it follows branch staging",
    ],
    [
      "a redirect with no gitBranch",
      { name: CLIENT_HOST, redirect: "x.example.com" },
      "it redirects, and it follows no git branch",
    ],
    [
      "another domain on staging",
      domain("e2e-api.ichnos-protocol.com", { gitBranch: "staging" }),
      "the response names another domain, and it follows branch staging",
    ],
    [
      "another domain with a null gitBranch",
      domain("e2e-api.ichnos-protocol.com", { gitBranch: null }),
      "the response names another domain, and it follows no git branch",
    ],
    [
      "an empty body",
      {},
      "the response names another domain, and it follows no git branch",
    ],
    [
      "no body",
      undefined,
      "the response names another domain, and it follows no git branch",
    ],
  ])("reports %s", (_label, body, expected) => {
    expect(domainMismatch(body, CLIENT_HOST)).toBe(expected);
  });
});

describe("domainRefusal", () => {
  it("names host, project and reason and ends with Nothing was changed.", () => {
    const message = domainRefusal({
      host: CLIENT_HOST,
      projectName: "ichnos-protocol",
      reason: "it follows branch staging",
    });

    expect(message).toContain(CLIENT_HOST);
    expect(message).toContain("ichnos-protocol");
    expect(message).toContain("branch staging");
    expect(message).toMatch(/Nothing was changed\.$/);
  });
});

describe("assertE2EDomainsFollowMain", () => {
  it("passes when both domains follow main, issuing only GET requests", async () => {
    const api = fakeApi(healthy());

    await expect(
      assertE2EDomainsFollowMain({ api, projects: PROJECTS }),
    ).resolves.toBeUndefined();

    expect(api.request.mock.calls).toEqual([
      [`/v9/projects/prj_c/domains/${CLIENT_HOST}`],
      [`/v9/projects/prj_s/domains/${SERVER_HOST}`],
    ]);
  });

  it("refuses a server domain following staging, naming host, project and branch", async () => {
    const api = fakeApi({
      ...healthy(),
      [SERVER_HOST]: domain(SERVER_HOST, { gitBranch: "staging" }),
    });

    const error = await assertE2EDomainsFollowMain({
      api,
      projects: PROJECTS,
    }).catch((err) => err);

    expect(error.message).toContain(SERVER_HOST);
    expect(error.message).toContain("ichnos-protocol_server");
    expect(error.message).toContain("follows branch staging");
    expect(error.message).toMatch(/Nothing was changed\.$/);
  });

  it("stops at the first refused domain", async () => {
    const api = fakeApi({
      ...healthy(),
      [CLIENT_HOST]: domain(CLIENT_HOST, { redirect: "x.example.com" }),
    });

    await expect(
      assertE2EDomainsFollowMain({ api, projects: PROJECTS }),
    ).rejects.toThrowError(
      /e2e-client\.ichnos-protocol\.com.*it redirects, and it follows branch main/,
    );
    expect(api.request).toHaveBeenCalledTimes(1);
  });

  it("names the branch found when a wrong-name response follows staging", async () => {
    const api = fakeApi({
      ...healthy(),
      [SERVER_HOST]: domain(CLIENT_HOST, { gitBranch: "staging" }),
    });

    const error = await assertE2EDomainsFollowMain({
      api,
      projects: PROJECTS,
    }).catch((err) => err);

    expect(error.message).toContain(SERVER_HOST);
    expect(error.message).toContain("ichnos-protocol_server");
    expect(error.message).toContain(
      "names another domain, and it follows branch staging",
    );
    expect(error.message).toMatch(/Nothing was changed\.$/);
  });

  it("accepts domain bodies that omit the redirect field", async () => {
    const api = fakeApi({
      [CLIENT_HOST]: { name: CLIENT_HOST, gitBranch: "main" },
      [SERVER_HOST]: { name: SERVER_HOST, gitBranch: "main" },
    });

    await expect(
      assertE2EDomainsFollowMain({ api, projects: PROJECTS }),
    ).resolves.toBeUndefined();

    expect(api.request.mock.calls).toEqual([
      [`/v9/projects/prj_c/domains/${CLIENT_HOST}`],
      [`/v9/projects/prj_s/domains/${SERVER_HOST}`],
    ]);
  });

  it("says a redirected domain follows no branch when gitBranch is absent", async () => {
    const api = fakeApi({
      ...healthy(),
      [CLIENT_HOST]: { name: CLIENT_HOST, redirect: "x.example.com" },
    });

    await expect(
      assertE2EDomainsFollowMain({ api, projects: PROJECTS }),
    ).rejects.toThrowError(/it redirects, and it follows no git branch\./);
  });

  it("turns a not_found into a refusal", async () => {
    const notFound = Object.assign(new Error("Vercel API GET failed"), {
      code: "not_found",
      detail: "not_found: The domain was not found",
    });
    const api = fakeApi({ ...healthy(), [CLIENT_HOST]: notFound });

    await expect(
      assertE2EDomainsFollowMain({ api, projects: PROJECTS }),
    ).rejects.toThrowError(
      /e2e-client\.ichnos-protocol\.com on the ichnos-protocol Vercel project.*is not found.*Nothing was changed\.$/,
    );
  });

  it("turns a zero-exit error envelope into a refusal with the redacted detail", async () => {
    const transport = vi.fn(async (path) => {
      const body = path.includes("prj_s")
        ? { error: { code: "forbidden", message: "Not authorized" } }
        : domain(CLIENT_HOST);
      return { ok: true, status: 0, text: JSON.stringify(body) };
    });
    const api = createVercelApi({ transport });

    const error = await assertE2EDomainsFollowMain({
      api,
      projects: PROJECTS,
    }).catch((err) => err);

    expect(error.message).toContain(SERVER_HOST);
    expect(error.message).toContain("ichnos-protocol_server");
    expect(error.message).toMatch(
      /could not be read \(forbidden: Not authorized\)/,
    );
    expect(error.message).toMatch(/Nothing was changed\.$/);
    expect(transport.mock.calls.map(([, opts]) => opts.method)).toEqual([
      "GET",
      "GET",
    ]);
  });
});
