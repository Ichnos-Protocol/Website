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

import {
  EXPECTED_PROJECT_NAMES,
  readLinkedProject,
  resolveProject,
} from "./e2eVercelProjects.js";

let root;

function link(dirName, contents) {
  const dir = join(root, dirName);
  mkdirSync(join(dir, ".vercel"), { recursive: true });
  writeFileSync(join(dir, ".vercel", "project.json"), JSON.stringify(contents));
  return dir;
}

function apiReturning(project) {
  return { request: vi.fn(async () => project) };
}

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), "vercel-projects-"));
});

afterEach(() => {
  rmSync(root, { recursive: true, force: true });
});

describe("readLinkedProject", () => {
  it("honours both link files", () => {
    const server = link("server", {
      projectId: "prj_s",
      orgId: "team_1",
      projectName: EXPECTED_PROJECT_NAMES.server,
    });
    const client = link("client", {
      projectId: "prj_c",
      orgId: "team_1",
      projectName: EXPECTED_PROJECT_NAMES.client,
    });

    expect(readLinkedProject(server, EXPECTED_PROJECT_NAMES.server)).toEqual({
      projectId: "prj_s",
      orgId: "team_1",
      projectName: "ichnos-protocol_server",
    });
    expect(
      readLinkedProject(client, EXPECTED_PROJECT_NAMES.client).projectId,
    ).toBe("prj_c");
  });

  it("governs the exact client project name", () => {
    expect(EXPECTED_PROJECT_NAMES).toEqual({
      client: "ichnos-client",
      server: "ichnos-protocol_server",
    });
  });

  it("refuses a client link that names ichnos-protocol", () => {
    const client = link("client", {
      projectId: "prj_c",
      orgId: "team_1",
      projectName: "ichnos-protocol",
    });

    expect(() =>
      readLinkedProject(client, EXPECTED_PROJECT_NAMES.client),
    ).toThrow(
      /Linked Vercel project 'ichnos-protocol' does not match the expected client project 'ichnos-client'/,
    );
  });

  it("refuses a client link that names the server project", () => {
    const client = link("client", {
      projectId: "prj_s",
      orgId: "team_1",
      projectName: EXPECTED_PROJECT_NAMES.server,
    });

    expect(() =>
      readLinkedProject(client, EXPECTED_PROJECT_NAMES.client),
    ).toThrow(/does not match the expected client project 'ichnos-client'/);
  });

  it("names the missing link file and the relink command", () => {
    expect(() =>
      readLinkedProject(join(root, "client"), EXPECTED_PROJECT_NAMES.client),
    ).toThrow(
      /client\/\.vercel\/project\.json not found[\s\S]*cd client && vercel link/,
    );
  });
});

describe("resolveProject", () => {
  it("confirms a linked project against the provider", async () => {
    const dir = link("server", {
      projectId: "prj_s",
      orgId: "team_1",
      projectName: EXPECTED_PROJECT_NAMES.server,
    });
    const api = apiReturning({ id: "prj_s", name: "ichnos-protocol_server" });

    const project = await resolveProject({
      api,
      dir,
      expectedName: EXPECTED_PROJECT_NAMES.server,
    });

    expect(project.projectId).toBe("prj_s");
    expect(api.request).toHaveBeenCalledWith("/v9/projects/prj_s");
  });

  it("falls back to an exact-name lookup when the link file is absent", async () => {
    const api = apiReturning({
      id: "prj_c",
      name: "ichnos-client",
      accountId: "team_1",
    });

    const project = await resolveProject({
      api,
      dir: join(root, "client"),
      expectedName: EXPECTED_PROJECT_NAMES.client,
    });

    expect(api.request).toHaveBeenCalledWith("/v9/projects/ichnos-client");
    expect(project).toEqual({
      projectId: "prj_c",
      orgId: "team_1",
      projectName: "ichnos-client",
    });
  });

  it.each([
    ["Ichnos-Client"],
    ["ichnos-client-old"],
    ["ichnos-protocol"],
    ["ichnos"],
  ])("refuses a looked-up project named %s", async (name) => {
    const api = apiReturning({ id: "prj_x", name, accountId: "team_1" });

    await expect(
      resolveProject({
        api,
        dir: join(root, "client"),
        expectedName: EXPECTED_PROJECT_NAMES.client,
      }),
    ).rejects.toThrowError(
      new RegExp(`expected 'ichnos-client', found '${name}'`),
    );
  });

  it("names the relink step when the linked team cannot see the project", async () => {
    const dir = link("server", {
      projectId: "prj_s",
      orgId: "team_stale",
      projectName: EXPECTED_PROJECT_NAMES.server,
    });
    const api = {
      request: vi.fn(async () => {
        throw new Error("Vercel API GET /v9/projects/prj_s failed (1): 404");
      }),
    };

    await expect(
      resolveProject({ api, dir, expectedName: EXPECTED_PROJECT_NAMES.server }),
    ).rejects.toThrowError(/vercel link/);
  });

  it("never writes the link file", async () => {
    const dir = link("server", {
      projectId: "prj_s",
      orgId: "team_1",
      projectName: EXPECTED_PROJECT_NAMES.server,
    });
    const path = join(dir, ".vercel", "project.json");
    const before = [readFileSync(path, "utf8"), statSync(path).mtimeMs];

    await resolveProject({
      api: apiReturning({ id: "prj_s", name: "ichnos-protocol_server" }),
      dir,
      expectedName: EXPECTED_PROJECT_NAMES.server,
    });

    expect([readFileSync(path, "utf8"), statSync(path).mtimeMs]).toEqual(
      before,
    );
  });
});
