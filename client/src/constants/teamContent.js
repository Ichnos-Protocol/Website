import {
  CAREER_TIMELINE_FRANCESCO,
  CAREER_TIMELINE_IHSAN,
} from "./teamTimelines";

export const TEAM_MEMBERS = [
  {
    id: "francesco",
    name: "Dr.-Ing. Francesco Maltoni",
    title: "Founder",
    photo: "/founder.png",
    bio: [
      "Dr.-Ing. Francesco Maltoni is the founder of Ichnos Protocol. He spent his engineering career at FEV in Germany as lead battery expert in battery-system engineering — owning sustainability requirements with customers, leading a battery digital-product-passport pilot on the in-house BMS/cloud-BMS practice, and presenting at Advanced Battery Power Europe 2025.",
      "He is the author of a published three-part analysis of Malaysia's MS 2818 battery-passport standard, and is completing the Catena-X consultant qualification to lead ASEAN onboarding into the Catena-X data space. Based in Kuala Lumpur.",
    ],
    skillsChips: [
      "Battery Systems & Safety (FMEA · requirements · test management)",
      "Catena-X onboarding (consultant qualification in progress)",
      "ASEAN data services (carbon · due diligence · composition)",
      "EU 2023/1542 compliance (Art. 7 · Arts. 47–53 · Annex XIII)",
      "EDC / data-space integration",
      "Remanufacturing & Circular Economy",
      "MS 2818 — author, three-part analysis",
      "Languages: IT · DE · EN",
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
  title: "Meet the Team",
  subtitle: "The expertise and vision behind Ichnos Protocol.",
};
