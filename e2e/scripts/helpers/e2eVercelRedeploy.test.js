import { describe, it, expect, vi } from "vitest";

import {
  findDeploymentForAlias,
  normalizeHost,
  redeployProject,
} from "./e2eVercelRedeploy.js";

const URL_VALUE = "https://e2e-api.ichnos-protocol.com";
const SERVER = { projectId: "prj_s", projectName: "ichnos-protocol_server" };

const PREVIEW = { projectId: "prj_s", target: null };

function fakeApi(pages, deployment = PREVIEW) {
  const request = vi.fn(async (path, { method = "GET" } = {}) => {
    if (method === "POST") return { id: "dpl_new" };
    if (path.startsWith("/v13/deployments/")) {
      return { id: decodeURIComponent(path.split("/")[3]), ...deployment };
    }
    const until = new URLSearchParams(path.split("?")[1]).get("until");
    return pages[until ?? "first"];
  });
  return { request };
}

function posts(api) {
  return api.request.mock.calls.filter(([, opts]) => opts?.method === "POST");
}

describe("normalizeHost", () => {
  it("lowercases, drops the port and a trailing dot", () => {
    expect(normalizeHost("https://E2E-API.Ichnos-Protocol.com.:443/x")).toBe(
      "e2e-api.ichnos-protocol.com",
    );
    expect(normalizeHost("e2e-api.ichnos-protocol.com")).toBe(
      "e2e-api.ichnos-protocol.com",
    );
  });
});

describe("findDeploymentForAlias", () => {
  it("uses only the exactly matching alias, across pages", async () => {
    const api = fakeApi({
      first: {
        aliases: [
          {
            alias: "staging-e2e-api.ichnos-protocol.com",
            deploymentId: "dpl_a",
          },
          {
            alias: "e2e-api.ichnos-protocol.com.evil.app",
            deploymentId: "dpl_b",
          },
        ],
        pagination: { next: 111 },
      },
      111: {
        aliases: [
          { alias: "e2e-api.ichnos-protocol.com", deploymentId: "dpl_ok" },
        ],
        pagination: { next: null },
      },
    });

    await expect(
      findDeploymentForAlias({ api, projectId: "prj_s", url: URL_VALUE }),
    ).resolves.toBe("dpl_ok");
    expect(api.request.mock.calls[0][0]).toBe(
      "/v4/aliases?projectId=prj_s&limit=100",
    );
    expect(api.request.mock.calls[1][0]).toContain("&until=111");
  });

  it.each([
    ["a different subdomain", "e2e-apis.ichnos-protocol.com"],
    ["a port", "e2e-api.ichnos-protocol.com:8443"],
    ["a longer suffix", "e2e-api.ichnos-protocol.com.cdn.net"],
  ])("does not accept %s", async (_label, alias) => {
    const api = fakeApi({
      first: { aliases: [{ alias, deploymentId: "dpl_x" }], pagination: {} },
    });

    await expect(
      findDeploymentForAlias({ api, projectId: "prj_s", url: URL_VALUE }),
    ).resolves.toBeNull();
  });
});

describe("redeployProject", () => {
  it("redeploys the matched deployment under the project name", async () => {
    const api = fakeApi({
      first: {
        aliases: [
          { alias: "e2e-api.ichnos-protocol.com", deploymentId: "dpl_ok" },
        ],
        pagination: {},
      },
    });

    const result = await redeployProject({
      api,
      project: SERVER,
      url: URL_VALUE,
    });

    expect(result).toEqual({
      project: "ichnos-protocol_server",
      host: "e2e-api.ichnos-protocol.com",
      status: "success",
      deploymentId: "dpl_new",
    });
    expect(api.request).toHaveBeenCalledWith("/v13/deployments/dpl_ok");
    const [[path, opts]] = posts(api);
    expect(path).toBe("/v13/deployments?forceNew=1");
    expect(opts.body).toEqual({
      name: "ichnos-protocol_server",
      deploymentId: "dpl_ok",
    });
  });

  it("fails with zero POST calls when no deployment serves the host", async () => {
    const api = fakeApi({
      first: {
        aliases: [
          { alias: "other.ichnos-protocol.com", deploymentId: "dpl_x" },
        ],
        pagination: {},
      },
    });

    const result = await redeployProject({
      api,
      project: SERVER,
      url: URL_VALUE,
    });

    expect(result).toMatchObject({
      status: "failed",
      reason: "no deployment serves e2e-api.ichnos-protocol.com",
    });
    expect(posts(api)).toHaveLength(0);
  });

  const SERVED = {
    first: {
      aliases: [
        { alias: "e2e-api.ichnos-protocol.com", deploymentId: "dpl_ok" },
      ],
      pagination: {},
    },
  };

  it("accepts a deployment reporting target preview", async () => {
    const api = fakeApi(SERVED, { projectId: "prj_s", target: "preview" });

    const result = await redeployProject({
      api,
      project: SERVER,
      url: URL_VALUE,
    });

    expect(result.status).toBe("success");
    expect(posts(api)).toHaveLength(1);
  });

  it.each([
    [
      "a Production deployment",
      { projectId: "prj_s", target: "production" },
      /Production deployment/,
    ],
    ["an absent target", { projectId: "prj_s" }, /target is unknown/],
    [
      "an unrecognised target",
      { projectId: "prj_s", target: "staging" },
      /target 'staging' is not Preview/,
    ],
    [
      "a custom environment",
      { projectId: "prj_s", target: null, customEnvironment: { id: "env_1" } },
      /custom environment/,
    ],
    [
      "another project",
      { projectId: "prj_other", target: null },
      /different project/,
    ],
  ])(
    "fails with zero POST calls when the alias resolves to %s",
    async (_label, deployment, reason) => {
      const api = fakeApi(SERVED, deployment);

      const result = await redeployProject({
        api,
        project: SERVER,
        url: URL_VALUE,
      });

      expect(result).toMatchObject({ status: "failed" });
      expect(result.reason).toMatch(reason);
      expect(result.reason).toMatch(/Nothing was deployed/);
      expect(posts(api)).toHaveLength(0);
    },
  );

  it("fails with zero POST calls when the metadata names another deployment", async () => {
    const api = fakeApi(SERVED);
    api.request.mockImplementation(async (path, { method = "GET" } = {}) => {
      if (method === "POST") return { id: "dpl_new" };
      if (path.startsWith("/v13/deployments/")) {
        return { id: "dpl_else", projectId: "prj_s", target: null };
      }
      return SERVED.first;
    });

    const result = await redeployProject({
      api,
      project: SERVER,
      url: URL_VALUE,
    });

    expect(result.reason).toMatch(/different deployment/);
    expect(posts(api)).toHaveLength(0);
  });
});
