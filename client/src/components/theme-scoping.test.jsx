/*
 * Theme-scoping token assertions.
 *
 * Reads client/src/index.css as plain text and asserts that the
 * .theme-advisory and .theme-catenax rule blocks each declare the
 * expected --color-bg-base token value. No DOM, no stylesheet injection.
 *
 * This file also asserts the §5 palette invariants (conformance item 22)
 * against index.css: the six required token hexes are declared in both
 * theme blocks, no legacy Solana-era hex survives anywhere in the file,
 * and the two non-text hexes are never given as a direct `color:` value.
 * Var-indirection (e.g. `color: var(--color-accent-warm)`) is deliberately
 * out of scope here — see §7.4 manual review.
 *
 * Hero rule change (§9.2 / approach D5): photography is no longer banned
 * from hero surfaces. The rule now guarded is that text never sits on RAW
 * photography — any hero whose `background` carries a `url(` must also
 * carry a `linear-gradient` overlay declared *before* that `url(` layer
 * (CSS paints the first layer on top), and every rgba stop in that value
 * must hold an alpha of at least MIN_OVERLAY_ALPHA.
 */

import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const EXPECTED_ADVISORY_BG = "#FAFBFC";
const EXPECTED_CATENAX_BG = "#FAFBFC";

// §5 palette invariants — every theme block must declare all six.
const REQUIRED_TOKEN_HEXES = [
  "#0F71CB",
  "#FFA600",
  "#B3CB2D",
  "#EAF1FE",
  "#DCDCDC",
  "#FAFBFC",
];

// §5 — the retired Solana-era palette. None may reappear in index.css.
// The JSX/JS-inline counterpart of this list lives in
// client/src/constants/vocabulary.js and is asserted by vocabulary.test.js;
// this file must not widen its scan beyond index.css.
const LEGACY_HEXES = [
  "#9945FF",
  "#7B3FE4",
  "#DC1FFF",
  "#14F195",
  "#00FFA3",
  "#00A89A",
  "#0F0F23",
  "#0A1628",
];

// §5 — "MUST NOT be used as a text colour".
const NON_TEXT_HEXES = ["#FFA600", "#B3CB2D"];

// §9.2 — the alpha floor for a photo-overlay gradient stop. Never lower.
const MIN_OVERLAY_ALPHA = 0.66;

// Hero surfaces allowed to carry photography. `optional: true` means a missing
// rule block is a deliberate no-op rather than a failure.
// `.theme-advisory .hero-section` is the selector the landing route actually
// renders under (App.jsx routes `/` through AdvisoryThemeLayout), so it is
// required: the guard must bite on the rule that carries the visible photo,
// independently of how the T7 rule groups its selector list.
// `.advisory-page-hero` also ships, so its absence must fail too.
// `.theme-catenax .hero-section` stays optional — it guards the Catena-X
// wrapper contract, and removing that scope must not fail the suite.
const PHOTO_HERO_SELECTORS = [
  { selector: ".advisory-page-hero", optional: false },
  { selector: ".theme-advisory .hero-section", optional: false },
  { selector: ".theme-catenax .hero-section", optional: true },
];

// Member clear-space modifiers (index.css §9.1). Presence + non-zero padding
// only — see the describe block for why the ratio itself is not asserted.
const MEMBER_LABEL_SELECTORS = [
  ".footer-label-img--member",
  ".credential-strip__label-img--member",
];

const INDEX_CSS_PATH = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "index.css",
);

function stripBlockComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, "");
}

// Raw text keeps comments, so a commented-out legacy hex still trips the guard.
const CSS_RAW = readFileSync(INDEX_CSS_PATH, "utf8");
const CSS_SOURCE = stripBlockComments(CSS_RAW);

function extractBlockBySelector(css, selectorName) {
  let i = 0;
  while (i < css.length) {
    const openIdx = css.indexOf("{", i);
    if (openIdx === -1) return null;
    const closeIdx = css.indexOf("}", openIdx);
    if (closeIdx === -1) return null;
    const selectorList = css.slice(i, openIdx);
    const selectors = selectorList.split(",").map((s) => s.trim());
    if (selectors.includes(selectorName)) {
      return css.slice(openIdx + 1, closeIdx);
    }
    i = closeIdx + 1;
  }
  return null;
}

function getDeclaredValue(blockBody, propertyName) {
  const declarations = blockBody.split(";");
  for (const decl of declarations) {
    const colonIdx = decl.indexOf(":");
    if (colonIdx === -1) continue;
    const name = decl.slice(0, colonIdx).trim();
    if (name === propertyName) {
      return decl.slice(colonIdx + 1).trim();
    }
  }
  return null;
}

// Returns an array of violation strings (empty = pass). The array form keeps
// every branch outside of `expect()` — conditional expects are banned.
function collectRawPhotoViolations(css, { selector: selectorName, optional }) {
  const block = extractBlockBySelector(css, selectorName);
  if (block === null) {
    // Only a selector flagged optional (`.theme-catenax .hero-section`)
    // may be absent; a required block missing is itself the violation.
    return optional
      ? []
      : [`${selectorName}: required rule block is missing from index.css`];
  }

  const background = getDeclaredValue(block, "background");
  // No photography declared here, so there is nothing to guard.
  if (background === null || !background.includes("url(")) return [];

  const violations = [];
  // CSS paints the FIRST background layer on top, so the gradient must be
  // declared before the url() layer or the photo would cover the overlay.
  const gradientIdx = background.indexOf("linear-gradient");
  const urlIdx = background.indexOf("url(");
  if (gradientIdx === -1) {
    violations.push(
      `${selectorName}: background carries url() but no linear-gradient overlay`,
    );
  } else if (gradientIdx > urlIdx) {
    violations.push(
      `${selectorName}: linear-gradient overlay is declared after the url() layer, so the photo paints over it`,
    );
  }

  const rgbaMatches = background.match(/rgba\([^)]*\)/g) ?? [];
  for (const rgba of rgbaMatches) {
    const parts = rgba.slice(rgba.indexOf("(") + 1, -1).split(",");
    const alpha = Number.parseFloat(parts[3]);
    if (Number.isNaN(alpha) || alpha < MIN_OVERLAY_ALPHA) {
      violations.push(
        `${selectorName}: overlay alpha ${parts[3]?.trim()} is below the ${MIN_OVERLAY_ALPHA} floor (${rgba})`,
      );
    }
  }
  return violations;
}

function extractNumericTokens(value) {
  return (value.match(/-?\d*\.?\d+/g) ?? []).map(Number.parseFloat);
}

describe("theme-scoping (index.css token assertions)", () => {
  it("declares --color-bg-base: #FAFBFC in the .theme-advisory block", () => {
    const block = extractBlockBySelector(CSS_SOURCE, ".theme-advisory");
    expect(block).toBeTruthy();
    const value = getDeclaredValue(block, "--color-bg-base");
    expect(value?.toUpperCase()).toBe(EXPECTED_ADVISORY_BG.toUpperCase());
  });

  it("declares --color-bg-base: #FAFBFC in the .theme-catenax block", () => {
    const block = extractBlockBySelector(CSS_SOURCE, ".theme-catenax");
    expect(block).toBeTruthy();
    const value = getDeclaredValue(block, "--color-bg-base");
    expect(value?.toUpperCase()).toBe(EXPECTED_CATENAX_BG.toUpperCase());
  });
});

describe("hero surface (index.css light-treatment assertions)", () => {
  it.each([".hero-section", ".hero-section--advisory"])(
    "%s uses ink text on a light surface",
    (selector) => {
      const block = extractBlockBySelector(CSS_SOURCE, selector);
      expect(block).toBeTruthy();
      expect(getDeclaredValue(block, "color")).toBe(
        "var(--color-text-primary)",
      );
    },
  );

  it.each(PHOTO_HERO_SELECTORS)(
    "$selector never puts text on raw photography (overlay + alpha floor)",
    (target) => {
      expect(collectRawPhotoViolations(CSS_SOURCE, target)).toEqual([]);
    },
  );

  it(".hero-section .section-subtext uses secondary ink without text-shadow", () => {
    const block = extractBlockBySelector(
      CSS_SOURCE,
      ".hero-section .section-subtext",
    );
    expect(block).toBeTruthy();
    expect(getDeclaredValue(block, "color")).toBe(
      "var(--color-text-secondary)",
    );
    expect(getDeclaredValue(block, "text-shadow")).toBeNull();
  });
});

describe("member label clear space (index.css §9.1)", () => {
  // Only presence and non-zero padding are machine-asserted. The exact
  // geometry — the 0.75× ratio against the *rendered* height — stays a §7.4
  // manual review point per §9.1 / Approach D4, so legitimate height tuning
  // cannot break this guard.
  it.each(MEMBER_LABEL_SELECTORS)(
    "%s declares non-zero clear-space padding",
    (selector) => {
      const block = extractBlockBySelector(CSS_SOURCE, selector);
      expect(block).toBeTruthy();
      const padding = getDeclaredValue(block, "padding");
      expect(padding).not.toBeNull();
      const values = extractNumericTokens(padding);
      expect(values.length).toBeGreaterThan(0);
      expect(values.filter((v) => !(v > 0))).toEqual([]);
    },
  );
});

describe("palette invariants (index.css §5 conformance)", () => {
  it.each([".theme-advisory", ".theme-catenax"])(
    "%s declares every required palette hex",
    (selector) => {
      const block = extractBlockBySelector(CSS_SOURCE, selector);
      expect(block).toBeTruthy();
      const body = block.toUpperCase();
      const missing = REQUIRED_TOKEN_HEXES.filter((hex) => !body.includes(hex));
      expect(missing).toEqual([]);
    },
  );

  it("contains no legacy Solana-era hex anywhere in the file", () => {
    const source = CSS_RAW.toUpperCase();
    const present = LEGACY_HEXES.filter((hex) => source.includes(hex));
    expect(present).toEqual([]);
  });

  it.each(NON_TEXT_HEXES)(
    "%s is never given as a direct color: value",
    (hex) => {
      // The delimiter class excludes `-`, so background-color:, border-color:
      // and -webkit-text-fill-color: are not matches; `--color-accent-warm:`
      // never contains the literal `color:` substring either.
      // `color: var(--color-accent-warm)` is intentionally undetectable here
      // and remains a §7.4 manual review point.
      const pattern = new RegExp(`(?:^|[\\s;{}])color\\s*:\\s*${hex}`, "gi");
      const matches = CSS_SOURCE.match(pattern) ?? [];
      expect(matches).toEqual([]);
    },
  );
});
