import { describe, it, expect, vi, beforeEach } from "vitest";

let mockClient;
let mockPool;

function createMockClient() {
  return {
    query: vi.fn().mockResolvedValue({ rows: [] }),
    release: vi.fn(),
  };
}

describe("withTransaction", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
    delete globalThis.__pgPool;

    mockClient = createMockClient();
    mockPool = {
      connect: vi.fn().mockResolvedValue(mockClient),
      on: vi.fn(),
    };

    globalThis.__pgPool = mockPool;
  });

  it("commits and returns the callback's value", async () => {
    const { withTransaction } = await import("./database.js");
    const sentinel = { id: "req-1" };
    const fn = vi.fn().mockResolvedValue(sentinel);

    const result = await withTransaction(fn);

    expect(mockPool.connect).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledExactlyOnceWith(mockClient);
    expect(mockClient.query).toHaveBeenNthCalledWith(1, "BEGIN");
    expect(mockClient.query).toHaveBeenNthCalledWith(2, "COMMIT");
    expect(mockClient.query).toHaveBeenCalledTimes(2);
    expect(result).toBe(sentinel);
    expect(mockClient.release).toHaveBeenCalledTimes(1);
  });

  it("rolls back and re-throws the original error", async () => {
    const { withTransaction } = await import("./database.js");
    const error = new Error("insert failed");
    const fn = vi.fn().mockRejectedValue(error);

    await expect(withTransaction(fn)).rejects.toBe(error);

    expect(mockClient.query).toHaveBeenNthCalledWith(1, "BEGIN");
    expect(mockClient.query).toHaveBeenCalledWith("ROLLBACK");
    expect(mockClient.query).not.toHaveBeenCalledWith("COMMIT");
    expect(mockClient.release).toHaveBeenCalledTimes(1);
  });

  it("re-throws the original error when the rollback itself fails", async () => {
    const { withTransaction } = await import("./database.js");
    const error = new Error("insert failed");
    const fn = vi.fn().mockRejectedValue(error);

    mockClient.query.mockImplementation((sql) =>
      sql === "ROLLBACK"
        ? Promise.reject(new Error("rollback failed"))
        : Promise.resolve({ rows: [] }),
    );
    vi.spyOn(console, "error").mockImplementation(() => {});

    await expect(withTransaction(fn)).rejects.toBe(error);

    expect(mockClient.query).toHaveBeenCalledWith("ROLLBACK");
    expect(mockClient.release).toHaveBeenCalledTimes(1);
  });

  it("releases the client on both the success and failure paths", async () => {
    const { withTransaction } = await import("./database.js");

    await withTransaction(vi.fn().mockResolvedValue("ok"));
    expect(mockClient.release).toHaveBeenCalledTimes(1);

    await expect(
      withTransaction(vi.fn().mockRejectedValue(new Error("boom"))),
    ).rejects.toThrow("boom");
    expect(mockClient.release).toHaveBeenCalledTimes(2);
  });
});
