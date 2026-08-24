import { describe, it, expect } from "vitest";
import {
  contactSubmitSchema,
  updateRequestSchema,
  addQuestionSchema,
  CONSORTIUM_POSITIONS,
  CONSORTIUM_CHAIN_ROLES,
  CONSORTIUM_DATA_EXTRACT,
  CONSORTIUM_PREFERRED_START,
} from "./contactSchemas.js";

describe("contactSubmitSchema", () => {
  const validPayload = {
    questions: [{ text: "Tell me about your services" }],
    consentTimestamp: "2026-02-16T12:00:00Z",
    consentVersion: "v1",
  };

  it("accepts a valid submission", () => {
    const result = contactSubmitSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it("accepts multiple questions", () => {
    const result = contactSubmitSchema.safeParse({
      ...validPayload,
      questions: [{ text: "Question 1" }, { text: "Question 2" }],
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty questions array", () => {
    const result = contactSubmitSchema.safeParse({ ...validPayload, questions: [] });
    expect(result.success).toBe(false);
  });

  it("rejects question with empty text", () => {
    const result = contactSubmitSchema.safeParse({
      ...validPayload,
      questions: [{ text: "" }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects question exceeding 2000 characters", () => {
    const result = contactSubmitSchema.safeParse({
      ...validPayload,
      questions: [{ text: "a".repeat(2001) }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing consentTimestamp", () => {
    const { consentTimestamp: _, ...rest } = validPayload;
    const result = contactSubmitSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("rejects invalid consentTimestamp format", () => {
    const result = contactSubmitSchema.safeParse({
      ...validPayload,
      consentTimestamp: "not-a-date",
    });
    expect(result.success).toBe(false);
  });

  it("accepts consentTimestamp with timezone offset", () => {
    const result = contactSubmitSchema.safeParse({
      ...validPayload,
      consentTimestamp: "2026-02-16T12:00:00+02:00",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing consentVersion", () => {
    const { consentVersion: _v, ...rest } = validPayload;
    const result = contactSubmitSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("defaults consortiumInterest to false when the key is absent", () => {
    const result = contactSubmitSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
    expect(result.data.consortiumInterest).toBe(false);
  });
});

describe("contactSubmitSchema — consortium", () => {
  const validConsortium = {
    position: "supplier",
    chainRole: "cathode_material",
    productLine: "NMC cathode powders",
    customerRequest: "Automotive OEM asked for a passport-ready datasheet",
    dataExtract: "not_yet",
    dataNeeds: "Cell-level carbon footprint",
    preferredStart: "nov_2026",
    source: "landing_page-1",
    consentTimestamp: "2026-02-16T12:00:00Z",
    consentVersion: "v1",
  };

  const validPayload = {
    questions: [],
    consentTimestamp: "2026-02-16T12:00:00Z",
    consentVersion: "v1",
    consortiumInterest: true,
    consortium: validConsortium,
  };

  function parseWith(overrides) {
    return contactSubmitSchema.safeParse({
      ...validPayload,
      consortium: { ...validConsortium, ...overrides },
    });
  }

  it("accepts a registration with no questions", () => {
    const result = contactSubmitSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it("accepts a registration alongside a question", () => {
    const result = contactSubmitSchema.safeParse({
      ...validPayload,
      questions: [{ text: "When does the pilot start?" }],
    });
    expect(result.success).toBe(true);
  });

  it("accepts a registration without the optional fields", () => {
    const { customerRequest: _c, dataNeeds: _d, source: _s, ...rest } =
      validConsortium;
    const result = contactSubmitSchema.safeParse({
      ...validPayload,
      consortium: rest,
    });
    expect(result.success).toBe(true);
  });

  it("accepts blank optional free text as absent", () => {
    const result = parseWith({ customerRequest: "", dataNeeds: "" });

    expect(result.success).toBe(true);
    expect(result.data.consortium.customerRequest).toBeUndefined();
    expect(result.data.consortium.dataNeeds).toBeUndefined();
  });

  it("accepts whitespace-only optional free text as absent", () => {
    const result = parseWith({ customerRequest: "   ", dataNeeds: "\n\t " });

    expect(result.success).toBe(true);
    expect(result.data.consortium.customerRequest).toBeUndefined();
    expect(result.data.consortium.dataNeeds).toBeUndefined();
  });

  it("trims surrounding whitespace from optional free text", () => {
    const result = parseWith({ customerRequest: "  An OEM asked  " });

    expect(result.success).toBe(true);
    expect(result.data.consortium.customerRequest).toBe("An OEM asked");
  });

  it("accepts a blank source as absent", () => {
    const result = parseWith({ source: "" });

    expect(result.success).toBe(true);
    expect(result.data.consortium.source).toBeUndefined();
  });

  it("rejects consortium interest without a consortium object", () => {
    const { consortium: _c, ...rest } = validPayload;
    const result = contactSubmitSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("rejects a consortium object without consortium interest", () => {
    const result = contactSubmitSchema.safeParse({
      ...validPayload,
      questions: [{ text: "A question" }],
      consortiumInterest: false,
    });
    expect(result.success).toBe(false);
  });

  it("rejects a missing position", () => {
    const { position: _p, ...rest } = validConsortium;
    const result = contactSubmitSchema.safeParse({
      ...validPayload,
      consortium: rest,
    });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid position", () => {
    expect(parseWith({ position: "ceo" }).success).toBe(false);
  });

  it("rejects an invalid chainRole", () => {
    expect(parseWith({ chainRole: "logistics" }).success).toBe(false);
  });

  it("rejects an invalid dataExtract", () => {
    expect(parseWith({ dataExtract: "maybe" }).success).toBe(false);
  });

  it("rejects an invalid preferredStart", () => {
    expect(parseWith({ preferredStart: "2026" }).success).toBe(false);
  });

  it("accepts every valid enum value", () => {
    for (const position of CONSORTIUM_POSITIONS) {
      expect(parseWith({ position }).success).toBe(true);
    }
    for (const chainRole of CONSORTIUM_CHAIN_ROLES) {
      expect(parseWith({ chainRole }).success).toBe(true);
    }
    for (const dataExtract of CONSORTIUM_DATA_EXTRACT) {
      expect(parseWith({ dataExtract }).success).toBe(true);
    }
    for (const preferredStart of CONSORTIUM_PREFERRED_START) {
      expect(parseWith({ preferredStart }).success).toBe(true);
    }
  });

  it("rejects an empty productLine", () => {
    expect(parseWith({ productLine: "" }).success).toBe(false);
  });

  it("rejects a whitespace-only productLine", () => {
    expect(parseWith({ productLine: "   " }).success).toBe(false);
  });

  it("accepts a productLine at the 300 character limit", () => {
    expect(parseWith({ productLine: "a".repeat(300) }).success).toBe(true);
  });

  it("rejects a productLine of 301 characters", () => {
    expect(parseWith({ productLine: "a".repeat(301) }).success).toBe(false);
  });

  it("rejects a customerRequest of 2001 characters", () => {
    expect(parseWith({ customerRequest: "a".repeat(2001) }).success).toBe(false);
  });

  it("rejects a dataNeeds of 2001 characters", () => {
    expect(parseWith({ dataNeeds: "a".repeat(2001) }).success).toBe(false);
  });

  it("rejects a source with spaces and uppercase", () => {
    expect(parseWith({ source: "BAD SOURCE" }).success).toBe(false);
  });

  it("rejects a source of 41 characters", () => {
    expect(parseWith({ source: "a".repeat(41) }).success).toBe(false);
  });

  it("rejects a consentVersion over 20 characters", () => {
    expect(parseWith({ consentVersion: "v".repeat(21) }).success).toBe(false);
  });

  it("rejects a malformed consortium consentTimestamp", () => {
    expect(parseWith({ consentTimestamp: "16-02-2026" }).success).toBe(false);
  });
});

describe("updateRequestSchema", () => {
  it("accepts valid status update", () => {
    const result = updateRequestSchema.safeParse({ status: "in_progress" });
    expect(result.success).toBe(true);
  });

  it("accepts all valid status values", () => {
    for (const status of ["new", "contacted", "in_progress", "resolved"]) {
      const result = updateRequestSchema.safeParse({ status });
      expect(result.success).toBe(true);
    }
  });

  it("rejects invalid status value", () => {
    const result = updateRequestSchema.safeParse({ status: "invalid" });
    expect(result.success).toBe(false);
  });

  it("accepts status with optional adminNotes", () => {
    const result = updateRequestSchema.safeParse({
      status: "resolved",
      adminNotes: "Called and resolved the issue",
    });
    expect(result.success).toBe(true);
  });

  it("rejects adminNotes exceeding 5000 characters", () => {
    const result = updateRequestSchema.safeParse({
      status: "new",
      adminNotes: "a".repeat(5001),
    });
    expect(result.success).toBe(false);
  });
});

describe("addQuestionSchema", () => {
  it("accepts a valid question string", () => {
    const result = addQuestionSchema.safeParse({ question: "What is your pricing?" });
    expect(result.success).toBe(true);
  });

  it("rejects an empty question string", () => {
    const result = addQuestionSchema.safeParse({ question: "" });
    expect(result.success).toBe(false);
  });

  it("rejects a whitespace-only question string", () => {
    const result = addQuestionSchema.safeParse({ question: "   " });
    expect(result.success).toBe(false);
  });

  it("rejects a missing question field", () => {
    const result = addQuestionSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects a non-string question value", () => {
    const result = addQuestionSchema.safeParse({ question: 42 });
    expect(result.success).toBe(false);
  });

  it("rejects a question exceeding 2000 characters", () => {
    const result = addQuestionSchema.safeParse({ question: "a".repeat(2001) });
    expect(result.success).toBe(false);
  });

  it("accepts a question at the 2000 character limit", () => {
    const result = addQuestionSchema.safeParse({ question: "a".repeat(2000) });
    expect(result.success).toBe(true);
  });
});
