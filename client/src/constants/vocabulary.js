/*
 * Vocabulary corpus data (§7.2).
 *
 * Data only — the file walk plus the pattern/name arrays that
 * vocabulary.test.js executes. No assertions live here.
 */

import { readdirSync } from "node:fs";
import { dirname, resolve, join } from "node:path";
import { fileURLToPath } from "node:url";

const CLIENT_ROOT = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
);

// node_modules/dist are defensive (they never sit under src/ today, but
// survive a future widening of the walk root). 'wireframes' is deliberately
// NOT listed: §6 deletes that directory, and a skip entry for a directory
// that must not exist would quietly mask its reappearance.
const SKIP_DIRS = new Set(["node_modules", "dist"]);
const SKIP_FILES = /(\.test\.(js|jsx)|vocabulary\.js|vocabulary\.test\.js)$/;

function walk(dir, out = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) {
      if (!SKIP_DIRS.has(e.name)) walk(join(dir, e.name), out);
    } else if (/\.(js|jsx)$/.test(e.name) && !SKIP_FILES.test(e.name)) {
      out.push(join(dir, e.name));
    }
  }
  return out;
}

// Static shells are user-visible and sit outside the js/jsx walk — the one
// live 6.3 violation found in the 2026-08-10 audit was in site.webmanifest,
// which no component test and no js-only sweep would ever have touched.
export const FILES = [
  ...walk(resolve(CLIENT_ROOT, "src")),
  resolve(CLIENT_ROOT, "index.html"),
  resolve(CLIENT_ROOT, "public/site.webmanifest"),
];

// Terms that may never appear in client source. Regexes are deliberately
// narrow so that legitimate text does not trip them:
//  - EU Battery Pass\b(?!port) misses both "EU Battery Passport" and
//    "Battery Pass Modelling Expert Group" (no "EU " prefix).
//  - expert committee does not touch the trademark notice's
//    "standards and committees".
export const FORBIDDEN = [
  /Catena-X\s+certified/i,
  // §1.2 prohibits the bare `Catena-X partner` and the `Solution Partner`
  // variant, not only the `official` form — one pattern covers all three,
  // since "official Catena-X partner" contains the bare claim.
  /Catena-X\s+(?:Solution\s+)?Partner/i,
  /powered\s+by\s+Catena-X/i,
  /we\s+operate\s+Catena-X/i,
  /expert[\s-]*committee/i, // hyphen form catches the stale `expert-committee` credential id
  /EU\s+Battery\s+Pass\b(?!port)/i,
  /Catena-X\s+Advisor(?:y)?\s+Provider/i,
  // Conformance-adjective family (IP Regs 6.3) — caught the live
  // site.webmanifest instance in the 2026-08-10 audit.
  /Catena-X[\s-]*(?:compatible|compliant|conformant|conforming)/i,
  /(?:compatible|compliant|conformant)\s+with\s+Catena-X/i,
  /(?:membership|application)[^.]{0,40}in\s+progress/i,
  // Pending wording is prohibited in both word orders ("membership
  // application pending" / "pending membership application"). `qualification`
  // is deliberately absent from the noun set: it would match the
  // `catenaXStatus.js` comment explaining the pending qualifier suffix, a
  // false positive the `in progress` pattern above already covers for real
  // claims. `\bpending\b` leaves `pendingSubmit` and the
  // `catenax-qualifier-pending` class name untouched.
  /(?:membership|application)[^.]{0,40}\bpending\b/i,
  /\bpending\b[^.]{0,40}(?:membership|application)/i,
  /consultant\s+qualification[^.]{0,30}in\s+progress/i,
  // Solana sunset (§6). Bare \bcrypto\b is deliberately ABSENT — it would
  // match Node's own `import { createHash } from "crypto"`; §6 narrows the
  // pattern instead of exception-listing a builtin.
  /\bsolana\b/i,
  /on-?chain/i,
  /\bweb3\b/i,
  /\bNFT\b/,
  /\bDeFi\b/i,
  /\bcryptocurrenc/i,
  /\bcrypto[\s-]?(?:asset|wallet|token)/i,
  /\bblockchain\b/i,
  /distributed\s+ledger/i,
];

// Groups not yet joined (§1). Move an entry out only when membership is
// confirmed in writing, and update §1 in the same commit.
export const NOT_YET_HELD = [
  /Battery\s+Pass\s+Modelling/i,
  /PCF\s+Architecture/i,
  /DPP\s+Regulations/i, // Stan confirmed DPP only; Regulations group unconfirmed
  /\bAPJ\b/,
  /Asia,?\s+Pacific,?\s+Japan/i,
];

// Item 8 (§7.1): the status-string exports that must each have a consumer
// outside catenaXStatus.js. Enumerated, not introspected — adding a status
// constant is a reviewed act that updates this list in the same commit.
export const STATUS_STRING_EXPORTS = [
  "CATENA_X_TITLE_BASE",
  "CATENA_X_MEMBERSHIP_NOTE",
  "CATENA_X_EXPERT_GROUP_NOTE",
  "CATENA_X_STATUS_LINE",
  "TRADEMARK_NOTICE",
];

// Solana-era palette (§5), scanned as TEXT over the same file set. This is
// what catches an inline JSX style ({ color: '#9945FF' }) — a defect the
// CSS-only assertion in theme-scoping.test.jsx can never see.
export const LEGACY_HEXES = [
  /#9945FF/i,
  /#7B3FE4/i,
  /#DC1FFF/i,
  /#14F195/i,
  /#00FFA3/i,
  /#00A89A/i,
  /#0F0F23/i,
  /#0A1628/i,
];

// Must be present somewhere in client source.
export const REQUIRED = [
  /Catena-X® is a registered trademark of Catena-X Automotive Network e\.V\./,
];

// Escape hatch, audited. Each entry is an EXACT string permitted despite
// matching a FORBIDDEN pattern, with the reason it is permitted. Adding an
// entry is a reviewed decision, not a fix for a failing test. It exists for
// FALSE POSITIVES ONLY — legitimate text a narrow pattern wrongly matches.
// A genuine §1.2 violation is NEVER an exception: exempting a real
// conformance claim would gut the legal position this file guards.
export const ALLOWED_EXCEPTIONS = [
  // (empty — no exception is currently justified)
];
