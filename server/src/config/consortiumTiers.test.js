import { describe, it, expect } from "vitest";

import {
  CONSORTIUM_TIER_IDS,
  CONSORTIUM_TIER_PRICES,
  CONSORTIUM_POSITION_TIERS,
  CONSORTIUM_RECURRING_FEE_RANGES,
  CONSORTIUM_REGION_CURRENCY,
  CONSORTIUM_DEFAULT_CURRENCY,
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

// Restates the chk_user_profiles_consortium_region CHECK in migration 008.
const MIGRATION_REGIONS = ["asean", "eu", "other"];
const CURRENCIES = ["EUR", "SGD"];
const PRICED_TIERS = ["pilot", "consortium_anchor", "consortium_supplier"];

function isPositiveInteger(value) {
  return Number.isInteger(value) && value > 0;
}

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

  describe("CONSORTIUM_TIER_PRICES", () => {
    it("carries positive-integer EUR and SGD figures for every priced tier", () => {
      for (const tierId of PRICED_TIERS) {
        for (const currency of CURRENCIES) {
          expect(isPositiveInteger(CONSORTIUM_TIER_PRICES[tierId][currency])).toBe(
            true,
          );
        }
      }
    });

    it("prices member as the on request string", () => {
      expect(CONSORTIUM_TIER_PRICES.member).toBe("on request");
    });

    it("carries no entry for readiness or not_sure", () => {
      expect(CONSORTIUM_TIER_PRICES).not.toHaveProperty("readiness");
      expect(CONSORTIUM_TIER_PRICES).not.toHaveProperty("not_sure");
    });

    it("gives the extra-tenant figure to the anchor only, in both currencies", () => {
      const { extraTenant } = CONSORTIUM_TIER_PRICES.consortium_anchor;

      for (const currency of CURRENCIES) {
        expect(isPositiveInteger(extraTenant[currency])).toBe(true);
      }
      expect(CONSORTIUM_TIER_PRICES.pilot).not.toHaveProperty("extraTenant");
      expect(CONSORTIUM_TIER_PRICES.consortium_supplier).not.toHaveProperty(
        "extraTenant",
      );
    });

    it("freezes the map and every nested entry", () => {
      expect(Object.isFrozen(CONSORTIUM_TIER_PRICES)).toBe(true);
      for (const tierId of PRICED_TIERS) {
        expect(Object.isFrozen(CONSORTIUM_TIER_PRICES[tierId])).toBe(true);
      }
      expect(
        Object.isFrozen(CONSORTIUM_TIER_PRICES.consortium_anchor.extraTenant),
      ).toBe(true);
    });
  });

  describe("CONSORTIUM_RECURRING_FEE_RANGES", () => {
    it("holds an ordered positive-integer [lo, hi] range per currency", () => {
      for (const fee of Object.values(CONSORTIUM_RECURRING_FEE_RANGES)) {
        for (const currency of CURRENCIES) {
          const range = fee[currency];

          expect(range).toHaveLength(2);
          expect(range.every(isPositiveInteger)).toBe(true);
          expect(range[0]).toBeLessThanOrEqual(range[1]);
        }
      }
    });

    it("freezes the map, every fee and every range", () => {
      expect(Object.isFrozen(CONSORTIUM_RECURRING_FEE_RANGES)).toBe(true);
      for (const fee of Object.values(CONSORTIUM_RECURRING_FEE_RANGES)) {
        expect(Object.isFrozen(fee)).toBe(true);
        for (const currency of CURRENCIES) {
          expect(Object.isFrozen(fee[currency])).toBe(true);
        }
      }
    });
  });

  describe("CONSORTIUM_REGION_CURRENCY", () => {
    it("maps exactly the three regions in the migration 008 CHECK", () => {
      expect(Object.keys(CONSORTIUM_REGION_CURRENCY).sort()).toEqual(
        MIGRATION_REGIONS,
      );
    });

    it("prices the EU in EUR and ASEAN and elsewhere in SGD", () => {
      expect(CONSORTIUM_REGION_CURRENCY.eu).toBe("EUR");
      expect(CONSORTIUM_REGION_CURRENCY.asean).toBe("SGD");
      expect(CONSORTIUM_REGION_CURRENCY.other).toBe("SGD");
    });

    it("is frozen", () => {
      expect(Object.isFrozen(CONSORTIUM_REGION_CURRENCY)).toBe(true);
    });

    it("defaults to SGD", () => {
      expect(CONSORTIUM_DEFAULT_CURRENCY).toBe("SGD");
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
    it("carries a term note and a capacity note", () => {
      expect(CONSORTIUM_TERM_NOTE.length).toBeGreaterThan(0);
      expect(CONSORTIUM_CAPACITY_NOTE.length).toBeGreaterThan(0);
    });
  });
});
