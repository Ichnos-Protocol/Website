// Single source of truth for whether the Catena-X qualification has
// been formally granted. While `false`, the site renders the pending
// qualifier suffix in muted styling everywhere the Advisory Provider
// title appears. When Catena-X confirms the listing, flip this to
// `true` — the suffix disappears across the entire site without any
// other code change.
export const CATENA_X_QUALIFICATION_GRANTED = false;

// Visual class used to gray the qualifier text while the toggle is off.
export const CATENA_X_QUALIFIER_CLASS = "catenax-qualifier-pending";

// Base credential title, shared by every surface that needs the full
// string (SEO meta, og:title, schema.org descriptions).
export const CATENA_X_TITLE_BASE =
  "Official Catena-X Qualified Advisory Provider";

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
