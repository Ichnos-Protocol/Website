import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";

const mockQuery = vi.fn();
const hitCounts = new Map();

vi.mock("../config/firebase.js", () => ({
  default: {
    auth: () => ({
      verifyIdToken: vi.fn(),
      getUser: vi.fn(),
      setCustomUserClaims: vi.fn(),
    }),
  },
}));

vi.mock("../config/database.js", () => ({
  default: { query: (...args) => mockQuery(...args) },
  withTransaction: (fn) => fn({ query: (...args) => mockQuery(...args) }),
}));

// In-memory stand-in for rate_limit_hits, keyed by the prefixed key.
vi.mock("../repositories/rateLimitRepository.js", () => ({
  incrementHit: async (key, windowMs) => {
    const hits = (hitCounts.get(key) || 0) + 1;
    hitCounts.set(key, hits);
    return { hits, resetAt: new Date(Date.now() + windowMs) };
  },
  decrementHit: async () => null,
  resetKey: async (key) => hitCounts.delete(key),
  getHit: async () => null,
}));

const { default: app } = await import("../app.js");

describe("auth rate limiter", () => {
  beforeEach(() => {
    hitCounts.clear();
    mockQuery.mockReset();
  });

  it("returns 429 on the 21st auth request in the window", async () => {
    const statuses = [];
    for (let i = 0; i < 21; i += 1) {
      const res = await request(app).get("/api/auth/me");
      statuses.push(res.status);
    }

    expect(statuses.slice(0, 20)).toEqual(Array(20).fill(401));
    expect(statuses[20]).toBe(429);
  });

  it("sends a draft-7 RateLimit header before the limit is reached", async () => {
    const res = await request(app).get("/api/auth/me");

    expect(res.status).toBe(401);
    expect(res.headers.ratelimit).toBeDefined();
    expect(res.headers["x-ratelimit-limit"]).toBeUndefined();
  });

  it("counts auth and global traffic under separate prefixes", async () => {
    await request(app).get("/api/auth/me");

    const keys = [...hitCounts.keys()];
    expect(keys.some((key) => key.startsWith("global:"))).toBe(true);
    expect(keys.some((key) => key.startsWith("auth:"))).toBe(true);
    expect(mockQuery).not.toHaveBeenCalled();
  });
});
