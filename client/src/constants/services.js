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
  {
    id: "eu-asean-compliance-bridge",
    icon: "bi-globe-asia-australia",
    title: "EU–ASEAN Battery Compliance Bridge",
    tagline:
      "Translating European battery regulation into ASEAN supply-chain reality — and vice versa.",
    description:
      "Translating European battery regulation into ASEAN supply-chain reality — and vice versa. Coverage includes EU 2023/1542, Malaysian MS 2818, regional certification frameworks, and supplier alignment for OEMs operating across both regions. Practitioner-grade understanding of where regulatory text meets the factory floor.",
    pillar: "compliance",
    deliveryMethod: false,
  },
  {
    id: "battery-passport-integration",
    icon: "bi-shield-fill-check",
    title: "Battery Passport Integration",
    tagline:
      "Integration and gap-bridging across the value chain into the Catena-X EU digital battery passport.",
    description:
      "Identifying and closing the data gaps that block ASEAN-made batteries and components from being seamlessly integrated into a EU-compliant digital battery passport. Hands-on work on data model design, supplier data collection workflows, and carbon-footprint pipelines, connected to the Catena-X data space and to the EU importer's passport stack.",
    pillar: "compliance",
    deliveryMethod: false,
    passportLink: "/passport",
  },
  {
    id: "strategic-consulting-passport-data-infrastructure",
    icon: "bi-diagram-3",
    title: "Strategic consulting — battery passport data infrastructure",
    eyebrow: "Official Catena-X Qualified Advisory Provider",
    tagline:
      "Architecting the data flows, schemas, and integration paths for an EU-compliant Catena-X battery-passport stack.",
    description:
      "Architecting the data flows, schemas, and integration paths for European importers and ASEAN manufacturers building a Catena-X-compatible battery passport stack from the ground up. Schema design, EDC connector planning, data sovereignty model, audit-trail strategy. Standards-grounded in Catena-X CX-0143, EU 2023/1542, DIN DKE SPEC 99100, MS 2818.",
    pillar: "compliance",
    deliveryMethod: false,
  },
  {
    id: "catena-x-supplier-onboarding",
    icon: "bi-clock-history",
    title: "Catena-X supplier onboarding services",
    tagline:
      "Onboarding ASEAN battery manufacturers and their European partners into the Catena-X data space.",
    description:
      "Hands-on onboarding of ASEAN suppliers into Catena-X — operational delivery is being scaled up. Strategy, gap analysis, and integration architecture for the same supply chains are available today under strategic consulting.",
    pillar: "compliance",
    deliveryMethod: false,
    comingSoon: true,
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
