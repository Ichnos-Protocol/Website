/*
 * Date-sweep patterns.
 *
 * Scanner data only: the patterns that page tests run against rendered text
 * to prove the copy carries no hard-coded date. No assertions live here, and
 * nothing here imports app code. vocabulary.js lists this file in SKIP_FILES
 * so the corpus scan never reads these patterns as page copy.
 */

// readinessAssessmentContent.js keeps its own MONTHS private, so the detector
// alphabet is rebuilt here with the same space-separated split(" ") idiom.
// This is a detector alphabet, not a restatement of any date on the site.
const MONTHS =
  "January February March April May June July August September October November December".split(
    " ",
  );

// The (19|20) prefix plus word boundaries is what keeps "MS 2818" (the
// readiness assessment FAQ) and "CX-0160" (the readiness assessment inputs)
// out of the match. formatPrice output is comma-grouped, so no four-digit run
// reaches the DOM from a price either.
export const YEAR_PATTERN = /\b(19|20)\d{2}\b/;

// Deliberately not narrowed to (19|20): a month name already disambiguates,
// so the broader year form is the stronger assertion here, not a looser one.
export const MONTH_YEAR_PATTERN = new RegExp(
  `\\b(?:${MONTHS.join("|")})\\s+\\d{4}\\b`,
);

export const ISO_DATE_PATTERN = /\d{4}-\d{2}-\d{2}/;

// Consumed by the consortium page sweeps and the readiness page sweep.
export const RELATIVE_TIME_PATTERN =
  /\b(this|next|last)\s+(year|quarter|month|week)\b/i;
