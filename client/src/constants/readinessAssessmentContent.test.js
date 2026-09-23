import { describe, it, expect } from "vitest";

import * as content from "./readinessAssessmentContent";
import {
  ASSESSMENT_AUDIENCE,
  ASSESSMENT_CTA_BAND,
  ASSESSMENT_DELIVERABLES,
  ASSESSMENT_FAQ,
  ASSESSMENT_HERO,
  ASSESSMENT_INPUTS,
  ASSESSMENT_NEXT_STEPS,
  ASSESSMENT_PANELS,
  ASSESSMENT_PROCESS,
  ASSESSMENT_SCOPE_BOUNDARY,
  ASSESSMENT_SEO_SUMMARY,
  ASSESSMENT_WINDOW,
  PRICING,
  REVIEWED_AS_OF,
  computeCurrentPrice,
  formatPrice,
  getCurrentPrice,
  getPassportDateLabel,
  interpolate,
} from "./readinessAssessmentContent";
import { REGULATORY_DATES } from "./regulatoryDates";

/*
 * Guard for the readiness-assessment content module (spec section 8 items 2,
 * 7, 8, 9 and 12, in the form they can be asserted before any component
 * exists).
 *
 * Unlike `regulatoryDates.test.js`, this file DOES restate literals: the
 * twelve figures in section 4.2.1 are owner decisions of 22 Sep 2026 whose
 * source is the specification table, not the module. Restating them here is
 * what makes an accidental edit to `PRICING` fail, which is the whole point.
 * Copy strings are NOT restated; they are asserted by shape and by token,
 * except the one fixed hosting claim guarded under "copy discipline".
 */

const EXPORT_NAMES = [
  "PRICING",
  "REVIEWED_AS_OF",
  "formatPrice",
  "computeCurrentPrice",
  "getCurrentPrice",
  "getPassportDateLabel",
  "interpolate",
  "ASSESSMENT_HERO",
  "ASSESSMENT_SEO_SUMMARY",
  "ASSESSMENT_PANELS",
  "ASSESSMENT_WINDOW",
  "ASSESSMENT_AUDIENCE",
  "ASSESSMENT_DELIVERABLES",
  "ASSESSMENT_PROCESS",
  "ASSESSMENT_INPUTS",
  "ASSESSMENT_NEXT_STEPS",
  "ASSESSMENT_SCOPE_BOUNDARY",
  "ASSESSMENT_FAQ",
  "ASSESSMENT_CTA_BAND",
];

const TIER_IDS = ["component", "cell", "operator"];
const CURRENCIES = ["SGD", "EUR"];

// User-facing copy only, enumerated rather than introspected (the
// `vocabulary.js` convention). `PRICING` is deliberately absent: its
// `founding` / `foundingOpen` keys are implementation names and must not be
// swept by the section 4.2.1.1 rule 1 word check. `factDate` is audit
// metadata that never renders, so it is excluded too.
const COPY_EXPORTS = [
  ASSESSMENT_HERO,
  ASSESSMENT_SEO_SUMMARY,
  ASSESSMENT_PANELS,
  ASSESSMENT_WINDOW,
  ASSESSMENT_AUDIENCE,
  ASSESSMENT_DELIVERABLES,
  ASSESSMENT_PROCESS,
  ASSESSMENT_INPUTS,
  ASSESSMENT_NEXT_STEPS,
  ASSESSMENT_SCOPE_BOUNDARY,
  ASSESSMENT_FAQ,
  ASSESSMENT_CTA_BAND,
];
const COPY = JSON.stringify(COPY_EXPORTS);

// Every tier flipped closed, built locally so the exported `PRICING` is never
// mutated.
const CLOSED_PRICING = Object.fromEntries(
  Object.entries(PRICING).map(([id, tier]) => [
    id,
    { ...tier, foundingOpen: false },
  ]),
);

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

const costAnswer = ASSESSMENT_FAQ.entries.find((entry) => entry.id === "cost").answer;

const isNonEmptyString = (value) =>
  typeof value === "string" && value.trim().length > 0;

const collectKeys = (value, out = []) => {
  if (Array.isArray(value)) {
    value.forEach((item) => collectKeys(item, out));
  } else if (value && typeof value === "object") {
    for (const [key, nested] of Object.entries(value)) {
      out.push(key);
      collectKeys(nested, out);
    }
  }
  return out;
};

describe("module API", () => {
  it("exports the render contract the page subtree imports against", () => {
    const missing = EXPORT_NAMES.filter((name) => !(name in content));
    expect(missing).toEqual([]);
  });

  it("exports nothing else", () => {
    expect(Object.keys(content).sort()).toEqual([...EXPORT_NAMES].sort());
  });
});

describe("REVIEWED_AS_OF", () => {
  it("is an ISO date", () => {
    expect(REVIEWED_AS_OF).toMatch(ISO_DATE);
  });

  it("records the owner's pricing confirmation of 22 Sep 2026", () => {
    expect(REVIEWED_AS_OF).toBe("2026-09-22");
  });
});

describe("PRICING shape", () => {
  it("holds the three tiers in scope order", () => {
    expect(Object.keys(PRICING)).toEqual(TIER_IDS);
  });

  it("carries a numeric founding and standard value in both currencies", () => {
    const offenders = TIER_IDS.filter((id) =>
      ["founding", "standard"].some((ladder) =>
        CURRENCIES.some(
          (currency) => typeof PRICING[id][ladder][currency] !== "number",
        ),
      ),
    );
    expect(offenders).toEqual([]);
  });

  it("opens every tier at its founding price", () => {
    const flags = TIER_IDS.map((id) => PRICING[id].foundingOpen);
    expect(flags).toEqual([true, true, true]);
  });

  // Section 4.2.1: the tier with the Article 77 exposure and the largest
  // budget must not sit at par with the narrower piece of work.
  it("prices the operator tier above the cell tier in both ladders", () => {
    expect(PRICING.operator.founding.EUR).toBeGreaterThan(
      PRICING.cell.founding.EUR,
    );
    expect(PRICING.operator.standard.EUR).toBeGreaterThan(
      PRICING.cell.standard.EUR,
    );
  });
});

describe("the twelve owner-confirmed figures", () => {
  it("prices the component tier", () => {
    expect(PRICING.component.founding).toEqual({ SGD: 4500, EUR: 3000 });
    expect(PRICING.component.standard).toEqual({ SGD: 7500, EUR: 5000 });
  });

  it("prices the cell tier", () => {
    expect(PRICING.cell.founding).toEqual({ SGD: 7500, EUR: 5000 });
    expect(PRICING.cell.standard).toEqual({ SGD: 15000, EUR: 10000 });
  });

  it("prices the operator tier", () => {
    expect(PRICING.operator.founding).toEqual({ SGD: 15000, EUR: 10000 });
    expect(PRICING.operator.standard).toEqual({ SGD: 25000, EUR: 16000 });
  });
});

describe("formatPrice", () => {
  it("groups thousands with an ASCII comma", () => {
    expect(formatPrice(4500)).toBe("4,500");
    expect(formatPrice(15000)).toBe("15,000");
    expect(formatPrice(1000000)).toBe("1,000,000");
  });

  it("leaves a sub-thousand figure ungrouped", () => {
    expect(formatPrice(500)).toBe("500");
  });

  // A de-DE runtime under `toLocaleString` would emit "4.500", which is the
  // failure this assertion exists to catch.
  it("never uses a period as the group separator", () => {
    const rendered = TIER_IDS.map((id) =>
      formatPrice(PRICING[id].standard.EUR),
    );
    const offenders = rendered.filter((value) => value.includes("."));
    expect(offenders).toEqual([]);
  });

  it("emits digits and commas only, with no symbol and no currency code", () => {
    expect(formatPrice(15000)).toMatch(/^[\d,]+$/);
  });
});

describe("current price selector", () => {
  it("returns the founding value for every tier and currency while open", () => {
    const offenders = TIER_IDS.flatMap((id) =>
      CURRENCIES.filter(
        (currency) =>
          getCurrentPrice(id, currency) !== PRICING[id].founding[currency],
      ).map((currency) => `${id}.${currency}`),
    );
    expect(offenders).toEqual([]);
  });

  it("returns the standard value for every tier and currency once closed", () => {
    const offenders = TIER_IDS.flatMap((id) =>
      CURRENCIES.filter(
        (currency) =>
          computeCurrentPrice(
            { ...PRICING[id], foundingOpen: false },
            currency,
          ) !== PRICING[id].standard[currency],
      ).map((currency) => `${id}.${currency}`),
    );
    expect(offenders).toEqual([]);
  });

  it("reads an injected pricing model without touching the export", () => {
    expect(getCurrentPrice("cell", "EUR", CLOSED_PRICING)).toBe(
      PRICING.cell.standard.EUR,
    );
    expect(TIER_IDS.map((id) => PRICING[id].foundingOpen)).toEqual([
      true,
      true,
      true,
    ]);
  });

  it("returns undefined for a tier that does not exist", () => {
    expect(getCurrentPrice("pack", "EUR")).toBeUndefined();
  });
});

describe("getPassportDateLabel", () => {
  const entry = REGULATORY_DATES.find((item) => item.id === "battery-passport");
  const [year, month] = entry.date.split("-");
  // Derived from the imported single source, not restated, so the assertion
  // stays true if the regulation's date ever moves.
  const expectedLabel = `${new Date(
    Date.UTC(Number(year), Number(month) - 1, 1),
  ).toLocaleString("en-US", { month: "long" })} ${year}`;

  it("renders the battery-passport entry as month and year", () => {
    expect(getPassportDateLabel()).toBe(expectedLabel);
  });

  it("resolves Panel B's date token from regulatoryDates.js", () => {
    expect(interpolate(ASSESSMENT_PANELS[1].body)).toContain(expectedLabel);
    expect(interpolate(ASSESSMENT_PANELS[1].body)).not.toContain(
      "{passportDate}",
    );
  });
});

describe("interpolate", () => {
  it("renders the founding figures while every tier is open", () => {
    const expected = costAnswer
      .replace("{component.SGD}", formatPrice(PRICING.component.founding.SGD))
      .replace("{cell.SGD}", formatPrice(PRICING.cell.founding.SGD))
      .replace("{operator.EUR}", formatPrice(PRICING.operator.founding.EUR));
    expect(interpolate(costAnswer)).toBe(expected);
  });

  // Section 8 item 9: the flag has to gate the copy both ways, and this is
  // the precondition for asserting it against the rendered page later.
  it("renders the standard figures once the tiers are closed", () => {
    const expected = costAnswer
      .replace("{component.SGD}", formatPrice(PRICING.component.standard.SGD))
      .replace("{cell.SGD}", formatPrice(PRICING.cell.standard.SGD))
      .replace("{operator.EUR}", formatPrice(PRICING.operator.standard.EUR));
    expect(interpolate(costAnswer, CLOSED_PRICING)).toBe(expected);
  });

  it("drops the founding-only figure once the tiers are closed", () => {
    expect(interpolate(costAnswer, CLOSED_PRICING)).not.toContain(
      formatPrice(PRICING.component.founding.SGD),
    );
  });

  it("resolves the panel price lines in both branches", () => {
    const open = ASSESSMENT_PANELS[0].priceLines.map((line) =>
      interpolate(line),
    );
    const closed = ASSESSMENT_PANELS[0].priceLines.map((line) =>
      interpolate(line, CLOSED_PRICING),
    );
    expect(open[0]).toContain(formatPrice(PRICING.component.founding.SGD));
    expect(closed[0]).toContain(formatPrice(PRICING.component.standard.SGD));
    expect(closed.join(" ")).not.toContain("{");
  });

  it("leaves an unknown token untouched", () => {
    expect(interpolate("From SGD {pack.SGD} for a pack.")).toBe(
      "From SGD {pack.SGD} for a pack.",
    );
  });
});

describe("no currency conversion surface", () => {
  // Section 4.2.1 rule 1 and section 3 rule 10: the two ladders are set
  // independently, so nothing here may name a conversion.
  it("exposes no FX, conversion or rate key at any depth", () => {
    const keys = [
      ...EXPORT_NAMES,
      ...collectKeys(COPY_EXPORTS),
      ...collectKeys(PRICING),
    ];
    const offenders = keys.filter((key) =>
      /fx|convert|conversion|exchange|rate/i.test(key),
    );
    expect(offenders).toEqual([]);
  });
});

describe("copy discipline", () => {
  it("uses currency codes, never symbols", () => {
    // Assembled from code points so a repo-wide grep for the symbols stays
    // clean while the assertion still matches them.
    const symbols = [0x20ac, 0xa3, 0xa5].map((code) =>
      String.fromCharCode(code),
    );
    const offenders = symbols.filter((symbol) => COPY.includes(symbol));
    expect(offenders).toEqual([]);
    expect(COPY).not.toMatch(/S\$/);
  });

  it("contains no em-dash", () => {
    expect(COPY).not.toContain(String.fromCharCode(0x2014));
  });

  it("is ASCII throughout, copy and pricing alike", () => {
    const serialized = COPY + JSON.stringify(PRICING);
    const offenders = [...serialized].filter((ch) => ch.charCodeAt(0) > 127);
    expect(offenders).toEqual([]);
  });

  // Section 4.2.1.1 rule 1. Phrase regexes rather than bare words, so
  // section 4.3's legitimate "product launches" does not false-positive.
  // `introductory` is matched as a phrase, not a bare word. The closing CTA
  // reads "Book an introductory call" (section 4.9, owner amendment
  // 2026-09-23), which is a description of the meeting and not a claim about
  // the price. The rule this guards is section 4.2.1.1 rule 1, which is about
  // pricing qualifiers, so the phrases are what it should have matched all
  // along.
  it("carries no first-client qualifier", () => {
    const terms = [
      /launch price/i,
      /launch offer/i,
      /limited offer/i,
      /limited places/i,
      /introductory (?:price|offer|rate)/i,
      /cohort/i,
      /early bird/i,
      /\bfounding\b/i,
    ];
    const offenders = terms.filter((term) => term.test(COPY));
    expect(offenders).toEqual([]);
  });

  it("carries no first-client qualifier in either rendered branch", () => {
    const rendered = [
      interpolate(costAnswer),
      interpolate(costAnswer, CLOSED_PRICING),
    ].join(" ");
    expect(rendered).not.toMatch(/\bfounding\b|introductory|launch price/i);
  });

  // A blanket 4-digit sweep would fail on fenced copy that legitimately says
  // "MS 2818" and "CX-0160" in section 4.8. The
  // invariant that matters is narrower: no figure from `PRICING` is typed
  // into copy, in either its raw or its grouped form.
  it("types no price figure into copy", () => {
    const figures = Object.values(PRICING).flatMap((tier) =>
      [
        ...Object.values(tier.founding),
        ...Object.values(tier.standard),
      ].flatMap((value) => [String(value), formatPrice(value)]),
    );
    const offenders = [...new Set(figures)].filter((figure) =>
      COPY.includes(figure),
    );
    expect(offenders).toEqual([]);
  });

  it("uses no grouped-thousands figure anywhere in copy", () => {
    expect(COPY).not.toMatch(/\d{1,3},\d{3}/);
  });

  it("types no ISO date into copy", () => {
    expect(COPY).not.toMatch(/\d{4}-\d{2}-\d{2}/);
  });

  // Section 3 rule 7, inherited from pivot-4 section 1: the hosting claim has
  // one permitted phrasing, and "certified", "TISAX" and "compliant servers"
  // are barred. Restating the literal is deliberate here, unlike ordinary
  // copy, because the exact wording is what the claim rule fixes.
  it("states the hosting claim in its permitted phrasing only", () => {
    expect(ASSESSMENT_NEXT_STEPS.body).toContain("EU-hosted, operated by Ichnos");
    expect(ASSESSMENT_NEXT_STEPS.body).not.toContain("EU servers operated by us");
  });
});

describe("price and date tokens sit where the panels need them", () => {
  it("gives Panel A both SGD tokens", () => {
    const lines = ASSESSMENT_PANELS[0].priceLines.join(" ");
    expect(lines).toContain("{component.SGD}");
    expect(lines).toContain("{cell.SGD}");
  });

  it("gives Panel B the operator EUR token and the passport date", () => {
    expect(ASSESSMENT_PANELS[1].priceLines.join(" ")).toContain(
      "{operator.EUR}",
    );
    expect(ASSESSMENT_PANELS[1].body).toContain("{passportDate}");
  });

  it("shows one currency per panel", () => {
    expect(ASSESSMENT_PANELS[0].priceLines.join(" ")).not.toContain("EUR");
    expect(ASSESSMENT_PANELS[1].priceLines.join(" ")).not.toContain("SGD");
  });

  it("gives the cost answer all three tokens", () => {
    expect(costAnswer).toContain("{component.SGD}");
    expect(costAnswer).toContain("{cell.SGD}");
    expect(costAnswer).toContain("{operator.EUR}");
  });

  it("keeps every price out of the hero", () => {
    expect(JSON.stringify(ASSESSMENT_HERO)).not.toMatch(/\{[a-z]+\.[A-Z]{3}\}/);
  });
});

describe("collection shapes", () => {
  it("holds two audience panels in source order A then B", () => {
    expect(ASSESSMENT_PANELS.map((panel) => panel.id)).toEqual([
      "supplier",
      "operator",
    ]);
  });

  it("holds four deliverables with unique ids", () => {
    const ids = ASSESSMENT_DELIVERABLES.items.map((item) => item.id);
    expect(ids).toHaveLength(4);
    expect(new Set(ids).size).toBe(4);
  });

  it("holds three process steps with a week label each", () => {
    expect(ASSESSMENT_PROCESS.steps).toHaveLength(3);
    const offenders = ASSESSMENT_PROCESS.steps.filter(
      (step) => !isNonEmptyString(step.week) || !isNonEmptyString(step.title),
    ).map((step) => step.id);
    expect(offenders).toEqual([]);
  });

  it("holds four input lines and four scope-boundary lines", () => {
    expect(ASSESSMENT_INPUTS.lines).toHaveLength(4);
    expect(ASSESSMENT_SCOPE_BOUNDARY.lines).toHaveLength(4);
    expect(isNonEmptyString(ASSESSMENT_SCOPE_BOUNDARY.heading)).toBe(true);
    const offenders = [
      ...ASSESSMENT_INPUTS.lines,
      ...ASSESSMENT_SCOPE_BOUNDARY.lines,
    ].filter((line) => !isNonEmptyString(line));
    expect(offenders).toEqual([]);
  });

  it("holds five FAQ entries with unique ids and a non-empty answer each", () => {
    const ids = ASSESSMENT_FAQ.entries.map((entry) => entry.id);
    expect(ids).toHaveLength(5);
    expect(new Set(ids).size).toBe(5);
    const offenders = ASSESSMENT_FAQ.entries.filter(
      (entry) =>
        !isNonEmptyString(entry.question) || !isNonEmptyString(entry.answer),
    ).map((entry) => entry.id);
    expect(offenders).toEqual([]);
  });

  it("carries the hero, next-steps and CTA labels without hrefs", () => {
    expect(isNonEmptyString(ASSESSMENT_HERO.ctaLabel)).toBe(true);
    expect(isNonEmptyString(ASSESSMENT_NEXT_STEPS.linkLabel)).toBe(true);
    expect(isNonEmptyString(ASSESSMENT_CTA_BAND.midCtaLabel)).toBe(true);
    expect(isNonEmptyString(ASSESSMENT_CTA_BAND.finalCtaLabel)).toBe(true);
    expect(isNonEmptyString(ASSESSMENT_CTA_BAND.fallbackLabel)).toBe(true);
    expect(COPY).not.toMatch(/https?:\/\//);
  });

  // Section 4.9, owner amendment 2026-09-23: the mid band keeps a headline,
  // the final band is a button alone. A headline on the final band would put
  // the deleted "Thirty minutes is enough" hedge back by another name.
  it("carries a mid-band headline and no final-band headline", () => {
    expect(isNonEmptyString(ASSESSMENT_CTA_BAND.midHeadline)).toBe(true);
    expect(ASSESSMENT_CTA_BAND.headline).toBeUndefined();
    expect(ASSESSMENT_CTA_BAND.finalHeadline).toBeUndefined();
  });

  it("carries the audience heading and body", () => {
    const offenders = ["heading", "body"].filter(
      (key) => !isNonEmptyString(ASSESSMENT_AUDIENCE[key]),
    );
    expect(offenders).toEqual([]);
  });

  it("carries the window heading, body and closing line", () => {
    const offenders = ["heading", "body", "closing"].filter(
      (key) => !isNonEmptyString(ASSESSMENT_WINDOW[key]),
    );
    expect(offenders).toEqual([]);
  });
});
