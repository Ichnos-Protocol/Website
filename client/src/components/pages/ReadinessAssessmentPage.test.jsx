import { describe, it, expect } from "vitest";

import { renderWithProviders, screen, waitFor } from "../../test-utils";
import ReadinessAssessmentPage from "./ReadinessAssessmentPage";
import {
  PRICING,
  formatPrice,
  ASSESSMENT_PANELS,
  getPassportDateLabel,
} from "../../constants/readinessAssessmentContent";
import {
  CATENA_X_LABEL_ASSET,
  CATENA_X_LABEL_ASSET_NEG,
  CATENA_X_MEMBER_LABEL_ASSET,
  CATENA_X_MEMBER_LABEL_ASSET_NEG,
} from "../../constants/catenaXStatus";
import { BOOKING_URL } from "../../constants/companyInfo";
import {
  ROUTE_CONTACT,
  ROUTE_PASSPORT,
  ROUTE_READINESS_ASSESSMENT,
} from "../../constants/routes";
import {
  READINESS_ASSESSMENT_META,
  SEO_BASE_URL,
} from "../../constants/seoMeta";
import { PAGE_STRUCTURED_DATA } from "../../constants/structuredData";
import {
  YEAR_PATTERN,
  MONTH_YEAR_PATTERN,
  ISO_DATE_PATTERN,
  RELATIVE_TIME_PATTERN,
} from "../../constants/dateGuards";

/*
 * Composition guard for the assembled page: section 8 items 6, 7 and 12, and
 * claim rule 1 of section 4.2.1.1, asserted against the real hero and the
 * real panels rather than against either organism alone.
 */

// Both ladders, both currencies, derived rather than typed.
const ALL_FIGURES = Object.values(PRICING).flatMap((tier) =>
  [tier.founding, tier.standard].flatMap((ladder) =>
    Object.values(ladder).map((amount) => formatPrice(amount)),
  ),
);

const LABEL_ASSETS = [
  CATENA_X_LABEL_ASSET,
  CATENA_X_LABEL_ASSET_NEG,
  CATENA_X_MEMBER_LABEL_ASSET,
  CATENA_X_MEMBER_LABEL_ASSET_NEG,
];

// Section 4.2.1.1 rule 1: the price is the price. Nothing may frame it as a
// first-client, introductory or time-boxed number, and no struck-through
// figure may appear beside it.
//
// `introductory` is matched as a pricing phrase, not as a bare word. The
// closing CTA reads "Book an introductory call" (section 4.9, owner amendment
// 2026-09-23), which describes the meeting and says nothing about the price.
// The rule this guards is about pricing qualifiers, so the phrases are what
// it should have matched all along.
const QUALIFIER_PHRASES = [
  "introductory price",
  "introductory offer",
  "introductory rate",
  "early bird",
  "launch price",
  "launch offer",
  "limited offer",
  "limited places",
  "cohort",
  "founding",
];

// The section testids in the normative order of the specification, so the
// order test below reads the same way the page does.
const SECTION_ORDER = [
  "assessment-window",
  "assessment-audience",
  "audience-panels",
  "deliverables-grid",
  "process-steps",
  "assessment-inputs",
  "scope-boundary",
  "readiness-cta-mid",
  "assessment-next-steps",
  "assessment-faq",
  "readiness-cta-final",
];

describe("ReadinessAssessmentPage", () => {
  it("composes the breadcrumb, the hero and every section built so far", () => {
    renderWithProviders(<ReadinessAssessmentPage />);
    expect(screen.getByTestId("assessment-breadcrumb")).toBeInTheDocument();
    expect(screen.getByTestId("readiness-hero")).toBeInTheDocument();
    SECTION_ORDER.forEach((testId) => {
      expect(screen.getByTestId(testId)).toBeInTheDocument();
    });
  });

  it("places the hero before the first section", () => {
    renderWithProviders(<ReadinessAssessmentPage />);
    const hero = screen.getByTestId("readiness-hero");
    const first = screen.getByTestId(SECTION_ORDER[0]);

    expect(
      hero.compareDocumentPosition(first) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  // The framing line is only a routing device if it arrives before the cards
  // it frames. Asserted on its own rather than left to the order sweep, so a
  // failure names the relationship that broke.
  it("places the audience framing immediately before the panels", () => {
    renderWithProviders(<ReadinessAssessmentPage />);
    const framing = screen.getByTestId("assessment-audience");
    const panels = screen.getByTestId("audience-panels");

    expect(
      framing.compareDocumentPosition(panels) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  // Sections 4.7 and 4.7.1 were deleted by owner amendment 2026-09-23. The
  // assertion is kept so a later change that reinstates either one is a
  // visible decision rather than a quiet reappearance.
  it("renders no author line and no published-work list", () => {
    renderWithProviders(<ReadinessAssessmentPage />);

    expect(screen.queryByTestId("assessment-author")).toBeNull();
    expect(screen.queryByTestId("published-work")).toBeNull();
  });

  it("renders the sections in the order of the specification", () => {
    renderWithProviders(<ReadinessAssessmentPage />);
    const sections = SECTION_ORDER.map((testId) => screen.getByTestId(testId));

    sections.slice(0, -1).forEach((section, index) => {
      expect(
        section.compareDocumentPosition(sections[index + 1]) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
    });
  });

  it("keeps every price out of the hero", () => {
    renderWithProviders(<ReadinessAssessmentPage />);
    const { textContent } = screen.getByTestId("readiness-hero");

    ALL_FIGURES.forEach((figure) => {
      expect(textContent).not.toContain(figure);
    });
  });

  it("renders no Catena-X label asset and no image", () => {
    const { container } = renderWithProviders(<ReadinessAssessmentPage />);

    LABEL_ASSETS.forEach((asset) => {
      expect(container.innerHTML).not.toContain(asset);
    });
    expect(container.innerHTML).not.toContain("_cropped");
    expect(container.querySelector("img")).toBeNull();
  });

  it("uses no first-client qualifier copy and no struck-through price", () => {
    const { container } = renderWithProviders(<ReadinessAssessmentPage />);
    const text = container.textContent.toLowerCase();

    QUALIFIER_PHRASES.forEach((phrase) => {
      expect(text).not.toContain(phrase);
    });
    expect(container.querySelector("s, del")).toBeNull();
  });

  it("renders no currency symbol", () => {
    const { container } = renderWithProviders(<ReadinessAssessmentPage />);
    expect(container.textContent).not.toMatch(/[\u20AC$\u00A3\u00A5]/);
  });

  // Section 8 item 4: every booking CTA on the page books through
  // BOOKING_URL by reference, with nothing appended. Table-driven over all
  // three, because the invariant is "every one of them", not "the one this
  // file happened to name".
  it.each([
    "readiness-hero-booking",
    "readiness-cta-mid-booking",
    "readiness-cta-final-booking",
  ])("points %s at BOOKING_URL unchanged", (testId) => {
    renderWithProviders(<ReadinessAssessmentPage />);
    const href = screen.getByTestId(testId).getAttribute("href");
    const url = new URL(BOOKING_URL);

    expect(href).toBe(BOOKING_URL);
    expect(href).not.toContain("?");
    expect(url.protocol).toBe("https:");
    expect(["calendar.app.google", "calendar.google.com"]).toContain(
      url.hostname,
    );
  });

  it("gives the mid band a plain text fallback to the contact page", () => {
    renderWithProviders(<ReadinessAssessmentPage />);
    const fallback = screen.getByTestId("readiness-cta-mid-fallback");

    expect(fallback).toHaveAttribute("href", ROUTE_CONTACT);
    expect(fallback.className).not.toMatch(/\bbtn\b/);
  });

  // The closing band is a button alone (section 4.9, owner amendment
  // 2026-09-23). A headline or a second link there would put back exactly
  // what that amendment removed.
  it("gives the closing band no headline and no fallback link", () => {
    renderWithProviders(<ReadinessAssessmentPage />);
    const band = screen.getByTestId("readiness-cta-final");

    expect(screen.queryByTestId("readiness-cta-final-fallback")).toBeNull();
    expect(band.querySelector("h2")).toBeNull();
  });
});

/*
 * Section 8 item 7 in its v1.10 form: Panel B's date is the interpolated
 * `regulatoryDates.js` value, and no other regulatory date renders anywhere
 * on the page. The one scoped relaxation is a bare year inside published
 * work (notes 7 to 11).
 *
 * 1. This is the v1.9 replacement for the old item 7, which asserted that
 *    both Panel B and the section 4.2.2 window render an interpolated
 *    `regulatoryDates.js` value. The window's fenced copy contains no date
 *    and never did, so that half could not pass. Owner ruling B keeps the
 *    window dateless.
 * 2. The window is deliberately dateless (section 4.2.2, v1.9), and Panel B
 *    is therefore the page's only rendered regulatory date.
 *    `AssessmentWindow.test.jsx` already tripwires that fenced copy for a
 *    `{passportDate}` token; this block is the page-level counterpart.
 * 3. The sweep is intentionally page-wide, over the whole rendered subtree
 *    rather than over named sections, so the sections later tickets add
 *    (4.8, 4.9) are covered without amending this file. That is the half of
 *    item 7 which enforces section 3 rule 4. The only subtree it scopes out
 *    is published work, and that subtree has a sweep of its own (note 9).
 * 4. Why the single exclusion exists: `getPassportDateLabel()` is the one
 *    date that is supposed to render, so it is removed before the year and
 *    month-year sweeps. The exclusion cannot hide a regression, because the
 *    first test pins both the label's presence and its occurrence count. A
 *    duplicated passport-date literal added anywhere raises the count and
 *    fails, and any other date literal survives the strip and fails the
 *    sweeps.
 * 5. EXPECTED_DATE_TOKENS and EXPECTED_DATE_RENDERS encode section 4.2.2's
 *    "Panel B and only Panel B" as fixed numbers, and DATED_PANEL_INDEX /
 *    DATED_PANEL_ID pin which panel that is. None of the three is derived
 *    from the current fenced copy, because a guard that counts what is there
 *    and then asserts the page matches that count cannot fail when a second
 *    regulatory date is introduced. If a later ticket legitimately
 *    interpolates the passport date a second time, or moves it to another
 *    panel, raising these constants is a deliberate, reviewable act, on the
 *    same reasoning as the routes.test.js skip set.
 * 6. `factDate` is audit metadata and must never render.
 *    ASSESSMENT_PUBLISHED_WORK items carry it for the section 8 item 19
 *    review. If a sweep goes red because a `factDate` reached the DOM, that
 *    is a real defect in the rendering component: fix the component, do not
 *    weaken the assertion. Every dated `factDate` is an ISO string, so the
 *    ISO assertion of sweep (c) is now the page-level tripwire for it.
 * 7. The forward collision recorded here before T9 is resolved by the v1.10
 *    ruling. ASSESSMENT_PUBLISHED_WORK.items[0].text carries a conference
 *    year inside its fenced copy, and it renders. A bare year is permitted
 *    only inside published work, because an event year such as a
 *    conference title is permanently true and is what makes the claim
 *    checkable (section 4.7.1 rules 1 and 5). Section 3 rule 4 exists to
 *    stop a regulatory obligation date going stale. The two are opposite
 *    failure modes, so one pattern cannot serve both scopes.
 * 8. The boundary is the component subtree, resolved from the
 *    `published-work` test id, not a string exception. Section 4.7.1 rule 5
 *    and section 11 item 5 both anticipate the list growing, and a per-item
 *    exception list would have to grow with it. That is the antipattern
 *    already rejected for ALLOWED_EXCEPTIONS and in the `corpusScan.js`
 *    placement ruling. Exclusion is by text node, not by string
 *    subtraction, so identical copy elsewhere on the page is still swept.
 * 9. Sweep (c) is what keeps the exclusion honest. Without it, a stale
 *    regulatory date could render inside the one section whose credibility
 *    depends on every line being checkable, and sweep (b) would never see
 *    it. The published-work root is also asserted to exist, so a renamed
 *    test id fails loudly instead of silently emptying both scopes.
 * 10. Month-year and ISO forms stay barred everywhere, published work
 *    included. Only the bare-year form is relaxed, and only inside that
 *    subtree.
 * 11. The resulting scopes:
 *    (a) Panel B and the page: token count, sole carrier, and the rendered
 *        value equals the interpolated source.
 *    (b) The page minus the published-work subtree, passport date
 *        stripped: no bare year, no written month-year, no ISO date.
 *    (c) The published-work subtree: no written month-year, no ISO date.
 *        A bare year is permitted.
 */

const DATE_TOKEN = "{passportDate}";

function countOccurrences(haystack, needle) {
  return haystack.split(needle).length - 1;
}

// Every fenced string one panel renders, so a token that moves from the body
// into a price line is still counted.
function countPanelDateTokens(panel) {
  return [panel.body, ...panel.priceLines].reduce(
    (count, copy) => count + countOccurrences(copy, DATE_TOKEN),
    0,
  );
}

// Panel B is pinned by position and by id, not located by searching the
// fenced copy for the token. A search-based derivation follows the token
// wherever it goes: move it to Panel A and the guard moves with it, still
// green, while the page now states its one regulatory date in the wrong
// panel. Both are asserted because either alone is weak: the index catches a
// reorder, the id catches a substitution at that index.
const DATED_PANEL_INDEX = 1;
const DATED_PANEL_ID = "operator";
const DATED_PANEL = ASSESSMENT_PANELS[DATED_PANEL_INDEX];

// Fixed expectations, never counted from the current copy. Counting the
// tokens and then asserting the rendered total matches that count lets the
// guard expand itself: add a second {passportDate} anywhere in
// ASSESSMENT_PANELS and both sides move together, so the page renders two
// regulatory dates and the test still passes. One token in the source, one
// label in the DOM. Raising either is a deliberate, reviewable edit here.
const EXPECTED_DATE_TOKENS = 1;
const EXPECTED_DATE_RENDERS = 1;

// Removes every occurrence of the one date that is supposed to render. Split
// and join rather than a regex, because the label is data and there is
// nothing to escape; the separator is a space and not an empty string, so
// the removal cannot fabricate or mask a match by joining its neighbours.
function stripPassportDate(text) {
  return text.split(getPassportDateLabel()).join(" ");
}

const PAGE_TEST_ID = "readiness-assessment-page";

// A subtree's text, with every text node separated by a space. `textContent`
// concatenates sibling nodes with nothing between them, so a year that ends
// one node and a letter that starts the next read as one word ("... 2027"
// followed by "Data point register" becomes "2027Data") and the trailing
// word boundary the sweeps depend on disappears. Re-joining on the seams is
// the same precaution stripPassportDate() takes, against the same hazard: a
// match must not be masked by two strings being glued together. Text nodes
// inside `excluded`, when given, are skipped node by node (note 8).
function subtreeText(root, excluded = null) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const parts = [];

  while (walker.nextNode()) {
    if (!excluded?.contains(walker.currentNode)) {
      parts.push(walker.currentNode.nodeValue);
    }
  }
  return parts.join(" ");
}

function pageText() {
  return subtreeText(screen.getByTestId(PAGE_TEST_ID));
}

describe("ReadinessAssessmentPage regulatory dates", () => {
  it("renders the passport date only as the interpolated source value", () => {
    renderWithProviders(<ReadinessAssessmentPage />);
    // The source shape first: one token in the whole panel set, and it is
    // Panel B that carries it. If the token ever leaves Panel B or gains a
    // sibling elsewhere, this fails loudly instead of following the change.
    expect(DATED_PANEL).toBeDefined();
    expect(DATED_PANEL.id).toBe(DATED_PANEL_ID);
    expect(countPanelDateTokens(DATED_PANEL)).toBe(EXPECTED_DATE_TOKENS);
    expect(
      ASSESSMENT_PANELS.reduce(
        (total, panel) => total + countPanelDateTokens(panel),
        0,
      ),
    ).toBe(EXPECTED_DATE_TOKENS);

    const card = screen.getByTestId(`audience-panel-${DATED_PANEL.id}`);
    const text = pageText();

    expect(card).toHaveTextContent(getPassportDateLabel());
    expect(text).not.toContain(DATE_TOKEN);
    expect(countOccurrences(text, getPassportDateLabel())).toBe(
      EXPECTED_DATE_RENDERS,
    );
  });

  // One scope, page-wide. v1.10 split this in two because the published-work
  // list legitimately carried a conference year; that section was deleted by
  // owner amendment 2026-09-23, so the exclusion and its companion test went
  // with it. The sweep is now stronger than it has ever been: after the one
  // legitimate date is stripped, nothing date-shaped may render anywhere on
  // the page, including in sections added later. Relative calendar phrases
  // are swept too: a phrase such as "this year" goes stale on a calendar the
  // guard cannot see, and the date patterns never matched it.
  it("renders no year, month-year, ISO date or relative calendar phrase anywhere else", () => {
    renderWithProviders(<ReadinessAssessmentPage />);
    const text = stripPassportDate(pageText());

    expect(text).not.toMatch(YEAR_PATTERN);
    expect(text).not.toMatch(MONTH_YEAR_PATTERN);
    expect(text).not.toMatch(ISO_DATE_PATTERN);
    expect(text).not.toMatch(RELATIVE_TIME_PATTERN);
  });
});

/*
 * Head block (spec sections 7.1 and 7.2), on the PassportPage.test.jsx
 * pattern. Every expected value is imported, nothing is restated. The page
 * subtree sweeps above are unaffected: Helmet renders into document.head,
 * not into the page's own subtree.
 */

const SCHEMAS = PAGE_STRUCTURED_DATA.readinessAssessment;

function headTag(selector) {
  return document.querySelector(`${selector}[data-rh="true"]`);
}

describe("ReadinessAssessmentPage head", () => {
  beforeEach(() => {
    renderWithProviders(<ReadinessAssessmentPage />);
  });

  it("sets the document title", async () => {
    await waitFor(() => {
      expect(document.title).toBe(READINESS_ASSESSMENT_META.title);
    });
  });

  it("sets the description, canonical, og:title and og:url", async () => {
    await waitFor(() => {
      expect(headTag('meta[name="description"]')).toHaveAttribute(
        "content",
        READINESS_ASSESSMENT_META.description,
      );
      expect(headTag('link[rel="canonical"]')).toHaveAttribute(
        "href",
        READINESS_ASSESSMENT_META.canonical,
      );
      expect(headTag('meta[property="og:title"]')).toHaveAttribute(
        "content",
        READINESS_ASSESSMENT_META.og.title,
      );
      expect(headTag('meta[property="og:url"]')).toHaveAttribute(
        "content",
        READINESS_ASSESSMENT_META.og.url,
      );
    });
  });

  it("emits every schema in the readinessAssessment bundle", async () => {
    await waitFor(() => {
      const scripts = document.querySelectorAll(
        'script[type="application/ld+json"][data-rh="true"]',
      );
      expect(scripts.length).toBe(SCHEMAS.length);
      scripts.forEach((script, index) => {
        expect(JSON.parse(script.textContent)).toEqual(SCHEMAS[index]);
      });
    });
  });

  // Structured breadcrumbs must mirror the crumbs the visitor sees.
  it("matches the BreadcrumbList to the rendered breadcrumb", () => {
    const list = SCHEMAS.find((node) => node["@type"] === "BreadcrumbList");
    const [parent, current] = list.itemListElement;
    const crumbs = screen
      .getByTestId("assessment-breadcrumb")
      .querySelectorAll("li");

    expect(list.itemListElement).toHaveLength(2);
    expect([...crumbs].map((crumb) => crumb.textContent)).toEqual([
      parent.name,
      current.name,
    ]);
    expect(parent.item).toBe(`${SEO_BASE_URL}${ROUTE_PASSPORT}`);
    expect(
      screen.getByTestId("assessment-breadcrumb-parent"),
    ).toHaveAttribute("href", ROUTE_PASSPORT);
    expect(current.item).toBe(`${SEO_BASE_URL}${ROUTE_READINESS_ASSESSMENT}`);
  });
});
