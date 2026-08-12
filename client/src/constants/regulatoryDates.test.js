import { describe, it, expect } from "vitest";

import { VERIFIED_AS_OF, REGULATORY_DATES } from "./regulatoryDates";

/*
 * First machine guard the regulatory-claim class has ever had (Analysis §3.2).
 * It asserts data-shape and authored-order invariants only, and deliberately
 * restates no label, no date and no verification literal — the data module is
 * the source of truth, so copying its values here would assert nothing.
 */

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

const isNonEmptyString = (value) =>
  typeof value === "string" && value.trim().length > 0;

describe("VERIFIED_AS_OF", () => {
  it("is an ISO date", () => {
    expect(VERIFIED_AS_OF).toMatch(ISO_DATE);
  });
});

describe("REGULATORY_DATES", () => {
  it("contains exactly the 7 agreed milestones", () => {
    expect(REGULATORY_DATES).toHaveLength(7);
  });

  it("has unique ids", () => {
    const ids = REGULATORY_DATES.map((entry) => entry.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("carries a non-empty label on every entry", () => {
    const offenders = REGULATORY_DATES.filter(
      (entry) => !isNonEmptyString(entry.label),
    ).map((entry) => entry.id);
    expect(offenders).toEqual([]);
  });

  it("carries a non-empty source citation on every entry", () => {
    const offenders = REGULATORY_DATES.filter(
      (entry) => !isNonEmptyString(entry.source),
    ).map((entry) => entry.id);
    expect(offenders).toEqual([]);
  });

  it("carries exactly one of date | datePending on every entry", () => {
    const offenders = REGULATORY_DATES.filter(
      (entry) =>
        [entry.date, entry.datePending].filter(
          (value) => value !== undefined && value !== null,
        ).length !== 1,
    ).map((entry) => entry.id);
    expect(offenders).toEqual([]);
  });

  // The ordering check below compares ISO strings lexicographically, so every
  // present `date` must be a well-formed ISO date for it to mean anything.
  it("formats every present date as ISO YYYY-MM-DD", () => {
    const offenders = REGULATORY_DATES.filter(
      (entry) => entry.date !== undefined && !ISO_DATE.test(entry.date),
    ).map((entry) => entry.id);
    expect(offenders).toEqual([]);
  });

  // The array is authored in display order and the component never sorts, so
  // authored order must already be chronological. Pending entries have no
  // enforceable date and are filtered out before the comparison.
  it("is chronologically non-decreasing in authored order", () => {
    const dates = REGULATORY_DATES.filter(
      (entry) => entry.date !== undefined,
    ).map((entry) => entry.date);
    expect(dates).toEqual([...dates].sort());
  });
});
