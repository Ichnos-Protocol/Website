import { describe, it, expect, vi } from "vitest";
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const setPreviewEnv = vi.fn(async ({ key }) => ({
  name: key,
  status: "success",
  masked: "****",
}));
const spawnSync = vi.fn();

vi.mock("child_process", () => ({ spawnSync }));
vi.mock("./e2eVercelEnv.js", () => ({ setPreviewEnv }));

const { syncToVercel } = await import("./e2eSyncVercel.js");

const CONTEXT = {
  api: { request: vi.fn() },
  project: { projectId: "prj_s", projectName: "ichnos-protocol_server" },
};

describe("syncToVercel", () => {
  it("delegates each non-empty variable to setPreviewEnv on the project", async () => {
    const results = await syncToVercel(
      { E2E_USER_EMAIL: "e2e-user@ichnos-test.com", E2E_USER_UID: "", B: "b" },
      CONTEXT,
    );

    expect(setPreviewEnv.mock.calls.map(([args]) => args)).toEqual([
      {
        api: CONTEXT.api,
        projectId: "prj_s",
        key: "E2E_USER_EMAIL",
        value: "e2e-user@ichnos-test.com",
      },
      { api: CONTEXT.api, projectId: "prj_s", key: "B", value: "b" },
    ]);
    expect(results.map((r) => r.name)).toEqual(["E2E_USER_EMAIL", "B"]);
    expect(spawnSync).not.toHaveBeenCalled();
  });

  it("no longer spawns `vercel env`", () => {
    const here = dirname(fileURLToPath(import.meta.url));
    const source = readFileSync(join(here, "e2eSyncVercel.js"), "utf8");

    expect(source).not.toMatch(/child_process|spawnSync|"env",/);
  });
});
