export const SERVICES_PAGE_CONTENT = {
  title: "Services and Solutions",
  subtitle:
    "Expert consulting for battery development, EU battery-passport readiness, and the circular value chain.",
};

// Services grouped into four pillars (Engineering, Catena-X, Compliance,
// Circularity).
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
  // ── Catena-X (SME-facing storefront cards, copy per docs §3.2 verbatim;
  //    official terms live only in the microlines, linked to official pages) ──
  {
    id: "catenax-get-connected",
    icon: "bi-diagram-3",
    title: "Get connected to Catena-X",
    description:
      'Joining the network means registering your company, getting your network ID, and setting up the secure "mailbox" your customers\' systems talk to. We handle the whole path — registration through an official onboarding provider, identity and credentials, and the connector choice that fits your size (managed service or self-hosted). No dataspace team required.',
    pillar: "catena-x",
    passportLink: "/passport",
    microline: [
      {
        text: "onboarding via an Onboarding Service Provider (OSP)",
        href: "https://catena-x.net",
      },
      { text: "Business Partner Number (BPN)" },
      {
        text: "Eclipse Dataspace Connector (EDC)",
        href: "https://eclipse-tractusx.github.io/docs-kits/kits/connector-kit/adoption-view",
      },
    ],
  },
  {
    id: "catenax-digital-twins",
    icon: "bi-boxes",
    title: "Your products as digital twins",
    description:
      "Every batch and every cell you ship gets a digital twin — a structured data record your customer can look up, if you allow it. We model your products in the formats the network understands, register the twins, and connect the pipeline to what you already run: ERP, MES, or spreadsheets. We meet your data where it is.",
    pillar: "catena-x",
    passportLink: "/passport",
    microline: [
      {
        text: "Industry Core KIT",
        href: "https://eclipse-tractusx.github.io/docs-kits/category/industry-core-kit",
      },
      { text: "Digital Twin Registry (DTR)" },
      { text: "SAMM aspect models" },
    ],
  },
  {
    id: "catenax-battery-passport",
    icon: "bi-file-earmark-text",
    title: "Flow into the EU Battery Passport",
    description:
      "From 18 February 2027, batteries sold in the EU carry a digital passport — and if you make materials, electrodes or cells, part of that passport is your data. We map your production data to the passport fields, validate it against the official formats, and set up the flow to your customer's passport: correct, on time, and only what you choose to share.",
    pillar: "catena-x",
    passportLink: "/passport",
    microline: [
      {
        text: "EcoPass KIT",
        href: "https://eclipse-tractusx.github.io/docs-kits/kits/eco-pass-kit/adoption-view/",
      },
      { text: "battery_pass aspect model" },
      { text: "EU Battery Regulation 2023/1542" },
    ],
  },
  {
    id: "catenax-production-planning",
    icon: "bi-calendar-week",
    title: "Production planning & data exchange",
    description:
      "The same connection that feeds the passport can carry your day-to-day business data: demand forecasts and capacity requests from your customers, delivery and stock information from you — structured and automatic, instead of email chains and Excel versions. Being easy to plan with is a competitive advantage; we set it up.",
    pillar: "catena-x",
    passportLink: "/passport",
    microline: [
      {
        text: "Demand & Capacity Management (DCM) KIT",
        href: "https://eclipse-tractusx.github.io/docs-kits/category/dcm-kit",
      },
      {
        text: "PURIS (short-interval production & stock data)",
        href: "https://eclipse-tractusx.github.io/docs-kits/category/puris-kit",
      },
    ],
  },
  {
    id: "catenax-pcf",
    icon: "bi-cloud",
    title: "Carbon footprint, per product",
    description:
      "EU customers increasingly ask for a carbon footprint per product, not per company. We help you calculate product carbon footprints from your real energy and material data and exchange them in the format the network verifies.",
    pillar: "catena-x",
    passportLink: "/passport",
    microline: [
      {
        text: "PCF KIT",
        href: "https://eclipse-tractusx.github.io/docs-kits/category/pcf-exchange-kit",
      },
      { text: "pcf aspect model" },
    ],
  },
  // ── Compliance ──
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
// The catena-x pillar carries optional group-header copy (kicker/heading/lede,
// docs §3.1 verbatim — the lede holds the single Catena-X® mention).
export const SERVICE_PILLARS = [
  { id: "engineering", label: "Engineering", anchor: "engineering" },
  {
    id: "catena-x",
    label: "Catena-X services",
    anchor: "catena-x",
    kicker: "Catena-X services",
    heading: "Connect once. Answer every customer data request.",
    lede: "Catena-X® is the automotive industry's shared data network — the channel through which EU customers will request battery data. Based in Singapore, we get ASEAN manufacturers connected and make the data flow: from your production floor into your customers' systems and the EU Battery Passport.",
  },
  { id: "compliance", label: "Compliance", anchor: "compliance" },
  { id: "circularity", label: "Circularity", anchor: "circularity" },
];

// Returns the services belonging to a single pillar, preserving SERVICES_LIST
// order.
export function getServicesByPillar(pillarId) {
  return SERVICES_LIST.filter((service) => service.pillar === pillarId);
}
