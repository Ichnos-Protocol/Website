import { describe, it, expect, vi, beforeEach } from "vitest";
import { existsSync, readFileSync } from "fs";
import { execFileSync } from "child_process";

vi.mock("fs", () => ({
  existsSync: vi.fn(),
  readFileSync: vi.fn(),
}));

vi.mock("child_process", () => ({
  execFileSync: vi.fn(),
}));

const {
  checkGhAuth,
  checkOptionalVercelProject,
  checkVercelApiAccess,
  checkVercelAuth,
  checkVercelProject,
} = await import("./e2ePreflightChecks.js");
const { EXPECTED_PROJECT_NAMES } = await import("./e2eVercelProjects.js");

const SERVER_DIR = "/fake/server";
const CLIENT_DIR = "/fake/client";

describe("checkGhAuth", () => {
  it("passes when gh auth status succeeds", () => {
    execFileSync.mockReturnValue("");
    expect(() => checkGhAuth()).not.toThrow();
  });

  it("throws when gh auth status fails", () => {
    execFileSync.mockImplementation(() => {
      throw new Error("not logged in");
    });
    expect(() => checkGhAuth()).toThrow(/GitHub CLI is not authenticated/);
  });
});

describe("checkVercelAuth", () => {
  it("passes when vercel whoami succeeds", () => {
    execFileSync.mockReturnValue("");
    expect(() => checkVercelAuth()).not.toThrow();
  });

  it("throws when vercel whoami fails", () => {
    execFileSync.mockImplementation(() => {
      throw new Error("not logged in");
    });
    expect(() => checkVercelAuth()).toThrow(/Vercel CLI is not authenticated/);
  });
});

describe("checkVercelApiAccess", () => {
  it("uses the CLI when `vercel api` is supported", () => {
    expect(checkVercelApiAccess({ supports: () => true, env: {} })).toEqual({
      mode: "cli",
    });
  });

  it("falls back to an exported VERCEL_TOKEN", () => {
    expect(
      checkVercelApiAccess({
        supports: () => false,
        env: { VERCEL_TOKEN: "tok" },
      }),
    ).toEqual({ mode: "token" });
  });

  it("stops naming VERCEL_TOKEN when neither is available, with no call made", () => {
    execFileSync.mockClear();

    expect(() =>
      checkVercelApiAccess({ supports: () => false, env: {} }),
    ).toThrow(/VERCEL_TOKEN is not set[\s\S]*npm i -g vercel@latest/);
    expect(execFileSync).not.toHaveBeenCalled();
  });
});

describe("session checks name their login command", () => {
  it.each([
    [() => checkGhAuth(), /gh auth login/],
    [() => checkVercelAuth(), /vercel login/],
  ])("stops with the remediation and makes no write call", (check, pattern) => {
    execFileSync.mockReset();
    execFileSync.mockImplementation(() => {
      throw new Error("not logged in");
    });

    expect(check).toThrow(pattern);
    expect(execFileSync).toHaveBeenCalledTimes(1);
    const [, args] = execFileSync.mock.calls[0];
    expect(["status", "whoami"]).toContain(args.at(-1));
  });
});

describe("checkOptionalVercelProject", () => {
  it("skips an absent client link file", () => {
    readFileSync.mockClear();
    existsSync.mockReturnValue(false);

    expect(() =>
      checkOptionalVercelProject(CLIENT_DIR, "ichnos-client"),
    ).not.toThrow();
    expect(readFileSync).not.toHaveBeenCalled();
  });

  it("refuses a present client link naming the server project", () => {
    existsSync.mockReturnValue(true);
    readFileSync.mockReturnValue(
      JSON.stringify({
        projectId: "prj_1",
        orgId: "team_1",
        projectName: "ichnos-protocol_server",
      }),
    );

    expect(() =>
      checkOptionalVercelProject(CLIENT_DIR, "ichnos-client"),
    ).toThrow(/does not match the expected client project 'ichnos-client'/);
  });

  it("refuses a present client link naming ichnos-protocol", () => {
    existsSync.mockReturnValue(true);
    readFileSync.mockReturnValue(
      JSON.stringify({
        projectId: "prj_1",
        orgId: "team_1",
        projectName: "ichnos-protocol",
      }),
    );

    expect(() =>
      checkOptionalVercelProject(CLIENT_DIR, EXPECTED_PROJECT_NAMES.client),
    ).toThrow(/does not match the expected client project 'ichnos-client'/);
  });
});

describe("checkVercelProject", () => {
  beforeEach(() => {
    existsSync.mockReturnValue(true);
    readFileSync.mockReturnValue(
      JSON.stringify({
        projectId: "prj_123",
        orgId: "org_456",
        projectName: "ichnos-protocol_server",
      }),
    );
  });

  it("passes with valid project.json and matching project name", () => {
    expect(() => checkVercelProject(SERVER_DIR)).not.toThrow();
  });

  it("throws when project.json does not exist", () => {
    existsSync.mockReturnValue(false);
    expect(() => checkVercelProject(SERVER_DIR)).toThrow(
      /project\.json not found/,
    );
  });

  it("throws when project.json is malformed JSON", () => {
    readFileSync.mockReturnValue("not-json{");
    expect(() => checkVercelProject(SERVER_DIR)).toThrow(
      /project\.json is malformed/,
    );
  });

  it("throws actionable error when project.json contains valid JSON null", () => {
    readFileSync.mockReturnValue("null");
    expect(() => checkVercelProject(SERVER_DIR)).toThrow(
      /project\.json is malformed/,
    );
  });

  it("throws when projectId is missing", () => {
    readFileSync.mockReturnValue(
      JSON.stringify({
        orgId: "org_456",
        projectName: "ichnos-protocol_server",
      }),
    );
    expect(() => checkVercelProject(SERVER_DIR)).toThrow(
      /missing projectId or orgId/,
    );
  });

  it("throws when orgId is missing", () => {
    readFileSync.mockReturnValue(
      JSON.stringify({
        projectId: "prj_123",
        projectName: "ichnos-protocol_server",
      }),
    );
    expect(() => checkVercelProject(SERVER_DIR)).toThrow(
      /missing projectId or orgId/,
    );
  });

  it("throws when projectName is absent", () => {
    readFileSync.mockReturnValue(
      JSON.stringify({ projectId: "prj_123", orgId: "org_456" }),
    );
    expect(() => checkVercelProject(SERVER_DIR)).toThrow(
      /does not contain a valid projectName/,
    );
  });

  it("throws when projectName is a truthy non-string value", () => {
    readFileSync.mockReturnValue(
      JSON.stringify({
        projectId: "prj_123",
        orgId: "org_456",
        projectName: 12345,
      }),
    );
    expect(() => checkVercelProject(SERVER_DIR)).toThrow(
      /does not contain a valid projectName/,
    );
  });

  it("throws when projectName does not match expected identity", () => {
    readFileSync.mockReturnValue(
      JSON.stringify({
        projectId: "prj_123",
        orgId: "org_456",
        projectName: "wrong-project",
      }),
    );
    expect(() => checkVercelProject(SERVER_DIR)).toThrow(
      /does not match the expected server project/,
    );
  });

  it("throws when projectName is the stale deleted 'ichnos-protocolserver'", () => {
    readFileSync.mockReturnValue(
      JSON.stringify({
        projectId: "prj_123",
        orgId: "org_456",
        projectName: "ichnos-protocolserver",
      }),
    );
    expect(() => checkVercelProject(SERVER_DIR)).toThrow(
      /does not match the expected server project/,
    );
  });

  it("throws when projectName is a substring match like my-server-project", () => {
    readFileSync.mockReturnValue(
      JSON.stringify({
        projectId: "prj_123",
        orgId: "org_456",
        projectName: "my-server-project",
      }),
    );
    expect(() => checkVercelProject(SERVER_DIR)).toThrow(
      /does not match the expected server project/,
    );
  });

  it("throws when projectName has wrong casing", () => {
    readFileSync.mockReturnValue(
      JSON.stringify({
        projectId: "prj_123",
        orgId: "org_456",
        projectName: "ichnos-protocolServer",
      }),
    );
    expect(() => checkVercelProject(SERVER_DIR)).toThrow(
      /does not match the expected server project/,
    );
  });

  it("throws when projectName is a client project", () => {
    readFileSync.mockReturnValue(
      JSON.stringify({
        projectId: "prj_123",
        orgId: "org_456",
        projectName: "ichnos-client",
      }),
    );
    expect(() => checkVercelProject(SERVER_DIR)).toThrow(
      /does not match the expected server project/,
    );
  });

  it("throws when projectName is empty string", () => {
    readFileSync.mockReturnValue(
      JSON.stringify({
        projectId: "prj_123",
        orgId: "org_456",
        projectName: "",
      }),
    );
    expect(() => checkVercelProject(SERVER_DIR)).toThrow(
      /does not contain a valid projectName/,
    );
  });
});
