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

// §5.4 Status quo. v4 removed the milestone list from this constant: it
// published obligation dates that the amending regulation superseded, so the
// page was stating dates that no longer hold. Every regulatory date now
// originates in regulatoryDates.js and renders through the RegulatoryTimeline
// organism. Do not reintroduce dates here.
export const PASSPORT_STATUS = {
  heading: "Status quo and milestones",
  intro:
    "Regulation (EU) 2023/1542, the EU Battery Regulation, introduces the digital battery passport, the carbon-footprint declaration, supply-chain due diligence, and recycled-content thresholds. The economic operator placing the battery on the EU market is legally responsible for the passport.",
};

// §5.5 The case for seamless value-chain data flow. Per source §7.2 /
// §12.4-Q4 the three paragraphs were replaced by the value-chain diagram: the
// graphic carries the chain the prose used to narrate, so the copy here is one
// lead-in sentence plus the image. `diagram.alt` is the accessible equivalent
// of the whole graphic and must stay complete — do not shorten it. The deck
// docs/diagrams/Ichnos_ValueChain_Diagrams.pptx is the source of truth for the
// artwork; a redraw replaces only the JPG at the same filename under
// client/public/diagrams/, which needs no code change here.
export const PASSPORT_CASE = {
  heading: "The case for seamless value-chain data flow",
  lead: "The passport is not a document the importer fills in at the border.",
  diagram: {
    src: "/diagrams/valuechain_full.jpg",
    alt: "EU battery-passport value chain: from mine through precursor, electrode, cell, module and pack to second life and recycling, with carbon-footprint, recycled-content and due-diligence documents verified by a notified body and published to the EU system",
  },
};

// §5.6 Catena-X stack — v4 §7.3 copy, segmented per §12.3-Q2. The single `body`
// string is split into `intro`, `principlesLead`, `principles`, and `closing`
// because each principle opens with a bold lead-in: HTML inside content strings
// and `dangerouslySetInnerHTML` are both banned, so the lead-in must reach the
// DOM as a real <strong> node built by PassportCatenaXStack from `lead`/`text`.
export const PASSPORT_CATENAX = {
  heading: "The Catena-X data stack",
  intro:
    "Catena-X is the automotive industry's shared data network, born in Europe and expanding internationally, with a North America hub operated with AIAG, growing collaboration in China (Suzhou Letter of Intent), and interoperability testing with the UN Transparency Protocol (UNTP) so that data can travel across dataspaces.",
  principlesLead: "Its principles matter more than its acronyms.",
  principles: [
    {
      lead: "Your data stays yours:",
      text: "every company keeps data sovereignty and decides who can discover its data, who can access which dataset, and under which contract policy.",
    },
    {
      lead: "Trade secrets don't travel:",
      text: "data is exchanged bilaterally, one tier up and one tier down, so your process know-how never propagates along the chain.",
    },
    {
      lead: "Every request is verified:",
      text: "each participant holds verifiable credentials, and its identity (Business Partner Number) is cryptographically checked at every data request.",
    },
    {
      lead: "Nothing moves without a contract:",
      text: "exchanges run through a connector, the Eclipse Dataspace Connector (EDC), a piece of software each participant runs, which negotiates a machine-readable contract, enforces the agreed usage policy, and transfers the data directly between the two parties, encrypted, with no central database in between.",
    },
  ],
  closing:
    "Ichnos can run this for you: we host and operate the connector and digital-twin infrastructure on EU-located servers, managed by us, so your team gets a working Catena-X presence without building one.",
  pointer: {
    label: "Read the Catena-X introduction →",
    href: "https://catena-x.net/en/about-us",
    external: true,
  },
};

// §5.7 Ichnos role in the value chain. Per source §7.4 / §12.1 the text band
// and the nine ASEAN/EU bullets were replaced by the diagram: the graphic shows
// exactly what they listed, so keeping both recreates the redundancy the rework
// removes. `intro` is deliberately one lead-in sentence. `diagram.alt` is the
// accessible equivalent of the whole graphic and must stay complete — do not
// shorten it. Two framings in the alt are load-bearing: the onboarding claim is
// registration / BPN management *with Cofinity-X*, never "we onboard you", and
// passport data readiness is *with the LCA partner* — Ichnos never performs the
// LCA. The deck docs/diagrams/Ichnos_ValueChain_Diagrams.pptx is the source of
// truth for the artwork; a redraw replaces only the JPG at the same filename
// under client/public/diagrams/, which needs no code change here.
export const PASSPORT_LOCALIZATION = {
  heading: "Ichnos role in the value chain",
  intro:
    "The EU battery passport carries data from every layer of the value chain.",
  diagram: {
    src: "/diagrams/ichnos_role.jpg",
    alt: "Ichnos's role: making ASEAN component and cell manufacturing passport-ready, between raw-materials traceability and EU importers, with connection management (registration with Cofinity-X), passport data readiness with the LCA partner, and EU-hosted infrastructure operated by Ichnos",
  },
};

// §5.8 offer block. v4 §7.5 / §12-Q2 stripped this section to eyebrow +
// pointer + CTA: its two paragraphs restated the service list that /services
// already owns, so the page said the same thing twice. The Kits gloss that the
// first paragraph carried now lives in PASSPORT_BUILD_STACK.body, next to the
// Tractus-X mention it defines. The credential eyebrow is still rendered by the
// PassportOffer organism through the catenaXStatus toggle, not hard-coded here.
// Note: `pointer` here is a plain string, unlike PASSPORT_CATENAX.pointer,
// which is an object carrying label / href / external.
export const PASSPORT_OFFER = {
  pointer: "Full service list on the Services page.",
  ctaLabel: "See services →",
  ctaHref: "/services",
};

// §5.10–5.12 (spec v5). Copy is authoritative; render it verbatim. The
// Catena-X credential is never hard-coded here — surfaces that show it derive
// it from catenaXStatus.js via the runtime toggle (see PassportOffer organism).

// §5.10 Build stack credibility
export const PASSPORT_BUILD_STACK = {
  heading: "The technical stack Ichnos works with",
  body: "Ichnos works on the open Catena-X reference implementation maintained by the Eclipse Foundation as the Tractus-X project, and consults on the integration of the Kits (the Tractus-X Development Kits). The passport data model is the AAS + SAMM standard with the Catena-X CX-0143 sub-aspects; the carbon-footprint sub-model follows CX-0026 with the rulebook in CX-0029, computed against the JRC CFB-EV methodology. Bilateral data exchange runs over the Eclipse Dataspace Connector (EDC). For production go-live, Ichnos uses the Cofinity-X Dataspace OS managed connector and Business Partner Number (BPN) onboarding.",
  standardsList: [
    {
      label: "AAS + SAMM (CX-0003)",
      note: "Semantic model on the Asset Administration Shell",
    },
    {
      label: "CX-0143",
      note: "Digital Product Passport sub-aspects for batteries",
    },
    { label: "CX-0026 / CX-0029", note: "PCF data model and rulebook" },
    { label: "CX-0136", note: "Use Case PCF" },
    { label: "JRC CFB-EV / CFB-IND", note: "EU carbon-footprint methodology" },
    {
      label: "Tractus-X EDC",
      note: "Eclipse Dataspace Connector reference implementation",
    },
    {
      label: "Tractus-X Industry Core Hub",
      note: "Twin and submodel provisioning",
    },
    {
      label: "Tractus-X SDK (Python)",
      note: "Programmatic EDC / DTR / submodel access",
    },
    {
      label: "Cofinity-X Dataspace OS",
      note: "Managed connector + BPN for go-live",
    },
  ],
};

// §5.11 Customer segmentation
export const PASSPORT_CUSTOMERS = {
  heading: "Who Ichnos works with",
  intro:
    "Three groups, three different conversations. Ichnos works with each on its own terms.",
  groups: [
    {
      id: "asean-suppliers",
      label: "ASEAN battery suppliers — materials, electrodes, cells, modules",
      body: "Manufacturers in Indonesia, Malaysia, Thailand, Vietnam and the rest of the region who need to put their data into a form a European importer can use as a passport. Ichnos works on the ground at the supplier site, then in schema and connector planning.",
    },
    {
      id: "eu-importers",
      label: "EU importers and OEMs",
      body: "The economic operator legally responsible for placing the battery on the EU market. Ichnos works with the importer's existing passport stack and helps them source supplier data through an independent rail, not through opaque manufacturer self-declarations.",
    },
    {
      id: "passport-app-partners",
      label: "Battery-passport application vendors",
      body: "Path.Era, Siemens, Spherity, AVL, and the other passport-application vendors. Ichnos feeds their passport stacks with the upstream data they need; the relationship is partner-and-channel, not competition.",
    },
  ],
};

// §5.12 Roadmap signal
export const PASSPORT_ROADMAP = {
  heading: "Ichnos in the Catena-X role model",
  body: "Beyond the consultant qualification, Ichnos is working toward Enablement Service Provider (ESP) and Business Application Provider (BAP) status in the Catena-X role model. These are the open, certifiable roles that bridge supplier data into the data space. The path runs through the Eclipse Tractus-X reference implementation and a Conformity Assessment Body. There is no ESP/BAP presence in ASEAN today; being the first battery-focused one is a measured next step.",
};
