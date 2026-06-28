// JSON-LD structured data for search engines (Schema.org).
// Each page renders one or more of these schemas inside a <script type="application/ld+json">
// tag injected via react-helmet-async. The Organization schema is global; per-page
// schemas (Person, Service, etc.) attach where they make sense.
//
// Reference: https://schema.org/

import { SEO_BASE_URL, SEO_SITE_NAME } from "./seoMeta";
import { getCatenaXFullTitle } from "./catenaXStatus";

const LOGO_URL = `${SEO_BASE_URL}/Ichnos-protocol_logo_transparent.png`;

export const ORGANIZATION_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SEO_SITE_NAME,
  legalName: "Ichnos Protocol Pte. Ltd.",
  url: SEO_BASE_URL,
  logo: LOGO_URL,
  email: "francesco@ichnos-protocol.com",
  description: `Battery advisory and EU battery-passport integration for ASEAN. Ichnos Protocol brings ASEAN battery manufacturers into the European data flow so EU importers and customers receive a compliant, traceable battery passport. ${getCatenaXFullTitle()}.`,
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

// Mirrors the pillar-grouped SERVICES_LIST in services.js (§4.2), in order.
// Each entry's name is the card title and description is the card description.
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
    "EU–ASEAN Battery Compliance Bridge",
    "Translating European battery regulation into ASEAN supply-chain reality — and vice versa. Coverage includes EU 2023/1542, Malaysian MS 2818, regional certification frameworks, and supplier alignment for OEMs operating across both regions. Practitioner-grade understanding of where regulatory text meets the factory floor.",
  ),
  service(
    "Battery Passport Integration",
    "Identifying and closing the data gaps that block ASEAN-made batteries and components from being seamlessly integrated into a EU-compliant digital battery passport. Hands-on work on data model design, supplier data collection workflows, and carbon-footprint pipelines, connected to the Catena-X data space and to the EU importer's passport stack.",
  ),
  service(
    "Strategic consulting — battery passport data infrastructure",
    "Architecting the data flows, schemas, and integration paths for European importers and ASEAN manufacturers building a Catena-X-compatible battery passport stack from the ground up. Schema design, EDC connector planning, data sovereignty model, audit-trail strategy. Standards-grounded in Catena-X CX-0143, EU 2023/1542, DIN DKE SPEC 99100, MS 2818.",
  ),
  service(
    "Catena-X supplier onboarding services",
    "Hands-on onboarding of ASEAN suppliers into Catena-X — operational delivery is being scaled up. Strategy, gap analysis, and integration architecture for the same supply chains are available today under strategic consulting.",
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
