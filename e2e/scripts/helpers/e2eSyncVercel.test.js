import { describe, it, expect, vi } from "vitest";
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const SCOPES = [
  { name: "all-branches", gitBranch: null },
  { name: "main", gitBranch: "main" },
];
const setPreviewEnv = vi.fn(async ({ key, scope }) => ({
  name: key,
  scope: scope.name,
  status: "success",
  masked: "****",
}));
// The two-scope entry point, delegating once per scope in order.
const setPreviewEnvScopes = vi.fn(async (args) => {
  const results = [];
  for (const scope of SCOPES) {
    results.push(await setPreviewEnv({ ...args, scope }));
  }
  return results;
});
const spawnSync = vi.fn();

vi.mock("child_process", () => ({ spawnSync }));
vi.mock("./e2eVercelEnv.js", () => ({ setPreviewEnvScopes }));

const { syncToVercel } = await import("./e2eSyncVercel.js");

const CONTEXT = {
  api: { request: vi.fn() },
  project: { projectId: "prj_s", projectName: "ichnos-protocol_server" },
};

describe("syncToVercel", () => {
  it("delegates each non-empty variable to both Preview scopes on the project", async () => {
    const results = await syncToVercel(
      { E2E_USER_EMAIL: "e2e-user@ichnos-test.com", E2E_USER_UID: "", B: "b" },
      CONTEXT,
    );

    const email = {
      api: CONTEXT.api,
      projectId: "prj_s",
      key: "E2E_USER_EMAIL",
      value: "e2e-user@ichnos-test.com",
    };
    const b = { api: CONTEXT.api, projectId: "prj_s", key: "B", value: "b" };
    expect(setPreviewEnvScopes.mock.calls.map(([args]) => args)).toEqual([
      email,
      b,
    ]);
    expect(setPreviewEnv.mock.calls.map(([args]) => args)).toEqual([
      { ...email, scope: SCOPES[0] },
      { ...email, scope: SCOPES[1] },
      { ...b, scope: SCOPES[0] },
      { ...b, scope: SCOPES[1] },
    ]);
    expect(results.map((r) => [r.name, r.scope])).toEqual([
      ["E2E_USER_EMAIL", "all-branches"],
      ["E2E_USER_EMAIL", "main"],
      ["B", "all-branches"],
      ["B", "main"],
    ]);
    expect(spawnSync).not.toHaveBeenCalled();
  });

  it("no longer spawns `vercel env`", () => {
    const here = dirname(fileURLToPath(import.meta.url));
    const source = readFileSync(join(here, "e2eSyncVercel.js"), "utf8");

    expect(source).not.toMatch(/child_process|spawnSync|"env",/);
  });
});
