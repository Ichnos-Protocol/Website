import { CAREER_TIMELINE_FRANCESCO } from "./teamTimelines";
// Team copy states the Qualified Advisor qualification only. That
// qualification is personal to Francesco — attestation 868 names him.
// Association membership and Digital Product Passport Expert Group
// participation belong to Ichnos Protocol Pte. Ltd., so they live on
// corporate surfaces (footer, credentials, structured data). The absence
// of `CATENA_X_MEMBERSHIP_NOTE` and `CATENA_X_EXPERT_GROUP_NOTE` here is
// deliberate — do not "fix" the asymmetry by adding them to a bio.
// `cxLabel: "advisor"` renders the official Qualified Advisor label image
// on this profile, beside the person the attestation names (september-fixes
// P7). It is the page's only linked label: Logo Use Agreement §4 allows a
// label to link only to catena-x.net, at most once per page.
import { CATENA_X_TITLE_BASE, getCatenaXFullTitle } from "./catenaXStatus";

export const TEAM_MEMBERS = [
  {
    id: "francesco",
    name: "Dr.-Ing. Francesco Maltoni",
    title: "Founder",
    photo: "/founder.png",
    cxLabel: "advisor",
    bio: [
      "Dr.-Ing. Francesco Maltoni is the founder of Ichnos Protocol. He spent his engineering career at FEV in Aachen as lead battery expert in battery-system engineering, owning sustainability requirements with customers, leading a battery digital-product-passport pilot on the in-house BMS/cloud-BMS practice, and presenting at Advanced Battery Power Europe 2025.",
      "His doctorate at the RWTH-Aachen University Chair of Production Engineering of Electromobility Components (PEM) covered circular-economy battery systems and was recognised with the 3rd-place RWTH Innovation Award. He authored four peer-reviewed publications on remanufacturing, recycling, and cell housing design, and lectured on battery recycling at the PEM Chair.",
      `He is a ${CATENA_X_TITLE_BASE}, working to bring ASEAN battery manufacturers into the Catena-X data space alongside their European importer customers, bridging the data-flow gap up the value chain without forcing any party to give up data sovereignty.`,
    ],
    skillsChips: [
      "Battery Systems & Safety (FMEA · requirements · test management)",
      "Battery Passport integration (EU 2023/1542 · MS 2818)",
      `Catena-X integration (${getCatenaXFullTitle()})`,
      "EU ↔ ASEAN value-chain data flow",
      "EDC / data-space integration",
      "Remanufacturing & Circular Economy",
    ],
    showTimeline: true,
    timeline: CAREER_TIMELINE_FRANCESCO,
  },
  // Frank holds no Catena-X qualification, so his entry has no `cxLabel`:
  // the advisor label stays the page's only linked label.
  {
    id: "frank",
    name: "Frank Tan",
    title: "Partner",
    photo: "/frank-tan.jpg",
    bio: [
      "Frank Tan is a partner at Ichnos Protocol and focuses on business development. An Accounting and Finance graduate, he has spent three decades in audit, banking and multinational technology companies, in roles spanning business development, sales and strategic engagement, project delivery and general management. He joined Ichnos Protocol to take on the challenge of building a business from the ground up, as the world moves towards digitalization, electrification and renewable energy.",
      "His technology career includes Techtanium, a technology firm spun off from DCITS Group; OCFT International, the international fintech arm of Ping An Group; Sunline, a leader in digital banking solutions; FIS, a US-based global solutions provider; and NCR, a US-based global consumer technology provider. Across these organisations he held roles from Solution Sales, Regional Head of Sales and Regional Head of Project Management to Chief Business Solutions and Chief Commercial roles.",
      "Before moving into technology, Frank spent almost a decade in internal audit and risk assessment at two leading Southeast Asian banking groups.",
    ],
    skillsChips: [
      "Business development",
      "Sales & strategic engagement",
      "Project delivery & general management",
      "Digital banking & fintech solutions",
      "Internal audit & risk assessment",
    ],
    showTimeline: false,
  },
];

// Label for the closing booking band on the team page (spec P6).
export const TEAM_CTA = { label: "Book a call with us" };

// The quotes render in this order inside one vision box, above one shared
// attribution.
export const VISION_STATEMENT = {
  quotes: [
    "Compliance and traceability are not only an upfront cost, but an investment into a more efficient and resilient value chain.",
    "Batteries should live as long as possible. Remanufacturing and repurposing are not just environmentally responsible — they are economically smart.",
  ],
  attribution: "Dr.-Ing. Francesco Maltoni",
};

export const TEAM_PAGE_HEADER = {
  title: "Team",
  subtitle:
    "Practitioners building battery passport data flows between ASEAN manufacturing and the European market.",
};
