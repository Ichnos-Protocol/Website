import { describe, it, expect, vi } from "vitest";
import { existsSync, readFileSync } from "fs";
import { execFileSync } from "child_process";

vi.mock("fs", () => ({
  existsSync: vi.fn(),
  readFileSync: vi.fn(),
}));

vi.mock("child_process", () => ({
  execFileSync: vi.fn(),
}));

const checks = await import("./e2ePreflightChecks.js");
const { checkGhAuth, checkVercelApiAccess, checkVercelAuth } = checks;

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

describe("no link-file check", () => {
  it("exports no .vercel link check and reads no file to pass", () => {
    existsSync.mockClear();
    readFileSync.mockClear();
    execFileSync.mockReset();
    execFileSync.mockReturnValue("");

    expect(Object.keys(checks).sort()).toEqual([
      "checkGhAuth",
      "checkVercelApiAccess",
      "checkVercelAuth",
    ]);
    checkGhAuth();
    checkVercelAuth();
    checkVercelApiAccess({ supports: () => true, env: {} });

    expect(readFileSync).not.toHaveBeenCalled();
    expect(existsSync).not.toHaveBeenCalled();
  });
});
