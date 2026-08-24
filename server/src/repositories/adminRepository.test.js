import { describe, it, expect, vi, beforeEach } from "vitest";

const mockQuery = vi.fn();

vi.mock("../config/database.js", () => ({
  default: { query: (...args) => mockQuery(...args) },
}));

const {
  getUsersWithRequests,
  getRequestsWithQuestionsByUserId,
  getChatOnlyUsers,
  getChatMessagesByUserId,
  getInactiveUsers,
  getRecentInquiries,
  getRecentChatOnlyLeads,
  getAllDataForExport,
  getRecentConsortiumRegistrations,
  getConsortiumRegistrants,
} = await import("./adminRepository.js");

describe("adminRepository", () => {
  beforeEach(() => {
    mockQuery.mockReset();
  });

  describe("getUsersWithRequests", () => {
    it("returns users with request counts", async () => {
      const rows = [
        { userId: "uid-1", name: "Alice", totalRequests: 3, lastActivity: "2026-01-01" },
      ];
      mockQuery.mockResolvedValue({ rows });

      const result = await getUsersWithRequests();

      expect(result).toEqual(rows);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("JOIN contact_requests"),
      );
    });

    it("counts inquiry rows only and exposes consortium interest", async () => {
      mockQuery.mockResolvedValue({ rows: [] });

      await getUsersWithRequests();

      const [sql] = mockQuery.mock.calls[0];
      // A consortium-kind row must not inflate the inquiry count.
      expect(sql).toContain("FILTER (WHERE cr.kind = 'inquiry')");
      expect(sql).toContain("consortium_interest");
      // Still an INNER JOIN: users with no contact_requests row stay out.
      expect(sql).toContain("JOIN contact_requests");
    });

    it("logs and rethrows on DB error", async () => {
      mockQuery.mockRejectedValue(new Error("connection failed"));
      const spy = vi.spyOn(console, "error").mockImplementation(() => {});

      await expect(getUsersWithRequests()).rejects.toThrow("connection failed");
      expect(spy).toHaveBeenCalledWith(
        "adminRepository.getUsersWithRequests failed:",
        "connection failed",
      );
      spy.mockRestore();
    });
  });

  describe("getRequestsWithQuestionsByUserId", () => {
    it("returns requests with questions array and questionPreview", async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ id: 1, user_id: "uid-1" }] })
        .mockResolvedValueOnce({
          rows: [
            {
              id: 10,
              question: "Hello?",
              answer: null,
              source: "form",
              created_at: "2026-01-01",
              contact_request_id: 1,
            },
          ],
        });

      const result = await getRequestsWithQuestionsByUserId("uid-1");

      expect(mockQuery).toHaveBeenCalledTimes(2);
      expect(result[0].questionPreview).toBe("Hello?");
      expect(result[0].questions).toHaveLength(1);
      expect(result[0].questions[0].id).toBe(10);
      expect(mockQuery).toHaveBeenNthCalledWith(
        2,
        expect.stringContaining("ANY"),
        [[1]],
      );
    });

    it("logs and rethrows on DB error", async () => {
      mockQuery.mockRejectedValue(new Error("timeout"));
      const spy = vi.spyOn(console, "error").mockImplementation(() => {});

      await expect(
        getRequestsWithQuestionsByUserId("uid-1"),
      ).rejects.toThrow("timeout");
      expect(spy).toHaveBeenCalledWith(
        "adminRepository.getRequestsWithQuestionsByUserId failed:",
        "timeout",
      );
      spy.mockRestore();
    });
  });

  describe("getChatOnlyUsers", () => {
    it("returns users without contact requests", async () => {
      const rows = [
        { userId: "uid-2", name: "Bob", totalMessages: 5, lastActivity: "2026-02-01" },
      ];
      mockQuery.mockResolvedValue({ rows });

      const result = await getChatOnlyUsers();

      expect(result).toEqual(rows);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("NOT IN"),
      );
    });

    // Paired with the getRecentChatOnlyLeads case below: both exclusions must
    // carry the same marker predicate. A user with chat messages plus a
    // consortium-kind row survives both queries; the same user with an
    // inquiry-kind row is excluded from both.
    it("excludes only users who filed an inquiry-kind request", async () => {
      mockQuery.mockResolvedValue({ rows: [] });

      await getChatOnlyUsers();

      const [sql] = mockQuery.mock.calls[0];
      expect(sql).toContain("NOT IN");
      expect(sql).toContain("WHERE kind = 'inquiry'");
    });

    it("logs and rethrows on DB error", async () => {
      mockQuery.mockRejectedValue(new Error("permission denied"));
      const spy = vi.spyOn(console, "error").mockImplementation(() => {});

      await expect(getChatOnlyUsers()).rejects.toThrow("permission denied");
      expect(spy).toHaveBeenCalledWith(
        "adminRepository.getChatOnlyUsers failed:",
        "permission denied",
      );
      spy.mockRestore();
    });
  });

  describe("getChatMessagesByUserId", () => {
    it("returns messages ordered by created_at ASC", async () => {
      const rows = [
        { id: 1, question: "Hi", answer: "Hello", created_at: "2026-01-01" },
        { id: 2, question: "Help", answer: "Sure", created_at: "2026-01-02" },
      ];
      mockQuery.mockResolvedValue({ rows });

      const result = await getChatMessagesByUserId("uid-1");

      expect(result).toEqual(rows);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("ORDER BY created_at ASC"),
        ["uid-1"],
      );
    });

    it("logs and rethrows on DB error", async () => {
      mockQuery.mockRejectedValue(new Error("syntax error"));
      const spy = vi.spyOn(console, "error").mockImplementation(() => {});

      await expect(getChatMessagesByUserId("uid-1")).rejects.toThrow("syntax error");
      expect(spy).toHaveBeenCalledWith(
        "adminRepository.getChatMessagesByUserId failed:",
        "syntax error",
      );
      spy.mockRestore();
    });
  });

  describe("getInactiveUsers", () => {
    it("returns users inactive for 24 months", async () => {
      const rows = [{ firebase_uid: "uid-old" }];
      mockQuery.mockResolvedValue({ rows });

      const result = await getInactiveUsers();

      expect(result).toEqual(rows);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("INTERVAL '24 months'"),
      );
    });

    it("logs and rethrows on DB error", async () => {
      mockQuery.mockRejectedValue(new Error("db down"));
      const spy = vi.spyOn(console, "error").mockImplementation(() => {});

      await expect(getInactiveUsers()).rejects.toThrow("db down");
      expect(spy).toHaveBeenCalledWith(
        "adminRepository.getInactiveUsers failed:",
        "db down",
      );
      spy.mockRestore();
    });
  });

  describe("getRecentInquiries", () => {
    it("returns inquiries from last 24 hours", async () => {
      const rows = [{ id: 1, name: "Alice", email: "a@b.com", status: "new" }];
      mockQuery.mockResolvedValue({ rows });

      const result = await getRecentInquiries();

      expect(result).toEqual(rows);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("INTERVAL '24 hours'"),
      );
    });

    it("restricts the window to inquiry-kind requests", async () => {
      mockQuery.mockResolvedValue({ rows: [] });

      await getRecentInquiries();

      const [sql] = mockQuery.mock.calls[0];
      expect(sql).toContain("cr.kind = 'inquiry'");
      expect(sql).toContain("INTERVAL '24 hours'");
    });

    it("logs and rethrows on DB error", async () => {
      mockQuery.mockRejectedValue(new Error("timeout"));
      const spy = vi.spyOn(console, "error").mockImplementation(() => {});

      await expect(getRecentInquiries()).rejects.toThrow("timeout");
      expect(spy).toHaveBeenCalledWith(
        "adminRepository.getRecentInquiries failed:",
        "timeout",
      );
      spy.mockRestore();
    });
  });

  describe("getRecentChatOnlyLeads", () => {
    it("returns chat-only leads from last 24 hours", async () => {
      const rows = [{ userId: "uid-new", name: "Bob", totalMessages: 3 }];
      mockQuery.mockResolvedValue({ rows });

      const result = await getRecentChatOnlyLeads();

      expect(result).toEqual(rows);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("INTERVAL '24 hours'"),
      );
    });

    // The other half of the pair: this exclusion must match getChatOnlyUsers
    // exactly, or the digest and the dashboard would disagree about who counts
    // as a chat-only lead.
    it("excludes only users who filed an inquiry-kind request", async () => {
      mockQuery.mockResolvedValue({ rows: [] });

      await getRecentChatOnlyLeads();

      const [sql] = mockQuery.mock.calls[0];
      expect(sql).toContain("NOT IN");
      expect(sql).toContain("WHERE kind = 'inquiry'");
    });

    it("logs and rethrows on DB error", async () => {
      mockQuery.mockRejectedValue(new Error("access denied"));
      const spy = vi.spyOn(console, "error").mockImplementation(() => {});

      await expect(getRecentChatOnlyLeads()).rejects.toThrow("access denied");
      expect(spy).toHaveBeenCalledWith(
        "adminRepository.getRecentChatOnlyLeads failed:",
        "access denied",
      );
      spy.mockRestore();
    });
  });

  describe("getAllDataForExport", () => {
    it("selects the consortium columns in both UNION arms", async () => {
      mockQuery.mockResolvedValue({ rows: [] });

      await getAllDataForExport();

      const [sql] = mockQuery.mock.calls[0];
      expect(sql).toContain("consortium_tier");
      expect(sql).toContain("consortium_registered_at");
      expect(sql).toContain("p.consortium_admin_notes");
      // One occurrence per arm keeps the two SELECT lists union-compatible.
      expect(sql.match(/consortium_interest/g)).toHaveLength(2);
      expect(sql.match(/consortium_admin_notes/g)).toHaveLength(2);
    });
  });

  describe("getRecentConsortiumRegistrations", () => {
    it("reads registrations from user_profiles without any kind predicate", async () => {
      const rows = [
        { name: "Dana", email: "dana@example.com", source: "website" },
      ];
      mockQuery.mockResolvedValue({ rows });

      const result = await getRecentConsortiumRegistrations();

      expect(result).toEqual(rows);
      const [sql] = mockQuery.mock.calls[0];
      expect(sql).toContain("consortium_interest = true");
      expect(sql).toContain(
        "consortium_registered_at >= NOW() - INTERVAL '24 hours'",
      );
      // Registration is a person-level property: contact_requests.kind plays
      // no part in discovering registrants.
      expect(sql).not.toContain("kind");
    });

    it("logs and rethrows on DB error", async () => {
      mockQuery.mockRejectedValue(new Error("relation missing"));
      const spy = vi.spyOn(console, "error").mockImplementation(() => {});

      await expect(getRecentConsortiumRegistrations()).rejects.toThrow(
        "relation missing",
      );
      expect(spy).toHaveBeenCalledWith(
        "adminRepository.getRecentConsortiumRegistrations failed:",
        "relation missing",
      );
      spy.mockRestore();
    });
  });

  describe("getConsortiumRegistrants", () => {
    it("passes an empty params array when no filters are given", async () => {
      const rows = [{ userId: "uid-1", consortiumTier: "gold" }];
      mockQuery.mockResolvedValue({ rows });

      const result = await getConsortiumRegistrants();

      expect(result).toEqual(rows);
      const [sql, params] = mockQuery.mock.calls[0];
      expect(params).toEqual([]);
      expect(sql).toContain("consortium_interest = true");
      expect(sql).toContain(
        'p.consortium_admin_notes AS "consortiumAdminNotes"',
      );
      expect(sql).not.toContain("kind");
      expect(sql).not.toContain("$1");
    });

    it("numbers one placeholder per filter and keeps values out of the SQL", async () => {
      mockQuery.mockResolvedValue({ rows: [] });

      await getConsortiumRegistrants({
        tier: "gold",
        source: "website",
        status: "registered",
      });

      const [sql, params] = mockQuery.mock.calls[0];
      expect(params).toEqual(["gold", "website", "registered"]);
      expect(sql).toContain("p.consortium_tier = $1");
      expect(sql).toContain("p.consortium_source = $2");
      expect(sql).toContain("p.consortium_status = $3");
      expect(sql).not.toContain("gold");
      expect(sql).not.toContain("website");
      expect(sql).not.toContain("kind");
    });

    it("renumbers placeholders when only a later filter is given", async () => {
      mockQuery.mockResolvedValue({ rows: [] });

      await getConsortiumRegistrants({ status: "invited" });

      const [sql, params] = mockQuery.mock.calls[0];
      expect(params).toEqual(["invited"]);
      expect(sql).toContain("p.consortium_status = $1");
      expect(sql).not.toContain("consortium_tier = $");
      expect(sql).not.toContain("invited");
    });

    it("logs and rethrows on DB error", async () => {
      mockQuery.mockRejectedValue(new Error("column missing"));
      const spy = vi.spyOn(console, "error").mockImplementation(() => {});

      await expect(getConsortiumRegistrants()).rejects.toThrow("column missing");
      expect(spy).toHaveBeenCalledWith(
        "adminRepository.getConsortiumRegistrants failed:",
        "column missing",
      );
      spy.mockRestore();
    });
  });
});
