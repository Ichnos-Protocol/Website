import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const mockQuery = vi.fn();

vi.mock("../config/database.js", () => ({
  default: { query: (...args) => mockQuery(...args) },
}));

const {
  incrementHit,
  decrementHit,
  resetKey,
  getHit,
  deleteExpiredHits,
  maybeSweepExpired,
  SWEEP_PROBABILITY,
  SWEEP_BATCH_SIZE,
} = await import("./rateLimitRepository.js");

const KEY = "auth:1.2.3.4";
const RESET_AT = new Date("2026-09-24T12:15:00Z");

describe("rateLimitRepository", () => {
  let errorSpy;
  let randomSpy;

  beforeEach(() => {
    mockQuery.mockReset();
    errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    // Pinned above the sweep threshold so only the sweep tests trigger one.
    randomSpy = vi.spyOn(Math, "random").mockReturnValue(0.99);
  });

  afterEach(() => {
    errorSpy.mockRestore();
    randomSpy.mockRestore();
  });

  describe("incrementHit", () => {
    it("upserts with an expiry reset in one parameterized statement", async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ hits: 3, reset_at: RESET_AT }] });

      const result = await incrementHit(KEY, 900000);

      expect(mockQuery).toHaveBeenCalledTimes(1);
      const [sql, params] = mockQuery.mock.calls[0];
      expect(sql).toContain("INSERT INTO rate_limit_hits");
      expect(sql).toContain("ON CONFLICT (key) DO UPDATE");
      expect(sql.match(/rate_limit_hits\.reset_at <= NOW\(\)/g)).toHaveLength(2);
      expect(sql).toContain("RETURNING hits, reset_at");
      expect(params).toEqual([KEY, 900000]);
      expect(result).toEqual({ hits: 3, resetAt: RESET_AT });
    });

    it("coerces a string hit count to a number", async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ hits: "2", reset_at: RESET_AT }] });

      const result = await incrementHit(KEY, 1000);

      expect(result.hits).toBe(2);
    });

    it("logs the message and rethrows on failure", async () => {
      mockQuery.mockRejectedValueOnce(new Error("db down"));

      await expect(incrementHit(KEY, 1000)).rejects.toThrow("db down");
      expect(errorSpy).toHaveBeenCalledWith(
        "rateLimitRepository.incrementHit failed:",
        "db down",
      );
    });
  });

  describe("decrementHit", () => {
    it("bounds the count at zero and returns the mapped row", async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ hits: 0, reset_at: RESET_AT }] });

      const result = await decrementHit(KEY);

      const [sql, params] = mockQuery.mock.calls[0];
      expect(sql).toContain("GREATEST(hits - 1, 0)");
      expect(sql).toContain("reset_at > NOW()");
      expect(params).toEqual([KEY]);
      expect(result).toEqual({ hits: 0, resetAt: RESET_AT });
    });

    it("returns null when no live row matched", async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      await expect(decrementHit(KEY)).resolves.toBeNull();
    });

    it("logs the message and rethrows on failure", async () => {
      mockQuery.mockRejectedValueOnce(new Error("db down"));

      await expect(decrementHit(KEY)).rejects.toThrow("db down");
      expect(errorSpy).toHaveBeenCalledWith(
        "rateLimitRepository.decrementHit failed:",
        "db down",
      );
    });
  });

  describe("resetKey", () => {
    it("deletes by key and reports true when a row was removed", async () => {
      mockQuery.mockResolvedValueOnce({ rowCount: 1 });

      const result = await resetKey(KEY);

      const [sql, params] = mockQuery.mock.calls[0];
      expect(sql).toContain("DELETE FROM rate_limit_hits WHERE key = $1");
      expect(params).toEqual([KEY]);
      expect(result).toBe(true);
    });

    it("reports false when no row existed", async () => {
      mockQuery.mockResolvedValueOnce({ rowCount: 0 });

      await expect(resetKey(KEY)).resolves.toBe(false);
    });

    it("logs the message and rethrows on failure", async () => {
      mockQuery.mockRejectedValueOnce(new Error("db down"));

      await expect(resetKey(KEY)).rejects.toThrow("db down");
      expect(errorSpy).toHaveBeenCalledWith(
        "rateLimitRepository.resetKey failed:",
        "db down",
      );
    });
  });

  describe("getHit", () => {
    it("returns the mapped live row", async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ hits: 5, reset_at: RESET_AT }] });

      const result = await getHit(KEY);

      const [sql, params] = mockQuery.mock.calls[0];
      expect(sql).toContain("SELECT hits, reset_at FROM rate_limit_hits");
      expect(sql).toContain("reset_at > NOW()");
      expect(params).toEqual([KEY]);
      expect(result).toEqual({ hits: 5, resetAt: RESET_AT });
    });

    it("returns null when the key is absent or expired", async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      await expect(getHit(KEY)).resolves.toBeNull();
    });

    it("logs the message and rethrows on failure", async () => {
      mockQuery.mockRejectedValueOnce(new Error("db down"));

      await expect(getHit(KEY)).rejects.toThrow("db down");
      expect(errorSpy).toHaveBeenCalledWith(
        "rateLimitRepository.getHit failed:",
        "db down",
      );
    });
  });

  describe("deleteExpiredHits", () => {
    it("deletes only expired rows, in a bounded batch, and returns the count", async () => {
      mockQuery.mockResolvedValueOnce({ rowCount: 42 });

      const result = await deleteExpiredHits();

      const [sql, params] = mockQuery.mock.calls[0];
      expect(sql).toContain("DELETE FROM rate_limit_hits");
      expect(sql.match(/reset_at <= NOW\(\)/g)).toHaveLength(2);
      expect(sql).not.toContain("reset_at > NOW()");
      expect(sql).toContain("ORDER BY reset_at");
      expect(sql).toContain("LIMIT $1");
      expect(sql).toContain("FOR UPDATE SKIP LOCKED");
      expect(params).toEqual([SWEEP_BATCH_SIZE]);
      expect(result).toBe(42);
    });

    it("passes a caller-supplied batch size", async () => {
      mockQuery.mockResolvedValueOnce({ rowCount: 0 });

      await deleteExpiredHits(10);

      expect(mockQuery.mock.calls[0][1]).toEqual([10]);
    });

    it("logs the message and rethrows on failure", async () => {
      mockQuery.mockRejectedValueOnce(new Error("db down"));

      await expect(deleteExpiredHits()).rejects.toThrow("db down");
      expect(errorSpy).toHaveBeenCalledWith(
        "rateLimitRepository.deleteExpiredHits failed:",
        "db down",
      );
    });
  });

  describe("maybeSweepExpired", () => {
    it("skips the sweep when the sample is at or above the threshold", () => {
      randomSpy.mockReturnValue(SWEEP_PROBABILITY);

      expect(maybeSweepExpired()).toBeNull();
      expect(mockQuery).not.toHaveBeenCalled();
    });

    it("sweeps when sampled and resolves to the deleted count", async () => {
      randomSpy.mockReturnValue(0);
      mockQuery.mockResolvedValueOnce({ rowCount: 7 });

      await expect(maybeSweepExpired()).resolves.toBe(7);
      expect(mockQuery.mock.calls[0][0]).toContain("DELETE FROM rate_limit_hits");
    });

    it("swallows a sweep failure and resolves to zero", async () => {
      randomSpy.mockReturnValue(0);
      mockQuery.mockRejectedValueOnce(new Error("db down"));

      await expect(maybeSweepExpired()).resolves.toBe(0);
    });
  });

  describe("incrementHit sweep sampling", () => {
    it("runs a sweep after the increment when sampled, without changing the live counter", async () => {
      randomSpy.mockReturnValue(0);
      mockQuery
        .mockResolvedValueOnce({ rows: [{ hits: 4, reset_at: RESET_AT }] })
        .mockResolvedValueOnce({ rowCount: 3 });

      const result = await incrementHit(KEY, 900000);

      expect(mockQuery).toHaveBeenCalledTimes(2);
      expect(mockQuery.mock.calls[0][0]).toContain("INSERT INTO rate_limit_hits");
      expect(mockQuery.mock.calls[1][0]).toContain("DELETE FROM rate_limit_hits");
      expect(mockQuery.mock.calls[1][1]).not.toContain(KEY);
      expect(result).toEqual({ hits: 4, resetAt: RESET_AT });
    });

    it("does not settle until the sampled sweep completes", async () => {
      randomSpy.mockReturnValue(0);
      let finishSweep;
      mockQuery
        .mockResolvedValueOnce({ rows: [{ hits: 2, reset_at: RESET_AT }] })
        .mockReturnValueOnce(
          new Promise((resolve) => {
            finishSweep = resolve;
          }),
        );
      let settled = false;

      const pending = incrementHit(KEY, 1000).then((result) => {
        settled = true;
        return result;
      });
      await vi.waitFor(() => expect(mockQuery).toHaveBeenCalledTimes(2));
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(settled).toBe(false);
      finishSweep({ rowCount: 5 });
      await expect(pending).resolves.toEqual({ hits: 2, resetAt: RESET_AT });
      expect(settled).toBe(true);
    });

    it("targets only expired rows when the sampled sweep runs", async () => {
      randomSpy.mockReturnValue(0);
      mockQuery
        .mockResolvedValueOnce({ rows: [{ hits: 1, reset_at: RESET_AT }] })
        .mockResolvedValueOnce({ rowCount: 0 });

      await incrementHit(KEY, 1000);

      const [sql, params] = mockQuery.mock.calls[1];
      expect(sql.match(/reset_at <= NOW\(\)/g)).toHaveLength(2);
      expect(sql).not.toContain("reset_at > NOW()");
      expect(params).toEqual([SWEEP_BATCH_SIZE]);
    });

    it("still returns the counter when the sampled sweep fails", async () => {
      randomSpy.mockReturnValue(0);
      mockQuery
        .mockResolvedValueOnce({ rows: [{ hits: 1, reset_at: RESET_AT }] })
        .mockRejectedValueOnce(new Error("db down"));

      await expect(incrementHit(KEY, 1000)).resolves.toEqual({
        hits: 1,
        resetAt: RESET_AT,
      });
      expect(errorSpy).toHaveBeenCalledWith(
        "rateLimitRepository.deleteExpiredHits failed:",
        "db down",
      );
      expect(errorSpy).not.toHaveBeenCalledWith(
        "rateLimitRepository.incrementHit failed:",
        expect.anything(),
      );
    });
  });
});
