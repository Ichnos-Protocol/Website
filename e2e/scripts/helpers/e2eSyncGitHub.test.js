import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { spawnSync } from "child_process";
import {
  listGitHubSecretMetadata,
  syncToGitHub,
  syncVariablesToGitHub,
} from "./e2eSyncGitHub.js";

vi.mock("child_process", () => ({
  spawnSync: vi.fn(() => ({ status: 0, stderr: "" })),
}));

vi.mock("./e2eEnvFile.js", () => ({
  maskValue: vi.fn((v) => `${v.slice(0, 2)}***`),
}));

describe("syncToGitHub", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("passes cwd option with provided repoRoot", () => {
    syncToGitHub({ SECRET_A: "value-a" }, "/fake/repo");

    expect(spawnSync).toHaveBeenCalledWith(
      "gh",
      ["secret", "set", "SECRET_A"],
      expect.objectContaining({ cwd: "/fake/repo" }),
    );
  });

  it("passes secret value via stdin input option", () => {
    syncToGitHub({ SECRET_A: "my-secret" }, "/fake/repo");

    expect(spawnSync).toHaveBeenCalledWith(
      "gh",
      expect.any(Array),
      expect.objectContaining({ input: "my-secret" }),
    );
  });

  it("constructs correct gh secret set args", () => {
    syncToGitHub({ MY_TOKEN: "tok123" }, "/fake/repo");

    expect(spawnSync).toHaveBeenCalledWith(
      "gh",
      ["secret", "set", "MY_TOKEN"],
      expect.any(Object),
    );
  });

  it("returns success result when spawnSync exits 0", () => {
    const results = syncToGitHub({ SECRET_A: "val" }, "/fake/repo");

    expect(results).toEqual([
      expect.objectContaining({ name: "SECRET_A", status: "success" }),
    ]);
  });

  it("returns failed result with stderr when exit is not 0", () => {
    spawnSync.mockReturnValueOnce({ status: 1, stderr: "permission denied" });

    const results = syncToGitHub({ SECRET_A: "val" }, "/fake/repo");

    expect(results).toEqual([
      expect.objectContaining({
        name: "SECRET_A",
        status: "failed",
        error: "permission denied",
      }),
    ]);
  });

  it("skips empty/falsy credential values", () => {
    syncToGitHub(
      { EMPTY: "", NULL_VAL: null, UNDEF_VAL: undefined },
      "/fake/repo",
    );

    expect(spawnSync).not.toHaveBeenCalled();
  });

  it("collects results for multiple credentials, skipping empty ones", () => {
    const results = syncToGitHub(
      { A: "val-a", B: "", C: "val-c" },
      "/fake/repo",
    );

    expect(results).toHaveLength(2);
    expect(results[0].name).toBe("A");
    expect(results[1].name).toBe("C");
    expect(spawnSync).toHaveBeenCalledTimes(2);
  });

  it("throws when repoRoot is missing", () => {
    expect(() => syncToGitHub({ SECRET_A: "val" })).toThrow(
      /repoRoot is required/,
    );
  });

  it("throws when repoRoot is empty string", () => {
    expect(() => syncToGitHub({ SECRET_A: "val" }, "")).toThrow(
      /repoRoot is required/,
    );
  });

  it("returns error from result.error.message when stderr is empty", () => {
    spawnSync.mockReturnValueOnce({
      status: 1,
      stderr: "",
      error: new Error("spawn ENOENT"),
    });

    const results = syncToGitHub({ SECRET_A: "val" }, "/fake/repo");

    expect(results).toEqual([
      expect.objectContaining({
        name: "SECRET_A",
        status: "failed",
        error: "spawn ENOENT",
      }),
    ]);
  });

  it("returns fallback message when both stderr and error are absent", () => {
    spawnSync.mockReturnValueOnce({
      status: 1,
      stderr: "",
    });

    const results = syncToGitHub({ SECRET_A: "val" }, "/fake/repo");

    expect(results).toEqual([
      expect.objectContaining({
        name: "SECRET_A",
        status: "failed",
        error: "Unknown error: process exited with non-zero status",
      }),
    ]);
  });
});

describe("syncVariablesToGitHub", () => {
  const WARNING =
    "[github] variable read-back failed; rewriting all variables.";

  function isListCall(args) {
    return args[0] === "variable" && args[1] === "list";
  }

  function mockGh({
    list = { status: 0, stdout: JSON.stringify([]) },
    set = { status: 0, stderr: "" },
  } = {}) {
    spawnSync.mockImplementation((_cmd, args) =>
      isListCall(args) ? list : set,
    );
  }

  function listing(entries) {
    return { status: 0, stdout: JSON.stringify(entries) };
  }

  function setCalls() {
    return spawnSync.mock.calls.filter(
      ([, args]) => args[0] === "variable" && args[1] === "set",
    );
  }

  function listCalls() {
    return spawnSync.mock.calls.filter(([, args]) => isListCall(args));
  }

  function setNames() {
    return setCalls().map(([, args]) => args[2]);
  }

  beforeEach(() => {
    vi.clearAllMocks();
    mockGh();
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    spawnSync.mockImplementation(() => ({ status: 0, stderr: "" }));
  });

  it("constructs correct gh variable set args with the value as --body", () => {
    mockGh({ list: listing([{ name: "VAR_A", value: "old-value" }]) });

    syncVariablesToGitHub({ VAR_A: "value-a" }, "/fake/repo");

    expect(spawnSync).toHaveBeenCalledWith(
      "gh",
      ["variable", "set", "VAR_A", "--body", "value-a"],
      expect.objectContaining({ cwd: "/fake/repo" }),
    );
  });

  it("does not enable shell and does not use stdin input", () => {
    syncVariablesToGitHub({ VAR_A: "value-a" }, "/fake/repo");

    const [[, , options]] = setCalls();
    expect(options.shell).toBeFalsy();
    expect(options).not.toHaveProperty("input");
  });

  it("returns success result with the value in clear", () => {
    const results = syncVariablesToGitHub({ VAR_A: "value-a" }, "/fake/repo");

    expect(results).toEqual([
      { name: "VAR_A", status: "success", value: "value-a" },
    ]);
  });

  it("returns failed result with stderr when exit is not 0", () => {
    mockGh({ set: { status: 1, stderr: "permission denied" } });

    const results = syncVariablesToGitHub({ VAR_A: "val" }, "/fake/repo");

    expect(results).toEqual([
      expect.objectContaining({
        name: "VAR_A",
        status: "failed",
        error: "permission denied",
      }),
    ]);
  });

  it("returns error from result.error.message when stderr is empty", () => {
    mockGh({
      set: { status: 1, stderr: "", error: new Error("spawn ENOENT") },
    });

    const results = syncVariablesToGitHub({ VAR_A: "val" }, "/fake/repo");

    expect(results).toEqual([
      expect.objectContaining({ status: "failed", error: "spawn ENOENT" }),
    ]);
  });

  it("returns fallback message when both stderr and error are absent", () => {
    mockGh({ set: { status: 1, stderr: "" } });

    const results = syncVariablesToGitHub({ VAR_A: "val" }, "/fake/repo");

    expect(results).toEqual([
      expect.objectContaining({
        status: "failed",
        error: "Unknown error: process exited with non-zero status",
      }),
    ]);
  });

  it("skips empty/falsy values and collects results for the rest", () => {
    const results = syncVariablesToGitHub(
      {
        A: "val-a",
        EMPTY: "",
        NULL_VAL: null,
        UNDEF_VAL: undefined,
        C: "val-c",
      },
      "/fake/repo",
    );

    expect(results.map((r) => r.name)).toEqual(["A", "C"]);
    expect(setNames()).toEqual(["A", "C"]);
  });

  it("throws when repoRoot is missing", () => {
    expect(() => syncVariablesToGitHub({ VAR_A: "val" })).toThrow(
      /repoRoot is required/,
    );
    expect(spawnSync).not.toHaveBeenCalled();
  });

  it("throws when repoRoot is empty string", () => {
    expect(() => syncVariablesToGitHub({ VAR_A: "val" }, "")).toThrow(
      /repoRoot is required/,
    );
    expect(spawnSync).not.toHaveBeenCalled();
  });

  it("writes nothing when every intended value is already equal", () => {
    mockGh({
      list: listing([
        { name: "A", value: "val-a" },
        { name: "B", value: "val-b" },
      ]),
    });

    const results = syncVariablesToGitHub(
      { A: "val-a", B: "val-b" },
      "/fake/repo",
    );

    expect(spawnSync).toHaveBeenCalledTimes(1);
    expect(listCalls()).toHaveLength(1);
    expect(setCalls()).toHaveLength(0);
    expect(results).toEqual([
      { name: "A", status: "unchanged", value: "val-a" },
      { name: "B", status: "unchanged", value: "val-b" },
    ]);
    expect(console.warn).not.toHaveBeenCalled();
  });

  it("reads the repository variables with one gh variable list call", () => {
    syncVariablesToGitHub({ A: "val-a", B: "val-b", C: "val-c" }, "/fake/repo");

    expect(listCalls()).toHaveLength(1);
    const [[cmd, args, options]] = listCalls();
    expect(cmd).toBe("gh");
    expect(args).toEqual(["variable", "list", "--json", "name,value"]);
    expect(options).toEqual(
      expect.objectContaining({ cwd: "/fake/repo", encoding: "utf8" }),
    );
    expect(options.shell).toBeFalsy();
    expect(options).not.toHaveProperty("input");
  });

  it("writes only the differing and missing variables, in input order", () => {
    mockGh({
      list: listing([
        { name: "DIFFERS", value: "old" },
        { name: "EQUAL", value: "same" },
      ]),
    });

    const results = syncVariablesToGitHub(
      { DIFFERS: "new", EQUAL: "same", MISSING: "added" },
      "/fake/repo",
    );

    expect(setNames()).toEqual(["DIFFERS", "MISSING"]);
    expect(results).toEqual([
      { name: "DIFFERS", status: "success", value: "new" },
      { name: "EQUAL", status: "unchanged", value: "same" },
      { name: "MISSING", status: "success", value: "added" },
    ]);
  });

  it("writes every variable without warning when the list is a valid []", () => {
    mockGh({ list: listing([]) });

    syncVariablesToGitHub({ A: "val-a", B: "", C: "val-c" }, "/fake/repo");

    expect(setNames()).toEqual(["A", "C"]);
    expect(console.warn).not.toHaveBeenCalled();
  });

  it("writes every variable and warns once with fixed text when the read exits non-zero", () => {
    mockGh({ list: { status: 1, stderr: "gh: not logged in" } });

    syncVariablesToGitHub({ A: "value-of-a", C: "val-c" }, "/fake/repo");

    expect(setNames()).toEqual(["A", "C"]);
    expect(console.warn).toHaveBeenCalledTimes(1);
    expect(console.warn).toHaveBeenCalledWith(WARNING);
    const logged = console.warn.mock.calls[0].join(" ");
    expect(logged).not.toContain("not logged in");
    expect(logged).not.toContain("value-of-a");
    expect(logged).not.toContain("val-c");
  });

  it.each([
    ["invalid JSON", "not json"],
    ["a JSON object instead of an array", JSON.stringify({ A: "val-a" })],
    ["an entry missing name", JSON.stringify([{ value: "val-a" }])],
    ["an empty name", JSON.stringify([{ name: "", value: "val-a" }])],
    ["a whitespace name", JSON.stringify([{ name: "  ", value: "val-a" }])],
    ["a non-string value", JSON.stringify([{ name: "A", value: 1 }])],
    ["a null entry", JSON.stringify([null])],
    ["an array entry", JSON.stringify([["A", "val-a"]])],
    [
      "duplicate names",
      JSON.stringify([
        { name: "A", value: "val-a" },
        { name: "A", value: "other" },
      ]),
    ],
  ])("writes every variable and warns once on %s", (_label, stdout) => {
    mockGh({ list: { status: 0, stdout } });

    const results = syncVariablesToGitHub(
      { A: "val-a", C: "val-c" },
      "/fake/repo",
    );

    expect(setNames()).toEqual(["A", "C"]);
    expect(results.map((r) => r.status)).toEqual(["success", "success"]);
    expect(console.warn).toHaveBeenCalledTimes(1);
    expect(console.warn).toHaveBeenCalledWith(WARNING);
  });

  it("compares values as exact strings", () => {
    mockGh({
      list: listing([
        { name: "NUM", value: "01" },
        { name: "PADDED", value: " https://x.test " },
      ]),
    });

    const results = syncVariablesToGitHub(
      { NUM: "1", PADDED: "https://x.test" },
      "/fake/repo",
    );

    expect(setNames()).toEqual(["NUM", "PADDED"]);
    expect(results.map((r) => r.status)).toEqual(["success", "success"]);
  });

  it("leaves secret sync untouched: no read-back and no unchanged rows", () => {
    const results = syncToGitHub({ S_A: "sec-a", S_B: "sec-b" }, "/fake/repo");

    expect(listCalls()).toHaveLength(0);
    expect(spawnSync).toHaveBeenCalledTimes(2);
    expect(spawnSync).toHaveBeenCalledWith(
      "gh",
      ["secret", "set", "S_A"],
      expect.objectContaining({ input: "sec-a" }),
    );
    expect(spawnSync).toHaveBeenCalledWith(
      "gh",
      ["secret", "set", "S_B"],
      expect.objectContaining({ input: "sec-b" }),
    );
    expect(results.map((r) => r.status)).toEqual(["success", "success"]);
  });
});

describe("listGitHubSecretMetadata", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("runs one gh secret list in the repo root and maps names to dates", () => {
    spawnSync.mockReturnValueOnce({
      status: 0,
      stdout: JSON.stringify([
        { name: "NEON_API_KEY", updatedAt: "2026-09-01T10:00:00Z" },
        { name: "SYNC_PAT", updatedAt: "2026-08-15T08:00:00Z" },
      ]),
    });

    const metadata = listGitHubSecretMetadata("/fake/repo");

    expect(metadata).toEqual({
      NEON_API_KEY: "2026-09-01T10:00:00Z",
      SYNC_PAT: "2026-08-15T08:00:00Z",
    });
    expect(spawnSync).toHaveBeenCalledTimes(1);
    expect(spawnSync).toHaveBeenCalledWith(
      "gh",
      ["secret", "list", "--json", "name,updatedAt"],
      expect.objectContaining({ cwd: "/fake/repo" }),
    );
  });

  it("returns {} when gh exits non-zero", () => {
    spawnSync.mockReturnValueOnce({ status: 1, stderr: "not logged in" });

    expect(listGitHubSecretMetadata("/fake/repo")).toEqual({});
  });

  it("returns {} when the output is not a JSON list", () => {
    spawnSync.mockReturnValueOnce({ status: 0, stdout: "not json" });

    expect(listGitHubSecretMetadata("/fake/repo")).toEqual({});
  });
});
