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
// Qualified Advisor credential from the still-in-flight membership and
// committee items (consumed by later tickets).
export const CATENA_X_MEMBERSHIP_NOTE =
  "Catena-X membership: application in progress";
export const CATENA_X_COMMITTEE_NOTE =
  "approved for the Catena-X expert committee on Battery Passport";

// Official Qualified Advisor label asset. Lifecycle/legal: use only
// while the qualification holds — set to `null` (and drop the file) if
// it lapses; renew by 2027-07-06. The negative/dark variant lights up
// once that asset file lands.
export const CATENA_X_LABEL_ASSET =
  "/brand/CX_Logo_Qualified-Advisor_CLR_RGB_pos_16x9@300.png";
export const CATENA_X_LABEL_ASSET_NEG = null;

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
