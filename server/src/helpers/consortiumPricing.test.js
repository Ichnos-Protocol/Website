import { describe, it, expect } from "vitest";

import {
  formatAmount,
  formatTierPriceLabel,
  formatRecurringFees,
} from "./consortiumPricing.js";

const CURRENCIES = ["EUR", "SGD"];
const PRICED_TIERS = ["pilot", "consortium_anchor", "consortium_supplier"];

describe("consortiumPricing", () => {
  describe("formatAmount", () => {
    it("groups thousands with a comma after the currency code", () => {
      expect(formatAmount("EUR", 26000)).toBe("EUR 26,000");
      expect(formatAmount("SGD", 1234567)).toBe("SGD 1,234,567");
    });

    it("leaves an amount below a thousand ungrouped", () => {
      expect(formatAmount("EUR", 950)).toBe("EUR 950");
    });

    it("never uses a period as a separator", () => {
      expect(formatAmount("EUR", 26000)).not.toContain(".");
    });
  });

  describe("formatTierPriceLabel", () => {
    it.each([
      ["pilot", "EUR", "EUR 26,000"],
      ["pilot", "SGD", "SGD 38,000"],
      ["consortium_supplier", "EUR", "EUR 7,000"],
      ["consortium_supplier", "SGD", "SGD 10,000"],
    ])("formats %s in %s", (tierId, currency, expected) => {
      expect(formatTierPriceLabel(tierId, currency)).toBe(expected);
    });

    it.each([
      ["EUR", "EUR 39,000 (+ EUR 7,000 per additional supplier tenant)"],
      ["SGD", "SGD 57,000 (+ SGD 10,000 per additional supplier tenant)"],
    ])("adds the extra-tenant figure to the anchor in %s", (currency, expected) => {
      expect(formatTierPriceLabel("consortium_anchor", currency)).toBe(expected);
    });

    it.each(CURRENCIES)("prefixes every priced tier with %s", (currency) => {
      for (const tierId of PRICED_TIERS) {
        expect(formatTierPriceLabel(tierId, currency)).toMatch(
          new RegExp(`^${currency} `),
        );
      }
    });

    it.each(["readiness", "not_sure", "unknown_tier"])(
      "returns null for %s",
      (tierId) => {
        expect(formatTierPriceLabel(tierId, "EUR")).toBeNull();
      },
    );

    it("returns the stored string for member", () => {
      expect(formatTierPriceLabel("member", "EUR")).toBe("on request");
      expect(formatTierPriceLabel("member", "SGD")).toBe("on request");
    });
  });

  describe("formatRecurringFees", () => {
    it("returns the three EUR lines in order", () => {
      expect(formatRecurringFees("EUR")).toEqual([
        "Dataspace licence, passed through at cost.",
        "Managed operations: EUR 5,000 to 6,000 per tenant and year.",
        "Passport data maintenance: EUR 4,500 to 7,000 per year.",
      ]);
    });

    it("returns the three SGD lines in order", () => {
      expect(formatRecurringFees("SGD")).toEqual([
        "Dataspace licence, passed through at cost.",
        "Managed operations: SGD 7,500 to 9,000 per tenant and year.",
        "Passport data maintenance: SGD 6,500 to 10,000 per year.",
      ]);
    });
  });

  it("never prints USD", () => {
    const outputs = CURRENCIES.flatMap((currency) => [
      ...formatRecurringFees(currency),
      ...PRICED_TIERS.map((tierId) => formatTierPriceLabel(tierId, currency)),
    ]);

    for (const output of outputs) {
      expect(output).not.toContain("USD");
    }
  });
});
