// JSON-LD structured data for search engines (Schema.org).
// Each page renders one or more of these schemas inside a <script type="application/ld+json">
// tag injected via react-helmet-async. The Organization schema is global; per-page
// schemas (Person, Service, etc.) attach where they make sense.
//
// Reference: https://schema.org/

import { SEO_BASE_URL, SEO_SITE_NAME } from "./seoMeta";
// Service nodes moved to serviceSchemas.js (spec section 7.2.1 split).
import {
  READINESS_ASSESSMENT_SERVICE_SCHEMA,
  SERVICE_SCHEMAS,
} from "./serviceSchemas";
import { COMPANY_INFO } from "./companyInfo";
import {
  CATENA_X_EXPERT_GROUP_NOTE,
  CATENA_X_MEMBERSHIP_NOTE,
  getCatenaXFullTitle,
} from "./catenaXStatus";
import {
  ROUTE_CONSORTIUM,
  ROUTE_CONTACT,
  ROUTE_LANDING,
  ROUTE_PASSPORT,
  ROUTE_READINESS_ASSESSMENT,
  ROUTE_SERVICES,
  ROUTE_TEAM,
} from "./routes";

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
      { name: "Home", path: ROUTE_LANDING },
      { name: "Services", path: ROUTE_SERVICES },
    ]),
    ...SERVICE_SCHEMAS,
  ],
  team: [
    ORGANIZATION_SCHEMA,
    breadcrumb([
      { name: "Home", path: ROUTE_LANDING },
      { name: "Team", path: ROUTE_TEAM },
    ]),
    FOUNDER_PERSON_SCHEMA,
  ],
  passport: [
    ORGANIZATION_SCHEMA,
    breadcrumb([
      { name: "Home", path: ROUTE_LANDING },
      { name: "Battery Passport", path: ROUTE_PASSPORT },
    ]),
  ],
  contact: [
    ORGANIZATION_SCHEMA,
    breadcrumb([
      { name: "Home", path: ROUTE_LANDING },
      { name: "Contact", path: ROUTE_CONTACT },
    ]),
  ],
  consortium: [
    ORGANIZATION_SCHEMA,
    breadcrumb([
      { name: "Home", path: ROUTE_LANDING },
      { name: "Consortium", path: ROUTE_CONSORTIUM },
    ]),
  ],
  consortiumTiers: [ORGANIZATION_SCHEMA],
  privacy: [ORGANIZATION_SCHEMA],
  // Crumb names are the visible labels in molecules/Breadcrumb.jsx, sentence
  // case, and deliberately differ from the passport bundle's "Battery
  // Passport": structured breadcrumbs mirror what the visitor sees. Two
  // crumbs, as spec section 2.4 draws them, with no redirect parent invented.
  readinessAssessment: [
    ORGANIZATION_SCHEMA,
    READINESS_ASSESSMENT_SERVICE_SCHEMA,
    breadcrumb([
      { name: "Battery passport", path: ROUTE_PASSPORT },
      { name: "Data readiness assessment", path: ROUTE_READINESS_ASSESSMENT },
    ]),
  ],
};

// Re-exported so existing consumers of SERVICE_SCHEMAS keep this module as
// their import surface after the split.
export { SERVICE_SCHEMAS };
