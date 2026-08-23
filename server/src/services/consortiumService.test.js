import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../repositories/userRepository.js", () => ({
  getConsortiumProfile: vi.fn(),
  setConsortiumTier: vi.fn(),
}));

const userRepository = await import("../repositories/userRepository.js");
const { getMyConsortium, getPermittedTiers, selectTier } = await import(
  "./consortiumService.js"
);

function registeredAs(position) {
  return { consortium_interest: true, consortium_position: position };
}

describe("consortiumService", () => {
  beforeEach(() => {
    userRepository.getConsortiumProfile.mockReset();
    userRepository.setConsortiumTier.mockReset();
  });

  describe("getPermittedTiers per position", () => {
    const cases = [
      ["anchor", ["readiness", "consortium_anchor", "pilot", "not_sure"]],
      ["supplier", ["readiness", "consortium_supplier", "not_sure"]],
      ["equipment_supplier", ["member", "not_sure"]],
      ["institute", ["member", "not_sure"]],
      ["other", ["readiness", "pilot", "consortium_supplier", "not_sure"]],
    ];

    it.each(cases)("returns exactly the %s ladder, in order", async (
      position,
      expected,
    ) => {
      userRepository.getConsortiumProfile.mockResolvedValue(
        registeredAs(position),
      );

      const result = await getPermittedTiers("uid-1");

      expect(result.tiers.map((t) => t.tierId)).toEqual(expected);
    });

    it("gives an anchor and a supplier different ladders", async () => {
      userRepository.getConsortiumProfile.mockResolvedValue(
        registeredAs("anchor"),
      );
      const anchor = await getPermittedTiers("uid-1");

      userRepository.getConsortiumProfile.mockResolvedValue(
        registeredAs("supplier"),
      );
      const supplier = await getPermittedTiers("uid-2");

      expect(anchor.tiers.map((t) => t.tierId)).not.toEqual(
        supplier.tiers.map((t) => t.tierId),
      );
      expect(supplier.tiers.map((t) => t.tierId)).not.toContain(
        "consortium_anchor",
      );
    });
  });

  describe("getPermittedTiers payload", () => {
    beforeEach(() => {
      userRepository.getConsortiumProfile.mockResolvedValue(
        registeredAs("supplier"),
      );
    });

    it("carries the shared commercial notes", async () => {
      const result = await getPermittedTiers("uid-1");

      expect(Array.isArray(result.recurringFees)).toBe(true);
      expect(result.recurringFees.length).toBeGreaterThan(0);
      expect(typeof result.termNote).toBe("string");
      expect(typeof result.capacityNote).toBe("string");
    });

    it("exposes only tierId and priceLabel per entry", async () => {
      const result = await getPermittedTiers("uid-1");

      for (const entry of result.tiers) {
        expect(Object.keys(entry).sort()).toEqual(["priceLabel", "tierId"]);
        expect(entry).not.toHaveProperty("name");
        expect(entry).not.toHaveProperty("description");
      }
    });

    it("returns a null price label for not_sure", async () => {
      const result = await getPermittedTiers("uid-1");

      const notSure = result.tiers.find((t) => t.tierId === "not_sure");
      expect(notSure.priceLabel).toBeNull();
    });
  });

  describe("unregistered caller", () => {
    beforeEach(() => {
      userRepository.getConsortiumProfile.mockResolvedValue(null);
    });

    it("refuses getPermittedTiers with 403", async () => {
      await expect(() => getPermittedTiers("uid-1")).rejects.toThrowError(
        expect.objectContaining({ statusCode: 403 }),
      );
    });

    it("refuses selectTier with 403 and writes nothing", async () => {
      await expect(() =>
        selectTier("uid-1", "readiness"),
      ).rejects.toThrowError(expect.objectContaining({ statusCode: 403 }));
      expect(userRepository.setConsortiumTier).not.toHaveBeenCalled();
    });
  });

  describe("unmapped position", () => {
    it("fails closed with 403", async () => {
      userRepository.getConsortiumProfile.mockResolvedValue(
        registeredAs("something_else"),
      );

      await expect(() => getPermittedTiers("uid-1")).rejects.toThrowError(
        expect.objectContaining({ statusCode: 403 }),
      );
    });
  });

  describe("selectTier", () => {
    beforeEach(() => {
      userRepository.getConsortiumProfile.mockResolvedValue(
        registeredAs("supplier"),
      );
    });

    it("refuses a tier the position does not permit, before any write", async () => {
      await expect(() =>
        selectTier("uid-1", "consortium_anchor"),
      ).rejects.toThrowError(expect.objectContaining({ statusCode: 403 }));
      expect(userRepository.setConsortiumTier).not.toHaveBeenCalled();
    });

    it("persists a permitted tier and returns the row", async () => {
      const row = { consortium_tier: "consortium_supplier" };
      userRepository.setConsortiumTier.mockResolvedValue(row);

      const result = await selectTier("uid-1", "consortium_supplier");

      expect(result).toEqual(row);
      expect(userRepository.setConsortiumTier).toHaveBeenCalledTimes(1);
      expect(userRepository.setConsortiumTier).toHaveBeenCalledWith(
        "uid-1",
        "consortium_supplier",
      );
    });
  });

  describe("getMyConsortium", () => {
    it("returns the repository row untouched", async () => {
      const row = registeredAs("anchor");
      userRepository.getConsortiumProfile.mockResolvedValue(row);

      await expect(getMyConsortium("uid-1")).resolves.toBe(row);
    });

    it("returns null for a non-registrant without refusing", async () => {
      userRepository.getConsortiumProfile.mockResolvedValue(null);

      await expect(getMyConsortium("uid-1")).resolves.toBeNull();
    });
  });
});
