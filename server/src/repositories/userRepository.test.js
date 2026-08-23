import { describe, it, expect, vi, beforeEach } from "vitest";

const mockQuery = vi.fn();

vi.mock("../config/database.js", () => ({
  default: { query: (...args) => mockQuery(...args) },
}));

const {
  createUser,
  upsertProfile,
  getUserById,
  getUserByEmail,
  updateUserActivity,
  deleteUserData,
  updateConsortiumProfile,
  getConsortiumProfile,
  setConsortiumTier,
  scrubConsortiumText,
} = await import("./userRepository.js");

const consortiumAnswers = {
  position: "supplier",
  chainRole: "cathode_material",
  productLine: "NMC cathode powders",
  customerRequest: null,
  dataExtract: "not_yet",
  dataNeeds: null,
  preferredStart: "nov_2026",
  source: "landing_page",
  consentTimestamp: "2026-02-16T12:00:00Z",
  consentVersion: "v1",
};

describe("userRepository", () => {
  beforeEach(() => {
    mockQuery.mockReset();
  });

  describe("createUser", () => {
    it("inserts a user and returns the created row", async () => {
      const user = { firebase_uid: "uid-1", created_at: new Date() };
      mockQuery.mockResolvedValue({ rows: [user] });

      const result = await createUser("uid-1");

      expect(result).toEqual(user);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO users"),
        ["uid-1"],
      );
    });
  });

  describe("upsertProfile", () => {
    it("inserts or updates profile and returns the row", async () => {
      const profile = { user_id: "uid-1", name: "John", surname: "Doe", email: "j@d.com" };
      mockQuery.mockResolvedValue({ rows: [profile] });

      const result = await upsertProfile("uid-1", {
        name: "John",
        surname: "Doe",
        email: "j@d.com",
      });

      expect(result).toEqual(profile);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("ON CONFLICT"),
        ["uid-1", "John", "Doe", "j@d.com", null, null, null],
      );
    });

    it("passes optional fields when provided", async () => {
      mockQuery.mockResolvedValue({ rows: [{}] });

      await upsertProfile("uid-1", {
        name: "Jane",
        surname: "Doe",
        email: "jane@d.com",
        phone: "+123",
        company: "Acme",
        linkedin: "https://linkedin.com/in/jane",
      });

      expect(mockQuery).toHaveBeenCalledWith(
        expect.any(String),
        ["uid-1", "Jane", "Doe", "jane@d.com", "+123", "Acme", "https://linkedin.com/in/jane"],
      );
    });
  });

  describe("getUserById", () => {
    it("returns user with profile when found", async () => {
      const row = { firebase_uid: "uid-1", name: "John" };
      mockQuery.mockResolvedValue({ rows: [row] });

      const result = await getUserById("uid-1");
      expect(result).toEqual(row);
    });

    it("returns null when user is not found", async () => {
      mockQuery.mockResolvedValue({ rows: [] });

      const result = await getUserById("nonexistent");
      expect(result).toBeNull();
    });
  });

  describe("getUserByEmail", () => {
    it("returns user when found by email", async () => {
      const row = { firebase_uid: "uid-1", email: "j@d.com" };
      mockQuery.mockResolvedValue({ rows: [row] });

      const result = await getUserByEmail("j@d.com");
      expect(result).toEqual(row);
    });

    it("returns null when email not found", async () => {
      mockQuery.mockResolvedValue({ rows: [] });

      const result = await getUserByEmail("nobody@nowhere.com");
      expect(result).toBeNull();
    });
  });

  describe("updateUserActivity", () => {
    it("executes update query with correct uid", async () => {
      mockQuery.mockResolvedValue({ rowCount: 1 });

      await updateUserActivity("uid-1");

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("UPDATE users SET updated_at"),
        ["uid-1"],
      );
    });
  });

  describe("deleteUserData", () => {
    it("wipes PII from profile and soft-deletes user", async () => {
      mockQuery.mockResolvedValue({ rowCount: 1 });

      await deleteUserData("uid-1");

      expect(mockQuery).toHaveBeenCalledTimes(2);
      expect(mockQuery).toHaveBeenNthCalledWith(
        1,
        expect.stringContaining("UPDATE user_profiles"),
        ["uid-1"],
      );
      expect(mockQuery).toHaveBeenNthCalledWith(
        2,
        expect.stringContaining("UPDATE users SET deleted_at"),
        ["uid-1"],
      );
    });
  });

  describe("updateConsortiumProfile", () => {
    it("issues a single UPDATE and returns the row", async () => {
      const row = { consortium_interest: true, consortium_position: "supplier" };
      mockQuery.mockResolvedValue({ rows: [row] });

      const result = await updateConsortiumProfile("uid-1", consortiumAnswers);

      expect(result).toEqual(row);
      expect(mockQuery).toHaveBeenCalledTimes(1);
      const [sql, params] = mockQuery.mock.calls[0];
      expect(sql).toContain("UPDATE user_profiles");
      expect(params[0]).toBe("uid-1");
      expect(params).toContain("registered");
    });

    it("keeps registration metadata on a first-write-wins basis", async () => {
      mockQuery.mockResolvedValue({ rows: [{}] });

      await updateConsortiumProfile("uid-1", consortiumAnswers);

      const [sql] = mockQuery.mock.calls[0];
      expect(sql).toContain(
        "consortium_registered_at = COALESCE(consortium_registered_at, NOW())",
      );
      expect(sql).toContain("consortium_source = COALESCE(consortium_source,");
      expect(sql).toContain("consortium_status = COALESCE(consortium_status,");
    });

    it("never clears consortium_interest", async () => {
      mockQuery.mockResolvedValue({ rows: [{}] });

      await updateConsortiumProfile("uid-1", consortiumAnswers);

      const [sql] = mockQuery.mock.calls[0];
      expect(sql).toContain("consortium_interest = true");
      expect(sql).not.toContain("consortium_interest = false");
    });

    it("never touches identity columns", async () => {
      mockQuery.mockResolvedValue({ rows: [{}] });

      await updateConsortiumProfile("uid-1", consortiumAnswers);

      const [sql] = mockQuery.mock.calls[0];
      for (const column of ["name", "surname", "email", "phone", "company", "linkedin"]) {
        expect(sql).not.toContain(`${column} =`);
      }
    });

    it("returns null when the profile does not exist", async () => {
      mockQuery.mockResolvedValue({ rows: [] });

      const result = await updateConsortiumProfile("nobody", consortiumAnswers);
      expect(result).toBeNull();
    });
  });

  describe("getConsortiumProfile", () => {
    it("returns the row when found", async () => {
      const row = { consortium_interest: true, consortium_tier: "pilot" };
      mockQuery.mockResolvedValue({ rows: [row] });

      const result = await getConsortiumProfile("uid-1");

      expect(result).toEqual(row);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("FROM user_profiles"),
        ["uid-1"],
      );
    });

    it("returns null when not found", async () => {
      mockQuery.mockResolvedValue({ rows: [] });

      const result = await getConsortiumProfile("nobody");
      expect(result).toBeNull();
    });

    it("returns null for an existing profile that never registered", async () => {
      mockQuery.mockResolvedValue({
        rows: [{ consortium_interest: false, consortium_position: null }],
      });

      const result = await getConsortiumProfile("uid-1");
      expect(result).toBeNull();
    });

    it("filters non-registrants in SQL", async () => {
      mockQuery.mockResolvedValue({ rows: [] });

      await getConsortiumProfile("uid-1");

      const [sql] = mockQuery.mock.calls[0];
      expect(sql).toContain("consortium_interest = true");
    });

    it("never selects admin notes", async () => {
      mockQuery.mockResolvedValue({ rows: [] });

      await getConsortiumProfile("uid-1");

      const [sql] = mockQuery.mock.calls[0];
      expect(sql).not.toContain("consortium_admin_notes");
    });
  });

  describe("setConsortiumTier", () => {
    it("issues a single UPDATE with the uid and tier", async () => {
      const row = { consortium_interest: true, consortium_tier: "pilot" };
      mockQuery.mockResolvedValue({ rows: [row] });

      const result = await setConsortiumTier("uid-1", "pilot");

      expect(result).toEqual(row);
      expect(mockQuery).toHaveBeenCalledTimes(1);
      const [sql, params] = mockQuery.mock.calls[0];
      expect(sql).toContain("UPDATE user_profiles");
      expect(params).toEqual(["uid-1", "pilot"]);
    });

    it("stamps the selection time and keeps the registrant predicate", async () => {
      mockQuery.mockResolvedValue({ rows: [{}] });

      await setConsortiumTier("uid-1", "pilot");

      const [sql] = mockQuery.mock.calls[0];
      expect(sql).toContain("consortium_tier_selected_at = NOW()");
      expect(sql).toContain("consortium_interest = true");
    });

    it("never selects admin notes", async () => {
      mockQuery.mockResolvedValue({ rows: [{}] });

      await setConsortiumTier("uid-1", "pilot");

      const [sql] = mockQuery.mock.calls[0];
      expect(sql).not.toContain("consortium_admin_notes");
    });

    it("never touches identity columns", async () => {
      mockQuery.mockResolvedValue({ rows: [{}] });

      await setConsortiumTier("uid-1", "pilot");

      const [sql] = mockQuery.mock.calls[0];
      for (const column of ["name", "surname", "email", "phone", "company", "linkedin"]) {
        expect(sql).not.toContain(`${column} =`);
      }
    });

    it("returns null when no registrant row matches", async () => {
      mockQuery.mockResolvedValue({ rows: [] });

      const result = await setConsortiumTier("nobody", "pilot");
      expect(result).toBeNull();
    });
  });

  describe("scrubConsortiumText", () => {
    it("nulls exactly the four free-text columns", async () => {
      mockQuery.mockResolvedValue({ rowCount: 1 });

      await scrubConsortiumText("uid-1");

      expect(mockQuery).toHaveBeenCalledTimes(1);
      const [sql, params] = mockQuery.mock.calls[0];
      expect(params).toEqual(["uid-1"]);
      expect(sql).toContain("consortium_product_line = NULL");
      expect(sql).toContain("consortium_customer_request = NULL");
      expect(sql).toContain("consortium_data_needs = NULL");
      expect(sql).toContain("consortium_admin_notes = NULL");
    });

    it("leaves the structured registration columns alone", async () => {
      mockQuery.mockResolvedValue({ rowCount: 0 });

      await scrubConsortiumText("uid-1");

      const [sql] = mockQuery.mock.calls[0];
      for (const column of [
        "consortium_position",
        "consortium_chain_role",
        "consortium_tier",
        "consortium_data_extract",
        "consortium_preferred_start",
        "consortium_status",
      ]) {
        expect(sql).not.toContain(column);
      }
    });
  });

  describe("upsertProfile consortium guard", () => {
    it("issues no consortium column on a login-shaped upsert", async () => {
      mockQuery.mockResolvedValue({ rows: [{}] });

      await upsertProfile("uid-1", {
        name: "John",
        surname: "Doe",
        email: "j@d.com",
      });

      expect(mockQuery).toHaveBeenCalledWith(
        expect.not.stringContaining("consortium"),
        ["uid-1", "John", "Doe", "j@d.com", null, null, null],
      );
    });
  });

  describe("error handling", () => {
    it("createUser logs and rethrows on DB error", async () => {
      const dbError = new Error("connection refused");
      mockQuery.mockRejectedValue(dbError);
      const spy = vi.spyOn(console, "error").mockImplementation(() => {});

      await expect(createUser("uid-1")).rejects.toThrow("connection refused");
      expect(spy).toHaveBeenCalledWith(
        "userRepository.createUser failed:",
        "connection refused",
      );
      spy.mockRestore();
    });

    it("upsertProfile logs and rethrows on DB error", async () => {
      const dbError = new Error("unique violation");
      mockQuery.mockRejectedValue(dbError);
      const spy = vi.spyOn(console, "error").mockImplementation(() => {});

      await expect(
        upsertProfile("uid-1", { name: "A", surname: "B", email: "a@b.com" }),
      ).rejects.toThrow("unique violation");
      expect(spy).toHaveBeenCalledWith(
        "userRepository.upsertProfile failed:",
        "unique violation",
      );
      spy.mockRestore();
    });

    it("getUserById logs and rethrows on DB error", async () => {
      mockQuery.mockRejectedValue(new Error("timeout"));
      const spy = vi.spyOn(console, "error").mockImplementation(() => {});

      await expect(getUserById("uid-1")).rejects.toThrow("timeout");
      expect(spy).toHaveBeenCalledWith(
        "userRepository.getUserById failed:",
        "timeout",
      );
      spy.mockRestore();
    });

    it("updateConsortiumProfile logs and rethrows on DB error", async () => {
      mockQuery.mockRejectedValue(new Error("check violation"));
      const spy = vi.spyOn(console, "error").mockImplementation(() => {});

      await expect(
        updateConsortiumProfile("uid-1", consortiumAnswers),
      ).rejects.toThrow("check violation");
      expect(spy).toHaveBeenCalledWith(
        "userRepository.updateConsortiumProfile failed:",
        "check violation",
      );
      spy.mockRestore();
    });

    it("getConsortiumProfile logs and rethrows on DB error", async () => {
      mockQuery.mockRejectedValue(new Error("timeout"));
      const spy = vi.spyOn(console, "error").mockImplementation(() => {});

      await expect(getConsortiumProfile("uid-1")).rejects.toThrow("timeout");
      expect(spy).toHaveBeenCalledWith(
        "userRepository.getConsortiumProfile failed:",
        "timeout",
      );
      spy.mockRestore();
    });

    it("setConsortiumTier logs and rethrows on DB error", async () => {
      mockQuery.mockRejectedValue(new Error("check violation"));
      const spy = vi.spyOn(console, "error").mockImplementation(() => {});

      await expect(setConsortiumTier("uid-1", "pilot")).rejects.toThrow(
        "check violation",
      );
      expect(spy).toHaveBeenCalledWith(
        "userRepository.setConsortiumTier failed:",
        "check violation",
      );
      spy.mockRestore();
    });

    it("scrubConsortiumText logs and rethrows on DB error", async () => {
      mockQuery.mockRejectedValue(new Error("connection lost"));
      const spy = vi.spyOn(console, "error").mockImplementation(() => {});

      await expect(scrubConsortiumText("uid-1")).rejects.toThrow(
        "connection lost",
      );
      expect(spy).toHaveBeenCalledWith(
        "userRepository.scrubConsortiumText failed:",
        "connection lost",
      );
      spy.mockRestore();
    });

    it("deleteUserData logs and rethrows on DB error", async () => {
      mockQuery.mockRejectedValue(new Error("FK constraint"));
      const spy = vi.spyOn(console, "error").mockImplementation(() => {});

      await expect(deleteUserData("uid-1")).rejects.toThrow("FK constraint");
      expect(spy).toHaveBeenCalledWith(
        "userRepository.deleteUserData failed:",
        "FK constraint",
      );
      spy.mockRestore();
    });
  });
});
