/**
 * Consortium Tier Configuration
 *
 * SERVER-ONLY module: it carries commercial figures and must never be imported
 * by anything under client/. The service projects a caller's permitted subset;
 * the full ladder never leaves this process.
 */

// Mirrors the chk_user_profiles_consortium_tier CHECK in migration 006 exactly —
// the constraint there is the authoritative source, this array only restates it.
export const CONSORTIUM_TIER_IDS = Object.freeze([
  "readiness",
  "pilot",
  "consortium_anchor",
  "consortium_supplier",
  "member",
  "not_sure",
]);

// not_sure carries no figure: it is a "talk to us" answer, not a priced tier.
export const CONSORTIUM_TIER_PRICE_LABELS = Object.freeze({
  readiness: "USD 10,000 to 12,000",
  pilot: "USD 30,000",
  consortium_anchor:
    "USD 45,000 (+ USD 8,000 per additional supplier tenant)",
  consortium_supplier: "USD 8,000",
  member: "on request",
  not_sure: null,
});

// Which tiers a registrant may see and choose, keyed by the position they
// declared at registration. Order is presentation order and is preserved.
export const CONSORTIUM_POSITION_TIERS = Object.freeze({
  anchor: Object.freeze([
    "readiness",
    "consortium_anchor",
    "pilot",
    "not_sure",
  ]),
  supplier: Object.freeze(["readiness", "consortium_supplier", "not_sure"]),
  equipment_supplier: Object.freeze(["member", "not_sure"]),
  institute: Object.freeze(["member", "not_sure"]),
  other: Object.freeze([
    "readiness",
    "pilot",
    "consortium_supplier",
    "not_sure",
  ]),
});

export const CONSORTIUM_RECURRING_FEES = Object.freeze([
  "Dataspace licence, passed through at cost.",
  "Managed operations: USD 6,000 to 7,000 per tenant and year.",
  "Passport data maintenance: USD 5,000 to 8,000 per year.",
]);

export const CONSORTIUM_TERM_NOTE =
  "Consortium participation runs on a three-year term.";

export const CONSORTIUM_CAPACITY_NOTE =
  "One consortium covers an anchor company and up to five suppliers, one project and one test environment.";
