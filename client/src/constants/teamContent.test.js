// Team content guard, spec P6 and D7.
// P6 reduced the team to its founder and added the closing booking band;
// Frank Tan joined as partner on 2026-10-23.
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
  it("lists the founder first, then the partner", () => {
    expect(TEAM_MEMBERS.map((m) => m.id)).toEqual(["francesco", "frank"]);
  });

  it("gives every member a bio, skills chips and a photo", () => {
    TEAM_MEMBERS.forEach((member) => {
      expect(member.bio.length).toBeGreaterThan(0);
      expect(member.skillsChips.length).toBeGreaterThan(0);
      expect(member.photo).toBeTruthy();
    });
  });

  it("titles Frank Tan as Partner without a Catena-X label", () => {
    const frank = TEAM_MEMBERS.find((m) => m.id === "frank");
    expect(frank.name).toBe("Frank Tan");
    expect(frank.title).toBe("Partner, Business Development");
    expect(frank.cxLabel).toBeUndefined();
  });

  it("gives Frank Tan his own career timeline, oldest first, ending at Ichnos Protocol", () => {
    const frank = TEAM_MEMBERS.find((m) => m.id === "frank");
    expect(frank.showTimeline).toBe(true);
    expect(frank.timeline).toHaveLength(10);
    expect(frank.timeline[0].organization).toBe("United Overseas Bank (UOB)");
    const last = frank.timeline[frank.timeline.length - 1];
    expect(last.title).toBe("Partner, Business Development");
    expect(last.year).toBe("2026 – Present");
    expect(frank.timelineSubtitle).toBeTruthy();
    expect(new Set(frank.timeline.map((e) => e.id)).size).toBe(10);
  });
});

describe("PAGE_STRUCTURED_DATA.team", () => {
  it("holds four schemas with one Person per team member", () => {
    expect(PAGE_STRUCTURED_DATA.team).toHaveLength(4);
    const people = PAGE_STRUCTURED_DATA.team.filter(
      (schema) => schema["@type"] === "Person",
    );
    expect(people.map((p) => p.name)).toEqual([
      "Dr.-Ing. Francesco Maltoni",
      "Frank Tan",
    ]);
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
