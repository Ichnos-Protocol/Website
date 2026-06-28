export const SERVICES_PAGE_CONTENT = {
  title: "Services & Solutions",
  subtitle:
    "Expert consulting for battery development, EU battery-passport readiness, and the circular value chain.",
};

// Services grouped into three pillars (Engineering, Compliance, Circularity).
// ID strings are stable — they are used as DOM anchors and as keys in tests;
// do not change without updating structuredData.js and any consumer test.
export const SERVICES_LIST = [
  // ── Engineering ──
  {
    id: "battery-systems-safety",
    icon: "bi-shield-check",
    title: "Battery Systems & Safety Engineering",
    tagline:
      "System architecture, requirement and test management, and full FMEA discipline.",
    description:
      "System architecture, requirement and test management, and full FMEA discipline — S-FMEA, D-FMEA, P-FMEA — across cell, module, and pack levels. Test planning, traceability, and design-review support for battery development programs that need rigorous engineering process from concept to SOP.",
    pillar: "engineering",
    deliveryMethod: false,
  },
  {
    id: "battery-mechanical-development",
    icon: "bi-tools",
    title: "Battery Mechanical Development",
    tagline:
      "Pack architecture, cell housing, thermal hardware, and design-for-manufacture.",
    description:
      "Pack and module mechanical design, cell housing, thermal hardware integration, and design-for-manufacture. Drawing on a doctorate in Production Engineering of E-Mobility Components and patents on battery modules and aluminium cell housings.",
    pillar: "engineering",
    deliveryMethod: false,
  },
  {
    id: "technical-lead-battery-systems",
    icon: "bi-person-workspace",
    title: "Technical Lead — Battery Systems",
    tagline:
      "Embedded technical leadership and agile project management for battery development programs.",
    description:
      "Embedded senior battery expertise for early-stage teams and in-house programs that need experienced direction without a full-time hire — combined with sprint cadence, requirement traceability, milestone management, and cross-functional coordination. PSM I (Professional Scrum Master™ I) certified, backed by thirteen years of cross-functional project engineering across Ducati, Technogym, and FEV — from gasoline engines and motorcycle design through electrification and vehicle battery systems.",
    pillar: "engineering",
    deliveryMethod: false,
  },
  // ── Compliance ──
  // Order per Francesco's review: Strategic Consulting first (the lead
  // Catena-X offering, includes the supplier-onboarding scope Ichnos
  // can deliver in advisory form today and as full onboarding once the
  // Catena-X qualification is granted via §0a toggle), then the
  // narrower Battery Passport Integration card, then the regulatory
  // Compliance Bridge.
  {
    id: "strategic-consulting-catena-x-battery-passport",
    icon: "bi-diagram-3",
    title: "Strategic Catena-X consulting — battery passport",
    eyebrow: "Official Catena-X Qualified Advisory Provider",
    tagline:
      "Catena-X battery-passport strategy: data architecture, schema mapping, and supplier onboarding into the data space.",
    description:
      "Strategic guidance for European importers and ASEAN manufacturers entering the Catena-X battery-passport data space. The engagement covers data-flow architecture, CX-0143 schema mapping, EDC connector planning, data sovereignty model, audit-trail strategy, and supplier onboarding into Catena-X (PCF first, then composition and due-diligence sub-models). Standards-grounded in Catena-X CX-0143, CX-0026, CX-0029, EU 2023/1542, DIN DKE SPEC 99100, and MS 2818. The lead offering on this pillar.",
    pillar: "compliance",
    deliveryMethod: false,
    lead: true,
  },
  {
    id: "battery-passport-integration",
    icon: "bi-shield-fill-check",
    title: "Battery Passport Integration",
    tagline:
      "Provisioning supplier data into the Catena-X battery passport: schema mapping, supplier ingestion, and PCF pipelines.",
    description:
      "Getting an ASEAN supplier's source data through to a compliant EU digital battery passport. Schema mapping into the Catena-X passport data model (CX-0143 sub-aspects on AAS and SAMM), supplier ingestion workflows from Excel / MES / ERP into a canonical battery data model, carbon-footprint pipelines built to CX-0026 / CX-0029 (JRC CFB-EV methodology), and exchange via Eclipse Dataspace Connector. Hands-on delivery of a working provisioning flow that the EU importer's passport stack consumes natively.",
    pillar: "compliance",
    deliveryMethod: false,
    passportLink: "/passport",
  },
  {
    id: "eu-asean-compliance-bridge",
    icon: "bi-globe-asia-australia",
    title: "EU–ASEAN Compliance Bridge",
    tagline:
      "Translating European battery regulation into ASEAN supply-chain reality and vice versa.",
    description:
      "Translating European battery regulation into ASEAN supply-chain reality and vice versa. Coverage includes EU 2023/1542, Malaysian MS 2818, regional certification frameworks, and supplier alignment for OEMs operating across both regions. Practitioner-grade understanding of where regulatory text meets the factory floor.",
    pillar: "compliance",
    deliveryMethod: false,
  },
  // ── Circularity ──
  {
    id: "remanufacturing-recycling-circular-economy",
    icon: "bi-arrow-repeat",
    title: "Battery Remanufacturing, Recycling & Circular Economy",
    tagline:
      "Second-life pathways, design for remanufacturing, design for recycling, design for cost.",
    description:
      "Second-life pathways, design for remanufacturing, design for recycling, and design for cost. PhD-level expertise in circular-economy battery systems.",
    pillar: "circularity",
    deliveryMethod: false,
  },
];

// Pillars in display order. `anchor` is the DOM id the page renders for each
// pillar section and the scroll target the footer/nav links navigate to.
export const SERVICE_PILLARS = [
  { id: "engineering", label: "Engineering", anchor: "engineering" },
  { id: "compliance", label: "Compliance", anchor: "compliance" },
  { id: "circularity", label: "Circularity", anchor: "circularity" },
];

// Returns the services belonging to a single pillar, preserving SERVICES_LIST
// order.
export function getServicesByPillar(pillarId) {
  return SERVICES_LIST.filter((service) => service.pillar === pillarId);
}
