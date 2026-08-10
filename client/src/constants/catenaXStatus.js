// Single source of truth for whether the Catena-X qualification has
// been formally granted. Now `true`: Catena-X has confirmed the
// Qualified Advisor listing, so `getCatenaXFullTitle()` collapses to
// the base title and `CatenaXQualifierSpan` renders nothing everywhere
// the credential appears — no other code change is needed. Flip back to
// `false` if the qualification ever lapses and the pending suffix must
// return across the site.
export const CATENA_X_QUALIFICATION_GRANTED = true;

// Visual class used to gray the qualifier text while the toggle is off.
export const CATENA_X_QUALIFIER_CLASS = "catenax-qualifier-pending";

// Base credential title, shared by every surface that needs the full
// string (SEO meta, og:title, schema.org descriptions).
export const CATENA_X_TITLE_BASE = "Catena-X Qualified Advisor";

// Companion status notes for surfaces that distinguish the granted
// Qualified Advisor credential from the association membership and the
// expert-group participation. Both statuses are held as of Aug 2026;
// these are consumed by `credentials.js` and `structuredData.js`.
export const CATENA_X_MEMBERSHIP_NOTE =
  "Ordinary member — Catena-X Automotive Network e.V.";
export const CATENA_X_EXPERT_GROUP_NOTE =
  "member of the Catena-X Digital Product Passport Expert Group";

// One-line status summary for the hero eyebrow (wired in T4 via
// `landingContent.js`). Deliberately a plain constant, NOT derived from
// `CATENA_X_TITLE_BASE` (deriving would require string surgery), and it
// deliberately elides the second "Catena-X". Keep it in lockstep with
// `CATENA_X_TITLE_BASE` — if the base title changes, update this too.
export const CATENA_X_STATUS_LINE = "Catena-X member & Qualified Advisor";

// Site-wide trademark and participation disclaimer. This is a tier-3
// exact-match string (§7.3 item 13) and the target of the §7.2 REQUIRED
// raw-source scan, so it stays a single string literal — do not "tidy"
// it into concatenated fragments; the final sentence is the load-bearing
// disclaimer and may not be shortened.
export const TRADEMARK_NOTICE =
  "Catena-X® is a registered trademark of Catena-X Automotive Network e.V. Ichnos Protocol Pte. Ltd. is an ordinary member of the association and a Catena-X Qualified Advisor. References to Catena-X standards and committees describe factual participation and do not imply certification of Ichnos products or endorsement by the association or its bodies.";

// Official Qualified Advisor label asset. Lifecycle/legal: use only
// while the qualification holds — set to `null` (and drop the file) if
// it lapses; renew by 2027-07-06. The negative/dark variant lights up
// once that asset file lands.
export const CATENA_X_LABEL_ASSET =
  "/brand/CX_Logo_Qualified-Advisor_CLR_RGB_pos_16x9@300.png";
export const CATENA_X_LABEL_ASSET_NEG = null;

// Dormant landing zone for the ordinary-member label file (not status
// strings): while `null` they are exempt from conformance item 8 (§7.1).
// The member label right runs with ordinary membership (ongoing,
// terminable on 3 months' notice to fiscal-year end) — an independent
// lifecycle from the Advisor label's 2027-07-06 renewal, so per §3.1 the
// two must never share a constant. Governed by Logo Use Agreement §6.1
// (revocation with immediate effect, no notice). Setting either back to
// `null` removes the image everywhere and falls back to text, with no
// other code change.
export const CATENA_X_MEMBER_LABEL_ASSET = null;
export const CATENA_X_MEMBER_LABEL_ASSET_NEG = null;

// Pure computation of the qualifier suffix from an explicit granted
// flag. This literal is the only place the pending qualifier text lives
// in the codebase — every other surface derives its text from here.
export function computeCatenaXQualifierText(granted) {
  return granted ? "" : " (qualification in progress)";
}

// Pure computation of the full title from an explicit granted flag.
export function computeCatenaXFullTitle(granted) {
  return CATENA_X_TITLE_BASE + computeCatenaXQualifierText(granted);
}

// Plain-text suffix, useful for SEO meta strings and alt text that
// cannot carry an HTML span (search engines render the literal text).
export function getCatenaXQualifierText() {
  return computeCatenaXQualifierText(CATENA_X_QUALIFICATION_GRANTED);
}

// Convenience: the full title with the optional qualifier as plain
// text. Use in places where one string is required (SEO meta, og:title,
// schema.org descriptions).
export function getCatenaXFullTitle() {
  return computeCatenaXFullTitle(CATENA_X_QUALIFICATION_GRANTED);
}
