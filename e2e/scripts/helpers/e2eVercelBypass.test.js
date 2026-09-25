import { describe, it, expect, vi } from "vitest";

import {
  BYPASS_SCOPE,
  addBypassToProjects,
  addBypassValue,
  confirmBypassOnProjects,
  generateBypassSecret,
  readAutomationBypass,
  revokeOtherAutomationKeys,
  revokeStaleBypass,
  selectBypassValue,
} from "./e2eVercelBypass.js";

const NEW = "N".repeat(16) + "0123456789abcdef";
const OLD = "O".repeat(32);
const OTHER = "P".repeat(32);
const SHARE = "S".repeat(32);
const CLIENT = { projectId: "prj_c", projectName: "ichnos-client" };
const SERVER = { projectId: "prj_s", projectName: "ichnos-protocol_server" };

const auto = { scope: BYPASS_SCOPE };
const shareable = { scope: "shareable-link" };

// A provider whose maps are seeded per case; every PATCH body is recorded.
function fakeVercel({
  maps: seeded = {},
  refuse = [],
  failPatch = [],
  failRevoke = [],
} = {}) {
  const maps = { prj_c: {}, prj_s: {}, ...structuredClone(seeded) };
  const patches = [];
  const request = vi.fn(async (path, { method = "GET", body } = {}) => {
    const id = path.split("/")[3];
    if (method === "GET") return { protectionBypass: { ...maps[id] } };
    patches.push([id, body]);
    if (failPatch.includes(id)) throw new Error("Vercel API PATCH failed (1)");
    if (body.generate && !refuse.includes(id)) {
      maps[id][body.generate.secret] = { scope: BYPASS_SCOPE };
    }
    if (body.revoke) {
      if (failRevoke.includes(body.revoke.secret)) {
        throw new Error("Vercel API PATCH failed (500)");
      }
      delete maps[id][body.revoke.secret];
    }
    return {};
  });
  return { api: { request, registerSecret: vi.fn() }, maps, patches };
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

describe("readAutomationBypass", () => {
  it("registers every key read and reports the preserved count", async () => {
    const { api } = fakeVercel({
      maps: { prj_c: { [OLD]: auto, [SHARE]: shareable } },
    });

    const state = await readAutomationBypass({ api, project: CLIENT });

    expect(state).toEqual({
      project: "ichnos-client",
      keys: [OLD],
      preserved: 1,
    });
    expect(api.registerSecret).toHaveBeenCalledWith(OLD);
    expect(api.registerSecret).toHaveBeenCalledWith(SHARE);
  });
});

describe("selectBypassValue", () => {
  it("reuses the single shared key without generating", () => {
    const generate = vi.fn();

    const selected = selectBypassValue(
      [{ keys: [OLD, OTHER] }, { keys: [OLD] }],
      generate,
    );

    expect(selected).toEqual({ secret: OLD, generated: false });
    expect(generate).not.toHaveBeenCalled();
  });

  it("generates when no key is shared", () => {
    const selected = selectBypassValue(
      [{ keys: [OLD] }, { keys: [OTHER] }],
      () => NEW,
    );

    expect(selected).toEqual({ secret: NEW, generated: true });
  });

  it("picks the lexicographically smallest of several shared keys", () => {
    const selected = selectBypassValue(
      [{ keys: [OTHER, OLD] }, { keys: [OLD, OTHER] }],
      () => NEW,
    );

    expect(selected.secret).toBe(OLD);
  });
});

describe("addBypassValue", () => {
  it("issues no request when the project already holds the value", async () => {
    const { api } = fakeVercel();
    const state = { project: "ichnos-client", keys: [OLD], preserved: 1 };

    const result = await addBypassValue({
      api,
      project: CLIENT,
      state,
      secret: OLD,
    });

    expect(result).toEqual({
      project: "ichnos-client",
      heldBefore: true,
      added: false,
      present: true,
    });
    expect(api.request).not.toHaveBeenCalled();
  });

  it("patches once and re-reads when the project lacks the value", async () => {
    const { api, patches } = fakeVercel({ maps: { prj_c: { [OLD]: auto } } });
    const state = { project: "ichnos-client", keys: [OLD], preserved: 0 };

    const result = await addBypassValue({
      api,
      project: CLIENT,
      state,
      secret: NEW,
    });

    expect(result).toEqual({
      project: "ichnos-client",
      heldBefore: false,
      added: true,
      present: true,
    });
    expect(patches).toEqual([
      ["prj_c", { generate: { secret: NEW, note: expect.any(String) } }],
    ]);
    expect(api.request).toHaveBeenCalledTimes(2);
  });

  it("reports unconfirmed and makes no further call when the readback lacks the value", async () => {
    const { api } = fakeVercel({ refuse: ["prj_c"] });
    const state = { project: "ichnos-client", keys: [], preserved: 0 };

    const result = await addBypassValue({
      api,
      project: CLIENT,
      state,
      secret: NEW,
    });

    expect(result).toMatchObject({ added: true, present: false, stage: "add" });
    expect(result.reason).toMatch(/does not hold the value/);
    expect(api.request).toHaveBeenCalledTimes(2);
  });

  it("keeps added: true when the PATCH lands and the readback throws", async () => {
    const { api, maps } = fakeVercel();
    const base = api.request.getMockImplementation();
    api.request.mockImplementation(async (path, opts = {}) => {
      if (!opts.method) throw new Error("Vercel API GET failed (503)");
      return base(path, opts);
    });
    const state = { project: "ichnos-client", keys: [], preserved: 0 };

    const result = await addBypassValue({
      api,
      project: CLIENT,
      state,
      secret: NEW,
    });

    expect(maps.prj_c).toEqual({ [NEW]: auto });
    expect(result).toEqual({
      project: "ichnos-client",
      heldBefore: false,
      added: true,
      present: false,
      stage: "confirm",
      reason: expect.stringMatching(/add was accepted.*readback failed/),
    });
    expect(JSON.stringify(result)).not.toContain(NEW);
  });
});

describe("confirmBypassOnProjects", () => {
  it("re-reads every project and confirms only those whose fresh read holds the value", async () => {
    const { api } = fakeVercel({
      maps: { prj_c: { [OLD]: auto, [NEW]: auto }, prj_s: { [OLD]: auto } },
    });

    const finals = await confirmBypassOnProjects({
      api,
      projects: [CLIENT, SERVER],
      secret: NEW,
    });

    expect(finals.map((r) => [r.project, r.confirmed])).toEqual([
      ["ichnos-client", true],
      ["ichnos-protocol_server", false],
    ]);
    expect(finals[0].keys.sort()).toEqual([NEW, OLD].sort());
    expect(finals[1].reason).toMatch(/final readback does not hold/);
    expect(api.request).toHaveBeenCalledTimes(2);
  });
});

describe("addBypassToProjects", () => {
  it("stops before patching the second project when the first fails", async () => {
    const { api, patches, maps } = fakeVercel({
      maps: { prj_c: { [OLD]: auto }, prj_s: { [OLD]: auto } },
      failPatch: ["prj_c"],
    });
    const states = [
      { keys: [OLD], preserved: 0 },
      { keys: [OLD], preserved: 0 },
    ];

    const results = await addBypassToProjects({
      api,
      projects: [CLIENT, SERVER],
      states,
      secret: NEW,
    });

    expect(results.map((r) => [r.added, r.present])).toEqual([
      [false, false],
      [false, false],
    ]);
    expect(results[1].reason).toMatch(/not attempted/);
    expect(patches.map(([id]) => id)).toEqual(["prj_c"]);
    expect(patches.some(([, body]) => body.revoke)).toBe(false);
    expect(maps.prj_s).toEqual({ [OLD]: auto });
    expect(api.registerSecret).toHaveBeenCalledWith(NEW);
  });
});

describe("revocation", () => {
  it("revokes only other automation keys and keeps shareable links", async () => {
    const { api, maps, patches } = fakeVercel({
      maps: { prj_c: { [NEW]: auto, [OLD]: auto, [SHARE]: shareable } },
    });

    const revoked = await revokeOtherAutomationKeys({
      api,
      project: CLIENT,
      keys: [NEW, OLD],
      secret: NEW,
    });

    expect(revoked).toBe(1);
    expect(patches).toEqual([
      ["prj_c", { revoke: { secret: OLD, regenerate: false } }],
    ]);
    expect(Object.keys(maps.prj_c).sort()).toEqual([NEW, SHARE].sort());
  });

  it("reports a throwing revoke with its partial count and still tries the other project", async () => {
    const { api, maps } = fakeVercel({
      maps: {
        prj_c: { [NEW]: auto, [OLD]: auto, [OTHER]: auto },
        prj_s: { [NEW]: auto, [OLD]: auto },
      },
      failRevoke: [OTHER],
    });

    const outcomes = await revokeStaleBypass({
      api,
      projects: [CLIENT, SERVER],
      results: [{ keys: [NEW, OLD, OTHER] }, { keys: [NEW, OLD] }],
      secret: NEW,
    });

    expect(outcomes[0]).toMatchObject({
      project: "ichnos-client",
      revoked: 1,
      revokeFailed: true,
    });
    expect(outcomes[1]).toEqual({
      project: "ichnos-protocol_server",
      revoked: 1,
      revokeFailed: false,
    });
    expect(maps.prj_s).toEqual({ [NEW]: auto });
  });
});

describe("leak sweep", () => {
  it("puts neither the selected, an old nor a generated value in any result or log line", async () => {
    const { api } = fakeVercel({
      maps: { prj_c: { [OLD]: auto }, prj_s: { [OTHER]: auto } },
      refuse: ["prj_s"],
    });
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    const err = vi.spyOn(console, "error").mockImplementation(() => {});
    const projects = [CLIENT, SERVER];

    const states = [
      await readAutomationBypass({ api, project: CLIENT }),
      await readAutomationBypass({ api, project: SERVER }),
    ];
    const { secret } = selectBypassValue(states, () => NEW);
    const adds = await addBypassToProjects({
      api,
      projects,
      states,
      secret,
    });
    const results = await confirmBypassOnProjects({ api, projects, secret });
    const revokes = await revokeStaleBypass({
      api,
      projects,
      results,
      secret,
    });

    const publicResults = results.map(({ keys: _keys, ...row }) => row);
    const text = JSON.stringify([
      adds,
      publicResults,
      revokes,
      log.mock.calls,
      err.mock.calls,
    ]);
    expect(text).not.toContain(NEW);
    expect(text).not.toContain(OLD);
    expect(text).not.toContain(OTHER);
    log.mockRestore();
    err.mockRestore();
  });
});
