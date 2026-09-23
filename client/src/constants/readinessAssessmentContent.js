/*
 * Fenced copy and pricing for the battery passport data readiness assessment
 * page. Source: `docs/website_readiness_assessment_page.md` section 4. Copy
 * may be rendered, reordered or split across elements, but it MUST NOT be
 * rewritten here without a recorded amendment to that specification.
 *
 * No figure and no date is ever typed into copy: prices reach a surface only
 * through the current-price selector below, the passport date only through
 * `regulatoryDates.js`, and both only via `interpolate()`. ASCII only, in
 * copy and in comments; currencies render as the codes SGD and EUR, never as
 * symbols (section 4.2.1 rule 3).
 */

import { REGULATORY_DATES } from "./regulatoryDates";

// Date the two price ladders were last reviewed against each other. Section 8
// item 20: re-check whenever EUR/SGD moves materially and update this.
export const REVIEWED_AS_OF = "2026-09-22";

// Independently set list prices, never conversions: no FX call, no computed
// equivalent, no "approximately" display (section 4.2.1 rule 1). Each tier
// carries its own `foundingOpen` flag and flips alone, as a one line change.
export const PRICING = {
  component: { founding: { SGD: 4500, EUR: 3000 }, standard: { SGD: 7500, EUR: 5000 }, foundingOpen: true },
  cell: { founding: { SGD: 7500, EUR: 5000 }, standard: { SGD: 15000, EUR: 10000 }, foundingOpen: true },
  operator: { founding: { SGD: 15000, EUR: 10000 }, standard: { SGD: 25000, EUR: 16000 }, foundingOpen: true },
};

// Thousands grouping by hand rather than `toLocaleString`: a de-DE runtime
// would emit "4.500" and the rendered figure would stop matching `PRICING`.
// Digits only. The copy around it carries the currency code.
export function formatPrice(amount) {
  return String(amount).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Takes an explicit tier object, so both branches are testable without
// mutating the export.
export function computeCurrentPrice(tier, currency) {
  return tier.foundingOpen ? tier.founding[currency] : tier.standard[currency];
}

// The selector every consumer reads. `pricing` is injectable so tests and
// later consumers can exercise the closed branch against a fixture.
export function getCurrentPrice(tierId, currency, pricing = PRICING) {
  const tier = pricing[tierId];
  return tier ? computeCurrentPrice(tier, currency) : undefined;
}

// One string rather than a twelve-entry array purely for length, and no
// locale API for the same reason as `formatPrice`.
const MONTHS =
  "January February March April May June July August September October November December".split(" ");

// The passport date as month and year, read from the single source in
// `regulatoryDates.js`. No date literal lives in this file.
export function getPassportDateLabel() {
  const entry = REGULATORY_DATES.find((item) => item.id === "battery-passport");
  const [year, month] = entry.date.split("-");
  return `${MONTHS[Number(month) - 1]} ${year}`;
}

const PRICE_TOKEN = /\{([a-z]+)\.([A-Z]{3})\}/g;

// Resolves `{tier.CURRENCY}` and `{passportDate}` in any fenced string.
// Unknown tokens are left exactly as they are.
export function interpolate(template, pricing = PRICING) {
  return template
    .replace(/\{passportDate\}/g, getPassportDateLabel())
    .replace(PRICE_TOKEN, (token, tierId, currency) => {
      const price = getCurrentPrice(tierId, currency, pricing);
      return price === undefined ? token : formatPrice(price);
    });
}

// Section 4.1. No price in the hero (section 4.2.1 rule 5). `ctaLabel` is a
// label only; the booking href comes from `companyInfo.js` at the call site.
export const ASSESSMENT_HERO = {
  headline: "Assess your readiness for the EU battery passport",
  subhead: "What data your customers will require from you, how it maps to the appropriate data models for your products and processes, where your systems fall short today, and what to do about it.",
  meta: "Results in three weeks from kickoff. Remote, with one optional site visit.",
  ctaLabel: "Book a 30-minute scoping call",
};

// Section 7.1: the summary the meta description and the Service JSON-LD
// share word for word. Both import it, so the two surfaces cannot drift.
export const ASSESSMENT_SEO_SUMMARY = "A three week, fixed scope assessment mapping the EU battery passport data your customers will require against the data your systems hold today, with a gap analysis and a sequenced remediation plan.";

// Sections 4.2 and 4.2.1, in the normative source order A then B. Neither
// panel is styled as recommended. Each panel shows one currency only (section
// 4.2.1 rule 4), and the fenced copy holds placeholders, never figures.
export const ASSESSMENT_PANELS = [
  {
    id: "supplier",
    eyebrow: "Your customer is asking",
    title: "You supply cells, electrodes or materials",
    body: "Your customer carries the passport obligation, not you. What they carry it with is your data: composition, carbon footprint inputs, recycled content, due diligence records, batch and lot identity. Suppliers who can answer on day one keep the business. The ones who cannot get designed out quietly, in the next sourcing round.",
    priceLines: [
      "From SGD {component.SGD} for a single component family.",
      "From SGD {cell.SGD} for a cell or a pack, including the suppliers behind it.",
    ],
  },
  {
    id: "operator",
    eyebrow: "The obligation is yours",
    title: "You place batteries on the EU market",
    body: "From {passportDate} every industrial, EV and LMT battery placed on the EU market carries a passport, and the economic operator answers for it. Most of the data it needs originates upstream, in companies you do not control. The assessment tells you which of those data points you can actually obtain, and which are structurally missing today.",
    priceLines: ["From EUR {operator.EUR} for a reference product, the supplier tiers behind it, and the data requests your customers are already sending you."],
  },
];

// Section 4.2.2, rewritten by owner amendment 2026-09-23. The fenced copy
// states no date, so it carries no token: it speaks to the passport
// obligation in prose and stays true without one. It must never gain a due
// diligence or carbon-footprint deadline.
//
// The v1.0 copy was time-relative ("the fourth quarter", "the new year",
// "the last quarter"), so it went false on a calendar it could not see. The
// closing line is now evergreen: it states a consequence of starting later,
// not a claim about which quarter it is.
export const ASSESSMENT_WINDOW = {
  heading: "Suppliers must be data ready well in advance of the mandated passport date",
  body: "By the time the EU battery passport is mandatory, every supplier must already have provided the data for the batteries entering the EU market. Data from all suppliers is aggregated into the passport of a finished battery.",
  closing: "Starting later leaves your customer with the obligation to fill the gaps, in ways which might not pass an audit.",
};

// Section 4.2.0, added by owner amendment 2026-09-23. Frames the two panels
// below as a routing device: without it the reader has to infer that the
// cards are a self-sort. Names both parties and says the work differs, which
// is what makes the price difference legible one section later.
export const ASSESSMENT_AUDIENCE = {
  heading: "To whom this assessment applies",
  body: "The passport obligation sits with the economic operator who places the battery on the EU market, and the data come from its value chain. Ichnos works with both, ideally along the same value chain.",
};

// Section 4.3. No deliverable states a count of data points: the published
// counts differ by source and still move. Do not add one.
export const ASSESSMENT_DELIVERABLES = {
  heading: "Scope of the assessment",
  items: [
  { id: "data-point-register", title: "Data point register", body: "Every data point the passport requires for your product category, mapped to the system, department or supplier that holds it today. The ones nobody holds are marked as such." },
  { id: "gap-analysis", title: "Gap analysis with severity", body: "Each missing or unusable data point rated by what it blocks: passport issuance, a customer's footprint calculation, a due diligence answer, or nothing yet. The report says which gaps to close first and which can wait." },
  { id: "supplier-data-map", title: "Supplier data map", body: "For each gap that originates outside your company, which tier it sits in, which of your suppliers holds it, and what to ask them for. Written as a request you can forward." },
  { id: "remediation-plan", title: "Sequenced remediation plan", body: "What to fix in-house, what to ask suppliers for, what needs a system change, and what can wait, ordered against your own product launches. Effort and owner per item, with no vendor lock-in assumed." },
  ],
};

// Section 4.4. `week` is the display label.
export const ASSESSMENT_PROCESS = {
  heading: "Timeline",
  steps: [
  { id: "intake", week: "Week 1", title: "Intake and scoping", body: "One workshop with your quality, IT and procurement leads. We take your product structure, your existing data systems, and one real product as the reference case." },
  { id: "mapping", week: "Week 2", title: "Mapping and gap analysis", body: "We map the reference product against the regulation's data requirements and the published data models the European supply chain is converging on, and interview your systems owners wherever the data is ambiguous." },
  { id: "report", week: "Week 3", title: "Report and walkthrough", body: "You get the written report and a two-hour walkthrough with your team, including the supplier requests you can send the following week." },
  ],
};

// Section 4.5. The last line answers the IP objection before the call.
export const ASSESSMENT_INPUTS = {
  heading: "Prerequisites",
  lines: [
  "One named owner, and roughly three days of their time across the three weeks.",
  "One reference product, ideally the one with your highest EU exposure.",
  "Read access to the systems holding your production and quality data, or a structured export.",
  "Your bill of materials at the level you already maintain it. We do not need recipes, formulations or anything you treat as a trade secret.",
  ],
};

// Section 4.5.1. The path is named, never priced. `linkLabel` is a label
// only; the target is wired from the route constant at the call site.
export const ASSESSMENT_NEXT_STEPS = {
  heading: "What usually follows",
  body: "The report is designed to be useful on its own, including to a team that takes it and acts without us. Where clients continue, it is usually one of three ways: closing the data gaps with your own systems team and your suppliers, standing up the exchange infrastructure so your customers can pull what they need, or running that infrastructure as a hosted service: EU-hosted, operated by Ichnos. Which of those makes sense is a conclusion of the assessment, not a precondition for it.",
  linkLabel: "See the full service list",
};

// Section 4.6. Discharges claim rules 3 and 6 in visible copy. Every line is
// load-bearing: none may be dropped or softened. The heading was added by
// owner amendment 2026-09-23 so the reader meets the boundary knowing what it
// is, rather than working it out from four sentences that each begin "It is
// not".
export const ASSESSMENT_SCOPE_BOUNDARY = {
  heading: "Disclaimer",
  lines: [
    "It is not a certification, an audit or a conformity assessment. No notified body role is implied and none is performed.",
    "It is not a life cycle assessment. Where footprint data is in scope, we prepare the data exchange so your LCA partner sets up the PCF digital twin.",
    "It is not a software purchase. The report stands on its own and names what you would need, including options that are not ours.",
    "It is not a passport. Issuing one is the work that follows, if you decide to do it.",
  ],
};

// Sections 4.7 and 4.7.1 are gone, owner decision 2026-09-23.
//
// The author paragraph was removed because every fact in it is carried by at
// least two other surfaces, and three of the four by the global footer, which
// renders on this page: Qualified Advisor, the Digital Product Passport
// expert group and the PEM RWTH Aachen / FEV background all reach the reader
// through FooterRecognitions regardless.
//
// The published-work list was removed on the same call. That one did NOT
// duplicate anything: the International Battery Summit talk, the CX-0160
// standard request, the PCF Interoperability expert group, the gap analysis
// and the component-level aspect models existed nowhere else in client/src
// and now exist nowhere on the site. Recorded because nothing in the
// toolchain will flag their absence, and putting any of them back is a fresh
// decision rather than a restoration.

// Section 4.8. Every answer must be in the initial DOM, so the consumer uses
// native details/summary and not a JavaScript accordion. The cost answer holds
// placeholders, never figures.
export const ASSESSMENT_FAQ = {
  heading: "FAQ",
  entries: [
  { id: "platform", question: "Do we need to be in Catena-X for this?", answer: "No. The assessment is about your data, not about a platform. Catena-X data models are used as the reference for how the data has to be shaped, because they are the published ones the European supply chain is converging on. If your route ends up elsewhere, MS 2818 in Malaysia or a customer's own system, the same register and the same gap analysis still apply." },
  { id: "imds", question: "Our customer says our IMDS entry is enough. Is it?", answer: "It is not. IMDS was built for end-of-life vehicles and REACH. It carries a small fraction of the passport's data points, at the wrong granularity, with no time dimension and no access tiering. The assessment shows you exactly which of your passport data points IMDS does and does not cover." },
  { id: "recipes", question: "Will you see our recipes?", answer: "No. The assessment works at lot and batch identity level, and on the properties your customers will be asked to report. Where a property would expose a formulation, it is carried behind an identifier. Which data is visible to whom is part of what the report specifies." },
  { id: "cost", question: "What does it cost, and what moves the number?", answer: "A single component family starts at SGD {component.SGD}. A cell or a pack, with the suppliers behind it, starts at SGD {cell.SGD}. For a company placing batteries on the EU market, where the assessment also covers your issuing path and the data requests coming at you from customers, it starts at EUR {operator.EUR}. The number moves with how many product families, sites and source systems are in scope, and the scoping call fixes it before you commit to anything." },
  { id: "outside-eu", question: "We are not in the EU. Does this apply to us?", answer: "The obligation sits with whoever places the battery on the EU market. If that is your customer, the data still has to come from you, and the request will arrive with a deadline attached. If you are the one placing it, the obligation is directly yours." },
  ],
};

// Section 4.9, reshaped by owner amendment 2026-09-23. Labels only: the
// booking href and the fallback target are wired at the call site.
//
// Two bands now, at the page's two highest-intent moments. The mid band
// follows the disclaimer, where the reader has the full picture and the
// boundaries have been stated; it keeps the headline and the quieter written
// fallback. The final band follows the FAQ, where the last objection has just
// been answered; it is a button alone, with no headline and no second link,
// so nothing competes with it.
//
// The v1.0 headline ("Thirty minutes is enough to tell you whether this is
// worth doing.") is deleted: it hedged, and invited the reader to conclude it
// might not be.
export const ASSESSMENT_CTA_BAND = {
  midHeadline: "Find out what the passport will require of you.",
  midCtaLabel: "Book an introductory call",
  fallbackLabel: "Or send the question in writing",
  finalCtaLabel: "Book an introductory call",
};
