// Content for the Battery Passport page (/passport) — spec v4 §5.3–5.9.
// Copy is authoritative; render it verbatim. The Catena-X credential is never
// hard-coded here — surfaces that show it derive it from catenaXStatus.js via
// the runtime toggle (see PassportOffer organism).

// §5.3 Hero
export const PASSPORT_HERO = {
  eyebrow: "EU BATTERY REGULATION 2023/1542",
  title: "The European battery passport and the role of Ichnos.",
  subtitle:
    "Status, milestones, the Catena-X data stack, and the ASEAN ↔ EU integration paths.",
};

// §5.4 Status quo + milestones
export const PASSPORT_STATUS = {
  heading: "Status quo and milestones",
  intro:
    "Regulation (EU) 2023/1542, the EU Battery Regulation, introduces the digital battery passport, the carbon-footprint declaration, supply-chain due diligence, and recycled-content thresholds. The economic operator placing the battery on the EU market is legally responsible for the passport.",
  milestones: [
    {
      date: "18 February 2025",
      text: "Article 7 carbon-footprint declaration applies to new EV batteries placed on the EU market.",
    },
    {
      date: "18 August 2025",
      text: "Articles 47–53 due-diligence obligations enter into force.",
    },
    {
      date: "18 February 2027",
      text: "Annex XIII digital battery passport data set applies — every EV battery and industrial battery > 2 kWh placed on the EU market must carry one.",
    },
    {
      date: "18 August 2028",
      text: "Recycled-content reporting begins (Article 8).",
    },
    {
      date: "Ongoing",
      text: "JRC carbon-footprint methodology (CFB-EV, CFB-IND) and the delegated acts refine the calculation rules. MS 2818 is the Malaysian Standard reference for the same problem in the ASEAN context.",
    },
  ],
};

// §5.5 The case for seamless value-chain data flow
export const PASSPORT_CASE = {
  heading: "The case for seamless value-chain data flow",
  paragraphs: [
    "The passport is not a document the importer fills in at the border. It is a dataset that must accompany the physical goods from raw-materials extraction, through refining, through the ASEAN-made materials, precursors, electrodes, cells, and modules, into the pack and system integrator, and finally into the EU importer's complete passport.",
    "The default state today is that this travel does not happen, so the data need to be gathered manually and aligned and aggregated painfully by hand. An EV battery containing an ASEAN-made cell starts a passport with no upstream data attached — the importer is legally responsible for a dataset they have no native way to source and rely on the cooperation of the supplier. This raises the costs and friction of onboarding new suppliers, because multiple lines of communication and trust need to be established.",
    "The fix is not to build a parallel passport. It is to integrate the ASEAN supply chain's data into the same Catena-X-compatible data flows the European passport stack consumes, with the right schemas, the right exchange runtime, and the right chain-of-custody.",
  ],
};

// §5.6 Catena-X stack — factual intro with outbound pointer
export const PASSPORT_CATENAX = {
  heading: "The Catena-X data stack",
  body: "The Catena-X network is the European automotive data space and offers a standardised way to exchange supply chain and passport data between organisations. It's built on standardized blocks: common semantic schemas (CX-0143 sub-aspects on the AAS / SAMM standard), standardized connectors such as the Eclipse Dataspace Connector (EDC), and a federated identity model based on Verified Credentials where each participant retains data sovereignty. The battery passport's machine-readable data layer is delivered on this stack.",
  pointer: {
    label: "Read the Catena-X introduction →",
    href: "https://catena-x.net/en/about-us",
    external: true,
  },
};

// §5.7 Ichnos role in the value chain
export const PASSPORT_LOCALIZATION = {
  heading: "Ichnos role in the value chain",
  intro:
    "The EU battery passport carries data from every layer of the value chain. Each layer has established, specialised providers. Ichnos's core competence is the middle of this chain: cells, modules, and packs, where ASEAN manufacturing concentrates and where the data gap to the EU passport is widest. When the customer prefers a single point of accountability, Ichnos also integrates the adjacent layers (raw materials, ESG and due-diligence, finished passport assembly) into the same Catena-X data flow.",
  layers: [
    { id: "raw-materials", label: "Raw materials" },
    { id: "esg", label: "ESG & due-diligence" },
    {
      id: "ichnos",
      label: "Cells, modules and packs (ASEAN manufacturing)",
      role: "Ichnos — core competence",
      highlight: true,
    },
    { id: "passport-identity", label: "Passport & identity" },
    { id: "eu-importer", label: "EU importer / OEM" },
  ],
  twoColumn: {
    asean: {
      heading: "ASEAN side (Ichnos's primary delivery zone)",
      bullets: [
        "Material composition, manufacturing-site data, and carbon-footprint data captured at the cell, module, and pack level.",
        "ESG and supply-chain due-diligence evidence gathered at the supplier site (cobalt, lithium, natural graphite, nickel).",
        "Supplier readiness for Catena-X onboarding.",
        "On-site verification across Singapore, Indonesia, Vietnam, Thailand, Malaysia, Philippines.",
        "Data-model translation from ASEAN standard (such as Malaysian MS 2818) into EU 2023/1542-compliant data structures.",
      ],
    },
    eu: {
      heading: "EU side",
      bullets: [
        "Integration of cell, module, and pack data into the importer's existing passport stack.",
        "Schema mapping between source data and the Catena-X passport data model (CX-0143 sub-aspects on AAS + SAMM).",
        "EDC connector planning and data-sovereignty model so each supplier retains control of its own data.",
        "Optional end-to-end extension upstream (raw materials, ESG) or downstream (finished passport assembly) into one Catena-X data flow when the customer wants single-vendor accountability.",
      ],
    },
  },
};

// §5.8 What Ichnos does on this page. The credential eyebrow is rendered by the
// PassportOffer organism through the catenaXStatus toggle, not hard-coded here.
export const PASSPORT_OFFER = {
  heading: "What Ichnos does",
  paragraphs: [
    "Ichnos consults on the integration of compliant data models, Kits (the Tractus-X Development Kits), data-sovereignty model, audit trail, how to make the best use of the network and supports the ASEAN located battery supplier chain through Catena-X onboarding readiness.",
    "See the full service list on the Services page.",
  ],
  ctaLabel: "See services →",
  ctaHref: "/services",
};
