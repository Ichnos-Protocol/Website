import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const mockIncrementHit = vi.fn();
const mockDecrementHit = vi.fn();
const mockResetKey = vi.fn();
const mockGetHit = vi.fn();

vi.mock("../repositories/rateLimitRepository.js", () => ({
  incrementHit: (...args) => mockIncrementHit(...args),
  decrementHit: (...args) => mockDecrementHit(...args),
  resetKey: (...args) => mockResetKey(...args),
  getHit: (...args) => mockGetHit(...args),
}));

const { default: PgRateLimitStore } = await import("./pgRateLimitStore.js");

const WINDOW_MS = 900000;
const IP = "1.2.3.4";
const RESET_AT = new Date("2026-09-24T12:15:00Z");

function buildStore(options) {
  const store = new PgRateLimitStore(options);
  store.init({ windowMs: WINDOW_MS });
  return store;
}

describe("PgRateLimitStore", () => {
  let errorSpy;

  beforeEach(() => {
    mockIncrementHit.mockReset();
    mockDecrementHit.mockReset();
    mockResetKey.mockReset();
    mockGetHit.mockReset();
    errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    errorSpy.mockRestore();
    vi.useRealTimers();
  });

  describe("increment", () => {
    it("passes the prefixed key and the init window to the repository", async () => {
      mockIncrementHit.mockResolvedValueOnce({ hits: 1, resetAt: RESET_AT });

      await buildStore({ prefix: "auth:" }).increment(IP);

      expect(mockIncrementHit).toHaveBeenCalledWith("auth:1.2.3.4", WINDOW_MS);
    });

    it("passes the bare key when no prefix is given", async () => {
      mockIncrementHit.mockResolvedValueOnce({ hits: 1, resetAt: RESET_AT });

      await buildStore().increment(IP);

      expect(mockIncrementHit).toHaveBeenCalledWith(IP, WINDOW_MS);
    });

    it("maps hits/resetAt to totalHits/resetTime", async () => {
      mockIncrementHit.mockResolvedValueOnce({ hits: 7, resetAt: RESET_AT });

      const result = await buildStore({ prefix: "global:" }).increment(IP);

      expect(result).toEqual({ totalHits: 7, resetTime: RESET_AT });
      expect(result.resetTime).toBeInstanceOf(Date);
    });

    it("fails open with a first hit when the repository throws", async () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2026-09-24T12:00:00Z"));
      mockIncrementHit.mockRejectedValueOnce(new Error("db down"));

      const result = await buildStore({ prefix: "auth:" }).increment(IP);

      expect(result).toEqual({
        totalHits: 1,
        resetTime: new Date(Date.now() + WINDOW_MS),
      });
      expect(errorSpy).toHaveBeenCalledWith(
        "pgRateLimitStore.increment failed:",
        "db down",
      );
      expect(JSON.stringify(errorSpy.mock.calls)).not.toContain(IP);
    });
  });

  describe("get", () => {
    it("maps a live row", async () => {
      mockGetHit.mockResolvedValueOnce({ hits: 4, resetAt: RESET_AT });

      const result = await buildStore({ prefix: "auth:" }).get(IP);

      expect(mockGetHit).toHaveBeenCalledWith("auth:1.2.3.4");
      expect(result).toEqual({ totalHits: 4, resetTime: RESET_AT });
    });

    it("returns undefined when the repository returns null", async () => {
      mockGetHit.mockResolvedValueOnce(null);

      await expect(buildStore().get(IP)).resolves.toBeUndefined();
    });

    it("returns undefined when the repository throws", async () => {
      mockGetHit.mockRejectedValueOnce(new Error("db down"));

      await expect(buildStore().get(IP)).resolves.toBeUndefined();
      expect(errorSpy).toHaveBeenCalledWith(
        "pgRateLimitStore.get failed:",
        "db down",
      );
    });
  });

  describe("decrement", () => {
    it("delegates with the prefixed key", async () => {
      mockDecrementHit.mockResolvedValueOnce(null);

      await expect(
        buildStore({ prefix: "auth:" }).decrement(IP),
      ).resolves.toBeUndefined();
      expect(mockDecrementHit).toHaveBeenCalledWith("auth:1.2.3.4");
    });

    it("resolves silently when the repository throws", async () => {
      mockDecrementHit.mockRejectedValueOnce(new Error("db down"));

      await expect(buildStore().decrement(IP)).resolves.toBeUndefined();
      expect(errorSpy).toHaveBeenCalledWith(
        "pgRateLimitStore.decrement failed:",
        "db down",
      );
    });
  });

  describe("resetKey", () => {
    it("delegates with the prefixed key", async () => {
      mockResetKey.mockResolvedValueOnce(true);

      await expect(
        buildStore({ prefix: "global:" }).resetKey(IP),
      ).resolves.toBeUndefined();
      expect(mockResetKey).toHaveBeenCalledWith("global:1.2.3.4");
    });

    it("resolves silently when the repository throws", async () => {
      mockResetKey.mockRejectedValueOnce(new Error("db down"));

      await expect(buildStore().resetKey(IP)).resolves.toBeUndefined();
      expect(errorSpy).toHaveBeenCalledWith(
        "pgRateLimitStore.resetKey failed:",
        "db down",
      );
    });
  });
});
