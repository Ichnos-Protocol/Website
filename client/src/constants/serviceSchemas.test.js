import {
  READINESS_ASSESSMENT_SERVICE_SCHEMA,
  SERVICE_SCHEMAS,
  buildReadinessAssessmentServiceSchema,
} from "./serviceSchemas";
import { ORGANIZATION_SCHEMA } from "./structuredData";
import { SEO_BASE_URL, SEO_SITE_NAME } from "./seoMeta";
import {
  ASSESSMENT_SEO_SUMMARY,
  PRICING,
  getCurrentPrice,
} from "./readinessAssessmentContent";
import {
  CATENA_X_LABEL_ASSET,
  CATENA_X_LABEL_ASSET_NEG,
  CATENA_X_MEMBER_LABEL_ASSET,
  CATENA_X_MEMBER_LABEL_ASSET_NEG,
} from "./catenaXStatus";

/*
 * Service JSON-LD (spec sections 7.2 and 7.2.1): parity for the ten nodes
 * moved out of structuredData.js, and the offer, naming and claim rules for
 * the readiness assessment node. Every price is read through the selector.
 */

const SERVICE_NAMES = [
  "Battery Systems & Safety Engineering",
  "Battery Mechanical Development",
  "Technical Lead — Battery Systems",
  "Get connected to Catena-X",
  "Your products as digital twins",
  "Flow into the EU Battery Passport",
  "Production planning & data exchange",
  "Carbon footprint, per product",
  "EU–ASEAN Compliance Bridge",
  "Battery Remanufacturing, Recycling & Circular Economy",
];

const TIER_OFFER_NAMES = {
  component: "Component family assessment",
  cell: "Cell or pack assessment",
  operator: "Economic operator assessment",
};

const CURRENCIES = ["SGD", "EUR"];

const CLOSED_PRICING = Object.fromEntries(
  Object.entries(PRICING).map(([id, tier]) => [
    id,
    { ...tier, foundingOpen: false },
  ]),
);

const QUALIFIER = /founding|introductory|cohort|launch|limited|early bird/i;
const CLAIM_KEY =
  /hasCredential|credential|certification|accreditation|award|conformance/i;

// Every tier-and-currency pair with the price the selector returns for it.
function expectedOffers(pricing = PRICING) {
  return Object.entries(TIER_OFFER_NAMES).flatMap(([id, name]) =>
    CURRENCIES.map((currency) => ({
      name,
      currency,
      minPrice: getCurrentPrice(id, currency, pricing),
    })),
  );
}

function offerSummary(schema) {
  return schema.offers.map((offer) => ({
    name: offer.name,
    currency: offer.priceSpecification.priceCurrency,
    minPrice: offer.priceSpecification.minPrice,
  }));
}

function collectKeys(node, out = []) {
  if (node === null || typeof node !== "object") return out;
  Object.entries(node).forEach(([key, value]) => {
    out.push(key);
    collectKeys(value, out);
  });
  return out;
}

describe("SERVICE_SCHEMAS (extraction parity)", () => {
  it("keeps the ten nodes in card order", () => {
    expect(SERVICE_SCHEMAS).toHaveLength(10);
    expect(SERVICE_SCHEMAS.map((node) => node.name)).toEqual(SERVICE_NAMES);
  });

  it("keeps every node's type and areaServed unchanged", () => {
    SERVICE_SCHEMAS.forEach((node) => {
      expect(node["@type"]).toBe("Service");
      expect(node.areaServed).toEqual(["EU", "ASEAN"]);
    });
  });
});

describe("READINESS_ASSESSMENT_SERVICE_SCHEMA offers", () => {
  it("carries six offers, three tiers by SGD and EUR, at current prices", () => {
    expect(READINESS_ASSESSMENT_SERVICE_SCHEMA.offers).toHaveLength(6);
    expect(offerSummary(READINESS_ASSESSMENT_SERVICE_SCHEMA)).toEqual(
      expectedOffers(),
    );
  });

  it("wraps each price in a numeric PriceSpecification", () => {
    READINESS_ASSESSMENT_SERVICE_SCHEMA.offers.forEach((offer) => {
      expect(offer["@type"]).toBe("Offer");
      expect(offer.priceSpecification["@type"]).toBe("PriceSpecification");
      expect(typeof offer.priceSpecification.minPrice).toBe("number");
    });
  });

  it("follows the selector into the closed branch", () => {
    const before = structuredClone(PRICING);
    const closed = buildReadinessAssessmentServiceSchema(CLOSED_PRICING);

    expect(offerSummary(closed)).toEqual(expectedOffers(CLOSED_PRICING));
    expect(PRICING).toEqual(before);
  });

  it("names no offer with time-boxed or first-client wording", () => {
    READINESS_ASSESSMENT_SERVICE_SCHEMA.offers.forEach((offer) => {
      expect(offer.name).not.toMatch(QUALIFIER);
    });
  });
});

describe("READINESS_ASSESSMENT_SERVICE_SCHEMA claims and fields", () => {
  it("carries no credential, certification or conformance key", () => {
    const keys = collectKeys(READINESS_ASSESSMENT_SERVICE_SCHEMA);
    expect(keys.filter((key) => CLAIM_KEY.test(key))).toEqual([]);
  });

  it("references no Catena-X label asset", () => {
    const serialized = JSON.stringify(READINESS_ASSESSMENT_SERVICE_SCHEMA);
    [
      CATENA_X_LABEL_ASSET,
      CATENA_X_LABEL_ASSET_NEG,
      CATENA_X_MEMBER_LABEL_ASSET,
      CATENA_X_MEMBER_LABEL_ASSET_NEG,
    ].forEach((asset) => {
      expect(serialized).not.toContain(asset);
    });
  });

  it("sets the service type and the organization provider", () => {
    expect(READINESS_ASSESSMENT_SERVICE_SCHEMA.serviceType).toBe(
      "Regulatory data readiness assessment",
    );
    expect(READINESS_ASSESSMENT_SERVICE_SCHEMA.provider).toEqual({
      "@type": "Organization",
      name: SEO_SITE_NAME,
      url: SEO_BASE_URL,
    });
  });

  it("takes its description from the shared SEO summary", () => {
    expect(READINESS_ASSESSMENT_SERVICE_SCHEMA.description).toBe(
      ASSESSMENT_SEO_SUMMARY,
    );
    expect(
      buildReadinessAssessmentServiceSchema(CLOSED_PRICING).description,
    ).toBe(ASSESSMENT_SEO_SUMMARY);
  });

  it("serves a strict subset of the organization's markets", () => {
    const { areaServed } = READINESS_ASSESSMENT_SERVICE_SCHEMA;
    expect(areaServed.length).toBeGreaterThan(0);
    expect(areaServed.length).toBeLessThan(
      ORGANIZATION_SCHEMA.areaServed.length,
    );
    areaServed.forEach((market) => {
      expect(ORGANIZATION_SCHEMA.areaServed).toContain(market);
    });
  });
});
