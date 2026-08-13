// JSON-LD structured data for search engines (Schema.org).
// Each page renders one or more of these schemas inside a <script type="application/ld+json">
// tag injected via react-helmet-async. The Organization schema is global; per-page
// schemas (Person, Service, etc.) attach where they make sense.
//
// Reference: https://schema.org/

import { SEO_BASE_URL, SEO_SITE_NAME } from "./seoMeta";
import { COMPANY_INFO } from "./companyInfo";
import {
  CATENA_X_EXPERT_GROUP_NOTE,
  CATENA_X_MEMBERSHIP_NOTE,
  getCatenaXFullTitle,
} from "./catenaXStatus";

const LOGO_URL = `${SEO_BASE_URL}/brand/ichnos_mark_dualtone.svg`;

export const ORGANIZATION_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SEO_SITE_NAME,
  legalName: "Ichnos Protocol Pte. Ltd.",
  url: SEO_BASE_URL,
  logo: LOGO_URL,
  email: "francesco@ichnos-protocol.com",
  // Per §12-Q1-B, the formal registration wording (CATENA_X_MEMBERSHIP_NOTE) lives
  // on this machine-readable corporate surface; the credential card carries marketing
  // copy instead. The constant is interpolated verbatim — its value is not edited here
  // (§12.1 exempts it) — and takes no closing period, since it ends with "e.V.".
  // The opening sentence is the single-sourced positioning line (companyInfo.js).
  description: `${COMPANY_INFO.tagline} Ichnos Protocol brings ASEAN battery manufacturers into the European data flow so EU importers and customers receive a compliant, traceable battery passport. ${getCatenaXFullTitle()} and ${CATENA_X_EXPERT_GROUP_NOTE}. ${CATENA_X_MEMBERSHIP_NOTE}`,
  address: {
    "@type": "PostalAddress",
    streetAddress: "160 Robinson Road, #14-04 Singapore Business Federation Centre",
    addressLocality: "Singapore",
    postalCode: "068914",
    addressCountry: "SG",
  },
  identifier: { "@type": "PropertyValue", name: "UEN", value: "202606052196" },
  sameAs: [
    "https://www.linkedin.com/company/ichnos-protocol/",
    "https://www.linkedin.com/in/maltonif/",
  ],
  founder: [
    { "@type": "Person", name: "Francesco Maltoni" },
    { "@type": "Person", name: "Ihsan Ahmad" },
  ],
  areaServed: ["EU", "ID", "MY", "SG"],
  knowsAbout: [
    "Battery Passport",
    "EU Battery Regulation 2023/1542",
    "Catena-X",
    "Battery Carbon Footprint",
    "Supply-Chain Due Diligence",
    "Malaysian Standard MS 2818",
  ],
};

export const WEBSITE_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SEO_SITE_NAME,
  url: SEO_BASE_URL,
  inLanguage: "en",
};

export const FOUNDER_PERSON_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Dr.-Ing. Francesco Maltoni",
  jobTitle: "Founder",
  description: `Ex-FEV lead battery expert in battery-system engineering, working to bring ASEAN battery manufacturers into the Catena-X data space alongside their European importer customers. ${getCatenaXFullTitle()}.`,
  worksFor: { "@type": "Organization", name: SEO_SITE_NAME, url: SEO_BASE_URL },
  alumniOf: [
    { "@type": "CollegeOrUniversity", name: "RWTH Aachen University" },
    { "@type": "CollegeOrUniversity", name: "Università di Bologna" },
  ],
  knowsAbout: [
    "Battery Systems Engineering",
    "Battery Safety",
    "Battery Mechanical Development",
    "Battery Remanufacturing",
    "Circular Economy",
    "EU Battery Regulation 2023/1542",
    "Battery Passport (DIN DKE SPEC 99100)",
    "Malaysian Standard MS 2818",
    "Catena-X",
    "ASEAN Catena-X Onboarding",
  ],
  sameAs: ["https://www.linkedin.com/in/maltonif/"],
};

export const COFOUNDER_PERSON_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Ihsan Ahmad",
  jobTitle: "Co-Founder",
  worksFor: { "@type": "Organization", name: SEO_SITE_NAME, url: SEO_BASE_URL },
  alumniOf: [
    { "@type": "CollegeOrUniversity", name: "Karlsruhe Institute of Technology" },
    { "@type": "CollegeOrUniversity", name: "Universität Mannheim" },
  ],
  knowsAbout: [
    "AI Integration",
    "Quantitative Modelling",
    "Notified-Body Coordination",
  ],
};

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

function breadcrumb(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${SEO_BASE_URL}${item.path}`,
    })),
  };
}

// Page-keyed schema bundles. Each page renders the array of schemas for its key.
export const PAGE_STRUCTURED_DATA = {
  landing: [ORGANIZATION_SCHEMA, WEBSITE_SCHEMA],
  services: [
    ORGANIZATION_SCHEMA,
    breadcrumb([
      { name: "Home", path: "/" },
      { name: "Services", path: "/services" },
    ]),
    ...SERVICE_SCHEMAS,
  ],
  team: [
    ORGANIZATION_SCHEMA,
    breadcrumb([
      { name: "Home", path: "/" },
      { name: "Team", path: "/team" },
    ]),
    FOUNDER_PERSON_SCHEMA,
    COFOUNDER_PERSON_SCHEMA,
  ],
  passport: [
    ORGANIZATION_SCHEMA,
    breadcrumb([
      { name: "Home", path: "/" },
      { name: "Battery Passport", path: "/passport" },
    ]),
  ],
  contact: [
    ORGANIZATION_SCHEMA,
    breadcrumb([
      { name: "Home", path: "/" },
      { name: "Contact", path: "/contact" },
    ]),
  ],
  privacy: [ORGANIZATION_SCHEMA],
};
