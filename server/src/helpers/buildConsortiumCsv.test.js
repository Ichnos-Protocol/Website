import { describe, it, expect } from "vitest";

import {
  buildGoogleContactsCsv,
  buildGoogleGroupsCsv,
} from "./buildConsortiumCsv.js";

const CONTACTS_HEADER =
  "Name,Given Name,Family Name,E-mail 1 - Type,E-mail 1 - Value,Phone 1 - Type,Phone 1 - Value,Organization 1 - Name,Organization 1 - Title,Website 1 - Value,Notes,Group Membership";
const GROUPS_HEADER =
  "Group Email [Required],Member Email,Member Type,Member Role";
const GROUP_EMAIL = "consortium@ichnos.example";

const completeRegistrant = {
  name: "Ada",
  surname: "Lovelace",
  email: "ada@example.com",
  phone: "+39 333 1112223",
  company: "Analytical Engines",
  linkedin: "https://linkedin.com/in/ada",
  consortiumPosition: "CTO",
  consortiumChainRole: "Recycler",
  consortiumTier: "founding",
  consortiumSource: "ibs2026",
  consortiumRegisteredAt: new Date("2026-03-04T09:15:00.000Z"),
};

const sparseRegistrant = {
  name: "Grace",
  surname: "Hopper",
  email: "grace@example.com",
  phone: null,
  company: null,
  linkedin: null,
  consortiumPosition: "Advisor",
  consortiumChainRole: null,
  consortiumTier: null,
  consortiumSource: null,
  consortiumRegisteredAt: null,
};

const trickyRegistrant = {
  ...completeRegistrant,
  email: "alan@example.com",
  company: 'Turing, Welchman & Co "Bombe" Ltd',
};

function toLines(csv) {
  return csv
    .split("\n")
    .map((line) => line.replace(/\r$/, ""))
    .filter((line) => line !== "");
}

describe("buildGoogleContactsCsv", () => {
  it("emits the Google Contacts header as the first line", () => {
    const lines = toLines(buildGoogleContactsCsv([completeRegistrant]));

    expect(lines[0]).toBe(CONTACTS_HEADER);
  });

  it("tags every data row with the consortium group membership label", () => {
    const lines = toLines(
      buildGoogleContactsCsv([completeRegistrant, sparseRegistrant]),
    );
    const dataLines = lines.slice(1);

    expect(dataLines).toHaveLength(2);
    dataLines.forEach((line) => {
      expect(line).toContain("* myContacts ::: Consortium 2026");
    });
  });

  it("renders missing values as empty cells, never as null or undefined", () => {
    const lines = toLines(buildGoogleContactsCsv([sparseRegistrant]));
    const dataLine = lines[1];

    expect(dataLine).not.toContain("null");
    expect(dataLine).not.toContain("undefined");
    expect(dataLine.split(",")).toEqual([
      "Grace Hopper",
      "Grace",
      "Hopper",
      "Work",
      "grace@example.com",
      "Work",
      "",
      "",
      "Advisor",
      "",
      "",
      "* myContacts ::: Consortium 2026",
    ]);
  });

  it("carries the position, chain role and notes of a complete registrant", () => {
    const lines = toLines(buildGoogleContactsCsv([completeRegistrant]));

    expect(lines[1]).toContain("CTO / Recycler");
    expect(lines[1]).toContain(
      "Tier: founding; Source: ibs2026; Registered: 2026-03-04",
    );
  });

  it("quotes commas and doubles embedded quotes in a company name", () => {
    const lines = toLines(buildGoogleContactsCsv([trickyRegistrant]));

    expect(lines[1]).toContain('"Turing, Welchman & Co ""Bombe"" Ltd"');
  });

  it("returns only the header row for an empty registrant list", () => {
    const lines = toLines(buildGoogleContactsCsv([]));

    expect(lines).toEqual([CONTACTS_HEADER]);
  });
});

describe("buildGoogleGroupsCsv", () => {
  it("emits the Google Groups header as the first line", () => {
    const lines = toLines(
      buildGoogleGroupsCsv([completeRegistrant], GROUP_EMAIL),
    );

    expect(lines[0]).toBe(GROUPS_HEADER);
  });

  it("writes one USER/MEMBER row per registrant for the supplied group", () => {
    const lines = toLines(
      buildGoogleGroupsCsv([completeRegistrant, sparseRegistrant], GROUP_EMAIL),
    );
    const dataLines = lines.slice(1);

    expect(dataLines).toEqual([
      `${GROUP_EMAIL},ada@example.com,USER,MEMBER`,
      `${GROUP_EMAIL},grace@example.com,USER,MEMBER`,
    ]);
  });

  it("returns only the header row for an empty registrant list", () => {
    const lines = toLines(buildGoogleGroupsCsv([], GROUP_EMAIL));

    expect(lines).toEqual([GROUPS_HEADER]);
  });
});
