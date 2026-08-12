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
  // v4 claim-accuracy guards (spec §1 / §9). Trust rests on Verifiable
  // Credentials presented via DCP, not on zero-knowledge proofs; hosting is
  // described as EU-hosted and Ichnos-operated, never as a compliance badge;
  // and the China relationship is a Suzhou Letter of Intent, not operation in
  // China. `\bZKPs?\b` is case-insensitive for now — narrow it to
  // case-sensitive if an identifier ever false-positives, rather than adding
  // an ALLOWED_EXCEPTIONS entry.
  /zero[\s-]?knowledge/i,
  /\bZKPs?\b/i,
  /\bcompliant\s+servers?\b/i,
  /\boperat(?:e|es|ing)\s+in\s+China\b/i,
  // The two superseded obligation dates deleted from the passport page in this
  // commit. The amending regulation moved them, so publishing either one states
  // an obligation that does not hold; the enforceable dates live in
  // regulatoryDates.js and render through RegulatoryTimeline. The \s+ form is
  // deliberate: it keeps this guard file itself free of any literal occurrence
  // of either string, so a grep sweep over client/ stays clean while the
  // patterns still catch the real text. Removing a pattern requires a recorded
  // reason, per the pivot-3 practice.
  /\b18\s+February\s+2025\b/i,
  /\b18\s+August\s+2025\b/i,
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
  "MEMBER_CARD_NOTE",
  "ADVISOR_CARD_NOTE",
  "CATENA_X_STATUS_LINE",
  "TRADEMARK_NOTICE",
];

// Item 8 (§7.1) again, for the label-asset path exports — all four are
// non-null now, so none of them is exempt. Scanned under a DIFFERENT rule
// from the status strings above: the correct consumer of these paths is
// CX_LABEL_ASSETS, which lives inside catenaXStatus.js itself, so a
// same-file hit counts and only the constant's own `export const` line is
// discounted. The two lists must NOT be merged — running the asset names
// through the status-string scan would exclude their only real consumer,
// and running the status strings through the asset scan would let a bare
// declaration pass.
export const ASSET_PATH_EXPORTS = [
  "CATENA_X_LABEL_ASSET",
  "CATENA_X_LABEL_ASSET_NEG",
  "CATENA_X_MEMBER_LABEL_ASSET",
  "CATENA_X_MEMBER_LABEL_ASSET_NEG",
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
