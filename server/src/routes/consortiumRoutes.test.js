import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import request from "supertest";

const mockVerifyIdToken = vi.fn();
const mockQuery = vi.fn();

vi.mock("../config/firebase.js", () => ({
  default: {
    auth: () => ({
      verifyIdToken: mockVerifyIdToken,
      deleteUser: vi.fn(),
    }),
    firestore: () => ({
      collection: () => ({
        where: () => ({
          where: () => ({
            limit: () => ({ get: () => ({ docs: [] }) }),
          }),
          limit: () => ({ get: () => Promise.resolve({ docs: [] }) }),
        }),
        limit: () => ({ get: () => Promise.resolve({ docs: [] }) }),
      }),
    }),
  },
}));

vi.mock("../config/database.js", () => ({
  default: { query: (...args) => mockQuery(...args) },
  withTransaction: (fn) => fn({ query: (...args) => mockQuery(...args) }),
}));

vi.mock("../repositories/knowledgeRepository.js", () => ({
  queryKnowledgeBase: vi.fn().mockResolvedValue([]),
}));

globalThis.fetch = vi.fn();

const { default: app } = await import("../app.js");

const decodedToken = { uid: "uid-1", email: "user@example.com" };

function authHeader() {
  return { Authorization: "Bearer valid-token" };
}

function registeredRow(position) {
  return { consortium_interest: true, consortium_position: position };
}

describe("Consortium routes", () => {
  beforeEach(() => {
    mockVerifyIdToken.mockReset();
    mockQuery.mockReset();
  });

  describe("authentication", () => {
    it("returns 401 on GET /api/consortium/me without a token", async () => {
      const res = await request(app).get("/api/consortium/me");

      expect(res.status).toBe(401);
    });

    it("returns 401 on GET /api/consortium/tiers without a token", async () => {
      const res = await request(app).get("/api/consortium/tiers");

      expect(res.status).toBe(401);
    });

    it("returns 401 on PUT /api/consortium/tier without a token", async () => {
      const res = await request(app)
        .put("/api/consortium/tier")
        .send({ tier: "readiness" });

      expect(res.status).toBe(401);
    });
  });

  describe("GET /api/consortium/me", () => {
    it("returns 200 with null data for a non-registrant", async () => {
      mockVerifyIdToken.mockResolvedValue(decodedToken);
      mockQuery.mockResolvedValue({ rows: [] });

      const res = await request(app)
        .get("/api/consortium/me")
        .set(authHeader());

      expect(res.status).toBe(200);
      expect(res.body.data).toBeNull();
      expect(res.body.message).toBe("Consortium profile retrieved");
    });
  });

  describe("GET /api/consortium/tiers", () => {
    it("returns 403 for a non-registrant", async () => {
      mockVerifyIdToken.mockResolvedValue(decodedToken);
      mockQuery.mockResolvedValue({ rows: [] });

      const res = await request(app)
        .get("/api/consortium/tiers")
        .set(authHeader());

      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty("data", null);
      expect(res.body.error).not.toBe(true);
      expect(typeof res.body.error).toBe("string");
      expect(res.body.message).toBe("Consortium registration required");
    });

    it("returns the permitted ladder for a registrant", async () => {
      mockVerifyIdToken.mockResolvedValue(decodedToken);
      mockQuery.mockResolvedValue({ rows: [registeredRow("supplier")] });

      const res = await request(app)
        .get("/api/consortium/tiers")
        .set(authHeader());

      expect(res.status).toBe(200);
      expect(res.body.data.tiers.map((t) => t.tierId)).toEqual([
        "readiness",
        "consortium_supplier",
        "not_sure",
      ]);
    });
  });

  describe("PUT /api/consortium/tier", () => {
    it("returns 400 for an unknown tier id", async () => {
      mockVerifyIdToken.mockResolvedValue(decodedToken);

      const res = await request(app)
        .put("/api/consortium/tier")
        .set(authHeader())
        .send({ tier: "platinum" });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Validation failed");
    });

    it("returns 403 when the position does not permit the tier", async () => {
      mockVerifyIdToken.mockResolvedValue(decodedToken);
      mockQuery.mockResolvedValue({ rows: [registeredRow("supplier")] });

      const res = await request(app)
        .put("/api/consortium/tier")
        .set(authHeader())
        .send({ tier: "consortium_anchor" });

      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty("data", null);
      expect(res.body).toHaveProperty("error");
      expect(res.body.message).toBe("Tier not available for this registration");
    });

    it("does not return 200 when the update touches no row", async () => {
      mockVerifyIdToken.mockResolvedValue(decodedToken);
      mockQuery
        .mockResolvedValueOnce({ rows: [registeredRow("supplier")] })
        .mockResolvedValueOnce({ rows: [] });

      const res = await request(app)
        .put("/api/consortium/tier")
        .set(authHeader())
        .send({ tier: "consortium_supplier" });

      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty("data", null);
      expect(res.body.message).not.toBe("Tier saved");
    });

    it("returns 200 and the response envelope for a permitted tier", async () => {
      mockVerifyIdToken.mockResolvedValue(decodedToken);
      mockQuery
        .mockResolvedValueOnce({ rows: [registeredRow("supplier")] })
        .mockResolvedValueOnce({
          rows: [
            {
              ...registeredRow("supplier"),
              consortium_tier: "consortium_supplier",
            },
          ],
        });

      const res = await request(app)
        .put("/api/consortium/tier")
        .set(authHeader())
        .send({ tier: "consortium_supplier" });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("data");
      expect(res.body).toHaveProperty("error", null);
      expect(res.body.message).toBe("Tier saved");
      expect(res.body.data.consortium_tier).toBe("consortium_supplier");
    });
  });

  describe("global error handler", () => {
    beforeEach(() => {
      vi.spyOn(console, "error").mockImplementation(() => {});
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("returns a string error reason, not error: true, on an unhandled failure", async () => {
      mockVerifyIdToken.mockResolvedValue(decodedToken);
      mockQuery.mockRejectedValue(new Error("db exploded"));

      const res = await request(app)
        .get("/api/consortium/me")
        .set(authHeader());

      expect(res.status).toBe(500);
      expect(res.body.data).toBeNull();
      expect(res.body.error).not.toBe(true);
      expect(typeof res.body.error).toBe("string");
      expect(typeof res.body.message).toBe("string");
    });
  });
});
