import { describe, it, expect } from 'vitest';
import { formatTimelineDate, todayMarkerIndex } from './regulatoryTimeline';

/**
 * Deliberately local fixture — the helpers must not know the real timeline
 * data module. A `datePending` entry sits between dated ones so the parity
 * assertions can prove it never shifts the marker.
 */
const TIMELINE_ENTRIES = [
  { id: 'labelling', date: '2026-08-18' },
  { id: 'passport', date: '2027-02-18' },
  { id: 'delegated-act', datePending: true },
  { id: 'due-diligence', date: '2027-08-18' },
  { id: 'recycled-content', date: '2028-08-18' },
];

const DATED_ENTRIES = TIMELINE_ENTRIES.filter((entry) => entry.date);

/** Turns an ISO day literal into a `Date` at `T00:00:00Z`. */
function clockAt(isoDay) {
  return new Date(`${isoDay}T00:00:00Z`);
}

describe('formatTimelineDate', () => {
  it('converts an ISO date to the display form', () => {
    expect(formatTimelineDate('2027-02-18')).toBe('18 Feb 2027');
  });

  it('resolves a second month from the abbreviation table', () => {
    expect(formatTimelineDate('2026-08-18')).toBe('18 Aug 2026');
  });

  it('resolves the last month of the abbreviation table', () => {
    expect(formatTimelineDate('2026-12-31')).toBe('31 Dec 2026');
  });

  it('drops the zero pad on a single-digit day', () => {
    expect(formatTimelineDate('2028-08-01')).toBe('1 Aug 2028');
  });

  it('returns an empty string for a missing date', () => {
    expect(formatTimelineDate(undefined)).toBe('');
  });
});

describe('todayMarkerIndex', () => {
  it('returns 0 when now precedes every entry', () => {
    expect(todayMarkerIndex(TIMELINE_ENTRIES, clockAt('2025-01-01'))).toBe(0);
  });

  it('returns the dated count when now follows every entry', () => {
    expect(todayMarkerIndex(TIMELINE_ENTRIES, clockAt('2030-01-01'))).toBe(
      DATED_ENTRIES.length,
    );
  });

  it('places the marker before an entry whose date now matches exactly', () => {
    expect(todayMarkerIndex(TIMELINE_ENTRIES, clockAt('2027-02-18'))).toBe(1);
  });

  it('counts only the dated entries that precede a mid-range now', () => {
    expect(todayMarkerIndex(TIMELINE_ENTRIES, clockAt('2027-06-01'))).toBe(2);
  });

  it('accepts an ISO string clock and agrees with the equivalent Date', () => {
    expect(todayMarkerIndex(TIMELINE_ENTRIES, '2027-06-01')).toBe(
      todayMarkerIndex(TIMELINE_ENTRIES, clockAt('2027-06-01')),
    );
  });

  it('returns 0 for an empty array', () => {
    expect(todayMarkerIndex([], clockAt('2027-06-01'))).toBe(0);
  });

  it.each(['2025-01-01', '2027-02-18', '2027-06-01', '2030-01-01'])(
    'ignores the datePending entry at %s',
    (isoDay) => {
      expect(todayMarkerIndex(TIMELINE_ENTRIES, clockAt(isoDay))).toBe(
        todayMarkerIndex(DATED_ENTRIES, clockAt(isoDay)),
      );
    },
  );
});
