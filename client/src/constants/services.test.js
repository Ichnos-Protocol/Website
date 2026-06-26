import { describe, it, expect } from "vitest";

import * as servicesModule from "./services";
import { SERVICES_SECTIONS } from "./services";

const FORBIDDEN_TERMS = /solana|blockchain|crypto|token/i;

describe("services module API", () => {
  it("no longer exposes the legacy flat-list API", () => {
    expect(servicesModule).not.toHaveProperty("SERVICES_LIST");
    expect(servicesModule).not.toHaveProperty("SERVICE_PILLARS");
    expect(servicesModule).not.toHaveProperty("getServicesByPillar");
  });

  it("exposes only the section-based service content exports", () => {
    expect(Object.keys(servicesModule).sort()).toEqual([
      "SERVICES_PAGE_CONTENT",
      "SERVICES_SECTIONS",
    ]);
  });

  it("carries no stale homepage/passport-platform copy", () => {
    const allText = JSON.stringify(servicesModule);
    expect(allText).not.toMatch(/Battery Passport platform Ichnos Protocol/);
  });
});

describe("SERVICES_SECTIONS", () => {
  it("has exactly three sections in the expected order", () => {
    expect(SERVICES_SECTIONS.map((s) => s.id)).toEqual([
      "data-services",
      "catena-x-consulting",
      "engineering-advisory",
    ]);
  });

  it("Section A (data services) has four items linking to /data", () => {
    const section = SERVICES_SECTIONS[0];
    expect(section.id).toBe("data-services");
    expect(section.items).toHaveLength(4);
    expect(section.cta.to).toBe("/data");
    const titles = section.items.map((i) => i.title).join(" ");
    expect(titles).toMatch(/Optional: quality data/);
  });

  it("Section B (Catena-X consulting) is a teaser linking to /catena-x", () => {
    const section = SERVICES_SECTIONS[1];
    expect(section.id).toBe("catena-x-consulting");
    expect(section.teaser).toBeTruthy();
    expect(section.items).toBeUndefined();
    expect(section.cta.to).toBe("/catena-x");
  });

  it("Section C (engineering advisory) has three items", () => {
    const section = SERVICES_SECTIONS[2];
    expect(section.id).toBe("engineering-advisory");
    expect(section.items).toHaveLength(3);
  });

  it("carries the expected key phrases", () => {
    const allText = JSON.stringify(SERVICES_SECTIONS);
    expect(allText).toMatch(/Catena-X-compatible/);
    expect(allText).toMatch(/carbon footprint/);
    expect(allText).toMatch(/Due-diligence/);
    expect(allText).toMatch(/Supplier diligence/);
    expect(allText).toMatch(/application in progress/);
  });

  it("contains no forbidden blockchain/crypto terms", () => {
    const allText = JSON.stringify(SERVICES_SECTIONS);
    expect(allText).not.toMatch(FORBIDDEN_TERMS);
  });
});
