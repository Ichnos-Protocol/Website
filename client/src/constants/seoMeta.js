// SEO meta — single source of truth consumed by per-page <Helmet> blocks.
// Updates here propagate to every page. Keep titles ≤ 60 chars and descriptions
// in the 120–155 char sweet spot for Google SERP rendering.
//
// Canonical domain is ichnos-protocol.com (hyphenated). The unhyphenated
// variant is intentionally NOT used anywhere — see DEPLOYMENT_GITHUB_ACTIONS.md.

import { getCatenaXFullTitle } from "./catenaXStatus";
import { COMPANY_INFO } from "./companyInfo";
import {
  ROUTE_CONSORTIUM,
  ROUTE_CONSORTIUM_TIERS,
  ROUTE_CONTACT,
  ROUTE_LANDING,
  ROUTE_PASSPORT,
  ROUTE_PRIVACY,
  ROUTE_READINESS_ASSESSMENT,
  ROUTE_SERVICES,
  ROUTE_TEAM,
} from "./routes";
import {
  ASSESSMENT_SEO_SUMMARY,
  PRICING,
  formatPrice,
  getCurrentPrice,
} from "./readinessAssessmentContent";

const BASE_URL = "https://ichnos-protocol.com";
const SITE_NAME = "Ichnos Protocol";
const LOCALE = "en_US";
const DEFAULT_OG_IMAGE = `${BASE_URL}/og-image.jpg`;
// Positioning line single-sourced from companyInfo.js (2026-08-12).
const DEFAULT_OG_IMAGE_ALT = `Ichnos Protocol: ${COMPANY_INFO.tagline} ${getCatenaXFullTitle()}.`;

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
  path: ROUTE_LANDING,
  title: "Ichnos Protocol — Battery advisory & passport integration",
  description:
    "Practitioner-led battery advisory: systems engineering, safety, mechanical development, remanufacturing, and EU battery-passport integration for ASEAN.",
  keywords:
    "battery advisory, battery systems engineering, EU Battery Regulation 2023/1542, battery passport, Catena-X, remanufacturing, battery safety, mechanical development, MS 2818, ASEAN, Singapore",
});

export const SERVICES_META = buildMeta({
  path: ROUTE_SERVICES,
  title: "Services — Ichnos Protocol",
  description:
    "Battery systems engineering, mechanical development, technical leadership, EU 2023/1542 compliance, Catena-X battery-passport integration, remanufacturing, and circular-economy services. Singapore-incorporated.",
  keywords:
    "battery systems engineering, FMEA, battery passport implementation, Catena-X consulting, Catena-X member, EU 2023/1542, MS 2818, ASEAN battery, circular economy, remanufacturing",
});

export const TEAM_META = buildMeta({
  path: ROUTE_TEAM,
  title: "Team — Ichnos Protocol",
  description: `Dr.-Ing. Francesco Maltoni (ex-FEV lead battery expert, ${getCatenaXFullTitle()}) and Ihsan Ahmad (AI, quantitative modelling).`,
  keywords:
    "Francesco Maltoni, Ihsan Ahmad, FEV battery expert, Catena-X Qualified Advisor, battery passport, ASEAN battery advisory",
});

export const PASSPORT_META = buildMeta({
  path: ROUTE_PASSPORT,
  title: "The European battery passport — Ichnos Protocol",
  description:
    "Status quo and milestones of the EU 2023/1542 battery passport, the Catena-X network, custom translation of ASEAN battery passport into EU-compliant ones and the ASEAN ↔ EU value chain. Singapore-incorporated.",
  keywords:
    "battery passport, EU 2023/1542, Catena-X, EDC, AAS, SAMM, CX-0143, MS 2818, ASEAN battery, EU importer, value-chain data flow",
});

export const CONTACT_META = buildMeta({
  path: ROUTE_CONTACT,
  title: "Contact — Ichnos Protocol",
  description:
    "Talk to Ichnos Protocol about battery systems engineering, EU 2023/1542 battery-passport implementation, Catena-X integration consulting, or remanufacturing. Singapore + EU.",
  keywords:
    "contact Ichnos Protocol, battery systems advisory, battery passport consultation, Catena-X integration, ASEAN battery, EU 2023/1542",
});

export const CONSORTIUM_META = buildMeta({
  path: ROUTE_CONSORTIUM,
  title: "Battery passport consortium — Ichnos Protocol",
  description:
    "Consortium for battery passport readiness: an anchor company and its suppliers in the Indonesian battery value chain. Register by 30 September 2026.",
  keywords:
    "battery passport consortium, Indonesian battery value chain, anchor company, supplier readiness, battery passport data, ASEAN battery, EU 2023/1542",
});

export const CONSORTIUM_TIERS_META = buildMeta({
  path: ROUTE_CONSORTIUM_TIERS,
  title: "Consortium tiers — Ichnos Protocol",
  description:
    "Participation options for registered consortium participants. This page is not indexed and requires a completed consortium registration.",
  keywords:
    "consortium tiers, consortium participation, registered participants",
});

export const PRIVACY_META = buildMeta({
  path: ROUTE_PRIVACY,
  title: "Privacy & Data Management — Ichnos Protocol",
  description:
    "Manage your personal data with Ichnos Protocol: download your records or delete your account. GDPR-aligned controls for our visitors and customers.",
  keywords: "privacy, data management, GDPR, account deletion",
});

// The lowest current SGD list price across the tiers, read through the
// selector so a founding flip or a repricing reaches the description without
// an edit here. `.founding` and `.standard` are never read directly.
function lowestCurrentSgd(pricing) {
  return Math.min(
    ...Object.keys(pricing).map((tierId) =>
      getCurrentPrice(tierId, "SGD", pricing),
    ),
  );
}

// Exported, rather than kept private behind the constant below, so the
// closed-tier branch can be tested against a local fixture without mutating
// PRICING or resetting modules. The title's "|" separator and sentence case
// are the spec section 7.1 fenced form, deliberately unlike the em-dash
// titles of the sibling entries.
export function buildReadinessAssessmentMeta(pricing = PRICING) {
  return buildMeta({
    path: ROUTE_READINESS_ASSESSMENT,
    title: "Battery passport data readiness assessment | Ichnos Protocol",
    description: `${ASSESSMENT_SEO_SUMMARY} From SGD ${formatPrice(lowestCurrentSgd(pricing))}.`,
    keywords:
      "battery passport readiness assessment, data gap analysis, EU 2023/1542, supplier data, remediation plan, ASEAN battery, Singapore",
  });
}

export const READINESS_ASSESSMENT_META = buildReadinessAssessmentMeta();

// Convenience: full list — used by sitemap generation and validation tests.
export const ALL_META = [
  LANDING_META,
  SERVICES_META,
  TEAM_META,
  PASSPORT_META,
  READINESS_ASSESSMENT_META,
  CONTACT_META,
  CONSORTIUM_META,
  CONSORTIUM_TIERS_META,
  PRIVACY_META,
];

// Re-exported scalars for use by structured-data builders and the static
// document head.
export const SEO_BASE_URL = BASE_URL;
export const SEO_SITE_NAME = SITE_NAME;
export const SEO_LOCALE = LOCALE;
export const SEO_DEFAULT_OG_IMAGE = DEFAULT_OG_IMAGE;
