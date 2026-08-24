import { describe, it, expect } from "vitest";

import { selectTierSchema } from "./consortiumSchemas.js";
import { CONSORTIUM_TIER_IDS } from "../config/consortiumTiers.js";

describe("selectTierSchema", () => {
  it("accepts every tier id in the migration CHECK", () => {
    for (const tier of CONSORTIUM_TIER_IDS) {
      expect(selectTierSchema.safeParse({ tier }).success).toBe(true);
    }
  });

  it("rejects an unknown tier id", () => {
    expect(selectTierSchema.safeParse({ tier: "platinum" }).success).toBe(
      false,
    );
  });

  it("rejects a missing tier", () => {
    expect(selectTierSchema.safeParse({}).success).toBe(false);
  });

  it("rejects an empty string", () => {
    expect(selectTierSchema.safeParse({ tier: "" }).success).toBe(false);
  });

  it("rejects a non-string tier", () => {
    expect(selectTierSchema.safeParse({ tier: 3 }).success).toBe(false);
    expect(selectTierSchema.safeParse({ tier: null }).success).toBe(false);
  });
});
