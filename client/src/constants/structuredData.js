// JSON-LD structured data for search engines (Schema.org).
// Each page renders one or more of these schemas inside a <script type="application/ld+json">
// tag injected via react-helmet-async. The Organization schema is global; per-page
// schemas (Person, Service, etc.) attach where they make sense.
//
// Reference: https://schema.org/

import { SEO_BASE_URL, SEO_SITE_NAME } from "./seoMeta";

const LOGO_URL = `${SEO_BASE_URL}/logo-dark.png`;

export const ORGANIZATION_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SEO_SITE_NAME,
  legalName: "Ichnos Protocol Pte. Ltd.",
  url: SEO_BASE_URL,
  logo: LOGO_URL,
  email: "francesco@ichnos-protocol.com",
  description:
    "Catena-X-compatible carbon, provenance, composition (and quality) data for ASEAN-made battery materials, cells, and modules — passport-ready for EU importers. Battery-systems advisory and Catena-X onboarding for ASEAN. Kuala Lumpur · Singapore · Europe.",
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

export const SERVICE_SCHEMAS = [
  service(
    "Material, electrode, cell, module & pack data — Catena-X-compatible",
    "Source-level data across the ASEAN chain (materials, precursors, electrodes, cells, modules): chemistry, composition by mass percentage of cobalt, lithium, nickel, lead, manufacturer identity under ISO/IEC 15459, manufacturing site, and batch. The Annex XIII data set, delivered via Eclipse Dataspace Connector (EDC) into your passport stack.",
  ),
  service(
    "Site-level carbon footprint data — EU-methodology-compliant",
    "Per-model, per-site, per-batch carbon footprint on the actual site grid mix, real process energy, and raw-materials transport, calculated under the EU's harmonised rules for EV batteries (Article 7 / Annex II, JRC CFB-EV).",
  ),
  service(
    "Due-diligence and ESG data — OECD- and CSDDD-aligned",
    "On-site-verified indicators on labour, environmental management, and provenance traceability of cobalt, lithium, natural graphite, and nickel. Ties to Articles 47–53 / Annex XIV under EU 2023/1542 and to the CSDDD (EU 2024/1760).",
  ),
  service(
    "Optional quality data",
    "Incoming-quality and supplier-quality indicators captured at source alongside the passport data, where the EU importer or OEM wants more than the regulatory minimum.",
  ),
  service(
    "Catena-X consulting (ASEAN onboarding)",
    "Guiding ASEAN manufacturers and their European partners through Catena-X: data readiness, onboarding steps, business cases, use-case and Tractus-X implementation, bilateral data relationships, and the regulatory requirements behind it all.",
  ),
  service(
    "Supplier diligence and qualification (ASEAN)",
    "On-the-ground site visits, qualification reports, process reviews, and qualification-test witnessing across Indonesia, Malaysia, Thailand, and Vietnam.",
  ),
  service(
    "Regulatory readiness and supply-chain liaison",
    "EU 2023/1542, MS 2818, TKDN, and ASEAN certification briefings; liaison with MARii, SIRIM, BKPM, KEMENPERIN; quarterly briefings and on-call retainer.",
  ),
  service(
    "System architecture, project management, and expert witness",
    "Battery-systems engineering from the FEV practice — architecture, BMS, cybersecurity, second-life; named subcontractor and expert witness for EU–ASEAN battery transactions.",
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
  data: [
    ORGANIZATION_SCHEMA,
    breadcrumb([
      { name: "Home", path: "/" },
      { name: "Data", path: "/data" },
    ]),
  ],
  catenaX: [
    ORGANIZATION_SCHEMA,
    breadcrumb([
      { name: "Home", path: "/" },
      { name: "Catena-X", path: "/catena-x" },
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
