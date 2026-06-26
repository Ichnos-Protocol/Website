// §6.5 messaging guardrails — a single cross-cutting test that locks the
// public surface to the approved Catena-X / battery-passport positioning.
//
// It scans two surfaces:
//   A. Rendered public-page text + anchors (catches inline copy in components).
//   B. Crawler-visible-but-unrendered surfaces — page meta, JSON-LD, navigation
//      labels, and the static public files (sitemap.xml, index.html, robots.txt).
//   C. Sitemap ↔ canonical consistency.
//
// All scans are word-boundary aware so the approved phrases ("qualification",
// "committed"), the "securetoken.googleapis.com" preconnect, and "EU partners"
// (plural) never false-trigger.

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
import { DATA_HERO } from './constants/dataContent';
import App from './App';
import LandingPage from './components/pages/LandingPage';
import ServicesPage from './components/pages/ServicesPage';
import DataPage from './components/pages/DataPage';
import CatenaXPage from './components/pages/CatenaXPage';
import TeamPage from './components/pages/TeamPage';
import ContactPage from './components/pages/ContactPage';
import Footer from './components/organisms/Footer';

// --- Canonical scan regexes (single source for the whole file) ---------------
// Forbidden crypto/Web3 messaging. `crypto\w*` also catches "cryptocurrency";
// the mandatory \b around "token" skips "securetoken.googleapis.com".
const FORBIDDEN_MESSAGING =
  /\bsolana\b|\bblockchain\b|\bcrypto\w*|\btoken\b|\bimmutable\s+ledger\b|\bdecentrali[sz]ed\b/i;

// False Catena-X *status* claims. A status word (qualified consultant / member /
// certified / partner) is only forbidden when it sits next to a Catena-X mention
// — in either word order. This context-aware match catches the explicit ticket
// claims ("Catena-X qualified consultant", "Catena-X member", "Catena-X
// certified", "Catena-X partner") and their reorderings, while leaving unrelated
// copy ("team member", "delivery partner", non-Catena-X certifications) alone.
// The approved phrases — "consultant qualification: application in progress",
// "consultant qualification in progress", and "committed" — never pair a
// Catena-X mention with a status WORD (`\bqualified\b` ignores "qualification"),
// so they stay outside the matcher.
const CATENA_X = String.raw`catena[-\s]?x`;
const STATUS_WORD = String.raw`qualified|member|certified|partner`;
const FALSE_STATUS = new RegExp(
  `(?:${CATENA_X})[\\s\\w]{0,40}\\b(?:${STATUS_WORD})\\b` +
    `|\\b(?:${STATUS_WORD})\\b[\\s\\w]{0,40}(?:${CATENA_X})`,
  'i',
);

// Leaked legacy route. The /passport → /data redirect source in vercel.json is
// intentionally NOT scanned here (see vercel.config.test.js).
const PASSPORT_ROUTE = /\/passport\b/;

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

// --- Part A: rendered public-page text + anchors -----------------------------
const PUBLIC_PAGES = [
  { name: 'LandingPage', Component: LandingPage, route: '/' },
  { name: 'ServicesPage', Component: ServicesPage, route: '/services' },
  { name: 'DataPage', Component: DataPage, route: '/data' },
  { name: 'CatenaXPage', Component: CatenaXPage, route: '/catena-x' },
  { name: 'TeamPage', Component: TeamPage, route: '/team' },
  { name: 'ContactPage', Component: ContactPage, route: '/contact' },
];

describe('messaging guardrails — rendered public pages', () => {
  afterEach(cleanup);

  it.each(PUBLIC_PAGES)(
    '$name renders no forbidden messaging, false status, or /passport links',
    (page) => {
      const Component = page.Component;
      const { container } = renderWithProviders(<Component />, {
        store,
        route: page.route,
      });

      const text = document.body.textContent;
      expect(text).not.toMatch(FORBIDDEN_MESSAGING);
      expect(text).not.toMatch(FALSE_STATUS);

      const leakedHrefs = [...container.querySelectorAll('a[href]')]
        .map((anchor) => anchor.getAttribute('href'))
        .filter((href) => PASSPORT_ROUTE.test(href));
      expect(leakedHrefs).toEqual([]);
    },
  );

  it('Footer renders no forbidden messaging, false status, or /passport links', () => {
    const { container } = renderWithProviders(<Footer />, { store });

    const text = document.body.textContent;
    expect(text).not.toMatch(FORBIDDEN_MESSAGING);
    expect(text).not.toMatch(FALSE_STATUS);

    const leakedHrefs = [...container.querySelectorAll('a[href]')]
      .map((anchor) => anchor.getAttribute('href'))
      .filter((href) => PASSPORT_ROUTE.test(href));
    expect(leakedHrefs).toEqual([]);
  });
});

// --- Part A.2: App /passport route renders no /data page or leaked anchor -----
// Locks the legacy /passport surface: App routes it through the catch-all
// `path="*" element={null}`, so only the public chrome (Navbar/Footer) mounts.
// This guards against a React /passport route being reintroduced that renders
// the /data page, and against any anchor leaking a /passport href.
describe('messaging guardrails — App /passport route', () => {
  afterEach(cleanup);

  it('renders no DataPage content and no /passport anchors at /passport', () => {
    const { container } = renderWithProviders(<App />, {
      store,
      route: '/passport',
    });

    expect(document.body.textContent).not.toContain(DATA_HERO.headline);

    const leakedHrefs = [...container.querySelectorAll('a[href]')]
      .map((anchor) => anchor.getAttribute('href'))
      .filter((href) => PASSPORT_ROUTE.test(href));
    expect(leakedHrefs).toEqual([]);
  });
});

// --- Part A.3: full-chain positive assertions --------------------------------
// Complements the forbidden-term sweeps above: locks the public surface to the
// full upstream chain (materials → precursors → electrodes → cells → modules)
// on the pages that enumerate it.
const FULL_CHAIN_PAGES = [
  { name: 'LandingPage', Component: LandingPage, route: '/' },
  { name: 'DataPage', Component: DataPage, route: '/data' },
];

describe('messaging guardrails — full upstream chain', () => {
  afterEach(cleanup);

  it.each(FULL_CHAIN_PAGES)(
    '$name renders the full chain (precursors and electrodes)',
    (page) => {
      const Component = page.Component;
      renderWithProviders(<Component />, { store, route: page.route });

      const text = document.body.textContent;
      expect(text).toContain('precursors');
      expect(text).toContain('electrodes');
    },
  );
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
  it('page meta + JSON-LD + nav labels carry no forbidden messaging, false status, or /passport', () => {
    expect(METADATA_STRINGS).not.toMatch(FORBIDDEN_MESSAGING);
    expect(METADATA_STRINGS).not.toMatch(FALSE_STATUS);
    expect(METADATA_STRINGS).not.toMatch(PASSPORT_ROUTE);
  });

  it.each(STATIC_FILES)(
    '$name carries no forbidden messaging, false status, or /passport',
    ({ content }) => {
      expect(content).not.toMatch(FORBIDDEN_MESSAGING);
      expect(content).not.toMatch(FALSE_STATUS);
      expect(content).not.toMatch(PASSPORT_ROUTE);
    },
  );
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
