// Cross-cutting messaging guardrail — locks the v4 public surface to the
// approved Catena-X / battery-passport positioning.
//
// It scans three surfaces:
//   A. Rendered public-page text (catches inline copy in components).
//   B. Crawler-visible-but-unrendered surfaces — page meta, JSON-LD, navigation
//      labels, and the static public files (sitemap.xml, index.html, robots.txt).
//   C. Sitemap ↔ canonical consistency.
//
// The forbidden-vocabulary scan is word-boundary aware so the "securetoken.
// googleapis.com" preconnect in index.html and approved copy never false-trip.

/* global process */
import { readFileSync } from 'fs';
import { resolve } from 'path';

import { describe, it, expect, vi, afterEach } from 'vitest';

vi.mock('./hooks/useReducedMotion', () => ({
  useReducedMotion: () => true,
}));

vi.mock('./hooks/useApiSanityCheck', () => ({
  useApiSanityCheck: () => ({ warning: null, isChecking: false }),
}));

import { renderWithProviders, cleanup } from './test-utils';
import { store } from './app/store';
import { ALL_META, SEO_BASE_URL } from './constants/seoMeta';
import {
  ORGANIZATION_SCHEMA,
  WEBSITE_SCHEMA,
  FOUNDER_PERSON_SCHEMA,
  COFOUNDER_PERSON_SCHEMA,
  SERVICE_SCHEMAS,
  PAGE_STRUCTURED_DATA,
} from './constants/structuredData';
import { NAV_ITEMS } from './constants/navigation';
import LandingPage from './components/pages/LandingPage';
import ServicesPage from './components/pages/ServicesPage';
import PassportPage from './components/pages/PassportPage';
import TeamPage from './components/pages/TeamPage';
import ContactPage from './components/pages/ContactPage';
import Footer from './components/organisms/Footer';

// Forbidden crypto/Web3 messaging. `crypto\w*` also catches "cryptocurrency";
// the mandatory \b around "token" skips "securetoken.googleapis.com".
const FORBIDDEN_MESSAGING =
  /\bsolana\b|\bblockchain\b|\bcrypto\w*|\btoken\b|\bimmutable\s+ledger\b|\bdecentrali[sz]ed\b/i;

// --- Helpers -----------------------------------------------------------------
// Walk objects/arrays and return only string leaf values. This inherently
// ignores object keys, identifiers, imports, and source comments.
function collectStrings(value, acc = []) {
  if (typeof value === 'string') {
    acc.push(value);
    return acc;
  }
  if (Array.isArray(value)) {
    value.forEach((item) => collectStrings(item, acc));
    return acc;
  }
  if (value && typeof value === 'object') {
    Object.values(value).forEach((item) => collectStrings(item, acc));
    return acc;
  }
  return acc;
}

// Static public files are read relative to the Vitest cwd (= client/), the
// same convention used by vercel.config.test.js.
function readPublic(relativePath) {
  return readFileSync(resolve(process.cwd(), relativePath), 'utf-8');
}

function pathFromUrl(url) {
  return url.replace(SEO_BASE_URL, '') || '/';
}

// --- Part A: rendered public-page text ---------------------------------------
const PUBLIC_PAGES = [
  { name: 'LandingPage', Component: LandingPage, route: '/' },
  { name: 'ServicesPage', Component: ServicesPage, route: '/services' },
  { name: 'PassportPage', Component: PassportPage, route: '/passport' },
  { name: 'TeamPage', Component: TeamPage, route: '/team' },
  { name: 'ContactPage', Component: ContactPage, route: '/contact' },
];

describe('messaging guardrails — rendered public pages', () => {
  afterEach(cleanup);

  it.each(PUBLIC_PAGES)('$name renders no forbidden messaging', (page) => {
    const Component = page.Component;
    renderWithProviders(<Component />, { store, route: page.route });
    expect(document.body.textContent).not.toMatch(FORBIDDEN_MESSAGING);
  });

  it('Footer renders no forbidden messaging', () => {
    renderWithProviders(<Footer />, { store });
    expect(document.body.textContent).not.toMatch(FORBIDDEN_MESSAGING);
  });
});

// --- Part B: public metadata + static-file sweep -----------------------------
const METADATA_STRINGS = [
  ...collectStrings(ALL_META),
  ...collectStrings(ORGANIZATION_SCHEMA),
  ...collectStrings(WEBSITE_SCHEMA),
  ...collectStrings(FOUNDER_PERSON_SCHEMA),
  ...collectStrings(COFOUNDER_PERSON_SCHEMA),
  ...collectStrings(SERVICE_SCHEMAS),
  ...collectStrings(PAGE_STRUCTURED_DATA),
  ...collectStrings(NAV_ITEMS),
].join('\n');

const STATIC_FILES = [
  { name: 'sitemap.xml', content: readPublic('public/sitemap.xml') },
  { name: 'index.html', content: readPublic('index.html') },
  { name: 'robots.txt', content: readPublic('public/robots.txt') },
];

describe('messaging guardrails — metadata + static files', () => {
  it('page meta + JSON-LD + nav labels carry no forbidden messaging', () => {
    expect(METADATA_STRINGS).not.toMatch(FORBIDDEN_MESSAGING);
  });

  it.each(STATIC_FILES)('$name carries no forbidden messaging', ({ content }) => {
    expect(content).not.toMatch(FORBIDDEN_MESSAGING);
  });
});

// --- Part C: sitemap ↔ canonical consistency ---------------------------------
describe('messaging guardrails — sitemap and canonical consistency', () => {
  const sitemap = readPublic('public/sitemap.xml');
  const sitemapPaths = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) =>
    pathFromUrl(m[1]),
  );
  const canonicalPaths = ALL_META.map((meta) => pathFromUrl(meta.canonical));

  it('every sitemap path has a matching canonical', () => {
    expect(canonicalPaths).toEqual(expect.arrayContaining(sitemapPaths));
  });

  it('every indexable canonical (except /privacy) is in the sitemap', () => {
    const indexable = canonicalPaths.filter((path) => path !== '/privacy');
    expect(sitemapPaths).toEqual(expect.arrayContaining(indexable));
  });
});
