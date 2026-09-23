/*
 * Route-constant guard (spec section 8 item 24).
 *
 * Walks client/src as plain text and asserts that no file outside routes.js
 * carries a quoted string equal to a swept route value, so that renaming a
 * route is a one-file edit rather than a grep. Test files are in the walk:
 * a DOM assertion comparing against a literal is exactly the drift this
 * guards. Failures report file, line and value, and every scan aggregates —
 * one assertion listing every violation, not a fail-fast on the first.
 */

import { readdirSync, readFileSync } from "node:fs";
import { basename, dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

import { stripNonConsuming } from "./corpusScan";
import * as ROUTES from "./routes";
import { SEO_BASE_URL } from "./seoMeta";

const CLIENT_ROOT = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
);
const SRC_ROOT = resolve(CLIENT_ROOT, "src");

// node_modules/dist are defensive — neither sits under src/ today, but both
// survive a future widening of the walk root.
const SKIP_DIRS = new Set(["node_modules", "dist"]);

// vocabulary.js's FILES is deliberately not reused: it drops every test file
// and adds index.html plus site.webmanifest, and this guard needs the exact
// opposite of both.
function walk(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) walk(join(dir, entry.name), out);
    } else if (/\.(js|jsx)$/.test(entry.name)) {
      out.push(join(dir, entry.name));
    }
  }
  return out;
}

const FILES = walk(SRC_ROOT);

// Matched by basename, on the CONSUMER_EXCLUDED precedent in
// vocabulary.test.js. routes.js declares the values, so a hit there proves
// nothing. App.test.jsx is the deliberate behavioural value pin that breaks
// this guard's circularity: it mounts the router against written-out literals,
// so it is the only thing asserting that the constants hold the paths the site
// actually publishes. It is excluded on purpose, not forgotten — and the pin
// assertion below is what makes the exclusion safe. The pin reads only the
// literal `route:` argument of real `renderWithProviders(<App />, ...)` calls,
// so a route named in a test title, a comment, an href or data-redirect-to
// assertion, or any other quoted string cannot satisfy it.
const SWEEP_EXCLUDED = new Set(["routes.js", "routes.test.js", "App.test.jsx"]);

const SWEPT_FILES = FILES.filter((file) => !SWEEP_EXCLUDED.has(basename(file)));

// Derived from the module's own exports rather than re-listed, so a fifteenth
// constant added later is swept without anyone remembering to add it here.
// ROUTE_LANDING is the one exclusion (spec section 2.1.1): "/" occurs around
// fifty times across two dozen files, two of which are not routes at all —
// a bare href and a navigate() home — and "/" cannot be renamed, so sweeping
// it would buy nothing and cost every one of those sites.
const ALL_ROUTE_VALUES = Object.values(ROUTES);
const SWEPT_VALUES = Object.entries(ROUTES)
  .filter(([name]) => name !== "ROUTE_LANDING")
  .map(([, value]) => value);
const SWEPT_SET = new Set(SWEPT_VALUES);

// The three quote forms are scanned independently rather than as one
// alternation: a single combined regex lets a long backtick span swallow a
// quoted path that sits inside it, which silently under-reports. Matches are
// keyed by offset so a position found by two passes is counted once.
const STRING_PATTERNS = [/'([^'\n]*)'/g, /"([^"\n]*)"/g, /`([^`$]*)`/g];

function lineNumberAt(text, index) {
  let line = 1;
  for (let i = 0; i < index; i += 1) {
    if (text[i] === "\n") line += 1;
  }
  return line;
}

// Set membership is exact equality by construction, which is the whole reason
// the text is never substring-searched: "/consortium" must not match inside
// "/consortium/tiers", nor "/passport" inside its readiness-assessment child,
// nor "/data" inside its own. A substring sweep passes while guarding nothing.
function findQuotedRoutes(text) {
  const hits = new Map();
  for (const pattern of STRING_PATTERNS) {
    const rx = new RegExp(pattern.source, pattern.flags);
    let match = rx.exec(text);
    while (match !== null) {
      if (SWEPT_SET.has(match[1])) {
        hits.set(match.index, {
          value: match[1],
          line: lineNumberAt(text, match.index),
        });
      }
      match = rx.exec(text);
    }
  }
  return [...hits.values()];
}

function toClientPath(file) {
  return relative(CLIENT_ROOT, file).split(sep).join("/");
}

function report(violations) {
  return violations.join("\n");
}

describe("route constants (file set)", () => {
  it("walks a non-empty corpus that includes test files", () => {
    const paths = SWEPT_FILES.map(toClientPath);
    expect(paths.length).toBeGreaterThan(0);
    expect(paths.some((path) => /\.test\.(js|jsx)$/.test(path))).toBe(true);
    expect(paths).not.toContain("src/constants/routes.js");
    expect(paths).not.toContain("src/App.test.jsx");
  });
});

describe("route constants (literal sweep)", () => {
  it("has no quoted route literal outside routes.js", () => {
    const violations = [];
    for (const file of SWEPT_FILES) {
      // Comments are stripped first: a stale comment quoting a path is prose,
      // not a consumer, and failing on it would push editors to paraphrase
      // rather than fix.
      const text = stripNonConsuming(readFileSync(file, "utf8"));
      for (const hit of findQuotedRoutes(text)) {
        violations.push(`${toClientPath(file)}:${hit.line} — "${hit.value}"`);
      }
    }
    expect(report(violations)).toBe("");
  });
});

describe("route constants (swept set)", () => {
  it("sweeps every exported route except the landing path", () => {
    expect(SWEPT_SET.has(ROUTES.ROUTE_LANDING)).toBe(false);
    expect(SWEPT_VALUES).toHaveLength(13);
    expect([...SWEPT_VALUES, ROUTES.ROUTE_LANDING].sort()).toEqual(
      [...ALL_ROUTE_VALUES].sort(),
    );
  });
});

describe("route constants (parent/child)", () => {
  // Composition is rejected in routes.js, so the relationship is asserted
  // here instead. A parent rename fails loudly and a human decides whether
  // the child's published URL moves with it.
  const PAIRS = [
    ["ROUTE_READINESS_ASSESSMENT", "ROUTE_PASSPORT"],
    ["ROUTE_LEGACY_DATA_READINESS", "ROUTE_LEGACY_DATA"],
    ["ROUTE_LEGACY_CATENA_X_READINESS", "ROUTE_LEGACY_CATENA_X"],
  ];

  it.each(PAIRS)("%s starts with %s", (child, parent) => {
    expect(ROUTES[child].startsWith(ROUTES[parent])).toBe(true);
  });
});

// All fourteen routes App.test.jsx mounts today. T6 added the readiness
// assessment route and its two legacy sibling redirects, so the three
// readiness values are pinned here alongside the rest — the pin list and the
// router entries landed in the same commit.
const PINNED_ROUTES = [
  ROUTES.ROUTE_LANDING,
  ROUTES.ROUTE_ADMIN,
  ROUTES.ROUTE_SERVICES,
  ROUTES.ROUTE_TEAM,
  ROUTES.ROUTE_CONTACT,
  ROUTES.ROUTE_CONSORTIUM,
  ROUTES.ROUTE_CONSORTIUM_TIERS,
  ROUTES.ROUTE_PRIVACY,
  ROUTES.ROUTE_PASSPORT,
  ROUTES.ROUTE_READINESS_ASSESSMENT,
  ROUTES.ROUTE_LEGACY_DATA,
  ROUTES.ROUTE_LEGACY_DATA_READINESS,
  ROUTES.ROUTE_LEGACY_CATENA_X,
  ROUTES.ROUTE_LEGACY_CATENA_X_READINESS,
];

// One left-to-right alternation over comments and string or template literals,
// so whichever opens first wins: a `//` inside a string stays string, a quote
// inside a comment stays comment. Quoted strings cannot cross a newline, so an
// unmatched apostrophe in JSX text is left alone rather than swallowing code.
const NON_CODE_PATTERN =
  /\/\/[^\n]*|\/\*[\s\S]*?\*\/|'(?:\\.|[^'\\\n])*'|"(?:\\.|[^"\\\n])*"|`(?:\\[\s\S]|[^`\\])*`/g;

function blank(text) {
  return text.replace(/[^\n]/g, " ");
}

// Blanks every comment and every string or template body to spaces, keeping
// string delimiters and newlines, so offsets and line anchors are unchanged
// and call-shaped text inside a comment, title or fixture string disappears.
function maskNonCode(source) {
  return source.replace(NON_CODE_PATTERN, (token) => {
    if (token.startsWith("/")) return blank(token);
    return token[0] + blank(token.slice(1, -1)) + token.slice(-1);
  });
}

// Run against the masked source, anchored at the start of a line, and required
// to close the call with `});`, so only a whole
// `renderWithProviders(<App />, { route: '<path>' });` statement counts, bare
// or assigned (`const { container } = ...`), across any line breaks and in
// either quote style. The back-reference makes the closing quote match the
// opening one. Group 2 spans the blanked literal; its offsets are read back
// from the raw source.
const APP_MOUNT_PATTERN =
  /^[ \t]*(?:(?:const|let|var)\s+[^=;\n]+=\s*)?renderWithProviders\(\s*<App\s*\/>\s*,\s*\{\s*route:\s*(['"])( *)\1\s*,?\s*\}\s*\);/dgm;

function findMountedRoutes(text) {
  const masked = maskNonCode(text);
  return new Set(
    [...masked.matchAll(APP_MOUNT_PATTERN)].map((match) =>
      text.slice(...match.indices[2]),
    ),
  );
}

describe("route constants (App.test.jsx value pin)", () => {
  it("mounts every pinned route against a written-out literal", () => {
    // Read raw: these literals are the only non-circular check that the
    // constants hold the paths the site publishes. Only the `route:` argument
    // of an actual `renderWithProviders(<App />, ...)` statement counts:
    // comments and string bodies are masked before matching, so titles,
    // comments, fixture strings and href or redirect assertions cannot
    // satisfy the pin. A
    // failure means either a route value moved without its mount, or somebody
    // replaced a pinned literal with an imported constant. Neither is a
    // formatting fix.
    const text = readFileSync(resolve(SRC_ROOT, "App.test.jsx"), "utf8");
    const present = findMountedRoutes(text);
    const missing = PINNED_ROUTES.filter((route) => !present.has(route));
    expect(report(missing)).toBe("");
  });
});

// The 37 files measured as carrying a swept literal, minus App.test.jsx (the
// pin) and minus organisms/Navbar.jsx, whose single occurrence was a stale
// comment quoting a removed pathname check and was rewritten as prose rather
// than converted — that file consumes no route constant and must not be
// forced to import one. The list is the route-constant consumer allow-list,
// not only the measured-literal set: constants/consortiumContent.js never
// carried a literal and was added by P3b as an approved consumer, importing
// ROUTE_READINESS_ASSESSMENT for the readiness tier's price link.
const RETROFITTED_FILES = [
  "src/App.jsx",
  "src/components/molecules/ContactFormProfile.jsx",
  "src/components/molecules/FooterNavColumns.jsx",
  "src/components/molecules/ServiceCard.jsx",
  "src/components/organisms/ContactSection.jsx",
  "src/components/organisms/ContactSection.test.jsx",
  "src/components/organisms/CookieConsentBanner.jsx",
  "src/components/organisms/CookieConsentBanner.test.jsx",
  "src/components/organisms/Footer.jsx",
  "src/components/organisms/Footer.test.jsx",
  "src/components/organisms/Hero.test.jsx",
  "src/components/organisms/MobileNavOverlay.test.jsx",
  "src/components/organisms/Navbar.test.jsx",
  "src/components/organisms/PassportTeaser.test.jsx",
  "src/components/organisms/ServicesGroup.test.jsx",
  "src/components/organisms/ServicesSnapshot.jsx",
  "src/components/organisms/ServicesSnapshot.test.jsx",
  "src/components/organisms/UserMenu.jsx",
  "src/components/organisms/UserMenu.test.jsx",
  "src/components/pages/ConsortiumPage.jsx",
  "src/components/pages/ConsortiumPage.test.jsx",
  "src/components/pages/ConsortiumTiersPage.test.jsx",
  "src/components/pages/PrivacyPage.test.jsx",
  "src/components/pages/ServicesPage.test.jsx",
  "src/constants/consortiumContent.js",
  "src/constants/landingContent.js",
  "src/constants/navigation.js",
  "src/constants/passportContent.js",
  "src/constants/seoMeta.js",
  "src/constants/services.js",
  "src/constants/services.test.js",
  "src/constants/structuredData.js",
  "src/hooks/useAuthInit.js",
  "src/hooks/useAuthInit.test.jsx",
  "src/routes/AdminRoute.test.jsx",
  "src/routes/ProtectedRoute.test.jsx",
];

// Anchored on the routes module's own path so that src/routes/, the guard
// component directory, can never satisfy it. stripNonConsuming removes import
// statements, so this reads the raw source.
const ROUTES_SPECIFIER = /^(\.\/routes|(?:\.{1,2}\/)+constants\/routes)$/;

function importsRoutesModule(source) {
  const rx = /^import\s[\s\S]*?from\s*['"]([^'"]*)['"]/gm;
  let match = rx.exec(source);
  while (match !== null) {
    if (ROUTES_SPECIFIER.test(match[1])) return true;
    match = rx.exec(source);
  }
  return false;
}

describe("route constants (import integrity)", () => {
  it("has every retrofitted file importing the routes module", () => {
    expect(RETROFITTED_FILES).toHaveLength(36);
    const missing = RETROFITTED_FILES.filter(
      (path) =>
        !importsRoutesModule(readFileSync(resolve(CLIENT_ROOT, path), "utf8")),
    );
    expect(report(missing)).toBe("");
  });
});

// Completes item 24: the sitemap half. sitemap.xml sits in client/public,
// outside the client/src walk above, so its literals are read here and
// compared against loc strings built from the route constants.
const SITEMAP = readFileSync(resolve(CLIENT_ROOT, "public/sitemap.xml"), "utf8");

function sitemapLoc(path) {
  return `<loc>${SEO_BASE_URL}${path}</loc>`;
}

describe("route constants (sitemap)", () => {
  it("lists the canonical readiness assessment URL exactly once", () => {
    const loc = sitemapLoc(ROUTES.ROUTE_READINESS_ASSESSMENT);
    expect(SITEMAP.split(loc).length - 1).toBe(1);
  });

  it("lists neither redirecting readiness assessment child", () => {
    const listed = [
      ROUTES.ROUTE_LEGACY_DATA_READINESS,
      ROUTES.ROUTE_LEGACY_CATENA_X_READINESS,
    ]
      .map((path) => `${SEO_BASE_URL}${path}`)
      .filter((url) => SITEMAP.includes(url));
    expect(report(listed)).toBe("");
  });
});
