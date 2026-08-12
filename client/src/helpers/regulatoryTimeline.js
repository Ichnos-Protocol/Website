/**
 * Regulatory timeline date helpers. Pure functions over ISO `YYYY-MM-DD`
 * strings — no DOM access, no import of the timeline data module, and the
 * clock is always injected by the caller.
 */

const MONTH_ABBREVIATIONS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

/**
 * Renders an ISO `YYYY-MM-DD` value as `18 Feb 2027`.
 *
 * Decomposes the string rather than building a `Date`: an ISO date-only
 * string parses as UTC, so `toLocaleDateString` would render the previous
 * day under negative-offset locales, and locale data would make the output
 * environment-dependent.
 */
export function formatTimelineDate(iso) {
  if (!iso) return '';
  const [year, month, day] = iso.split('-');
  return `${Number(day)} ${MONTH_ABBREVIATIONS[Number(month) - 1]} ${year}`;
}

/**
 * Reduces an injected clock — a `Date` or an already-ISO string — to a plain
 * `YYYY-MM-DD` day, so the entry comparison stays a lexicographic string
 * compare and no timezone offset can drift the result by a day.
 */
function toIsoDay(now) {
  const iso = typeof now === 'string' ? now : now.toISOString();
  return iso.slice(0, 10);
}

/**
 * Insertion index for the "today" marker within the *dated subsequence* of
 * `entries`. `now` is an injected clock — either a `Date` or an ISO string,
 * never read from the wall clock; entries without a `date`
 * (`datePending`) never contribute to the count. Where the marker lands in
 * the rendered list is the component's concern.
 *
 * The comparison is strictly-before, so a `now` landing exactly on an
 * entry's date places the marker ahead of that entry. Never sorts —
 * authored order is display order and dated entries are guaranteed
 * non-decreasing by the data module's guard.
 */
export function todayMarkerIndex(entries, now) {
  const today = toIsoDay(now);
  return entries.filter((entry) => entry.date && entry.date < today).length;
}
