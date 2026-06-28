import {
  CAREER_TIMELINE_FRANCESCO,
  CAREER_TIMELINE_IHSAN,
} from "./teamTimelines";
import { CATENA_X_TITLE_BASE, getCatenaXFullTitle } from "./catenaXStatus";

export const TEAM_MEMBERS = [
  {
    id: "francesco",
    name: "Dr.-Ing. Francesco Maltoni",
    title: "Founder",
    photo: "/founder.png",
    bio: [
      "Dr.-Ing. Francesco Maltoni is the founder of Ichnos Protocol. He spent his engineering career at FEV in Aachen as lead battery expert in battery-system engineering, owning sustainability requirements with customers, leading a battery digital-product-passport pilot on the in-house BMS/cloud-BMS practice, and presenting at Advanced Battery Power Europe 2025.",
      "His doctorate at the RWTH-Aachen University Chair of Production Engineering of Electromobility Components (PEM) covered circular-economy battery systems and was recognised with the 3rd-place RWTH Innovation Award. He authored four peer-reviewed publications on remanufacturing, recycling, and cell housing design, and lectured on battery recycling at the PEM Chair.",
      `He is an ${CATENA_X_TITLE_BASE}, working to bring ASEAN battery manufacturers into the Catena-X data space alongside their European importer customers, bridging the data-flow gap up the value chain without forcing any party to give up data sovereignty.`,
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
  {
    id: "ihsan",
    name: "Ihsan Ahmad",
    title: "Co-Founder",
    photo: "/ihsan.png",
    bio: [
      "Ihsan Ahmad is Co-Founder of Ichnos Protocol, bringing methodical excellence to the company's digital strategy and product development.",
      "A mathematician by training (M.Sc. Wirtschaftsmathematik, Karlsruhe Institute of Technology), Ihsan combines analytical rigour with hands-on execution across AI integration, quantitative financial modelling, and coordination of testing with notified bodies in the chemical industry.",
      "At Ichnos Protocol, Ihsan leads the digital and analytical workstreams supporting the Battery Passport product — applying his AI-integration background and process discipline to the data, intelligence, and certification layers of the platform.",
    ],
    skillsChips: [
      "AI Integration",
      "Quantitative Modelling",
      "Notified-Body Coordination",
      "Methodical Excellence",
    ],
    showTimeline: false, // hidden — flip after content review
    timeline: CAREER_TIMELINE_IHSAN,
  },
];

export const VISION_STATEMENT = {
  quote:
    "Batteries should live as long as possible. Remanufacturing and repurposing are not just environmentally responsible — they are economically smart.",
  attribution: "Dr.-Ing. Francesco Maltoni",
};

export const TEAM_PAGE_HEADER = {
  title: "Team",
  subtitle:
    "Practitioners building battery passport data flows between ASEAN manufacturing and the European market.",
};
