import { describe, it, expect } from "vitest";

import * as servicesModule from "./services";
import {
  SERVICES_LIST,
  SERVICE_PILLARS,
  getServicesByPillar,
} from "./services";
import { SERVICE_SCHEMAS } from "./structuredData";
import { CATENA_X_TITLE_BASE } from "./catenaXStatus";

const FORBIDDEN_TERMS = /solana|blockchain|crypto|token|APAC/i;

const EXPECTED_IDS = [
  "battery-systems-safety",
  "battery-mechanical-development",
  "technical-lead-battery-systems",
  "eu-asean-compliance-bridge",
  "battery-passport-integration",
  "strategic-consulting-passport-data-infrastructure",
  "catena-x-supplier-onboarding",
  "remanufacturing-recycling-circular-economy",
];

describe("services module API", () => {
  it("exposes the pillar-based service content exports", () => {
    expect(servicesModule).toHaveProperty("SERVICES_PAGE_CONTENT");
    expect(servicesModule).toHaveProperty("SERVICES_LIST");
    expect(servicesModule).toHaveProperty("SERVICE_PILLARS");
    expect(servicesModule).toHaveProperty("getServicesByPillar");
  });

  it("no longer exposes the legacy section-based API", () => {
    expect(servicesModule).not.toHaveProperty("SERVICES_SECTIONS");
  });
});

describe("SERVICES_LIST", () => {
  it("matches the resolved §4.2 contract: ids in pillar order", () => {
    expect(SERVICES_LIST.map((s) => s.id)).toEqual(EXPECTED_IDS);
  });

  // The agreed Phase C contract (spec §4.2 / §11) is exactly 8 service cards,
  // split 3 (Engineering) / 4 (Compliance) / 1 (Circularity). The spec's only
  // "nine" is the unrelated career timeline, not services. Assert the total
  // against an explicit literal — never a value derived from the implementation
  // (e.g. summing getServicesByPillar) — so the count cannot silently drift if
  // a card is added or removed. The per-pillar 3/4/1 split is guarded
  // separately in the getServicesByPillar suite below.
  it("contains exactly the 8 agreed service cards", () => {
    expect(SERVICES_LIST).toHaveLength(8);
    expect(EXPECTED_IDS).toHaveLength(8);
  });

  it("card 5 (battery-passport-integration) links to /passport", () => {
    const card = SERVICES_LIST.find((s) => s.id === "battery-passport-integration");
    expect(card.passportLink).toBe("/passport");
  });

  it("card 6 carries the credential eyebrow without the pending suffix", () => {
    const card = SERVICES_LIST.find(
      (s) => s.id === "strategic-consulting-passport-data-infrastructure",
    );
    expect(card.eyebrow).toBe(CATENA_X_TITLE_BASE);
    expect(card.eyebrow).not.toMatch(/qualification in progress/i);
  });

  it("card 7 (catena-x-supplier-onboarding) is coming soon", () => {
    const card = SERVICES_LIST.find((s) => s.id === "catena-x-supplier-onboarding");
    expect(card.comingSoon).toBe(true);
  });

  it("contains no forbidden blockchain/crypto/APAC terms", () => {
    expect(JSON.stringify(SERVICES_LIST)).not.toMatch(FORBIDDEN_TERMS);
  });
});

describe("SERVICE_SCHEMAS (structuredData.js) lockstep with SERVICES_LIST", () => {
  // §4.6: SERVICE_SCHEMAS must mirror the resolved §4.2 eight-card contract
  // one-for-one, in order. Guard the count against an explicit literal — never a
  // value derived from SERVICES_LIST.length — so a card added to one module but
  // not the other is caught instead of silently re-deriving to match.
  it("contains exactly the 8 agreed service schemas", () => {
    expect(SERVICE_SCHEMAS).toHaveLength(8);
  });

  it("mirrors each card's title in SERVICES_LIST order", () => {
    expect(SERVICE_SCHEMAS.map((s) => s.name)).toEqual(
      SERVICES_LIST.map((s) => s.title),
    );
  });
});

describe("SERVICE_PILLARS", () => {
  it("lists the three pillars in display order", () => {
    expect(SERVICE_PILLARS.map((p) => p.id)).toEqual([
      "engineering",
      "compliance",
      "circularity",
    ]);
  });
});

describe("getServicesByPillar", () => {
  it("returns the services for each pillar with the expected counts", () => {
    expect(getServicesByPillar("engineering")).toHaveLength(3);
    expect(getServicesByPillar("compliance")).toHaveLength(4);
    expect(getServicesByPillar("circularity")).toHaveLength(1);
  });

  it("returns an empty array for an unknown pillar", () => {
    expect(getServicesByPillar("nope")).toEqual([]);
  });
});
