// SEO meta — single source of truth consumed by per-page <Helmet> blocks.
// Updates here propagate to every page. Keep titles ≤ 60 chars and descriptions
// in the 120–155 char sweet spot for Google SERP rendering.
//
// Canonical domain is ichnos-protocol.com (hyphenated). The unhyphenated
// variant is intentionally NOT used anywhere — see DEPLOYMENT_GITHUB_ACTIONS.md.

const BASE_URL = "https://ichnos-protocol.com";
const SITE_NAME = "Ichnos Protocol";
const LOCALE = "en_US";
const DEFAULT_OG_IMAGE = `${BASE_URL}/og-image.jpg`;
const DEFAULT_OG_IMAGE_ALT =
  "Ichnos Protocol — Catena-X-compatible ASEAN data layer for the European battery passport";

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
  title:
    "Ichnos Protocol — ASEAN data layer for the European battery passport",
  description:
    "Catena-X-compatible carbon, provenance, composition (and quality) data for ASEAN-made battery materials, cells, and modules — passport-ready for EU importers. Battery-systems advisory and Catena-X onboarding for ASEAN. Kuala Lumpur · Singapore · Europe.",
  keywords:
    "battery passport, Catena-X, EU Battery Regulation 2023/1542, ASEAN battery data, carbon footprint data, supply-chain provenance, battery materials, battery systems advisory, MS 2818, Kuala Lumpur, Singapore",
});

export const SERVICES_META = buildMeta({
  path: "/services",
  title: "Services — Ichnos Protocol",
  description:
    "Catena-X-compatible data services (materials to modules) for EU importers and passport issuers, Catena-X consulting for ASEAN onboarding, and battery-systems advisory. Singapore + Kuala Lumpur.",
  keywords:
    "Catena-X data services, battery passport data, ASEAN Catena-X onboarding, battery systems advisory, EU Battery Regulation, carbon footprint data, battery materials data, Singapore, Kuala Lumpur",
});

export const TEAM_META = buildMeta({
  path: "/team",
  title: "Team — Ichnos Protocol",
  description:
    "Founders of Ichnos Protocol. Dr.-Ing. Francesco Maltoni (ex-FEV lead battery expert, Catena-X consultant qualification in progress) and Ihsan Ahmad (AI, quantitative modelling).",
  keywords:
    "Francesco Maltoni, Ihsan Ahmad, FEV battery expert, Catena-X consultant, battery passport, ASEAN battery advisory, AI, quantitative modelling",
});

export const DATA_META = buildMeta({
  path: "/data",
  title: "Data services for the battery passport — Ichnos Protocol",
  description:
    "Catena-X-compatible carbon, provenance, composition (and quality) data for ASEAN-made materials, cells, and modules — passport-ready for EU importers. We feed your passport; we do not replace it. EU 2023/1542, EDC, DIN DKE SPEC 99100, MS 2818.",
  keywords:
    "battery passport data, Catena-X-compatible data, carbon footprint data, provenance data, composition data, ASEAN battery materials, EU Battery Regulation 2023/1542, EDC, DIN DKE SPEC 99100, MS 2818",
});

export const CATENAX_META = buildMeta({
  path: "/catena-x",
  title: "Catena-X consulting for ASEAN — Ichnos Protocol",
  description:
    "Catena-X consulting focused on onboarding ASEAN battery manufacturers and their EU partners: data readiness, onboarding steps, business cases, use-case and Tractus-X implementation, bilateral data relationships, release changes, and EU Battery Regulation compliance. Consultant qualification in progress.",
  keywords:
    "Catena-X consulting, ASEAN onboarding, Tractus-X implementation, battery data readiness, bilateral data relationships, EU Battery Regulation compliance, battery passport, data spaces",
});

export const CONTACT_META = buildMeta({
  path: "/contact",
  title: "Contact — Ichnos Protocol",
  description:
    "Talk to Ichnos Protocol about Catena-X-compatible ASEAN data services, Catena-X onboarding, or battery-systems advisory. AI assistant, email, LinkedIn, Calendly. Kuala Lumpur + Singapore + EU.",
  keywords:
    "contact Ichnos Protocol, Catena-X data services, ASEAN Catena-X onboarding, battery systems advisory, battery passport consultation, Kuala Lumpur, Singapore",
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
  DATA_META,
  CATENAX_META,
  CONTACT_META,
  PRIVACY_META,
];

// Re-exported scalars for use by structured-data builders and the static
// document head.
export const SEO_BASE_URL = BASE_URL;
export const SEO_SITE_NAME = SITE_NAME;
export const SEO_LOCALE = LOCALE;
export const SEO_DEFAULT_OG_IMAGE = DEFAULT_OG_IMAGE;
