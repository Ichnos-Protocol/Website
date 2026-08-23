/**
 * Zod Schemas for Contact Endpoints
 *
 * Validates contact form submissions and request updates.
 * The consortium enums mirror migration 006 exactly — the CHECK constraints
 * there are the authoritative source, these arrays only restate them.
 */
import { z } from "zod/v4";

export const CONSORTIUM_POSITIONS = Object.freeze([
  "anchor",
  "supplier",
  "equipment_supplier",
  "institute",
  "other",
]);

export const CONSORTIUM_CHAIN_ROLES = Object.freeze([
  "mining_refining",
  "cathode_material",
  "electrode",
  "dry_cell",
  "cell_activation",
  "module_pack",
  "recycling",
  "equipment",
  "institute",
  "other",
]);

export const CONSORTIUM_DATA_EXTRACT = Object.freeze([
  "yes",
  "not_yet",
  "no",
  "not_applicable",
]);

export const CONSORTIUM_PREFERRED_START = Object.freeze(["nov_2026", "later"]);

const questionSchema = z.object({
  text: z
    .string()
    .trim()
    .min(1, "Question cannot be empty")
    .max(2000, "Question cannot exceed 2000 characters"),
});

// A blank textarea reaches the API as "" — optional means absent, so an empty
// or whitespace-only value is normalised to undefined before the remaining
// checks run rather than rejected.
function blankToUndefined(schema) {
  return z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? value : undefined))
    .pipe(schema.optional());
}

const optionalFreeText = blankToUndefined(
  z.string().max(2000, "Field cannot exceed 2000 characters"),
);

const optionalSource = blankToUndefined(
  z
    .string()
    .max(40)
    .regex(/^[a-z0-9_-]{1,40}$/, "Invalid source"),
);

export const consortiumSchema = z.object({
  position: z.enum(CONSORTIUM_POSITIONS),
  chainRole: z.enum(CONSORTIUM_CHAIN_ROLES),
  productLine: z
    .string()
    .trim()
    .min(1, "Product line is required")
    .max(300, "Product line cannot exceed 300 characters"),
  customerRequest: optionalFreeText,
  dataExtract: z.enum(CONSORTIUM_DATA_EXTRACT),
  dataNeeds: optionalFreeText,
  preferredStart: z.enum(CONSORTIUM_PREFERRED_START),
  source: optionalSource,
  consentTimestamp: z.string().datetime({ offset: true }),
  consentVersion: z.string().min(1, "Consent version is required").max(20),
});

function checkConsortiumConsistency(value, ctx) {
  const interested = value.consortiumInterest === true;

  if (!interested && value.questions.length === 0) {
    ctx.addIssue({
      code: "custom",
      path: ["questions"],
      message: "At least one question is required",
    });
  }
  if (interested && !value.consortium) {
    ctx.addIssue({
      code: "custom",
      path: ["consortium"],
      message: "Consortium answers are required",
    });
  }
  if (!interested && value.consortium) {
    ctx.addIssue({
      code: "custom",
      path: ["consortium"],
      message: "Consortium answers require consortium interest",
    });
  }
}

export const contactSubmitSchema = z
  .object({
    questions: z.array(questionSchema),
    consentTimestamp: z.string().datetime({ offset: true }),
    consentVersion: z.string().min(1, "Consent version is required").max(20),
    consortiumInterest: z.boolean().default(false),
    consortium: consortiumSchema.optional(),
  })
  .superRefine(checkConsortiumConsistency);

export const updateRequestSchema = z.object({
  status: z.enum(["new", "contacted", "in_progress", "resolved"]),
  adminNotes: z.string().max(5000).optional(),
});

export const addQuestionSchema = z.object({
  question: z
    .string()
    .trim()
    .min(1, "Question cannot be empty")
    .max(2000, "Question cannot exceed 2000 characters"),
});
