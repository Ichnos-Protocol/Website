import { describe, it, expect, vi, beforeEach } from "vitest";

const execFileSync = vi.fn();
const spawnSync = vi.fn();
const readEnvFile = vi.fn();

vi.mock("child_process", () => ({ execFileSync, spawnSync }));
vi.mock("dotenv", async (importOriginal) => ({
  ...(await importOriginal()),
  config: vi.fn(),
}));
vi.mock("fs", async (importOriginal) => ({
  ...(await importOriginal()),
  existsSync: () => true,
}));
vi.mock("./e2eEnvFile.js", async (importOriginal) => ({
  ...(await importOriginal()),
  readEnvFile,
}));

const { main } = await import("../provision-e2e-firebase-users.js");

const SECRET = "hunter2-admin-secret";

// Sync-only env that passes preflight validation but omits every non-admin name.
const incompleteEnv = {
  E2E_ADMIN_EMAIL: "admin@test.com",
  E2E_ADMIN_PASSWORD: SECRET,
  E2E_ADMIN_UID: "uid-admin",
};

describe("provision orchestrator ordering", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "log").mockImplementation(() => {});
    readEnvFile.mockReturnValue({ ...incompleteEnv });
  });

  it("reports missing GitHub names in sync-only mode before any gh call", async () => {
    const run = main({ syncOnly: true });

    await expect(run).rejects.toThrowError(/Missing GitHub config value\(s\): .*FIREBASE_API_KEY/);
    expect(execFileSync).not.toHaveBeenCalled();
    expect(spawnSync).not.toHaveBeenCalled();
  });

  it("never includes secret values in the missing-names error", async () => {
    await expect(main({ syncOnly: true })).rejects.toThrowError(
      expect.objectContaining({ message: expect.not.stringContaining(SECRET) }),
    );
  });
});
