// Data-services page content — single source of truth for the `/data` page.
// Narrative per spec v3 §5.3: Problem → Solution → Positioning.
// Compliance-locked copy: keep the three mandatory phrases verbatim —
// "We feed your passport; we do not replace it.",
// "Catena-X consultant qualification: application in progress",
// "Committed to onboarding ASEAN into Catena-X.". Never use Solana/blockchain/
// crypto/token/immutable-ledger/decentralised terms, and never claim
// Catena-X member/certified/qualified/partner status.

export const DATA_HERO = {
  headline:
    "Data services for the battery passport, from where the cells are actually made.",
  subheadline:
    "Catena-X-compatible carbon, provenance, and composition data for ASEAN-made materials, precursors, electrodes, cells, and modules — passport-ready for the EU importer. We feed your passport; we do not replace it.",
  primaryCta: { label: "Book a 30-minute briefing" },
};

export const DATA_STATUS_BADGE =
  "Catena-X consultant qualification: application in progress. Committed to onboarding ASEAN into Catena-X. Working demo: coming soon.";

export const DATA_PROBLEM = {
  heading:
    "Between the refinery and the finished cell, there is no data — and none of it is in Catena-X yet.",
  stack: {
    stages: [
      "Mining",
      "Refinery",
      "ASEAN materials · precursors · electrodes · cells · modules",
      "Pack & EU importer/OEM",
      "Vehicle",
      "Second life",
    ],
    upstreamProviders: ["Minespider", "Circulor", "Re|Source"],
    downstreamProviders: ["Path.Era", "Siemens", "Spherity", "AVL", "Catena-X"],
    middleLabel: "ASEAN materials · precursors · electrodes · cells · modules",
    gapLabel: "— gap —",
  },
  explanation:
    "Mine→refinery is covered; the OEM/passport layer is covered on Catena-X; the ASEAN materials · precursors · electrodes · cells · modules middle is not, and no provider operates at site-level depth there, nor onboards that supply into Catena-X. That is the gap Ichnos fills.",
  whyNow: [
    "The EU battery-passport requirement (Annex XIII) applies from 18 February 2027. Without an ASEAN data layer in Catena-X, every battery containing an Indonesian- or Malaysian-made cell is non-compliant by default.",
  ],
  complianceItems: [
    {
      id: "carbon",
      label: "Carbon footprint",
      regulation: "Article 7 / Annex II",
    },
    {
      id: "due-diligence",
      label: "Due diligence",
      regulation: "Articles 47–53 / Annex XIV + CSDDD 2024/1760",
    },
    {
      id: "composition",
      label: "Material composition & provenance",
      regulation: "Annex XIII",
    },
  ],
};

export const DATA_SOLUTION = {
  heading:
    "A Catena-X-compatible data layer, collected at source in ASEAN — and onboarded into Catena-X.",
  narrative:
    "Ichnos collects data directly from ASEAN sites (materials → precursors → electrodes → cells → modules), normalises it into Catena-X-compatible schemas, signs it for chain-of-custody, and delivers it via standard EDC connectors. The EU importer / economic operator — and the passport stack they use (Path.Era, Siemens, Spherity, AVL, OEM-internal) — consumes it as any Catena-X-compatible feed. We also guide the ASEAN supplier through Catena-X onboarding so the data flows natively.",
  deliveryHeading: "How we deliver",
  deliveryMethod: [
    "Catena-X-compatible schemas.",
    "EDC connector endpoints (each party runs its own EDC; the sovereign-exchange model the EU Data Act, Reg. 2023/2854, supports).",
    "A signed, tamper-evident audit trail (implementation-agnostic, invisible to the consumer).",
  ],
  stepsHeading: "Three steps for the customer",
  steps: [
    "Tell us which ASEAN suppliers and which tiles.",
    "We collect, sign, stage in Catena-X format, and onboard the supplier.",
    "You consume via EDC — your existing passport, your existing workflow, with the EU importer's dataset passport-ready.",
  ],
  standardsHeading: "Standards supported",
  standards: [
    "Catena-X (primary)",
    "EU 2023/1542 (Art. 7, Arts. 47–53, Annex II/XIII/XIV, Art. 77)",
    "JRC CFB-EV/IND",
    "EU PEF (EC Rec. 2021/2279)",
    "CSDDD (2024/1760)",
    "EU Data Act (2023/2854)",
    "DIN DKE SPEC 99100",
    "MS 2818",
    "ISO/IEC 15459",
    "OECD Due Diligence Guidance",
  ],
};

export const DATA_SOLUTION_TILES = [
  {
    id: "composition",
    title: "Material composition & manufacturing",
    body: "Site-collected material composition and manufacturing data, normalised into Catena-X-compatible schemas.",
    regulation: "Annex XIII",
  },
  {
    id: "carbon",
    title: "Site-level carbon footprint",
    body: "Carbon footprint measured at site level — an asset for the decarbonising producer, computed to the EU rules.",
    regulation: "Article 7 / Annex II",
  },
  {
    id: "due-diligence",
    title: "Due-diligence & ESG",
    body: "Supply-chain due-diligence and ESG evidence collected on the ground where the supply originates.",
    regulation: "Articles 47–53 / Annex XIV",
  },
  {
    id: "quality",
    title: "Optional quality data",
    body: "Optional production-quality data, available alongside the mandated tiles when the customer needs it.",
    regulation: "Optional",
  },
];

export const DATA_SCHEMA_MAPPING = {
  heading: "Schema mapping",
  note: "Retained for technical reviewers.",
  columns: {
    source: "EU requirement",
    target: "Catena-X target",
  },
  rows: [
    {
      source: "Annex XIII",
      target: "AAS + SAMM / CX-0143 sub-aspects",
    },
    {
      source: "Article 7 / Annex II",
      target: "AAS + SAMM / CX-0143 sub-aspects",
    },
    {
      source: "Articles 47–53 / Annex XIV",
      target: "AAS + SAMM / CX-0143 sub-aspects",
    },
  ],
};

export const DATA_FOUNDER = {
  heading: "Who is behind this",
  paragraph:
    "Dr.-Ing. Francesco Maltoni, ex-FEV lead battery expert, FEV battery DPP pilot, ABPE 2025 speaker, author of the MS 2818 series.",
  pillars: [
    {
      id: "battery-credibility",
      title: "Battery-systems credibility.",
      body: "Ex-FEV Aachen, Dr.-Ing.; author of the MS 2818 analysis series. We speak the regulation and the engineering at once.",
    },
    {
      id: "on-the-ground",
      title: "On site whenever needed.",
      body: "Singapore-incorporated, working across the ASEAN supply chain and at European client sites when needed. For carbon and due-diligence verification, someone has to be physically at the site. That is the difference between data services and data theatre.",
    },
    {
      id: "catena-x-commitment",
      title: "Catena-X by commitment.",
      body: "Catena-X consultant qualification — application in progress (Academy basic training completed). Committed to onboarding ASEAN manufacturers into Catena-X and to building Catena-X business applications (on Tractus-X) for their EU-compliance needs. Schemas, EDC connectors, and a data-sovereignty model built to the ecosystem's standards.",
    },
    {
      id: "regulatory-depth",
      title: "Regulatory depth.",
      body: "EU 2023/1542 and its annexes, the JRC carbon rules, CSDDD, DIN DKE SPEC 99100, MS 2818 — current requirements and how to fulfil them.",
    },
  ],
  credibilityRow: [
    "FEV alumnus",
    "RWTH Aachen PEM",
    "ABPE 2025 speaker",
    "Singapore-incorporated",
    "Author, MS 2818 series",
    "Catena-X consultant qualification: application in progress",
  ],
};

export const DATA_CLOSING_CTA = {
  text: "Catena-X consultant qualification: application in progress · committed to onboarding ASEAN into Catena-X · working demo coming soon.",
  cta: { label: "Book a 30-minute briefing" },
};
