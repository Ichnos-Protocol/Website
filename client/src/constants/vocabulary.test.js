/*
 * Vocabulary corpus guard (§7.2).
 *
 * Reads every file in the §7.2 corpus as plain text and scans it against the
 * pattern sets in vocabulary.js. No DOM, no component rendering. Failures
 * report file, line and matched text so a hit is actionable without a manual
 * search, and every scan aggregates — one assertion listing every violation,
 * not a fail-fast on the first.
 */

import { readFileSync } from "node:fs";
import { basename, dirname, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

import {
  ALLOWED_EXCEPTIONS,
  FILES,
  FORBIDDEN,
  LEGACY_HEXES,
  NOT_YET_HELD,
  REQUIRED,
  STATUS_STRING_EXPORTS,
} from "./vocabulary";

const CLIENT_ROOT = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
);

const SOURCE_CACHE = new Map();

function readSource(file) {
  if (!SOURCE_CACHE.has(file)) {
    SOURCE_CACHE.set(file, readFileSync(file, "utf8"));
  }
  return SOURCE_CACHE.get(file);
}

function toClientPath(file) {
  return relative(CLIENT_ROOT, file).split(sep).join("/");
}

function lineNumberAt(text, index) {
  let line = 1;
  for (let i = 0; i < index; i += 1) {
    if (text[i] === "\n") line += 1;
  }
  return line;
}

// A fresh global clone per use: lastIndex never leaks between files, and every
// occurrence is reported rather than only the first. The scan runs against the
// whole file text — patterns such as `[^.]{0,40}` span newlines, so a
// line-by-line loop would miss them.
function findMatches(pattern, text) {
  const flags = pattern.flags.includes("g")
    ? pattern.flags
    : `${pattern.flags}g`;
  const rx = new RegExp(pattern.source, flags);
  const hits = [];
  let match = rx.exec(text);
  while (match !== null) {
    hits.push({ text: match[0], index: match.index });
    if (match[0] === "") rx.lastIndex += 1;
    match = rx.exec(text);
  }
  return hits;
}

function scanCorpus(patterns, exceptions = []) {
  const violations = [];
  for (const file of FILES) {
    const text = readSource(file);
    for (const pattern of patterns) {
      for (const hit of findMatches(pattern, text)) {
        if (exceptions.includes(hit.text)) continue;
        violations.push(
          `${toClientPath(file)}:${lineNumberAt(text, hit.index)} — "${hit.text}" (matched ${pattern.source})`,
        );
      }
    }
  }
  return violations;
}

function report(violations) {
  return violations.join("\n");
}

describe("vocabulary corpus (file set)", () => {
  it("walks a non-empty corpus that includes the static shells and no test files", () => {
    const paths = FILES.map(toClientPath);
    expect(paths.length).toBeGreaterThan(0);
    expect(paths).toContain("index.html");
    expect(paths).toContain("public/site.webmanifest");
    const excluded = FILES.map((file) => basename(file)).filter((name) =>
      /(\.test\.(js|jsx)|vocabulary\.js|vocabulary\.test\.js)$/.test(name),
    );
    expect(excluded).toEqual([]);
  });
});

describe("vocabulary corpus (prohibited expressions)", () => {
  it("contains no FORBIDDEN expression", () => {
    const violations = scanCorpus(FORBIDDEN, ALLOWED_EXCEPTIONS);
    expect(report(violations)).toBe("");
  });

  // ALLOWED_EXCEPTIONS is a FORBIDDEN-only escape hatch (§7.2): a group that
  // is not yet held cannot be excepted into being held.
  it("claims no NOT_YET_HELD group", () => {
    const violations = scanCorpus(NOT_YET_HELD);
    expect(report(violations)).toBe("");
  });

  it("contains no Solana-era legacy hex", () => {
    const violations = scanCorpus(LEGACY_HEXES);
    expect(report(violations)).toBe("");
  });
});

describe("vocabulary corpus (required expressions)", () => {
  it("contains every REQUIRED expression somewhere in client source", () => {
    const missing = REQUIRED.filter((pattern) =>
      FILES.every(
        (file) => findMatches(pattern, readSource(file)).length === 0,
      ),
    ).map((pattern) => pattern.source);
    expect(report(missing)).toBe("");
  });
});

// Item 8 (§7.1). catenaXStatus.js is where these constants are declared, so a
// hit there proves nothing; its test is already dropped by SKIP_FILES, but the
// exclusion is spelled out rather than left incidental.
// CATENA_X_MEMBER_LABEL_ASSET / _NEG are deliberately out of scope while they
// remain null (§7.1) — the omission is a decision, not an oversight.
const CONSUMER_EXCLUDED = new Set([
  "catenaXStatus.js",
  "catenaXStatus.test.js",
]);

const CONSUMER_FILES = FILES.filter(
  (file) => /\.(js|jsx)$/.test(file) && !CONSUMER_EXCLUDED.has(basename(file)),
);

// An unused uppercase import survives lint (varsIgnorePattern: "^[A-Z_]") and a
// comment mention satisfies a raw text search, so both are removed before the
// identifier is counted. Import stripping is multiline-aware: a line filter
// misses the identifier inside a multiline `import { … }` block. The side-effect
// form is stripped first so its statement cannot be swallowed by the `from`
// form's non-greedy span. `import` must be followed by whitespace or a quote,
// so a dynamic `import(` is never stripped.
function stripNonConsuming(source) {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:])\/\/[^\n]*/g, "$1")
    .replace(/^import\s*['"][^'"]*['"];?/gm, "")
    .replace(/^import\s[\s\S]*?from\s*['"][^'"]*['"];?/gm, "");
}

describe("vocabulary corpus (status-string consumers)", () => {
  it("has a real consumer for every status-string export", () => {
    const consumingText = CONSUMER_FILES.map((file) =>
      stripNonConsuming(readSource(file)),
    );
    const unconsumed = STATUS_STRING_EXPORTS.filter((name) => {
      const rx = new RegExp(`\\b${name}\\b`);
      return !consumingText.some((text) => rx.test(text));
    });
    expect(report(unconsumed)).toBe("");
  });
});
