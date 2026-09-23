// Service JSON-LD nodes (Schema.org), split out of structuredData.js.
//
// Owns the ten card-mirroring SERVICE_SCHEMAS and the readiness assessment
// Service node with its Offer children. The split exists because the
// readiness node took structuredData.js past the CLAUDE.md section 5.1 cap,
// which is the split trigger recorded in spec section 7.2.1. No source module
// other than structuredData.js imports this one: PAGE_STRUCTURED_DATA there remains
// the only surface SeoHead consumes.

import { SEO_BASE_URL, SEO_SITE_NAME } from "./seoMeta";
import {
  ASSESSMENT_SEO_SUMMARY,
  PRICING,
  getCurrentPrice,
} from "./readinessAssessmentContent";
import { ROUTE_READINESS_ASSESSMENT } from "./routes";

function service(name, description) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    description,
    provider: { "@type": "Organization", name: SEO_SITE_NAME, url: SEO_BASE_URL },
    areaServed: ["EU", "ASEAN"],
  };
}

// Mirrors the pillar-grouped SERVICES_LIST in services.js (§4.2 / §4.6),
// one-for-one in order: 10 cards, split 3 (Engineering) / 5 (Catena-X) /
// 1 (Compliance) / 1 (Circularity). Each entry's name is the card title and
// description is the card description.
export const SERVICE_SCHEMAS = [
  service(
    "Battery Systems & Safety Engineering",
    "System architecture, requirement and test management, and full FMEA discipline — S-FMEA, D-FMEA, P-FMEA — across cell, module, and pack levels. Test planning, traceability, and design-review support for battery development programs that need rigorous engineering process from concept to SOP.",
  ),
  service(
    "Battery Mechanical Development",
    "Pack and module mechanical design, cell housing, thermal hardware integration, and design-for-manufacture. Drawing on a doctorate in Production Engineering of E-Mobility Components and patents on battery modules and aluminium cell housings.",
  ),
  service(
    "Technical Lead — Battery Systems",
    "Embedded senior battery expertise for early-stage teams and in-house programs that need experienced direction without a full-time hire — combined with sprint cadence, requirement traceability, milestone management, and cross-functional coordination. PSM I (Professional Scrum Master™ I) certified, backed by thirteen years of cross-functional project engineering across Ducati, Technogym, and FEV — from gasoline engines and motorcycle design through electrification and vehicle battery systems.",
  ),
  service(
    "Get connected to Catena-X",
    'Joining the network means registering your company, getting your network ID, and setting up the secure "mailbox" your customers\' systems talk to. We handle the whole path — registration through an official onboarding provider, identity and credentials, and the connector choice that fits your size (managed service or self-hosted). No dataspace team required.',
  ),
  service(
    "Your products as digital twins",
    "Every batch and every cell you ship gets a digital twin — a structured data record your customer can look up, if you allow it. We model your products in the formats the network understands, register the twins, and connect the pipeline to what you already run: ERP, MES, or spreadsheets. We meet your data where it is.",
  ),
  service(
    "Flow into the EU Battery Passport",
    "From 18 February 2027, batteries sold in the EU carry a digital passport — and if you make materials, electrodes or cells, part of that passport is your data. We map your production data to the passport fields, validate it against the official formats, and set up the flow to your customer's passport: correct, on time, and only what you choose to share.",
  ),
  service(
    "Production planning & data exchange",
    "The same connection that feeds the passport can carry your day-to-day business data: demand forecasts and capacity requests from your customers, delivery and stock information from you — structured and automatic, instead of email chains and Excel versions. Being easy to plan with is a competitive advantage; we set it up.",
  ),
  service(
    "Carbon footprint, per product",
    "EU customers increasingly ask for a carbon footprint per product, not per company. We help you calculate product carbon footprints from your real energy and material data and exchange them in the format the network verifies.",
  ),
  service(
    "EU–ASEAN Compliance Bridge",
    "Translating European battery regulation into ASEAN supply-chain reality and vice versa. Coverage includes EU 2023/1542, Malaysian MS 2818, regional certification frameworks, and supplier alignment for OEMs operating across both regions. Practitioner-grade understanding of where regulatory text meets the factory floor.",
  ),
  service(
    "Battery Remanufacturing, Recycling & Circular Economy",
    "Second-life pathways, design for remanufacturing, design for recycling, and design for cost. PhD-level expertise in circular-economy battery systems.",
  ),
];

// Spec section 7.2: areaServed covers the ASEAN markets already listed on the
// organization. "EU" from ORGANIZATION_SCHEMA.areaServed is deliberately not
// carried, and the ["EU", "ASEAN"] shape of service() is deliberately not
// reused. ORGANIZATION_SCHEMA is not imported, because that would be a cycle
// with structuredData.js; the subset relationship is asserted in tests.
const ASEAN_MARKETS = ["ID", "MY", "SG"];

// One entry per PRICING tier. Offer names distinguish the tier and carry no
// time-boxed or first-client framing (spec section 4.2.1.1 rule 1).
const OFFER_TIERS = [
  { id: "component", name: "Component family assessment" },
  { id: "cell", name: "Cell or pack assessment" },
  { id: "operator", name: "Economic operator assessment" },
];

const OFFER_CURRENCIES = ["SGD", "EUR"];

// minPrice is the numeric current price from the selector: never formatted,
// never typed, so the markup follows the page when a tier flips.
function offer(tier, currency, pricing) {
  return {
    "@type": "Offer",
    name: tier.name,
    priceSpecification: {
      "@type": "PriceSpecification",
      minPrice: getCurrentPrice(tier.id, currency, pricing),
      priceCurrency: currency,
    },
  };
}

// The node carries no hasCredential key, no certification, accreditation or
// conformance key, and no Catena-X label claim (spec section 7.2). The
// recorded fallback, dropping to the three EUR offers, is a manual decision
// taken after rich-result testing and is not implemented here.
export function buildReadinessAssessmentServiceSchema(pricing = PRICING) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Battery passport data readiness assessment",
    description: ASSESSMENT_SEO_SUMMARY,
    serviceType: "Regulatory data readiness assessment",
    provider: { "@type": "Organization", name: SEO_SITE_NAME, url: SEO_BASE_URL },
    url: `${SEO_BASE_URL}${ROUTE_READINESS_ASSESSMENT}`,
    areaServed: ASEAN_MARKETS,
    offers: OFFER_TIERS.flatMap((tier) =>
      OFFER_CURRENCIES.map((currency) => offer(tier, currency, pricing)),
    ),
  };
}

export const READINESS_ASSESSMENT_SERVICE_SCHEMA =
  buildReadinessAssessmentServiceSchema();
