export const HERO_CONTENT = {
  headline: "The ASEAN data layer for the European battery passport.",
  subhead:
    "We bring ASEAN battery manufacturers into Catena-X, and deliver Catena-X-compatible carbon, provenance, and composition data — from materials to modules — so European importers have a passport-ready dataset. Catena-X consultant qualification: application in progress.",
  ctaText: "Talk to us",
  ctaHref: "/contact",
};

export const HOMEPAGE_COMMITMENT = {
  text: "Committed to onboarding ASEAN into Catena-X — from supplier data readiness to passport-ready data for EU importers. Catena-X consultant qualification in progress.",
};

export const HOMEPAGE_OFFER_CARDS = [
  {
    id: "data",
    title: "Upstream data services",
    description:
      "Carbon, provenance, and composition data for ASEAN-made battery materials, precursors (pCAM/CAM), electrodes, cells, and modules — collected, structured, and delivered passport-ready via the Eclipse Dataspace Connector (EDC) in a Catena-X-compatible format your importers can drop straight into the passport.",
    linkLabel: "Explore data services →",
    linkTo: "/data",
  },
  {
    id: "catena-x",
    title: "Catena-X consulting (ASEAN onboarding)",
    description:
      "We get ASEAN manufacturers ready for Catena-X — assessing data readiness, mapping the gaps, and onboarding suppliers into the network so their data flows to European partners.",
    linkLabel: "Catena-X consulting →",
    linkTo: "/catena-x",
  },
  {
    id: "advisory",
    title: "Battery-systems advisory",
    description:
      "Practitioner-led advisory across battery systems engineering, safety, mechanical development, and remanufacturing — so the programs behind the data hold up in production.",
    linkLabel: "Explore advisory →",
    linkTo: "/services",
  },
];

export const HOMEPAGE_STACK_BAND = {
  heading: "Where we sit in the stack",
  layers: [
    {
      id: "raw-materials",
      label: "Raw materials",
      providers: "Minespider · Circulor · Re|Source",
    },
    {
      id: "ichnos",
      label: "ASEAN materials → precursors → electrodes → cells → modules",
      providers: "Ichnos",
      highlight: true,
    },
    {
      id: "passport-identity",
      label: "Passport & identity",
      providers: "Path.Era · Siemens · Spherity · AVL",
    },
    {
      id: "eu-importer",
      label: "EU importer / OEM",
    },
  ],
  summary:
    "We sit between the refinery and the finished passport, where ASEAN-made supply currently has no data layer — and we onboard that supply into Catena-X.",
};
