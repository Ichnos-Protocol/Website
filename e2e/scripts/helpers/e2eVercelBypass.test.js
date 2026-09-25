import { describe, it, expect, vi } from "vitest";

import {
  BYPASS_SCOPE,
  generateBypassSecret,
  syncBypassOnProject,
  syncBypassSecret,
} from "./e2eVercelBypass.js";

const NEW = "N".repeat(16) + "0123456789abcdef";
const OLD = "O".repeat(32);
const SHARE = "S".repeat(32);
const CLIENT = { projectId: "prj_c", projectName: "ichnos-client" };
const SERVER = { projectId: "prj_s", projectName: "ichnos-protocol_server" };

// A provider whose project maps accept a caller value unless `refuse` is set.
function fakeVercel({ refuse = [], failPatch = [] } = {}) {
  const maps = {
    prj_c: {
      [OLD]: { scope: BYPASS_SCOPE },
      [SHARE]: { scope: "shareable-link" },
    },
    prj_s: { [OLD]: { scope: BYPASS_SCOPE } },
  };
  const request = vi.fn(async (path, { method = "GET", body } = {}) => {
    const id = path.split("/")[3];
    if (method === "GET") return { protectionBypass: { ...maps[id] } };
    if (failPatch.includes(id)) throw new Error("Vercel API PATCH failed (1)");
    if (body.generate && !refuse.includes(id)) {
      maps[id][body.generate.secret] = { scope: BYPASS_SCOPE };
    }
    if (body.revoke) delete maps[id][body.revoke.secret];
    return {};
  });
  return { api: { request, registerSecret: vi.fn() }, maps };
}

function writes(request) {
  return request.mock.calls.filter(([, opts]) => opts?.method === "PATCH");
}

describe("generateBypassSecret", () => {
  it("returns 32 characters of [A-Za-z0-9]", () => {
    const secret = generateBypassSecret();

    expect(secret).toMatch(/^[a-zA-Z0-9]{32}$/);
    expect(generateBypassSecret()).not.toBe(secret);
  });

  it("draws each character with randomInt over the whole alphabet", () => {
    const randomInt = vi.fn(() => 61);

    expect(generateBypassSecret(randomInt)).toBe("9".repeat(32));
    expect(randomInt).toHaveBeenCalledWith(62);
  });
});

describe("syncBypassOnProject", () => {
  it("sets the caller value, revokes the old automation key and keeps others", async () => {
    const { api, maps } = fakeVercel();

    const result = await syncBypassOnProject({
      api,
      project: CLIENT,
      secret: NEW,
    });

    expect(result).toEqual({
      project: "ichnos-client",
      confirmed: true,
      revoked: 1,
      preserved: 1,
    });
    expect(Object.keys(maps.prj_c).sort()).toEqual([NEW, SHARE].sort());
    const [generate, revoke] = writes(api.request);
    expect(generate[0]).toBe("/v1/projects/prj_c/protection-bypass");
    expect(generate[1].body.generate.secret).toBe(NEW);
    expect(revoke[1].body).toEqual({
      revoke: { secret: OLD, regenerate: false },
    });
  });

  it("reports unconfirmed and makes no further call when the readback lacks the value", async () => {
    const { api } = fakeVercel({ refuse: ["prj_c"] });

    const result = await syncBypassOnProject({
      api,
      project: CLIENT,
      secret: NEW,
    });

    expect(result.confirmed).toBe(false);
    expect(api.request).toHaveBeenCalledTimes(2);
    expect(writes(api.request)).toHaveLength(1);
  });
});

describe("syncBypassSecret", () => {
  it("sends the identical value to both project maps", async () => {
    const { api, maps } = fakeVercel();

    const results = await syncBypassSecret({
      api,
      projects: [CLIENT, SERVER],
      secret: NEW,
    });

    expect(results.map((r) => r.confirmed)).toEqual([true, true]);
    expect(maps.prj_c[NEW]).toBeDefined();
    expect(maps.prj_s[NEW]).toBeDefined();
    expect(api.registerSecret).toHaveBeenCalledWith(NEW);
  });

  it("reports a partial failure per project", async () => {
    const { api } = fakeVercel({ failPatch: ["prj_s"] });

    const results = await syncBypassSecret({
      api,
      projects: [CLIENT, SERVER],
      secret: NEW,
    });

    expect(results[0].confirmed).toBe(true);
    expect(results[1]).toMatchObject({
      project: "ichnos-protocol_server",
      confirmed: false,
    });
  });

  it("puts neither the new nor an old value in any result or log line", async () => {
    const { api } = fakeVercel({ refuse: ["prj_s"] });
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    const err = vi.spyOn(console, "error").mockImplementation(() => {});

    const results = await syncBypassSecret({
      api,
      projects: [CLIENT, SERVER],
      secret: NEW,
    });

    const text = JSON.stringify([results, log.mock.calls, err.mock.calls]);
    expect(text).not.toContain(NEW);
    expect(text).not.toContain(OLD);
    log.mockRestore();
    err.mockRestore();
  });
});
