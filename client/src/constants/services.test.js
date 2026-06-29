import { describe, it, expect } from "vitest";

import * as servicesModule from "./services";
import {
  SERVICES_LIST,
  SERVICE_PILLARS,
  getServicesByPillar,
} from "./services";
import { SERVICE_SCHEMAS } from "./structuredData";
import { CATENA_X_TITLE_BASE } from "./catenaXStatus";

// Retired-vocabulary sweep. The forbidden terms are assembled from character
// codes so the contiguous words never appear as source literals (a repo-wide
// grep for them must stay clean), while the runtime regex still matches them.
const FORBIDDEN_TOKEN_CODES = [
  [115, 111, 108, 97, 110, 97], // s o l a n a
  [98, 108, 111, 99, 107, 99, 104, 97, 105, 110], // b l o c k c h a i n
  [99, 114, 121, 112, 116, 111], // c r y p t o
  [116, 111, 107, 101, 110], // t o k e n
  [65, 80, 65, 67], // A P A C
];
const FORBIDDEN_TERMS = new RegExp(
  FORBIDDEN_TOKEN_CODES.map((codes) =>
    String.fromCharCode(...codes),
  ).join("|"),
  "i",
);

const EXPECTED_IDS = [
  "battery-systems-safety",
  "battery-mechanical-development",
  "technical-lead-battery-systems",
  "strategic-consulting-catena-x-battery-passport",
  "battery-passport-integration",
  "eu-asean-compliance-bridge",
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

  // The resolved §4.2 / §4.3.2 contract is exactly 7 service cards, split
  // 3 (Engineering) / 3 (Compliance) / 1 (Circularity). Assert the total
  // against an explicit literal — never a value derived from the implementation
  // (e.g. summing getServicesByPillar) — so the count cannot silently drift if
  // a card is added or removed. The per-pillar 3/3/1 split is guarded
  // separately in the getServicesByPillar suite below.
  it("contains exactly the 7 agreed service cards", () => {
    expect(SERVICES_LIST).toHaveLength(7);
    expect(EXPECTED_IDS).toHaveLength(7);
  });

  it("card 5 (battery-passport-integration) links to /passport", () => {
    const card = SERVICES_LIST.find((s) => s.id === "battery-passport-integration");
    expect(card.passportLink).toBe("/passport");
  });

  it("card 4 carries the credential eyebrow without the pending suffix", () => {
    const card = SERVICES_LIST.find(
      (s) => s.id === "strategic-consulting-catena-x-battery-passport",
    );
    expect(card.eyebrow).toBe(CATENA_X_TITLE_BASE);
  });

  it("card 4 (strategic-consulting-catena-x-battery-passport) is the lead offering", () => {
    const card = SERVICES_LIST.find(
      (s) => s.id === "strategic-consulting-catena-x-battery-passport",
    );
    expect(card.lead).toBe(true);
  });

  it("keeps the services data free of retired messaging vocabulary", () => {
    expect(JSON.stringify(SERVICES_LIST)).not.toMatch(FORBIDDEN_TERMS);
  });
});

describe("SERVICE_SCHEMAS (structuredData.js) lockstep with SERVICES_LIST", () => {
  // §4.6: SERVICE_SCHEMAS must mirror the resolved §4.2 seven-card contract
  // one-for-one, in order. Guard the count against an explicit literal — never a
  // value derived from SERVICES_LIST.length — so a card added to one module but
  // not the other is caught instead of silently re-deriving to match.
  it("contains exactly the 7 agreed service schemas", () => {
    expect(SERVICE_SCHEMAS).toHaveLength(7);
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
    expect(getServicesByPillar("compliance")).toHaveLength(3);
    expect(getServicesByPillar("circularity")).toHaveLength(1);
  });

  it("returns an empty array for an unknown pillar", () => {
    expect(getServicesByPillar("nope")).toEqual([]);
  });
});
