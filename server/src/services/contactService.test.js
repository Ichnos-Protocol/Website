import { describe, it, expect, vi, beforeEach } from "vitest";

const mockCreateContactRequest = vi.fn();
const mockGetRequestsByUserId = vi.fn();
const mockGetRequestById = vi.fn();
const mockCreateQuestion = vi.fn();
const mockGetQuestionsByUserId = vi.fn();
const mockUpdateUserActivity = vi.fn();
const mockGetConsortiumProfile = vi.fn();
const mockUpdateConsortiumProfile = vi.fn();
const mockClientQuery = vi.fn();

const mockClient = { query: (...args) => mockClientQuery(...args) };

vi.mock("../repositories/contactRepository.js", () => ({
  createContactRequest: (...args) => mockCreateContactRequest(...args),
  getRequestsByUserId: (...args) => mockGetRequestsByUserId(...args),
  getRequestById: (...args) => mockGetRequestById(...args),
}));

vi.mock("../repositories/questionRepository.js", () => ({
  createQuestion: (...args) => mockCreateQuestion(...args),
  getQuestionsByUserId: (...args) => mockGetQuestionsByUserId(...args),
}));

vi.mock("../repositories/userRepository.js", () => ({
  updateUserActivity: (...args) => mockUpdateUserActivity(...args),
  getConsortiumProfile: (...args) => mockGetConsortiumProfile(...args),
  updateConsortiumProfile: (...args) => mockUpdateConsortiumProfile(...args),
}));

// Mirrors the real withTransaction against a mock client so BEGIN / COMMIT /
// ROLLBACK are observable without a database.
vi.mock("../config/database.js", () => ({
  default: { query: (...args) => mockClientQuery(...args) },
  withTransaction: async (fn) => {
    await mockClient.query("BEGIN");
    try {
      const result = await fn(mockClient);
      await mockClient.query("COMMIT");
      return result;
    } catch (error) {
      await mockClient.query("ROLLBACK");
      throw error;
    }
  },
}));

const { submitContactRequest, getMyRequests, addQuestion } = await import(
  "./contactService.js"
);

const consortiumAnswers = {
  position: "supplier",
  chainRole: "cathode_material",
  productLine: "NMC cathode powders",
  dataExtract: "not_yet",
  preferredStart: "nov_2026",
  consentTimestamp: "2026-01-01T00:00:00Z",
  consentVersion: "consortium-v1",
};

function clientStatements() {
  return mockClientQuery.mock.calls.map(([sql]) => sql);
}

describe("contactService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetConsortiumProfile.mockResolvedValue(null);
    mockUpdateUserActivity.mockResolvedValue();
  });

  describe("submitContactRequest", () => {
    it("creates request with a single question", async () => {
      mockCreateContactRequest.mockResolvedValue({ id: 1, user_id: "uid-1" });
      mockCreateQuestion.mockResolvedValue({ id: 10, question: "Q1" });
      mockUpdateUserActivity.mockResolvedValue();

      const result = await submitContactRequest("uid-1", {
        consentTimestamp: "2026-01-01T00:00:00Z",
        consentVersion: "v1",
        questions: [{ text: "Q1" }],
      });

      expect(result.id).toBe(1);
      expect(result.questions).toHaveLength(1);
      expect(result.questions[0].question).toBe("Q1");
      expect(mockCreateQuestion).toHaveBeenCalledWith(
        "uid-1",
        {
          question: "Q1",
          answer: null,
          source: "form",
          contactRequestId: 1,
        },
        mockClient,
      );
      expect(mockUpdateUserActivity).toHaveBeenCalledWith("uid-1");
    });

    it("creates request with multiple questions", async () => {
      mockCreateContactRequest.mockResolvedValue({ id: 2, user_id: "uid-1" });
      mockCreateQuestion
        .mockResolvedValueOnce({ id: 20, question: "Q1" })
        .mockResolvedValueOnce({ id: 21, question: "Q2" });
      mockUpdateUserActivity.mockResolvedValue();

      const result = await submitContactRequest("uid-1", {
        consentTimestamp: "2026-01-01T00:00:00Z",
        consentVersion: "v1",
        questions: [{ text: "Q1" }, { text: "Q2" }],
      });

      expect(result.questions).toHaveLength(2);
      expect(mockCreateQuestion).toHaveBeenCalledTimes(2);
    });

    it("does not touch the consortium profile on a plain inquiry", async () => {
      mockCreateContactRequest.mockResolvedValue({ id: 3, user_id: "uid-1" });
      mockCreateQuestion.mockResolvedValue({ id: 30, question: "Q1" });

      const result = await submitContactRequest("uid-1", {
        consentTimestamp: "2026-01-01T00:00:00Z",
        consentVersion: "v1",
        questions: [{ text: "Q1" }],
      });

      expect(mockUpdateConsortiumProfile).not.toHaveBeenCalled();
      expect(result).toEqual({
        id: 3,
        user_id: "uid-1",
        questions: [{ id: 30, question: "Q1" }],
      });
      expect(mockCreateContactRequest).toHaveBeenCalledWith(
        "uid-1",
        expect.objectContaining({ kind: "inquiry" }),
        mockClient,
      );
    });
  });

  describe("submitContactRequest — consortium", () => {
    const registration = {
      consentTimestamp: "2026-01-01T00:00:00Z",
      consentVersion: "v1",
      questions: [],
      consortiumInterest: true,
      consortium: consortiumAnswers,
    };

    it("creates a consortium row and returns the profile", async () => {
      const profile = { consortium_interest: true, consortium_status: "registered" };
      mockUpdateConsortiumProfile.mockResolvedValue(profile);
      mockCreateContactRequest.mockResolvedValue({
        id: 7,
        user_id: "uid-1",
        kind: "consortium",
      });

      const result = await submitContactRequest("uid-1", registration);

      expect(mockCreateContactRequest).toHaveBeenCalledWith(
        "uid-1",
        expect.objectContaining({ kind: "consortium" }),
        mockClient,
      );
      expect(result.id).toBe(7);
      expect(result.consortium).toEqual(profile);
      expect(result.questions).toEqual([]);
      expect(mockCreateQuestion).not.toHaveBeenCalled();
    });

    it("treats a swallowed insert as an edit of the existing registration", async () => {
      const profile = { consortium_interest: true, consortium_position: "anchor" };
      mockGetConsortiumProfile.mockResolvedValue({ consortium_interest: true });
      mockUpdateConsortiumProfile.mockResolvedValue(profile);
      mockCreateContactRequest.mockResolvedValue(null);

      const result = await submitContactRequest("uid-1", registration);

      expect(result).toEqual({ id: null, questions: [], consortium: profile });
      expect(mockUpdateConsortiumProfile).toHaveBeenCalledTimes(1);
    });

    it("files an edit carrying a question as an inquiry", async () => {
      const profile = { consortium_interest: true };
      mockGetConsortiumProfile.mockResolvedValue(profile);
      mockUpdateConsortiumProfile.mockResolvedValue(profile);
      mockCreateContactRequest.mockResolvedValue({ id: 8, user_id: "uid-1" });
      mockCreateQuestion.mockResolvedValue({ id: 80, question: "Q1" });

      const result = await submitContactRequest("uid-1", {
        ...registration,
        questions: [{ text: "Q1" }],
      });

      expect(mockCreateContactRequest).toHaveBeenCalledTimes(1);
      expect(mockCreateContactRequest).toHaveBeenCalledWith(
        "uid-1",
        expect.objectContaining({ kind: "inquiry" }),
        mockClient,
      );
      expect(mockCreateQuestion).toHaveBeenCalledWith(
        "uid-1",
        expect.objectContaining({ contactRequestId: 8 }),
        mockClient,
      );
      expect(result.consortium).toEqual(profile);
    });

    it("writes the profile before the request and the request before questions", async () => {
      mockUpdateConsortiumProfile.mockResolvedValue({ consortium_interest: true });
      mockCreateContactRequest.mockResolvedValue({ id: 9, user_id: "uid-1" });
      mockCreateQuestion.mockResolvedValue({ id: 90 });

      await submitContactRequest("uid-1", {
        ...registration,
        questions: [{ text: "Q1" }],
      });

      const profileOrder = mockUpdateConsortiumProfile.mock.invocationCallOrder[0];
      const requestOrder = mockCreateContactRequest.mock.invocationCallOrder[0];
      const questionOrder = mockCreateQuestion.mock.invocationCallOrder[0];
      expect(profileOrder).toBeLessThan(requestOrder);
      expect(requestOrder).toBeLessThan(questionOrder);
    });

    it("rolls back and skips the activity bump when a question write fails", async () => {
      mockUpdateConsortiumProfile.mockResolvedValue({ consortium_interest: true });
      mockCreateContactRequest.mockResolvedValue({ id: 10, user_id: "uid-1" });
      mockCreateQuestion.mockRejectedValue(new Error("insert failed"));

      await expect(
        submitContactRequest("uid-1", {
          ...registration,
          questions: [{ text: "Q1" }],
        }),
      ).rejects.toThrow("insert failed");

      expect(clientStatements()).toContain("ROLLBACK");
      expect(clientStatements()).not.toContain("COMMIT");
      expect(mockUpdateUserActivity).not.toHaveBeenCalled();
    });
  });

  describe("getMyRequests", () => {
    it("returns requests with linked questions", async () => {
      mockGetRequestsByUserId.mockResolvedValue([
        { id: 1, user_id: "uid-1" },
        { id: 2, user_id: "uid-1" },
      ]);
      mockGetQuestionsByUserId.mockResolvedValue([
        { id: 10, contact_request_id: 1 },
        { id: 11, contact_request_id: 1 },
        { id: 12, contact_request_id: 2 },
      ]);

      const result = await getMyRequests("uid-1");

      expect(result).toHaveLength(2);
      expect(result[0].questions).toHaveLength(2);
      expect(result[1].questions).toHaveLength(1);
    });

    it("returns empty array when no requests", async () => {
      mockGetRequestsByUserId.mockResolvedValue([]);
      mockGetQuestionsByUserId.mockResolvedValue([]);

      const result = await getMyRequests("uid-1");

      expect(result).toEqual([]);
    });
  });

  describe("addQuestion", () => {
    it("creates a question for an owned request", async () => {
      mockGetRequestById.mockResolvedValue({
        id: 1,
        user_id: "uid-1",
        kind: "inquiry",
      });
      mockCreateQuestion.mockResolvedValue({ id: 30, question: "Follow-up" });
      mockUpdateUserActivity.mockResolvedValue();

      const result = await addQuestion("uid-1", 1, "Follow-up");

      expect(result.id).toBe(30);
      expect(mockCreateQuestion).toHaveBeenCalledWith("uid-1", {
        question: "Follow-up",
        answer: null,
        source: "form",
        contactRequestId: 1,
      });
      expect(mockUpdateUserActivity).toHaveBeenCalledWith("uid-1");
    });

    it("throws 404 when request not found", async () => {
      mockGetRequestById.mockResolvedValue(null);

      const error = await addQuestion("uid-1", 999, "Q").catch((e) => e);

      expect(error.message).toBe("Contact request not found");
      expect(error.statusCode).toBe(404);
    });

    it("throws 403 when request belongs to another user", async () => {
      mockGetRequestById.mockResolvedValue({ id: 1, user_id: "uid-other" });

      const error = await addQuestion("uid-1", 1, "Q").catch((e) => e);

      expect(error.message).toBe("Not authorized to add to this request");
      expect(error.statusCode).toBe(403);
    });

    it("refuses a consortium row with 409", async () => {
      mockGetRequestById.mockResolvedValue({
        id: 5,
        user_id: "uid-1",
        kind: "consortium",
      });

      const error = await addQuestion("uid-1", 5, "Q").catch((e) => e);

      expect(error.statusCode).toBe(409);
      expect(error.message).toBe("Ask your question as a new inquiry");
      expect(mockCreateQuestion).not.toHaveBeenCalled();
      expect(mockUpdateUserActivity).not.toHaveBeenCalled();
    });
  });
});
