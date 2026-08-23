import { describe, it, expect } from "vitest";

import {
  CONSORTIUM_TIER_IDS,
  CONSORTIUM_TIER_PRICE_LABELS,
  CONSORTIUM_POSITION_TIERS,
  CONSORTIUM_RECURRING_FEES,
  CONSORTIUM_TERM_NOTE,
  CONSORTIUM_CAPACITY_NOTE,
} from "./consortiumTiers.js";

// Restates the chk_user_profiles_consortium_tier CHECK in migration 006.
const MIGRATION_TIER_IDS = [
  "readiness",
  "pilot",
  "consortium_anchor",
  "consortium_supplier",
  "member",
  "not_sure",
];

const POSITIONS = [
  "anchor",
  "supplier",
  "equipment_supplier",
  "institute",
  "other",
];

describe("consortiumTiers config", () => {
  describe("CONSORTIUM_TIER_IDS", () => {
    it("matches the six values in the migration CHECK", () => {
      expect([...CONSORTIUM_TIER_IDS]).toEqual(MIGRATION_TIER_IDS);
    });

    it("is frozen", () => {
      expect(Object.isFrozen(CONSORTIUM_TIER_IDS)).toBe(true);
    });
  });

  describe("CONSORTIUM_TIER_PRICE_LABELS", () => {
    it("carries a non-empty label for every priced tier", () => {
      for (const tierId of CONSORTIUM_TIER_IDS.filter(
        (id) => id !== "not_sure",
      )) {
        expect(typeof CONSORTIUM_TIER_PRICE_LABELS[tierId]).toBe("string");
        expect(CONSORTIUM_TIER_PRICE_LABELS[tierId].length).toBeGreaterThan(0);
      }
    });

    it("carries no figure for not_sure", () => {
      expect(CONSORTIUM_TIER_PRICE_LABELS.not_sure).toBeNull();
    });

    it("is frozen", () => {
      expect(Object.isFrozen(CONSORTIUM_TIER_PRICE_LABELS)).toBe(true);
    });
  });

  describe("CONSORTIUM_POSITION_TIERS", () => {
    it("maps all five registration positions", () => {
      expect(Object.keys(CONSORTIUM_POSITION_TIERS).sort()).toEqual(
        [...POSITIONS].sort(),
      );
    });

    it("references only known tier ids", () => {
      for (const permitted of Object.values(CONSORTIUM_POSITION_TIERS)) {
        for (const tierId of permitted) {
          expect(CONSORTIUM_TIER_IDS).toContain(tierId);
        }
      }
    });

    it("freezes the map and every permitted list", () => {
      expect(Object.isFrozen(CONSORTIUM_POSITION_TIERS)).toBe(true);
      for (const permitted of Object.values(CONSORTIUM_POSITION_TIERS)) {
        expect(Object.isFrozen(permitted)).toBe(true);
      }
    });
  });

  describe("shared notes", () => {
    it("lists the three recurring fee lines, frozen", () => {
      expect(CONSORTIUM_RECURRING_FEES).toHaveLength(3);
      expect(Object.isFrozen(CONSORTIUM_RECURRING_FEES)).toBe(true);
    });

    it("carries a term note and a capacity note", () => {
      expect(CONSORTIUM_TERM_NOTE.length).toBeGreaterThan(0);
      expect(CONSORTIUM_CAPACITY_NOTE.length).toBeGreaterThan(0);
    });
  });
});
