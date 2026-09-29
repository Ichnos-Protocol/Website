import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const mockRunMigrations = vi.fn();
vi.mock("../runMigrations.js", () => ({ runMigrations: mockRunMigrations }));

const { applyPreviewMigrations, MAIN_PREVIEW_BRANCH } =
  await import("./previewMigrations.js");

const DB_URL = "postgresql://u:p@host/db";

describe("applyPreviewMigrations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "log").mockImplementation(() => {});
    process.env.DATABASE_URL = DB_URL;
    delete process.env.VERCEL_GIT_COMMIT_REF;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete process.env.VERCEL_GIT_COMMIT_REF;
  });

  it("targets the main branch", () => {
    expect(MAIN_PREVIEW_BRANCH).toBe("main");
  });

  it("runs the migrations once with DATABASE_URL and the SSL option on main", async () => {
    process.env.VERCEL_GIT_COMMIT_REF = "main";

    await applyPreviewMigrations(process.env.DATABASE_URL);

    expect(mockRunMigrations).toHaveBeenCalledTimes(1);
    expect(mockRunMigrations).toHaveBeenCalledWith(DB_URL, {
      ssl: { rejectUnauthorized: false },
    });
  });

  it("passes no SSL override when the URL sets sslmode", async () => {
    process.env.VERCEL_GIT_COMMIT_REF = "main";
    const url = `${DB_URL}?sslmode=require`;

    await applyPreviewMigrations(url);

    expect(mockRunMigrations).toHaveBeenCalledWith(url, { ssl: undefined });
  });

  it("propagates a migration error untouched", async () => {
    process.env.VERCEL_GIT_COMMIT_REF = "main";
    mockRunMigrations.mockRejectedValueOnce(new Error("syntax error"));

    await expect(() => applyPreviewMigrations(DB_URL)).rejects.toThrowError(
      expect.objectContaining({ message: "syntax error" }),
    );
  });

  it.each(["staging", "feature/new-page"])(
    "does not migrate for ref %s and logs once",
    async (ref) => {
      process.env.VERCEL_GIT_COMMIT_REF = ref;

      await applyPreviewMigrations(DB_URL);

      expect(mockRunMigrations).not.toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledTimes(1);
      expect(console.log).toHaveBeenCalledWith(
        `[e2e-seed] migrations are not run for ref ${ref}`,
      );
    },
  );

  it("does not migrate when the ref is missing and logs once", async () => {
    await applyPreviewMigrations(DB_URL);

    expect(mockRunMigrations).not.toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalledWith(
      "[e2e-seed] migrations are not run for ref (unset)",
    );
  });
});
