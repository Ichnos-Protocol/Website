// SEO meta — single source of truth consumed by per-page <Helmet> blocks.
// Updates here propagate to every page. Keep titles ≤ 60 chars and descriptions
// in the 120–155 char sweet spot for Google SERP rendering.
//
// Canonical domain is ichnos-protocol.com (hyphenated). The unhyphenated
// variant is intentionally NOT used anywhere — see DEPLOYMENT_GITHUB_ACTIONS.md.

import { getCatenaXFullTitle } from "./catenaXStatus";

const BASE_URL = "https://ichnos-protocol.com";
const SITE_NAME = "Ichnos Protocol";
const LOCALE = "en_US";
const DEFAULT_OG_IMAGE = `${BASE_URL}/og-image.jpg`;
const DEFAULT_OG_IMAGE_ALT = `Ichnos Protocol — Battery advisory and EU battery-passport integration for ASEAN. ${getCatenaXFullTitle()}.`;

function buildMeta({ path, title, description, keywords, ogImage, ogImageAlt }) {
  const url = `${BASE_URL}${path}`;
  const image = ogImage || DEFAULT_OG_IMAGE;
  const imageAlt = ogImageAlt || DEFAULT_OG_IMAGE_ALT;
  return {
    title,
    description,
    keywords,
    canonical: url,
    og: {
      title,
      description,
      type: "website",
      url,
      siteName: SITE_NAME,
      locale: LOCALE,
      image,
      imageAlt,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      image,
      imageAlt,
    },
  };
}

export const LANDING_META = buildMeta({
  path: "/",
  title: "Ichnos Protocol — Battery advisory & passport integration",
  description:
    "Practitioner-led battery advisory: systems engineering, safety, mechanical development, remanufacturing, and EU battery-passport integration for ASEAN.",
  keywords:
    "battery advisory, battery systems engineering, EU Battery Regulation 2023/1542, battery passport, Catena-X, remanufacturing, battery safety, mechanical development, MS 2818, ASEAN, Singapore",
});

export const SERVICES_META = buildMeta({
  path: "/services",
  title: "Services — Ichnos Protocol",
  description:
    "Battery systems engineering, mechanical development, technical leadership, EU 2023/1542 compliance, Catena-X battery-passport integration, remanufacturing, and circular-economy services. Singapore-incorporated.",
  keywords:
    "battery systems engineering, FMEA, battery passport implementation, Catena-X consulting, EU 2023/1542, MS 2818, ASEAN battery, circular economy, remanufacturing",
});

export const TEAM_META = buildMeta({
  path: "/team",
  title: "Team — Ichnos Protocol",
  description: `Dr.-Ing. Francesco Maltoni (ex-FEV lead battery expert, ${getCatenaXFullTitle()}) and Ihsan Ahmad (AI, quantitative modelling).`,
  keywords:
    "Francesco Maltoni, Ihsan Ahmad, FEV battery expert, Catena-X Advisory Provider, battery passport, ASEAN battery advisory",
});

export const PASSPORT_META = buildMeta({
  path: "/passport",
  title: "The European battery passport — Ichnos Protocol",
  description:
    "Status quo and milestones of the EU 2023/1542 battery passport, the Catena-X network, custom translation of ASEAN battery passport into EU-compliant ones and the ASEAN ↔ EU value chain. Singapore-incorporated.",
  keywords:
    "battery passport, EU 2023/1542, Catena-X, EDC, AAS, SAMM, CX-0143, MS 2818, ASEAN battery, EU importer, value-chain data flow",
});

export const CONTACT_META = buildMeta({
  path: "/contact",
  title: "Contact — Ichnos Protocol",
  description:
    "Talk to Ichnos Protocol about battery systems engineering, EU 2023/1542 battery-passport implementation, Catena-X integration consulting, or remanufacturing. Singapore + EU.",
  keywords:
    "contact Ichnos Protocol, battery systems advisory, battery passport consultation, Catena-X integration, ASEAN battery, EU 2023/1542",
});

export const PRIVACY_META = buildMeta({
  path: "/privacy",
  title: "Privacy & Data Management — Ichnos Protocol",
  description:
    "Manage your personal data with Ichnos Protocol: download your records or delete your account. GDPR-aligned controls for our visitors and customers.",
  keywords: "privacy, data management, GDPR, account deletion",
});

// Convenience: full list — used by sitemap generation and validation tests.
export const ALL_META = [
  LANDING_META,
  SERVICES_META,
  TEAM_META,
  PASSPORT_META,
  CONTACT_META,
  PRIVACY_META,
];

// Re-exported scalars for use by structured-data builders and the static
// document head.
export const SEO_BASE_URL = BASE_URL;
export const SEO_SITE_NAME = SITE_NAME;
export const SEO_LOCALE = LOCALE;
export const SEO_DEFAULT_OG_IMAGE = DEFAULT_OG_IMAGE;
