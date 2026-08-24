import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGetUserById = vi.fn();
const mockDeleteUserData = vi.fn();
const mockGetQuestionsByUserId = vi.fn();
const mockGetTopicsByQuestionId = vi.fn();
const mockScrubQuestionTexts = vi.fn();
const mockGetRequestsByUserId = vi.fn();
const mockDeleteUser = vi.fn();
const mockGetConsortiumProfile = vi.fn();
const mockScrubConsortiumText = vi.fn();

vi.mock("../repositories/userRepository.js", () => ({
  getUserById: (...args) => mockGetUserById(...args),
  deleteUserData: (...args) => mockDeleteUserData(...args),
  getConsortiumProfile: (...args) => mockGetConsortiumProfile(...args),
  scrubConsortiumText: (...args) => mockScrubConsortiumText(...args),
}));

vi.mock("../repositories/questionRepository.js", () => ({
  getQuestionsByUserId: (...args) => mockGetQuestionsByUserId(...args),
  getTopicsByQuestionId: (...args) =>
    mockGetTopicsByQuestionId(...args),
  scrubQuestionTexts: (...args) => mockScrubQuestionTexts(...args),
}));

vi.mock("../repositories/contactRepository.js", () => ({
  getRequestsByUserId: (...args) => mockGetRequestsByUserId(...args),
}));

vi.mock("../config/firebase.js", () => ({
  default: {
    auth: () => ({
      deleteUser: (...args) => mockDeleteUser(...args),
    }),
  },
}));

const { scrubPII, exportUserData, deleteUserAccount } = await import(
  "./gdprService.js"
);

describe("gdprService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetConsortiumProfile.mockResolvedValue(null);
    mockScrubConsortiumText.mockResolvedValue();
  });

  describe("scrubPII", () => {
    it("replaces email addresses with [REDACTED]", () => {
      const result = scrubPII("Contact me at john@example.com");
      expect(result).toBe("Contact me at [REDACTED]");
    });

    it("replaces phone numbers with [REDACTED]", () => {
      const result = scrubPII("Call me at +1 555-123-4567");
      expect(result).toBe("Call me at [REDACTED]");
    });

    it("replaces URLs with [REDACTED]", () => {
      const result = scrubPII("Visit https://example.com/page");
      expect(result).toBe("Visit [REDACTED]");
    });

    it("returns text unchanged when no PII is present", () => {
      const text = "This is a plain message";
      expect(scrubPII(text)).toBe(text);
    });

    it("returns null as-is", () => {
      expect(scrubPII(null)).toBeNull();
    });

    it("returns undefined as-is", () => {
      expect(scrubPII(undefined)).toBeUndefined();
    });

    it("replaces exactly 7-digit phone numbers", () => {
      const result = scrubPII("Call 5551234");
      expect(result).toBe("Call [REDACTED]");
    });

    it("replaces 7-digit numbers with separators", () => {
      const result = scrubPII("Call 555-1234");
      expect(result).toBe("Call [REDACTED]");
    });

    it("replaces spaced 7-digit numbers", () => {
      const result = scrubPII("Call 555 12 34");
      expect(result).toBe("Call [REDACTED]");
    });

    it("replaces phone in mixed-content string", () => {
      const result = scrubPII("Contact 555-1234 for info");
      expect(result).not.toContain("555-1234");
    });

    it("replaces multiple PII types in one string", () => {
      const text =
        "Email john@test.com, call +39 06 1234 5678, see http://x.com";
      const result = scrubPII(text);
      expect(result).not.toContain("john@test.com");
      expect(result).not.toContain("+39");
      expect(result).not.toContain("http://x.com");
      expect(result.match(/\[REDACTED]/g).length).toBe(3);
    });
  });

  describe("exportUserData", () => {
    it("returns JSON with user, profile, contactRequests, questions, topics", async () => {
      mockGetUserById.mockResolvedValue({
        firebase_uid: "uid-1",
        created_at: "2026-01-01",
        name: "John",
        surname: "Doe",
        email: "john@example.com",
        phone: null,
        company: null,
        linkedin: null,
      });
      mockGetRequestsByUserId.mockResolvedValue([{ id: 1 }]);
      mockGetQuestionsByUserId.mockResolvedValue([
        { id: 10, question: "Q1" },
      ]);
      mockGetTopicsByQuestionId.mockResolvedValue([
        { id: 100, topic: "battery" },
      ]);

      const result = await exportUserData("uid-1");
      const parsed = JSON.parse(result);

      expect(parsed).toHaveProperty("user");
      expect(parsed).toHaveProperty("profile");
      expect(parsed).toHaveProperty("contactRequests");
      expect(parsed).toHaveProperty("questions");
      expect(parsed).toHaveProperty("topics");
      expect(mockGetUserById).toHaveBeenCalledWith("uid-1");
    });

    it("flattens topics from multiple questions", async () => {
      mockGetUserById.mockResolvedValue({ firebase_uid: "uid-1" });
      mockGetRequestsByUserId.mockResolvedValue([]);
      mockGetQuestionsByUserId.mockResolvedValue([
        { id: 1 },
        { id: 2 },
      ]);
      mockGetTopicsByQuestionId
        .mockResolvedValueOnce([{ id: 10, topic: "a" }])
        .mockResolvedValueOnce([
          { id: 20, topic: "b" },
          { id: 21, topic: "c" },
        ]);

      const result = await exportUserData("uid-1");
      const parsed = JSON.parse(result);

      expect(parsed.topics).toHaveLength(3);
      expect(mockGetTopicsByQuestionId).toHaveBeenCalledTimes(2);
    });

    it("includes the consortium registration in the payload", async () => {
      const consortium = {
        consortium_interest: true,
        consortium_position: "supplier",
        consortium_chain_role: "cathode_material",
        consortium_source: "landing_page",
        consortium_tier: "pilot",
        consortium_tier_selected_at: "2026-03-01",
        consortium_status: "registered",
        consortium_registered_at: "2026-02-16",
        consortium_consent_timestamp: "2026-02-16T12:00:00Z",
        consortium_consent_version: "v1",
      };
      mockGetUserById.mockResolvedValue({ firebase_uid: "uid-1" });
      mockGetRequestsByUserId.mockResolvedValue([]);
      mockGetQuestionsByUserId.mockResolvedValue([]);
      mockGetConsortiumProfile.mockResolvedValue(consortium);

      const parsed = JSON.parse(await exportUserData("uid-1"));

      expect(parsed.consortium).toEqual(consortium);
      expect(mockGetConsortiumProfile).toHaveBeenCalledWith("uid-1");
    });

    it("exports null consortium when the user never registered", async () => {
      mockGetUserById.mockResolvedValue({ firebase_uid: "uid-1" });
      mockGetRequestsByUserId.mockResolvedValue([]);
      mockGetQuestionsByUserId.mockResolvedValue([]);

      const parsed = JSON.parse(await exportUserData("uid-1"));

      expect(parsed.consortium).toBeNull();
    });
  });

  describe("deleteUserAccount", () => {
    it("scrubs questions, deletes user data, and deletes firebase user", async () => {
      mockGetQuestionsByUserId.mockResolvedValue([
        { id: 1, question: "test@email.com", answer: "reply" },
        { id: 2, question: "plain", answer: null },
      ]);
      mockScrubQuestionTexts.mockResolvedValue({});
      mockDeleteUserData.mockResolvedValue();
      mockDeleteUser.mockResolvedValue();

      const result = await deleteUserAccount("uid-1");

      expect(result).toEqual({ success: true });
      expect(mockScrubQuestionTexts).toHaveBeenCalledTimes(2);
      expect(mockScrubQuestionTexts).toHaveBeenCalledWith(
        1,
        "[REDACTED]",
        "reply",
      );
      expect(mockDeleteUserData).toHaveBeenCalledWith("uid-1");
      expect(mockDeleteUser).toHaveBeenCalledWith("uid-1");
    });

    it("deletes firebase user even with zero questions", async () => {
      mockGetQuestionsByUserId.mockResolvedValue([]);
      mockDeleteUserData.mockResolvedValue();
      mockDeleteUser.mockResolvedValue();

      await deleteUserAccount("uid-1");

      expect(mockScrubQuestionTexts).not.toHaveBeenCalled();
      expect(mockDeleteUserData).toHaveBeenCalledWith("uid-1");
      expect(mockDeleteUser).toHaveBeenCalledWith("uid-1");
    });

    it("scrubs consortium free text before the soft delete", async () => {
      mockGetQuestionsByUserId.mockResolvedValue([]);
      mockDeleteUserData.mockResolvedValue();
      mockDeleteUser.mockResolvedValue();

      await deleteUserAccount("uid-1");

      expect(mockScrubConsortiumText).toHaveBeenCalledWith("uid-1");
      expect(
        mockScrubConsortiumText.mock.invocationCallOrder[0],
      ).toBeLessThan(mockDeleteUserData.mock.invocationCallOrder[0]);
    });

    it("completes for a user who never registered for the consortium", async () => {
      mockGetQuestionsByUserId.mockResolvedValue([]);
      mockDeleteUserData.mockResolvedValue();
      mockDeleteUser.mockResolvedValue();

      const result = await deleteUserAccount("uid-1");

      expect(result).toEqual({ success: true });
      expect(mockDeleteUser).toHaveBeenCalledWith("uid-1");
    });
  });
});
