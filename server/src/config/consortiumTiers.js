/**
 * Consortium Tier Configuration
 *
 * SERVER-ONLY module: it carries commercial figures and must never be imported
 * by anything under client/. The service projects a caller's permitted subset;
 * the full ladder never leaves this process.
 *
 * Provenance of the figures below. The source figures are in USD:
 *  - pilot: 30,000
 *  - consortium anchor: 45,000, plus 8,000 per additional supplier tenant
 *  - consortium supplier tenant: 8,000
 *  - managed operations: 6,000 to 7,000 per tenant and year
 *  - passport data maintenance: 5,000 to 8,000 per year
 *  - readiness: the retired label "USD 10,000 to 12,000" is gone; the tier is
 *    now priced by reference to the readiness assessment page.
 * Rates: USD 1 = SGD 1.275 and USD 1 = EUR 0.874, mid-market, 22 September 2026.
 * Rounding: nearest thousand, nearest five hundred inside a range, then fixed.
 * Nothing converts at runtime; the EUR and SGD figures here are the prices.
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

// readiness and not_sure are deliberately absent. readiness is priced on the
// readiness assessment page and the client links there; not_sure is a "talk
// to us" answer, not a priced tier. The formatter returns null for both.
export const CONSORTIUM_TIER_PRICES = Object.freeze({
  pilot: Object.freeze({ EUR: 26000, SGD: 38000 }),
  consortium_anchor: Object.freeze({
    EUR: 39000,
    SGD: 57000,
    extraTenant: Object.freeze({ EUR: 7000, SGD: 10000 }),
  }),
  consortium_supplier: Object.freeze({ EUR: 7000, SGD: 10000 }),
  member: "on request",
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

// Each range is [low, high] per currency.
export const CONSORTIUM_RECURRING_FEE_RANGES = Object.freeze({
  managedOperations: Object.freeze({
    EUR: Object.freeze([5000, 6000]),
    SGD: Object.freeze([7500, 9000]),
  }),
  passportMaintenance: Object.freeze({
    EUR: Object.freeze([4500, 7000]),
    SGD: Object.freeze([6500, 10000]),
  }),
});

// Keys restate the chk_user_profiles_consortium_region CHECK of migration 008;
// the constraint there is the authoritative source.
export const CONSORTIUM_REGION_CURRENCY = Object.freeze({
  eu: "EUR",
  asean: "SGD",
  other: "SGD",
});

// The company is Singapore-based, and rows that predate the region question
// carry a NULL region.
export const CONSORTIUM_DEFAULT_CURRENCY = "SGD";

export const CONSORTIUM_TERM_NOTE =
  "Consortium participation runs on a three-year term.";

export const CONSORTIUM_CAPACITY_NOTE =
  "One consortium covers an anchor company and up to five suppliers, one project and one test environment.";
