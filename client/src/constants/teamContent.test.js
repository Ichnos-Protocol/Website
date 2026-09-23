// Team content guard, spec P6 and D7.
// P6 reduces the team to its one member and adds the closing booking band.
// D7 keeps the page title "Team" and the plural practitioner subtitle.
// No departed member's name may be written in this file, so there is no
// negative-literal assertion: the positive id list below is the guard.
import { describe, it, expect } from "vitest";

import { TEAM_CTA, TEAM_MEMBERS, TEAM_PAGE_HEADER } from "./teamContent";
import { PAGE_STRUCTURED_DATA } from "./structuredData";

const PAGE_KEYS = [
  "landing",
  "services",
  "team",
  "passport",
  "contact",
  "consortium",
  "consortiumTiers",
  "privacy",
  "readinessAssessment",
];

describe("TEAM_MEMBERS", () => {
  it("lists exactly the one current member", () => {
    expect(TEAM_MEMBERS).toHaveLength(1);
    expect(TEAM_MEMBERS.map((m) => m.id)).toEqual(["francesco"]);
  });

  it("keeps the surviving entry's bio, skills chips and photo", () => {
    const [member] = TEAM_MEMBERS;
    expect(member.bio.length).toBeGreaterThan(0);
    expect(member.skillsChips.length).toBeGreaterThan(0);
    expect(member.photo).toBeTruthy();
  });
});

describe("PAGE_STRUCTURED_DATA.team", () => {
  it("holds three schemas with exactly one Person", () => {
    expect(PAGE_STRUCTURED_DATA.team).toHaveLength(3);
    const people = PAGE_STRUCTURED_DATA.team.filter(
      (schema) => schema["@type"] === "Person",
    );
    expect(people).toHaveLength(1);
  });

  it("leaves every page key in place", () => {
    expect(Object.keys(PAGE_STRUCTURED_DATA)).toEqual(
      expect.arrayContaining(PAGE_KEYS),
    );
  });
});

describe("TEAM_CTA", () => {
  it("carries a non-empty label", () => {
    expect(typeof TEAM_CTA.label).toBe("string");
    expect(TEAM_CTA.label.length).toBeGreaterThan(0);
  });
});

describe("TEAM_PAGE_HEADER (D7)", () => {
  it("keeps the title and the plural practitioner subtitle", () => {
    expect(TEAM_PAGE_HEADER.title).toBe("Team");
    expect(TEAM_PAGE_HEADER.subtitle).toMatch(/^Practitioners\b/);
  });
});
