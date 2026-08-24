/**
 * Zod Schemas for Admin Endpoints
 *
 * Validates admin request updates.
 * Also validates the consortium registrant update and CSV export endpoints.
 */
import { z } from "zod/v4";

export const adminManageAdminsSchema = z.object({
  action: z.enum(["add", "remove"]),
  email: z.string().email().max(255),
});

export const adminUpdateRequestSchema = z
  .object({
    status: z.enum(["new", "contacted", "in_progress", "resolved"]).optional(),
    adminNotes: z.string().max(5000).optional(),
  })
  .refine(
    (data) => data.status !== undefined || data.adminNotes !== undefined,
    { message: "At least one field must be provided" },
  );

// `consortium_status` (migration 006) is a separate vocabulary from
// `contact_requests.status`, which `adminUpdateRequestSchema` above keeps.
export const adminUpdateConsortiumSchema = z
  .object({
    status: z
      .enum([
        "registered",
        "contacted",
        "readiness",
        "in_consortium",
        "declined",
      ])
      .optional(),
    adminNotes: z.string().max(5000).optional(),
  })
  .refine(
    (data) => data.status !== undefined || data.adminNotes !== undefined,
    { message: "At least one field must be provided" },
  );

// Meant to be `safeParse`d against `req.query` by the controller —
// `validateRequest` only covers `req.body`. The filter fields are deliberately
// permissive plain strings so an unexpected value yields an empty result set
// rather than a 500.
export const adminConsortiumExportSchema = z
  .object({
    format: z.enum(["google-contacts", "google-groups"]),
    group: z.string().email().max(255).optional(),
    tier: z.string().max(40).optional(),
    source: z.string().max(40).optional(),
    status: z.string().max(40).optional(),
  })
  .refine((data) => data.format !== "google-groups" || Boolean(data.group), {
    message: "A group address is required for the google-groups format",
  });
