import { describe, it, expect } from "vitest";

import * as servicesModule from "./services";
import {
  SERVICES_LIST,
  SERVICE_PILLARS,
  getServicesByPillar,
} from "./services";
import { SERVICE_SCHEMAS } from "./structuredData";

// Retired-vocabulary sweep. The forbidden terms are assembled from character
// codes so the contiguous words never appear as source literals (a repo-wide
// grep for them must stay clean), while the runtime regex still matches them.
// Terms match as whole words (\b) so legitimate copy such as "capacity"
// (which contains "apac") does not false-positive.
const FORBIDDEN_TOKEN_CODES = [
  [115, 111, 108, 97, 110, 97], // s o l a n a
  [98, 108, 111, 99, 107, 99, 104, 97, 105, 110], // b l o c k c h a i n
  [99, 114, 121, 112, 116, 111], // c r y p t o
  [116, 111, 107, 101, 110], // t o k e n
  [65, 80, 65, 67], // A P A C
];
const FORBIDDEN_TERMS = new RegExp(
  FORBIDDEN_TOKEN_CODES.map(
    (codes) => `\\b${String.fromCharCode(...codes)}\\b`,
  ).join("|"),
  "i",
);

const EXPECTED_IDS = [
  "battery-systems-safety",
  "battery-mechanical-development",
  "technical-lead-battery-systems",
  "catenax-get-connected",
  "catenax-digital-twins",
  "catenax-battery-passport",
  "catenax-production-planning",
  "catenax-pcf",
  "eu-asean-compliance-bridge",
  "remanufacturing-recycling-circular-economy",
];

const RETIRED_IDS = [
  "strategic-consulting-catena-x-battery-passport",
  "battery-passport-integration",
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
  it("matches the four-pillar contract: ids in pillar order", () => {
    expect(SERVICES_LIST.map((s) => s.id)).toEqual(EXPECTED_IDS);
  });

  // The four-pillar contract is exactly 10 service cards, split
  // 3 (Engineering) / 5 (Catena-X) / 1 (Compliance) / 1 (Circularity). Assert
  // the total against an explicit literal — never a value derived from the
  // implementation (e.g. summing getServicesByPillar) — so the count cannot
  // silently drift if a card is added or removed. The per-pillar 3/5/1/1 split
  // is guarded separately in the getServicesByPillar suite below.
  it("contains exactly the 10 agreed service cards", () => {
    expect(SERVICES_LIST).toHaveLength(10);
    expect(EXPECTED_IDS).toHaveLength(10);
  });

  it("no longer contains the retired expert-facing cards", () => {
    const ids = SERVICES_LIST.map((s) => s.id);
    RETIRED_IDS.forEach((retiredId) => {
      expect(ids).not.toContain(retiredId);
    });
  });

  it("every catenax-* card links to /passport", () => {
    const catenaXCards = SERVICES_LIST.filter((s) =>
      s.id.startsWith("catenax-"),
    );
    expect(catenaXCards).toHaveLength(5);
    catenaXCards.forEach((card) => {
      expect(card.passportLink).toBe("/passport");
    });
  });

  it("catenax-* cards carry structured microline segments with official links", () => {
    const card = SERVICES_LIST.find((s) => s.id === "catenax-get-connected");
    expect(Array.isArray(card.microline)).toBe(true);
    expect(card.microline.length).toBeGreaterThan(0);
    card.microline.forEach((segment) => {
      expect(typeof segment.text).toBe("string");
    });
    expect(
      card.microline.some((segment) => segment.href?.startsWith("https")),
    ).toBe(true);
  });

  it("keeps the services data free of retired messaging vocabulary", () => {
    expect(JSON.stringify(SERVICES_LIST)).not.toMatch(FORBIDDEN_TERMS);
  });
});

describe("SERVICE_SCHEMAS (structuredData.js) lockstep with SERVICES_LIST", () => {
  // SERVICE_SCHEMAS must mirror the ten-card contract one-for-one, in order.
  // Guard the count against an explicit literal — never a value derived from
  // SERVICES_LIST.length — so a card added to one module but not the other is
  // caught instead of silently re-deriving to match.
  it("contains exactly the 10 agreed service schemas", () => {
    expect(SERVICE_SCHEMAS).toHaveLength(10);
  });

  it("mirrors each card's title in SERVICES_LIST order", () => {
    expect(SERVICE_SCHEMAS.map((s) => s.name)).toEqual(
      SERVICES_LIST.map((s) => s.title),
    );
  });

  it("mirrors each card's description in SERVICES_LIST order", () => {
    expect(SERVICE_SCHEMAS.map((schema) => schema.description)).toEqual(
      SERVICES_LIST.map((service) => service.description),
    );
  });
});

describe("SERVICE_PILLARS", () => {
  it("lists the four pillars in display order", () => {
    expect(SERVICE_PILLARS.map((p) => p.id)).toEqual([
      "engineering",
      "catena-x",
      "compliance",
      "circularity",
    ]);
  });

  it("the catena-x pillar carries the group-header subtitle/lede", () => {
    const pillar = SERVICE_PILLARS.find((p) => p.id === "catena-x");
    expect(pillar.subtitle).toBe(
      "Connect once. Answer every customer data request.",
    );
    expect(pillar.lede).toContain("Catena-X®");
  });

  // The lede's em-dash junction was converted to a comma. The em-dash is
  // written as an escape so no literal em-dash character enters this file.
  it("the catena-x lede joins the clause with a comma, not an em-dash", () => {
    const pillar = SERVICE_PILLARS.find((p) => p.id === "catena-x");
    expect(pillar.lede).toContain("shared data network, the channel");
    expect(pillar.lede).not.toMatch(/\u2014/);
  });

  it("the engineering pillar carries a subtitle", () => {
    const pillar = SERVICE_PILLARS.find((p) => p.id === "engineering");
    expect(pillar.subtitle).toBe(
      "Technical depth across the battery circular value chain.",
    );
  });

  it("allows pillars without a subtitle", () => {
    ["compliance", "circularity"].forEach((id) => {
      const pillar = SERVICE_PILLARS.find((p) => p.id === id);
      expect(pillar).not.toHaveProperty("subtitle");
      expect(pillar.subtitle).toBeUndefined();
    });
  });

  it("no pillar retains the retired kicker/heading fields", () => {
    SERVICE_PILLARS.forEach((pillar) => {
      expect(pillar).not.toHaveProperty("kicker");
      expect(pillar).not.toHaveProperty("heading");
    });
  });
});

describe("getServicesByPillar", () => {
  it("returns the services for each pillar with the expected counts", () => {
    expect(getServicesByPillar("engineering")).toHaveLength(3);
    expect(getServicesByPillar("catena-x")).toHaveLength(5);
    expect(getServicesByPillar("compliance")).toHaveLength(1);
    expect(getServicesByPillar("circularity")).toHaveLength(1);
  });

  it("returns an empty array for an unknown pillar", () => {
    expect(getServicesByPillar("nope")).toEqual([]);
  });
});
