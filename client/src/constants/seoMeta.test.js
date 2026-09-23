import {
  ALL_META,
  CONSORTIUM_META,
  CONSORTIUM_TIERS_META,
  CONTACT_META,
  LANDING_META,
  PASSPORT_META,
  PRIVACY_META,
  READINESS_ASSESSMENT_META,
  SEO_BASE_URL,
  SERVICES_META,
  TEAM_META,
  buildReadinessAssessmentMeta,
} from "./seoMeta";
import {
  ASSESSMENT_SEO_SUMMARY,
  PRICING,
  formatPrice,
  getCurrentPrice,
} from "./readinessAssessmentContent";
import { ROUTE_READINESS_ASSESSMENT } from "./routes";
import { getCatenaXFounderLine } from "./catenaXStatus";

/*
 * Readiness assessment meta (spec section 7.1). The price in the description
 * is computed here through the selector, never typed, for both the open and
 * the closed founding branch.
 */

const TITLE = "Battery passport data readiness assessment | Ichnos Protocol";

const CLOSED_PRICING = Object.fromEntries(
  Object.entries(PRICING).map(([id, tier]) => [
    id,
    { ...tier, foundingOpen: false },
  ]),
);

function lowestSgd(pricing = PRICING) {
  return Math.min(
    ...Object.keys(pricing).map((id) => getCurrentPrice(id, "SGD", pricing)),
  );
}

describe("READINESS_ASSESSMENT_META (open branch)", () => {
  it("uses the section 7.1 title", () => {
    expect(READINESS_ASSESSMENT_META.title).toBe(TITLE);
  });

  it("points the canonical at the readiness assessment route", () => {
    expect(READINESS_ASSESSMENT_META.canonical).toBe(
      `${SEO_BASE_URL}${ROUTE_READINESS_ASSESSMENT}`,
    );
  });

  it("opens the description with the shared SEO summary", () => {
    expect(
      READINESS_ASSESSMENT_META.description.startsWith(
        `${ASSESSMENT_SEO_SUMMARY} From SGD `,
      ),
    ).toBe(true);
  });

  it("ends the description with the lowest current SGD price", () => {
    expect(
      READINESS_ASSESSMENT_META.description.endsWith(
        `From SGD ${formatPrice(lowestSgd())}.`,
      ),
    ).toBe(true);
  });

  it("mirrors buildMeta's og and twitter contract", () => {
    expect(READINESS_ASSESSMENT_META.og.url).toBe(
      READINESS_ASSESSMENT_META.canonical,
    );
    expect(READINESS_ASSESSMENT_META.og.title).toBe(TITLE);
    expect(READINESS_ASSESSMENT_META.twitter.title).toBe(TITLE);
    expect(READINESS_ASSESSMENT_META.twitter.description).toBe(
      READINESS_ASSESSMENT_META.description,
    );
  });
});

describe("buildReadinessAssessmentMeta (closed branch)", () => {
  it("carries the lowest standard SGD price once founding closes", () => {
    const closed = buildReadinessAssessmentMeta(CLOSED_PRICING);
    expect(
      closed.description.endsWith(
        `From SGD ${formatPrice(lowestSgd(CLOSED_PRICING))}.`,
      ),
    ).toBe(true);
    expect(closed.description).not.toBe(READINESS_ASSESSMENT_META.description);
    expect(closed.description.startsWith(ASSESSMENT_SEO_SUMMARY)).toBe(true);
  });

  it("leaves PRICING unmutated", () => {
    const before = structuredClone(PRICING);
    buildReadinessAssessmentMeta();
    buildReadinessAssessmentMeta(CLOSED_PRICING);
    expect(PRICING).toEqual(before);
  });
});

describe("ALL_META", () => {
  it("includes the readiness assessment entry alongside every other page", () => {
    expect(ALL_META).toEqual([
      LANDING_META,
      SERVICES_META,
      TEAM_META,
      PASSPORT_META,
      READINESS_ASSESSMENT_META,
      CONTACT_META,
      CONSORTIUM_META,
      CONSORTIUM_TIERS_META,
      PRIVACY_META,
    ]);
  });
});

// september-fixes P7: the default Open Graph alt attributes the Qualified
// Advisor title to the founder. DEFAULT_OG_IMAGE_ALT is module-private, so
// the assertion goes through an exported meta that falls back to it.
describe("default Open Graph image alt", () => {
  it("carries the founder line on LANDING_META", () => {
    expect(LANDING_META.og.imageAlt).toContain(getCatenaXFounderLine());
    expect(LANDING_META.twitter.imageAlt).toContain(getCatenaXFounderLine());
  });
});
