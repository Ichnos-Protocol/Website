# Ichnos Protocol — Website Spec v4.0

**Version:** 4.0 — June 2026 (replaces v3.0 as the authoritative spec)
**Owner:** Francesco
**Target site:** `ichnos-protocol.com`

> **How to read this spec.** Every component, page, and content block has its
> own numbered section with the exact copy, file location, and behaviour.
> Traycer follows the structure literally; nothing here is a hint to be
> interpreted. Where copy is not given verbatim, the spec says either
> _"existing copy retained"_ (carry over from current state) or _"to be
> written by Francesco"_ (paste-in placeholder, not implementation latitude).
> When in doubt, do not invent — flag for clarification.
>
> **Relationship to prior specs.** v3 (`ichnos_website_CatenaX_pivot_spec_v3.md`)
> is superseded but kept in the repo for context. References below to "v2"
> mean the state of the codebase at commit `ed3f326~1` (the parent of the
> Catena-X rebrand merge), i.e. the pre-rebrand state. References to "v3"
> mean the state at commit `ed3f326` and after.

---

## 0. Phases already shipped — do not re-plan

| Phase                               | PR   | Status               | Anchor commit |
| ----------------------------------- | ---- | -------------------- | ------------- |
| A — Logo presence + KL/MM2H cleanup | #148 | Open, awaiting merge | `cbcd408`     |
| B — Nav consolidation + APAC→ASEAN  | #149 | Open, awaiting merge | `105e508`     |

These are correct work matching this spec. Traycer's plan starts after these
land. Sections of this spec that they cover are marked **[A]** or **[B]** —
those sections are satisfied by the merge.

---

## 0a. Catena-X credential status — runtime toggle

The qualification is **in progress at spec time** (Catena-X Academy basic
training completed, consortium membership being paid, listing application
submitted). It will be granted at some point after the site goes live,
and the site needs to flip from "in progress" to "held" the moment
Catena-X answers — without a developer touching every component.

The implementation is a single runtime constant + a tiny helper, both in
a new module that every consumer imports from. Flipping one boolean
removes the qualifier everywhere site-wide.

**New module — `client/src/constants/catenaXStatus.js`:**

```js
// Single source of truth for whether the Catena-X qualification has
// been formally granted. While `false`, the site renders the
// "(qualification in progress)" suffix in muted styling everywhere the
// Advisory Provider title appears. When Catena-X confirms the listing,
// flip this to `true` — the suffix disappears across the entire site
// without any other code change.
export const CATENA_X_QUALIFICATION_GRANTED = false;

// Visual class used to gray the qualifier text while the toggle is off.
export const CATENA_X_QUALIFIER_CLASS = "catenax-qualifier-pending";

// Plain-text suffix, useful for SEO meta strings and alt text that
// cannot carry an HTML span (search engines render the literal text).
export function getCatenaXQualifierText() {
  return CATENA_X_QUALIFICATION_GRANTED ? "" : " (qualification in progress)";
}

// React node version, for any visual surface that should gray the
// qualifier — wraps it in a span carrying CATENA_X_QUALIFIER_CLASS.
// Returns null when the qualification is granted so the surrounding JSX
// renders nothing extra.
export function CatenaXQualifierSpan() {
  if (CATENA_X_QUALIFICATION_GRANTED) return null;
  return (
    <span className={CATENA_X_QUALIFIER_CLASS}>
      {" "}
      (qualification in progress)
    </span>
  );
}

// Convenience: the full title with the optional qualifier as plain
// text. Use in places where one string is required (SEO meta, og:title,
// schema.org descriptions).
export function getCatenaXFullTitle() {
  return (
    "Official Catena-X Qualified Advisory Provider" + getCatenaXQualifierText()
  );
}
```

**CSS — added to `client/src/index.css`:**

```css
/* ========== Catena-X qualifier (toggle styling) ========== */
/* While CATENA_X_QUALIFICATION_GRANTED is false, the helper wraps the
   "(qualification in progress)" suffix in this class so it reads as a
   subtle note next to the credential rather than dominating the line.
   When the boolean flips to true, the helper returns null and this
   class is unused — no other change required. */
.catenax-qualifier-pending {
  color: var(--color-text-secondary);
  opacity: 0.7;
  font-size: 0.85em;
  font-weight: var(--font-weight-normal);
  white-space: nowrap;
}
```

**Where the toggle applies (consumers of the helper):**

| Spec §          | Surface                                          | How it consumes the helper                                                                          |
| --------------- | ------------------------------------------------ | --------------------------------------------------------------------------------------------------- |
| 1.3             | Footer brand line 2 (credential row)             | JSX: `{...} <CatenaXQualifierSpan />` after the title text.                                         |
| 3.2             | Why Ichnos paragraph 2                           | Same JSX pattern.                                                                                   |
| 4.2             | Services Card 3 eyebrow                          | Same JSX pattern.                                                                                   |
| 5.8             | PASSPORT_OFFER eyebrow                           | Same JSX pattern.                                                                                   |
| 6.2             | Francesco's bio paragraph 2                      | Same JSX pattern.                                                                                   |
| 6.2             | `skillsChips[2]`                                 | Plain text — use `\`Catena-X integration (\${getCatenaXFullTitle()})\``.                            |
| 6.5             | TEAM_META.description                            | Plain text — use `\`… (ex-FEV lead battery expert, \${getCatenaXFullTitle()}) and Ihsan Ahmad …\``. |
| Structured data | `Organization.description`, `Person.description` | Plain text via `getCatenaXFullTitle()`.                                                             |

**Implementer's contract.** Every time the spec literally writes
"Official Catena-X Qualified Advisory Provider", the rendered output
is whatever the helper returns at runtime. Do **not** hard-code the
qualifier ("(qualification in progress)") anywhere in a constant file
or component. The toggle is the only source of truth.

**Day Catena-X answers.** Open `client/src/constants/catenaXStatus.js`,
change `CATENA_X_QUALIFICATION_GRANTED` from `false` to `true`, commit
on a tiny PR, ship. No other files change.

## 0b. Writing directive — name things, do not gesture

**HIGHEST-PRIORITY DIRECTIVE.** This rule overrides every section below.
It applies to every block of copy, every section heading, every code
comment, and to every future revision of this spec itself. If an
implementer writes a sentence that violates it, the implementer rewrites
before merging.

**The pattern Francesco rejects:** verbs and phrases that dodge a precise
statement by gesturing at a position, capability, or relationship rather
than naming it. Reads as pretentious in business contexts and as
imprecise in technical ones. A credible academic-and-practitioner-led
practice names things; it does not gesture at them.

**Banished verbs and phrases (the list is non-exhaustive — the family
extends to anything written in the same register):**

- "where X sits" / "where X lives" / "where X plays" / "where X stands"
- "occupies the position of" / "is positioned to" / "exists at the
  intersection of"
- "navigates" / "navigating complexity" (when metaphorical)
- "engages with" (vague — name the specific verb: consults, audits,
  builds, onboards, delivers)
- "leverages" (almost always replaceable with "uses" or "applies")
- "enables" (often replaceable with the named action)
- "empowers" / "powers" / "drives" (vague metaphor)
- "facilitates" / "facilitating" (vague substitute for the precise verb)
- "delivers value" / "value-add" / "value-driven" (name the specific
  value)
- "where the rubber meets the road" and other business clichés
- Em-dashes for subordinate clauses or asides (use colons, parentheses,
  or separate sentences — see §9.4)

**Replacement pattern.** When tempted to write one of these forms, ask
in order:

1. What does this entity actually do? Name it.
2. What is the specific noun for its work? Use it.
3. What verb describes the operation, not the disposition? Use it.

**Examples of the rewrite:**

| Writerly (banished) | Precise (replace with) |
| --- | --- |
| Where Ichnos sits in the value chain | Ichnos role in the value chain |
| Ichnos sits at the cell-and-module level | Ichnos operates at the cell-and-module level |
| Ichnos leverages its FEV experience | Ichnos applies its FEV battery-systems engineering experience |
| Catena-X enables data exchange | Catena-X is the standard the European battery passport's data exchange runs on |
| The platform delivers value to importers | The platform produces a Catena-X-compatible passport dataset for importers |
| Ichnos navigates the EU regulatory landscape | Ichnos consults on EU 2023/1542 compliance |
| Engages with ASEAN suppliers | Onboards ASEAN suppliers; runs site verification at ASEAN suppliers |

**Why this directive is at this priority level.** Catena-X reviewers, EU
compliance auditors, and academic engineering peers all read for
precision. Indonesian and Malaysian buyers reading in their second
language read for plain meaning. Both audiences are better served by
sentences that name what is happening. Writerly metaphor serves
neither, and the reputational cost of pretentious writing is real.

**Cross-project scope.** Francesco has elevated this rule to a
cross-project Claude directive. It applies to every Claude-assisted
session in this repository and to every other Francesco project.

## 0c. Audience layering — tone register per section

Each user-facing section has one **primary audience** that sets the tone
register. Implementations of each section must match the register
prescribed here, not invent a different one.

| §           | Section                                            | Primary audience                                   | Tone register                                                                                                                               |
| ----------- | -------------------------------------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| 3.1         | Landing hero                                       | First-time visitor, any background                 | Aspirational, abstract. One memorable line.                                                                                                 |
| 3.2         | Why Ichnos (`#company`)                            | First-time visitor                                 | Plain, biographical, no acronyms beyond MS 2818 / EU 2023/1542.                                                                             |
| 3.3         | Services snapshot (`#services`)                    | Buyer                                              | Practical, scannable. Card titles + taglines only.                                                                                          |
| 3.4         | Passport teaser (`#passport`)                      | **First-time visitor**                             | **Plain language. No Catena-X / EDC / SAMM / AAS / data-space jargon.** One sentence on the problem, one on what Ichnos does, one CTA.      |
| 3.5         | Contact teaser (`#contact`)                        | Buyer                                              | Action-oriented.                                                                                                                            |
| 4.x         | Services page                                      | Buyer (with Card 3 also for the Catena-X reviewer) | Practical with regulatory citations where they prove competence.                                                                            |
| **5.3**     | **Passport hero**                                  | First-time visitor                                 | Plain.                                                                                                                                      |
| **5.4–5.5** | **Passport milestones + value-chain case**         | First-time visitor + buyer                         | Plain language. The acronyms (CFB-EV, CSDDD, etc.) appear only as inline glosses, never as the load-bearing nouns.                          |
| **5.6–5.7** | **Catena-X stack intro + ASEAN ↔ EU localization** | Catena-X reviewer + technical evaluator            | **Technical register OK here.** CX-0143, EDC, AAS, SAMM, data sovereignty model — all permitted. This is where the credential is signalled. |
| 5.8         | What Ichnos does                                   | Buyer                                              | Practical, refers back to /services.                                                                                                        |
| 6           | Team                                               | Buyer                                              | Biographical.                                                                                                                               |
| 7           | Contact                                            | Buyer                                              | Operational.                                                                                                                                |
| 8           | Footer                                             | First-time visitor (every page)                    | Two lines, one value statement + one credential statement. Francesco's surgical edit in §1.3 is the source of truth.                        |

**The point of the layering.** A cell-plant manager in Indonesia or
Malaysia landing on `/` should be able to read the hero, the Why Ichnos
block, and the passport teaser without ever hitting a term they don't
recognise, and still understand what Ichnos does. The Catena-X
technical depth appears further down `/passport` for the audience that
expects to see it (reviewers, EU passport-stack integrators, technical
evaluators). The two audiences are not served by the same paragraph.

## 0d. Branching strategy for Traycer

**Working branch:** `Catena-X_Pivot`. All Phase C, D, and E work
happens on this one branch. It is already branched off the current
`main` (which has Phases A and B merged in via PRs #148 and #149)
and already carries this spec.

**Why a single branch instead of branch-per-phase.** Francesco's
explicit instruction. One PR at the end, one staging-QA cycle, no
per-phase merge conflicts with `main` as `main` keeps moving. Phases
C / D / E land as separate commits on the same branch in serial
order so each step is reviewable in isolation, but they never split
across branches.

**Pre-Traycer setup (already complete):**

1. PR #148 (Phase A — logo + KL/MM2H cleanup) merged into `main`.
2. PR #149 (Phase B — nav consolidation + APAC→ASEAN) merged into `main`.
3. `Catena-X_Pivot` branched off `main` HEAD with A and B included.
4. v4 spec committed to `Catena-X_Pivot` at commit `291e719`.

Verification:
```bash
git fetch origin
git checkout Catena-X_Pivot
git log --oneline -1                  # expect: 291e719 (or later)
git merge-base --is-ancestor cbcd408 HEAD && echo "Phase A in branch ✓"
git merge-base --is-ancestor 105e508 HEAD && echo "Phase B in branch ✓"
ls docs/ichnos_website_CatenaX_pivot_spec_v4.md
```

**Commit pattern on `Catena-X_Pivot`.** Phases land in serial order
as one or a small number of commits each. Lint and tests must pass
after every commit; no commit may leave the working tree in a
half-implemented state.

| Phase | Commit subject prefix | Order | Depends on |
| --- | --- | --- | --- |
| C | `feat(client): Phase C — services restoration` | First | A, B (already in branch) |
| D | `feat(client): Phase D — passport page` | After C | C committed on branch |
| E | `feat(client): Phase E — homepage tone-down` | After D | C and D committed on branch |

**Why serial.** Phase D's `/passport` page links back to the Services
page by anchor (`#engineering`, `#compliance`, `#circularity`).
Phase E's homepage Services snapshot consumes the data Phase C
restores. Out-of-order implementation breaks tests.

**Mid-flight staging verification (optional).** Between phase commits,
the implementer can push `Catena-X_Pivot` to origin and trigger a
preview deployment on its own URL (Vercel auto-builds the branch as a
preview if Git integration is healthy). That gives a visual sanity
check without involving `staging`.

**Final PR and promotion sequence:**

1. After Phase E commits on `Catena-X_Pivot` and the full suite is
   green, push: `git push origin Catena-X_Pivot`.
2. Open the PR:
   ```bash
   gh pr create --base main --head Catena-X_Pivot \
     --title "feat(client): Catena-X pivot — Phases C, D, E"
   ```
3. Review the diff, merge into `main`.
4. Sync to staging:
   ```bash
   gh workflow run "Sync main → staging" --ref main
   ```
   (PR #145's Deploy Hook patch is already merged, so the sync
   workflow auto-triggers Vercel builds.)
5. Visual QA at `https://staging-client.ichnos-protocol.com` against
   the acceptance criteria in §11 of this spec.
6. Once all §11 criteria pass on staging, promote to production via
   the `main → release` PR and the standard promote-to-production
   workflow.

---

## 1. Global brand surfaces

### 1.1 Top-nav logo — `client/src/components/atoms/Logo.jsx` + `client/src/index.css` **[A]**

- Source: `/Ichnos-protocol_logo_transparent.png` (transparent background).
- Class: `.logo-img`, height **168px** (3× the v3 56px).
- All four `LOGO_SOURCES` theme keys point at the same transparent file.

### 1.2 Footer logo — same component, different class

- Source: same transparent PNG as 1.1 **[A]**.
- Class: `.footer-logo`, height **64px** (unchanged from v3).

### 1.3 Brand tagline (footer attribution row) — `client/src/components/organisms/Footer.jsx` **[A]**

- `BRAND_DESCRIPTION` constant value:

  > Line 1 (Brand): Battery advisory and EU battery-passport integration for ASEAN.
  > Line 2 (credential, smaller text): Official Catena-X Qualified Advisory Provider.

  (Exactly this string. No "Kuala Lumpur".)

### 1.4 Registered legal-entity row — `client/src/components/organisms/Footer.jsx`

- `ATTRIBUTION_TEXT` constant value:

  > © 2026 Ichnos Protocol Pte. Ltd. — All rights reserved.

  (Existing copy retained.)

### 1.5 SEO default OG image alt — `client/src/constants/seoMeta.js`

The v3 alt string (_"Catena-X-compatible ASEAN data layer for the European
battery passport"_) is retired — it led with Catena-X and used the
"data layer" jargon Francesco rejected for the footer. v4 mirrors the
§1.3 footer brand line and appends the Catena-X title through the
runtime toggle helper so it auto-flips when the qualification is
granted.

**Implementation:**

```js
import { getCatenaXFullTitle } from "./catenaXStatus";

const DEFAULT_OG_IMAGE_ALT = `Ichnos Protocol — Battery advisory and EU battery-passport integration for ASEAN. ${getCatenaXFullTitle()}.`;
```

**Rendered output while the toggle is off (`CATENA_X_QUALIFICATION_GRANTED = false`):**

> Ichnos Protocol — Battery advisory and EU battery-passport integration for ASEAN. Official Catena-X Qualified Advisory Provider (qualification in progress).

(~160 characters. Over the 125-char ideal for accessibility tooling,
but social-preview crawlers and screen readers do not break at that
boundary — they truncate visually if needed and index the full string.)

**Rendered output when the toggle flips to `true`:**

> Ichnos Protocol — Battery advisory and EU battery-passport integration for ASEAN. Official Catena-X Qualified Advisory Provider.

(130 characters — within ideal range.)

**Why the helper, not a literal:** OG meta is part of `<head>` markup
that crawlers and screen readers consume as plain text — there is no
DOM to render the muted `<span>` variant from `CatenaXQualifierSpan`.
The plain-text helper `getCatenaXFullTitle()` (from §0a) produces the
same string the rendered HTML would carry, including or excluding
the qualifier per the runtime toggle. Single source of truth, same
rule as §9.1.

**Implementer's gate:** the literal string `"Catena-X-compatible ASEAN
data layer"` must not appear anywhere in `client/src/`. The v3 phrasing
is retired across the board.

### 1.6 Page themes — Advisory (default), Catena-X (active for `/passport`), Solana (preserved, dormant)

The site uses CSS-variable-driven theme scoping (the v3 mechanism is
unchanged): a wrapper element gets a class like `.theme-X`, and the
nested CSS variables override the defaults declared on `:root` /
`body`. Three themes exist after v4 lands; only two are consumed by
v4 routes.

**1.6.1 Theme inventory.**

| Class | Status in v4 | Consumed by | Look |
| --- | --- | --- | --- |
| (default — declared on `body`) | Active | All advisory routes (`/`, `/services`, `/team`, `/contact`) | Charcoal/light advisory palette per current v3 `index.css` |
| `.theme-catenax` | **New, active** | `/passport` route via `CatenaXThemeLayout.jsx` | Deep navy / near-black backdrop with Eclipse-style cyan/teal accents. Inspired by the Eclipse Tractus-X open-source project (`github.com/eclipse-tractusx`) and the broader Catena-X data-space visual register. No neon gradients — explicitly NOT Solana-derived. |
| `.theme-solana` | **Renamed, dormant** | None in v4. Layout file `SolanaThemeLayout.jsx` exists but no route uses it. | Dark navy + Solana neon green→purple gradient — exactly the v3 `.theme-passport` look, preserved for a future Battery Passport product page. |

**1.6.2 New layout — `client/src/components/templates/CatenaXThemeLayout.jsx`.**

A thin wrapper component, ≤30 lines, that renders `<div className="theme-catenax">{children}</div>`. Identical structure to the existing
`AdvisoryThemeLayout.jsx`. Used in `App.jsx` only by the `/passport`
route (see §5.1).

**1.6.3 Renamed layout — `SolanaThemeLayout.jsx`.**

The v3 `DataThemeLayout.jsx` renames to `SolanaThemeLayout.jsx` with
the class name flipped from `.theme-passport` → `.theme-solana`. No
route consumes it in v4. Kept on disk because the v3 visual identity
is intentionally preserved as a future product-mode showroom theme.

**1.6.4 CSS token blocks in `client/src/index.css`.**

The existing `.theme-passport { … }` block is renamed to
`.theme-solana { … }` with identical token values (no visual
regression for the preserved theme). A new `.theme-catenax { … }`
block is added. Starting palette for the Catena-X theme, to be
refined against the live Eclipse Tractus-X visual identity
(`github.com/eclipse-tractusx`) before ship — see §1.6.6:

```css
/* ========== Theme: Catena-X (active on /passport) ========== */
/* Visual identity inspired by the Eclipse Tractus-X project
   (github.com/eclipse-tractusx) and the broader Catena-X data-space
   visual language: deep navy / near-black backdrop with Eclipse-
   register cyan/teal accents. Intentionally NOT a Solana-derived
   theme — no neon green→purple gradients, no high-saturation
   midtones. The Solana-flavoured dark theme is preserved separately
   as .theme-solana for a future product page.

   Token values below are a starting point. Before the Phase D PR
   merges, the implementer MUST inspect the Eclipse Tractus-X
   organisation pages and a representative Tractus-X repo README
   (rendered on github.com/eclipse-tractusx) in DevTools, copy the
   actual hex values used for hero backgrounds, primary accents,
   and link colours, and replace the placeholders below. */
.theme-catenax {
  --color-bg-base: #0F0F23;          /* deep navy, near-black (placeholder) */
  --color-bg-alt: #1B1B3A;           /* slightly lighter for section variation */
  --color-surface: #232347;          /* card / panel surface */
  --color-accent-primary: #00B0E1;   /* Eclipse cyan (placeholder, verify) */
  --color-accent-cyan: #00C7CB;      /* secondary Tractus-X teal (placeholder) */
  --color-accent-warm: #FFC107;      /* subdued warm callout for notes/badges */
  --color-text-primary: #F1F5F9;     /* near-white */
  --color-text-secondary: #9CA3AF;   /* light gray */
  --color-border: rgba(241, 245, 249, 0.12);
  /* NO --color-gradient-start / --color-gradient-end exposed.
     The Catena-X theme intentionally drops the Solana-style neon
     gradient. If a /passport headline needs visual emphasis, use a
     single accent colour or a subtle within-palette tonal shift —
     never a high-saturation rainbow gradient. */
  background-color: var(--color-bg-base);
  color: var(--color-text-primary);
}

/* ========== Theme: Solana (renamed from .theme-passport, dormant) ========== */
/* No route consumes this in v4. Preserved verbatim from v3
   .theme-passport so a future Battery Passport product page can adopt
   it again without re-deriving the palette. */
.theme-solana {
  --color-bg-base: #0A1628;
  --color-bg-alt: #1A2744;
  --color-surface: #1A2744;
  --color-accent-primary: #1E90FF;
  --color-accent-cyan: #00D1C1;
  --color-accent-warm: #C8A24E;
  --color-gradient-start: #14F195;
  --color-gradient-end: #9945FF;
  --color-text-primary: #E8ECF1;
  --color-text-secondary: #8B9DC3;
  background-color: var(--color-bg-base);
  color: var(--color-text-primary);
}
```

**1.6.5 Tests.**

- `client/src/components/theme-scoping.test.jsx` — update assertions:
  - Rename the existing `.theme-passport` test to `.theme-solana` and
    verify the renamed class still resolves the same token values.
  - Add a new test for `.theme-catenax` that verifies the new class
    resolves the new token values (or at minimum that `--color-bg-base`
    differs from the default and from `.theme-solana`).
- The Navbar's logo-theme branching (`pathname === '/data'` in v3) is
  removed; `/data` no longer exists as a live route in v4. The Logo
  component currently routes every theme to the same transparent PNG
  (per §1.1), so no per-theme logo swap is required.

**1.6.6 Colour refinement before merge.**

The `.theme-catenax` palette is a defensible starting point but is
**not** the authoritative Catena-X / Tractus-X brand kit. Before the
Phase D PR merges, the implementer must:

1. Open `https://github.com/eclipse-tractusx` in a browser with
   DevTools.
2. Inspect the rendered GitHub organisation header, the project
   README hero banners, and any docs-site links the org pages point
   at (e.g., `eclipse-tractusx.github.io`).
3. Copy the exact hex values used for hero backgrounds, primary
   accents (link colour, button colour), and secondary accents
   (badge fills, callout borders).
4. Replace the placeholder hex values in `.theme-catenax` with the
   verified Eclipse-register colours.
5. Note any constraints in the comment block above the CSS so a
   future implementer doesn't drift the palette back toward Solana
   neon or some other off-brand mid-saturation accident.

The intent is: when a Catena-X reviewer lands on `/passport`, the
visual register should read as "this is a Catena-X-fluent practice",
not "this is a generic dark-mode product page".

---

## 2. Navbar — `client/src/constants/navigation.js` + `client/src/components/organisms/Navbar.jsx`

### 2.1 Top-level items, in left-to-right order **[B]**

```js
export const NAV_ITEMS = [
  {
    label: "Company",
    activeSectionId: "company",
    children: [
      { label: "Why Ichnos", sectionId: "company" },
      { label: "Team", path: "/team" },
    ],
  },
  {
    label: "Services",
    path: "/services",
    sectionId: "services",
    activeSectionId: "services",
  },
  { label: "Battery Passport", path: "/passport" },
  {
    label: "Contact",
    path: "/contact",
    sectionId: "contact",
    activeSectionId: "contact",
  },
];
```

Notes:

- Phase B currently has `Battery Passport` pointing at `/data` (route hadn't
  been renamed yet). Phase D flips it to `/passport`.
- The `Company` parent is a dropdown (has `children`). All other items are
  flat links.

### 2.2 Mobile overlay — `client/src/components/organisms/MobileNavOverlay.jsx`

- Renders the dropdown children **inline** (not behind a click) so the
  overlay is one-level. Section label = parent label ("Company").
- Order matches 2.1 left-to-right top-to-bottom.

### 2.3 Login button

- Right-aligned in the desktop navbar.
- Label: `Login` (existing copy retained).
- Opens the auth modal in `login` mode.

### 2.4 Mobile hamburger

- Right-aligned, aria-label `Open menu`.
- Existing behaviour retained.

### 2.5 LANDING_SECTION_IDS — `client/src/constants/navigation.js`

```js
export const LANDING_SECTION_IDS = [
  "company",
  "services",
  "passport",
  "contact",
];
```

Note: Phase B currently has `'data'` instead of `'passport'`. Phase E flips
this when the homepage section is renamed in 3.5.

---

## 3. Landing page (`/`) — `client/src/components/pages/LandingPage.jsx`

Section order, top to bottom: 3.1 Hero, 3.2 Why Ichnos, 3.3 Services snapshot,
3.4 Battery Passport teaser, 3.5 Contact teaser. No other sections. The v3
`HOMEPAGE_COMMITMENT`, `HOMEPAGE_OFFER_CARDS`, and `HOMEPAGE_STACK_BAND`
blocks are deleted entirely — their content lives in §3.4 and §4.

### 3.1 Hero block — `client/src/components/organisms/Hero.jsx` + `client/src/constants/landingContent.js`

`HERO_CONTENT` shape:

```js
export const HERO_CONTENT = {
  eyebrow: "EU BATTERY PASSPORT INTEGRATION FOR ASEAN",
  headline:
    "From regulatory compliance to seamless integration into the circular value chain.",
  subhead:
    "Practitioner-led advisory in battery systems engineering, safety, mechanical development, remanufacturing and integration into the Catena-X battery-passport ecosystem.",
  ctaText: "Explore Our Services",
  ctaHref: "/services",
};
```

- **Eyebrow** rendered with `.section-eyebrow` class (small uppercase, secondary
  text colour).
- **Headline** rendered with `.gradient-text` class on a dark grey background.
  Period at the end is intentional.
- **Subhead** rendered with `.section-subtext` class.
- **CTA**: single button, no secondary CTA. Class `.hero-cta-btn`.

`Hero.jsx` consumes `HERO_CONTENT.headline` (not `tagline`). The v3 field
`tagline` is removed from the constant.

### 3.2 Why Ichnos block — id="company"

`landingContent.js`:

```js
export const WHY_ICHNOS = {
  heading: "Why Ichnos",
  paragraphs: [
    "Ichnos Protocol is a Singapore-incorporated battery advisory practice run by Dr.-Ing. Francesco Maltoni — ex-FEV lead battery expert in battery-system engineering, PhD at the Chair of Production Engineering of Electromobility Components (PEM) of the RWTH-Aachen University, with more than 20 years in R&D roles within the automotive industry.",
    "The practice covers battery systems engineering, safety, mechanical development, and remanufacturing and extends into the EU battery-passport ecosystem as an Official Catena-X Qualified Advisory Provider. Ichnos brings ASEAN battery manufacturers into the European data flow so EU importers and customers get a compliant, traceable passport embedded in their supply chain infrastructure.",
  ],
};
```

- Rendered as a `<section id="company">` containing an `<h2>` (the heading)
  and two `<p>` paragraphs in order.
- New component if needed: `client/src/components/organisms/WhyIchnosSection.jsx`,
  ≤60 lines JSX.

### 3.3 Services snapshot block — id="services"

- Component: existing `ServicesSnapshot.jsx` reused.
- Data source: `SERVICES_LIST` from `services.js` (per §4.2.1) — all 9 cards.
- Layout: pillar-grouped grid in the order Engineering → Compliance →
  Circularity.
- Footer link below the grid: `See full services →` linking to `/services`
  (existing pattern retained).

### 3.4 Battery Passport teaser block — id="passport"

**Audience: first-time visitor (per §0c). Plain language. No
Catena-X / EDC / SAMM / AAS / data-space jargon in this block — those
appear further down on `/passport` for the audience that expects them.**

`landingContent.js`:

```js
export const PASSPORT_TEASER = {
  heading: "The European battery passport: what it means for ASEAN suppliers.",
  body: "From 2027, every battery sold in Europe has to carry a digital passport: a structured record along the whole value chain, from raw-materials suppliers through cell makers and pack integrators into the European importers and OEMs. The chain only works if every supplier passes the passport-relevant data on to the next tier. The Catena-X network is establishing itself as a standard in the automotive, chemical and other industries, to enable suppliers to do that within a rich ecosystem of certified applications, maitaining their data ownership. Ichnos helps each supplier hand over exactly what their customer needs while keeping control of their own data.",
  ctaLabel: "Read the passport overview →",
  ctaHref: "/passport",
};
```

- Rendered as `<section id="passport">`.
- Single paragraph, single CTA. No graphics in this teaser — the visual
  stack diagram and the Catena-X technical detail live on `/passport`
  (§5.5 onward).
- **Allowed acronyms in this block:** `EU` only. Spell out everything
  else inline ("Regulation (EU) 2023/1542" is acceptable on first
  mention but optional — "Europe's new battery regulation" is preferred
  here).
- **Why this paragraph, not a shorter one:** the value-chain depth +
  data-sovereignty angle is the explicit supplier-onboarding pitch.
  The audience for this block includes the ASEAN suppliers Ichnos
  needs to onboard, not just EU importers. Telling them they keep
  control of their own data while still passing what's required up
  the chain is the proposition that gets them to engage.

### 3.5 Contact teaser block — id="contact"

- Component: existing `ContactSection.jsx` retained.
- Content: existing copy retained (form fields, AI assistant prompt,
  calendar link).

---

## 4. Services page (`/services`) — `client/src/components/pages/ServicesPage.jsx`

### 4.1 Hero — `AdvisoryPageHero` component

`services.js`:

```js
export const SERVICES_PAGE_CONTENT = {
  title: "Services & Solutions",
  subtitle:
    "Expert consulting for battery development, EU battery-passport readiness, and the circular value chain.",
};
```

Rendered as `<AdvisoryPageHero title={...} subtitle={...} />`.

### 4.2 Services data structure — `client/src/constants/services.js`

`SERVICES_LIST` is an array of 9 cards. Pillar field values: `"engineering"`,
`"compliance"`, `"circularity"`. ID strings are stable — they are used as
DOM anchors and as keys in tests; do not change without updating
`structuredData.js` and any consumer test.

The full restored + extended `SERVICES_LIST`:

```js
export const SERVICES_LIST = [
  // ── Engineering ──
  {
    id: "battery-systems-safety",
    icon: "bi-shield-check",
    title: "Battery Systems & Safety Engineering",
    tagline:
      "System architecture, requirement and test management, and full FMEA discipline.",
    description:
      "System architecture, requirement and test management, and full FMEA discipline — S-FMEA, D-FMEA, P-FMEA — across cell, module, and pack levels. Test planning, traceability, and design-review support for battery development programs that need rigorous engineering process from concept to SOP.",
    pillar: "engineering",
    deliveryMethod: false,
  },
  {
    id: "battery-mechanical-development",
    icon: "bi-tools",
    title: "Battery Mechanical Development",
    tagline:
      "Pack architecture, cell housing, thermal hardware, and design-for-manufacture.",
    description:
      "Pack and module mechanical design, cell housing, thermal hardware integration, and design-for-manufacture. Drawing on a doctorate in Production Engineering of E-Mobility Components and patents on battery modules and aluminium cell housings.",
    pillar: "engineering",
    deliveryMethod: false,
  },
  {
    id: "technical-lead-battery-systems",
    icon: "bi-person-workspace",
    title: "Technical Lead — Battery Systems",
    tagline:
      "Embedded technical leadership and agile project management for battery development programs.",
    description:
      "Embedded senior battery expertise for early-stage teams and in-house programs that need experienced direction without a full-time hire — combined with sprint cadence, requirement traceability, milestone management, and cross-functional coordination. PSM I (Professional Scrum Master™ I) certified, backed by thirteen years of cross-functional project engineering across Ducati, Technogym, and FEV — from gasoline engines and motorcycle design through electrification and vehicle battery systems.",
    pillar: "engineering",
    deliveryMethod: false,
  },
  // ── Compliance ──
  {
    id: "eu-asean-compliance-bridge",
    icon: "bi-globe-asia-australia",
    title: "EU–ASEAN Battery Compliance Bridge",
    tagline:
      "Translating European battery regulation into ASEAN supply-chain reality — and vice versa.",
    description:
      "Translating European battery regulation into ASEAN supply-chain reality — and vice versa. Coverage includes EU 2023/1542, Malaysian MS 2818, regional certification frameworks, and supplier alignment for OEMs operating across both regions. Practitioner-grade understanding of where regulatory text meets the factory floor.",
    pillar: "compliance",
    deliveryMethod: false,
  },
  {
    id: "battery-passport-integration",
    icon: "bi-shield-fill-check",
    title: "Battery Passport Integration",
    tagline:
      "Integration and gap-bridging across the value chain into the Catena-X EU digital battery passport.",
    description:
      "Identifying and closing the data gaps that block ASEAN-made batteries and components from being seamlessly integrated into a EU-compliant digital battery passport. Hands-on work on data model design, supplier data collection workflows, and carbon-footprint pipelines, connected to the Catena-X data space and to the EU importer's passport stack.",
    pillar: "compliance",
    deliveryMethod: false,
    passportLink: "/passport",
  },
  {
    id: "strategic-consulting-passport-data-infrastructure",
    icon: "bi-diagram-3",
    title: "Strategic consulting — battery passport data infrastructure",
    eyebrow: "Official Catena-X Qualified Advisory Provider",
    tagline:
      "Architecting the data flows, schemas, and integration paths for an EU-compliant Catena-X battery-passport stack.",
    description:
      "Architecting the data flows, schemas, and integration paths for European importers and ASEAN manufacturers building a Catena-X-compatible battery passport stack from the ground up. Schema design, EDC connector planning, data sovereignty model, audit-trail strategy. Standards-grounded in Catena-X CX-0143, EU 2023/1542, DIN DKE SPEC 99100, MS 2818.",
    pillar: "compliance",
    deliveryMethod: false,
  },
  {
    id: "catena-x-supplier-onboarding",
    icon: "bi-clock-history",
    title: "Catena-X supplier onboarding services",
    tagline:
      "Onboarding ASEAN battery manufacturers and their European partners into the Catena-X data space.",
    description:
      "Hands-on onboarding of ASEAN suppliers into Catena-X — operational delivery is being scaled up. Strategy, gap analysis, and integration architecture for the same supply chains are available today under strategic consulting.",
    pillar: "compliance",
    deliveryMethod: false,
    comingSoon: true,
  },
  // ── Circularity ──
  {
    id: "remanufacturing-recycling-circular-economy",
    icon: "bi-arrow-repeat",
    title: "Battery Remanufacturing, Recycling & Circular Economy",
    tagline:
      "Second-life pathways, design for remanufacturing, design for recycling, design for cost.",
    description:
      "Second-life pathways, design for remanufacturing, design for recycling, and design for cost. PhD-level expertise in circular-economy battery systems.",
    pillar: "circularity",
    deliveryMethod: false,
  },
];
```

(Credentials previously appended here — RWTH Innovation Award, peer-reviewed
publications, PEM lectureship — moved to §6.2 Francesco's bio per Francesco's
review.)

`SERVICE_PILLARS` array (in display order):

```js
export const SERVICE_PILLARS = [
  { id: "engineering", label: "Engineering", anchor: "engineering" },
  { id: "compliance", label: "Compliance", anchor: "compliance" },
  { id: "circularity", label: "Circularity", anchor: "circularity" },
];
```

`getServicesByPillar(pillarId)` helper retained from the v2 implementation.

### 4.3 Pillar sections — `ServicesPage.jsx` body

Page body iterates `SERVICE_PILLARS` in order and renders one `ServicesGroup`
per pillar. Each `ServicesGroup` receives `services = getServicesByPillar(pillar.id)`.

`ServicesGroup` renders an `<h2>` (pillar label), an optional intro paragraph,
and a 3-column grid of service cards. No intro paragraph required at this
time — the heading alone is enough.

#### 4.3.1 Engineering pillar (3 cards in order)

| Position | Card id                          | Title                                |
| -------- | -------------------------------- | ------------------------------------ |
| 1        | `battery-systems-safety`         | Battery Systems & Safety Engineering |
| 2        | `battery-mechanical-development` | Battery Mechanical Development       |
| 3        | `technical-lead-battery-systems` | Technical Lead — Battery Systems     |

Card visual: `ServiceCard` component, full description visible, no badge.

#### 4.3.2 Compliance pillar (4 cards in order)

| Position | Card id                                             | Title                                                       |
| -------- | --------------------------------------------------- | ----------------------------------------------------------- |
| 1        | `eu-asean-compliance-bridge`                        | EU–ASEAN Battery Compliance Bridge                          |
| 2        | `battery-passport-integration`                      | Battery Passport Implementation                             |
| 3        | `strategic-consulting-passport-data-infrastructure` | Strategic consulting — battery passport data infrastructure |
| 4        | `catena-x-supplier-onboarding`                      | Catena-X supplier onboarding services                       |

Card 3 visual: standard card. The `eyebrow` field renders as a small uppercase
chip above the title, class `.service-card-eyebrow` (new) or reuses `.section-eyebrow`.

Card 4 visual: **grayed / "coming soon" treatment**. Visual rules:

- `.service-card--coming-soon` class on the card root.
- Card border: dashed, lighter shade (`var(--color-border)` at 60% opacity).
- Card body text colour: `var(--color-text-secondary)` at 60% opacity.
- Icon: lower contrast.
- **No hover transform.**
- **No CTA / no `passportLink`.**
- No "Coming Soon" ribbon graphic — the visual desaturation plus the body
  text (the §4.2 description, which now reads "Hands-on onboarding … is
  being scaled up. Strategy … available today under Strategic consulting")
  is the entire signal.

Card 2 (`battery-passport-implementation`) renders a `Learn more →` link
to `/passport` (existing pattern from v2 was `passportLink: "/passport"`).

#### 4.3.3 Circularity pillar (1 card)

| Position | Card id                                      | Title                                                 |
| -------- | -------------------------------------------- | ----------------------------------------------------- |
| 1        | `remanufacturing-recycling-circular-economy` | Battery Remanufacturing, Recycling & Circular Economy |

### 4.4 Contact CTA at bottom of services page

- Component: existing `ContactSection` retained.
- Anchor: id="contact".

### 4.5 SEO meta — `client/src/constants/seoMeta.js`

`SERVICES_META`:

```js
export const SERVICES_META = buildMeta({
  path: "/services",
  title: "Services — Ichnos Protocol",
  description:
    "Battery systems engineering, mechanical development, technical leadership, EU 2023/1542 compliance, Catena-X battery-passport integration, remanufacturing, and circular-economy services. Singapore-incorporated.",
  keywords:
    "battery systems engineering, FMEA, battery passport implementation, Catena-X consulting, EU 2023/1542, MS 2818, ASEAN battery, circular economy, remanufacturing",
});
```

### 4.6 Structured data — `client/src/constants/structuredData.js`

`SERVICE_SCHEMAS` array rebuilt to mirror the 9 cards in 4.2. Each entry uses
the helper `service(name, description)`. `areaServed: ["EU", "ASEAN"]` per §1.

---

## 5. Battery Passport page (`/passport`) — new `PassportPage.jsx`

Replaces v3's `/data` and `/catena-x` pages.

### 5.1 Route & redirects — `client/src/App.jsx` + `client/vercel.json`

- New route: `<Route path="/passport" element={<PassportPage />} />` under a
  **new Catena-X theme layout** (`client/src/components/templates/CatenaXThemeLayout.jsx`,
  newly authored). The layout applies the `.theme-catenax` token set,
  styled per §1.6 to echo the Eclipse Tractus-X visual register —
  deep navy backdrop, Eclipse-cyan accents, no Solana-style neon
  gradients. The v3 `DataThemeLayout.jsx` is **renamed** to
  `SolanaThemeLayout.jsx` and the `.theme-passport` CSS block is
  **renamed** to `.theme-solana`. Both are preserved but no route
  consumes them in v4 — retained for a future Battery Passport
  product showroom.
- Legacy redirects (preserve external SEO links):
  - `<Route path="/data" element={<Navigate replace to="/passport" />} />`
  - `<Route path="/catena-x" element={<Navigate replace to="/passport" />} />`
- `client/vercel.json` rewrites add 301-equivalents:
  - `{ "source": "/data", "destination": "/passport", "permanent": true }`
  - `{ "source": "/catena-x", "destination": "/passport", "permanent": true }`

**External-link dependency — why the 301s are business-critical, not
just SEO hygiene (H5 answer).** Francesco has published LinkedIn
posts and outreach material that point at `https://ichnos-protocol.com/data`
and `https://ichnos-protocol.com/catena-x` as canonical landing pages.
Real human traffic comes through those URLs from those posts. The
redirects must therefore satisfy two requirements:

1. **Correctness over cleverness.** Each 301 must land directly on
   `/passport` (the consolidated page). Do not introduce a "landing
   redirect" intermediate page, a query-string preservation, or a
   modal pop-up. A click on a LinkedIn post should arrive at
   `/passport` with no perceptible hop.
2. **Forever-stable.** Once these 301s ship, they stay in
   `client/vercel.json` indefinitely. Removing or repurposing them
   later breaks the LinkedIn post archive. If `/passport` ever
   itself moves (e.g., to `/battery-passport`), update the rewrite
   `destination` rather than deleting the rule.

Out-of-code dependencies the implementer should also flag (no code
change required during Phases C-E, but documented here so future
work picks them up):

- **Google Search Console** — if `/data` or `/catena-x` were
  submitted as verified URLs or had explicit index requests, the
  redirect chain will gradually be honoured by Google but the
  console may show "soft 404" warnings for ~2–4 weeks. Acceptable;
  no action needed beyond the 301.
- **Google Analytics / Plausible / any conversion tracking** — if
  any conversion goals were keyed to the path `/data` or
  `/catena-x`, those goals stop firing once visitors are
  redirected. If the analytics setup matters, reconfigure goals to
  trigger on `/passport` after the rename ships. Out of scope for
  Phases C-E.
- **LinkedIn post archive** — no action possible; the post URLs
  are immutable. The 301 redirect IS the fix.

### 5.2 Page sections, top to bottom

1. Hero (§5.3)
2. Status quo + milestones of the EU battery passport (§5.4)
3. The case for seamless value-chain data flow (§5.5)
4. Catena-X stack — short factual intro with outbound pointer (§5.6)
5. Ichnos role in the value chain (§5.7)
6. What Ichnos does on this page (§5.8)
7. Contact CTA (§5.9)

### 5.3 Hero block

`passportContent.js`:

```js
export const PASSPORT_HERO = {
  eyebrow: "EU BATTERY REGULATION 2023/1542",
  title: "The European battery passport and the role of Ichnos.",
  subtitle:
    "Status, milestones, the Catena-X data stack, and the ASEAN ↔ EU integration paths.",
};
```

Component: reuse `AdvisoryPageHero` from §4.1.

### 5.4 Status quo + milestones section

`passportContent.js`:

```js
export const PASSPORT_STATUS = {
  heading: "Status quo and milestones",
  intro:
    "Regulation (EU) 2023/1542, the EU Battery Regulation, introduces the digital battery passport, the carbon-footprint declaration, supply-chain due diligence, and recycled-content thresholds. The economic operator placing the battery on the EU market is legally responsible for the passport.",
  milestones: [
    {
      date: "18 February 2025",
      text: "Article 7 carbon-footprint declaration applies to new EV batteries placed on the EU market.",
    },
    {
      date: "18 August 2025",
      text: "Articles 47–53 due-diligence obligations enter into force.",
    },
    {
      date: "18 February 2027",
      text: "Annex XIII digital battery passport data set applies — every EV battery and industrial battery > 2 kWh placed on the EU market must carry one.",
    },
    {
      date: "18 August 2028",
      text: "Recycled-content reporting begins (Article 8).",
    },
    {
      date: "Ongoing",
      text: "JRC carbon-footprint methodology (CFB-EV, CFB-IND) and the delegated acts refine the calculation rules. MS 2818 is the Malaysian Standard reference for the same problem in the ASEAN context.",
    },
  ],
};
```

Visual: vertical timeline list, each milestone as a `<li>` with date emphasised.

### 5.5 The case for seamless value-chain data flow

`passportContent.js`:

```js
export const PASSPORT_CASE = {
  heading: "The case for seamless value-chain data flow",
  paragraphs: [
    "The passport is not a document the importer fills in at the border. It is a dataset that must accompany the physical goods from raw-materials extraction, through refining, through the ASEAN-made materials, precursors, electrodes, cells, and modules, into the pack and system integrator, and finally into the EU importer's complete passport.",
    "The default state today is that this travel does not happen, so the data need to be gathered manually and aligned and aggregated painfully by hand. An EV battery containing an ASEAN-made cell starts a passport with no upstream data attached — the importer is legally responsible for a dataset they have no native way to source and rely on the cooperation of the supplier. This raises the costs and friction of onboarding new suppliers, because multiple lines of communication and trust need to be established",
    "The fix is not to build a parallel passport. It is to integrate the ASEAN supply chain's data into the same Catena-X-compatible data flows the European passport stack consumes, with the right schemas, the right exchange runtime, and the right chain-of-custody.",
  ],
};
```

Visual: three paragraphs, no graphics.

### 5.6 Catena-X stack — factual intro with pointer

`passportContent.js`:

```js
export const PASSPORT_CATENAX = {
  heading: "The Catena-X data stack",
  body: "The Catena-X network is the European automotive data space and offers a standardised way to exchange supply chain and passport data between organisations. Its built on standardized blocks: common semantic schemas (CX-0143 sub-aspects on the AAS / SAMM standard), standardized connectors such as the Eclipse Dataspace Connector (EDC), and a federated identity model based on Verified Credentials where each participant retains data sovereignty. The battery passport's machine-readable data layer is delivered on this stack.",
  pointer: {
    label: "Read the Catena-X introduction →",
    href: "https://catena-x.net/en/about-us",
    external: true,
  },
};
```

Visual: heading, one paragraph, a small outbound link (`target="_blank" rel="noopener"`).

**Do not paraphrase Catena-X's own marketing copy.** This section is a brief
factual pointer, not a marketing piece.

### 5.7 Ichnos role in the value chain

`passportContent.js`:

```js
export const PASSPORT_LOCALIZATION = {
  heading: "Ichnos role in the value chain",
  intro:
    "The EU battery passport carries data from every layer of the value chain. Each layer has established, specialised providers. Ichnos's core competence is the middle of this chain: cells, modules, and packs, where ASEAN manufacturing concentrates and where the data gap to the EU passport is widest. When the customer prefers a single point of accountability, Ichnos also integrates the adjacent layers (raw materials, ESG and due-diligence, finished passport assembly) into the same Catena-X data flow.",
  layers: [
    { id: "raw-materials", label: "Raw materials" },
    { id: "esg", label: "ESG & due-diligence" },
    {
      id: "ichnos",
      label: "Cells, modules and packs (ASEAN manufacturing)",
      role: "Ichnos — core competence",
      highlight: true,
    },
    { id: "passport-identity", label: "Passport & identity" },
    { id: "eu-importer", label: "EU importer / OEM" },
  ],
  twoColumn: {
    asean: {
      heading: "ASEAN side (Ichnos's primary delivery zone)",
      bullets: [
        "Material composition, manufacturing-site data, and carbon-footprint data captured at the cell, module, and pack level.",
        "ESG and supply-chain due-diligence evidence gathered at the supplier site (cobalt, lithium, natural graphite, nickel).",
        "Supplier readiness for Catena-X onboarding.",
        "On-site verification across Singapore, Indonesia, Vietnam, Thailand, Malaysia, Philippines.",
        "Data-model translation from ASEAN standard (such as Malaysian MS 2818) into EU 2023/1542-compliant data structures.",
      ],
    },
    eu: {
      heading: "EU side",
      bullets: [
        "Integration of cell, module, and pack data into the importer's existing passport stack.",
        "Schema mapping between source data and the Catena-X passport data model (CX-0143 sub-aspects on AAS + SAMM).",
        "EDC connector planning and data-sovereignty model so each supplier retains control of its own data.",
        "Optional end-to-end extension upstream (raw materials, ESG) or downstream (finished passport assembly) into one Catena-X data flow when the customer wants single-vendor accountability.",
      ],
    },
  },
};
```

**Why this section changed from the v3 wording:**

- v3 listed Minespider / Circulor / Re|Source under raw materials and
  Path.Era / Siemens / Spherity / AVL under passport identity. Reading
  as marketing for competitors and confusing Ichnos's place in the
  picture. v4 keeps the layer band visual but drops the named-providers
  line — the layers are now neutral and the visible "Ichnos — core
  competence" label is the positioning signal.
- v3 didn't show ESG as a distinct layer. v4 adds it between Raw
  materials and Cells/modules/packs because it is a real, separate
  passport-data deliverable under Articles 47-53 / Annex XIV, and
  because Ichnos delivers ESG evidence at the supplier site (visible
  in the ASEAN-side bullet).
- v3 spoke about Ichnos as "ASEAN materials → precursors → electrodes
  → cells → modules". v4 narrows to "cells, modules and packs" — the
  layer where Ichnos's engineering credibility actually applies — and
  keeps the upstream/downstream-extension option as a separate
  sentence in the intro, not as a blanket claim of coverage.

Visual: the layer band reuses the v3 `HOMEPAGE_STACK_BAND` rendering pattern
(horizontal layered band, middle layer highlighted). Below the band, a
two-column row showing the ASEAN side and EU side bullet lists side by side.

### 5.8 What Ichnos does on this page

`passportContent.js`:

```js
export const PASSPORT_OFFER = {
  heading: "What Ichnos does",
  paragraphs: [
    "Ichnos consults on the integration of compliant data models, KITS, data-sovereignty model, audit trail, how to make the best use of the network and supports the ASEAN located battery supplier chain through Catena-X onboarding readiness.",
    "See the full service list on the Services page.",
  ],
  eyebrow: "Official Catena-X Qualified Advisory Provider",
  ctaLabel: "See services →",
  ctaHref: "/services",
};
```

Visual: small eyebrow chip at the top of the block; heading; two paragraphs;
a single text CTA.

### 5.9 Contact CTA

- Component: existing `ContactSection`.
- Anchor: id="contact".

### 5.10 SEO meta — `client/src/constants/seoMeta.js`

**What this constant is for.** `PASSPORT_META` is the metadata that
populates the `<head>` of the `/passport` page. It is **not displayed
on the page itself** — visitors never see it as body content. Three
audiences consume it:

1. **Google and other search engines.** The `title` becomes the bold
   blue link in search results. The `description` becomes the gray
   snippet under the link. The keywords are largely deprecated but
   still indexed by some engines.
2. **Social media platforms** (LinkedIn, Twitter, WhatsApp, Slack).
   When someone pastes the `/passport` URL, the platform's preview
   card reads the `title` and `description` from this constant (plus
   the OG image from §1.5 + §4.1).
3. **Browser tab and screen readers.** The `title` is what appears
   in the tab and what a screen reader announces when the page loads.

The constant is rendered into the page's `<head>` by `react-helmet-async`
(see `SeoHead` component in `client/src/components/molecules/SeoHead.jsx`).

Replace `DATA_META` and `CATENAX_META` with one `PASSPORT_META`:

```js
export const PASSPORT_META = buildMeta({
  path: "/passport",
  title: "The European battery passport — Ichnos Protocol",
  description:
    "Status quo and milestones of the EU 2023/1542 battery passport, the Catena-X network, custom translation of ASEAN battery passport into EU-compliant ones and the ASEAN ↔ EU value chain. Singapore-incorporated.",
  keywords:
    "battery passport, EU 2023/1542, Catena-X, EDC, AAS, SAMM, CX-0143, MS 2818, ASEAN battery, EU importer, value-chain data flow",
});
```

`ALL_META` array entries: drop `DATA_META` and `CATENAX_META`, add
`PASSPORT_META`.

### 5.11 Structured data — `client/src/constants/structuredData.js`

`BreadcrumbList` / sitemap references to `/data` and `/catena-x` removed;
`/passport` added.

---

## 6. Team page (`/team`) — `client/src/components/pages/TeamPage.jsx`

### 6.1 Header

`teamContent.js`:

```js
export const TEAM_PAGE_HEADER = {
  title: "Team",
  subtitle:
    "Practitioners building battery passport data flows between ASEAN manufacturing and the European market.",
};
```

### 6.2 Francesco's bio

`teamContent.js` `TEAM_MEMBERS[0]`:

- `id`: `"francesco"` (unchanged).
- `name`: `"Dr.-Ing. Francesco Maltoni"` (unchanged).
- `title`: `"Founder"` (unchanged).
- `photo`: `"/founder.png"` (unchanged).
- `bio`:

  ```js
  [
    "Dr.-Ing. Francesco Maltoni is the founder of Ichnos Protocol. He spent his engineering career at FEV in Aachen as lead battery expert in battery-system engineering, owning sustainability requirements with customers, leading a battery digital-product-passport pilot on the in-house BMS/cloud-BMS practice, and presenting at Advanced Battery Power Europe 2025.",
    "His doctorate at the RWTH-Aachen University Chair of Production Engineering of Electromobility Components (PEM) covered circular-economy battery systems and was recognised with the 3rd-place RWTH Innovation Award. He authored four peer-reviewed publications on remanufacturing, recycling, and cell housing design, and lectured on battery recycling at the PEM Chair.",
    "He is an Official Catena-X Qualified Advisory Provider, working to bring ASEAN battery manufacturers into the Catena-X data space alongside their European importer customers, bridging the data-flow gap up the value chain without forcing any party to give up data sovereignty.",
  ];
  ```

  (Phase A already removed "Based in Kuala Lumpur." — v4 keeps that.
  The Catena-X title appears as a held credential per §0a.)

- `skillsChips`:

  ```js
  [
    "Battery Systems & Safety (FMEA · requirements · test management)",
    "Battery Passport integration (EU 2023/1542 · MS 2818)",
    "Catena-X integration (Official Catena-X Qualified Advisory Provider)",
    "EU ↔ ASEAN value-chain data flow",
    "EDC / data-space integration",
    "Remanufacturing & Circular Economy",
  ];
  ```

- `showTimeline`: `true` (unchanged).
- `timeline`: existing `CAREER_TIMELINE_FRANCESCO` retained (the locked
  9-entry timeline from `teamTimelines.js`).

### 6.3 Ihsan's entry

`TEAM_MEMBERS[1]` — keep the existing v3 structure but verify `showTimeline:
false` is still set; no other changes for v4.

### 6.4 Vision / core competencies blocks

Existing `VISION_STATEMENT` and `CORE_COMPETENCIES` retained.

### 6.5 SEO meta

`TEAM_META`:

```js
export const TEAM_META = buildMeta({
  path: "/team",
  title: "Team — Ichnos Protocol",
  description:
    "Dr.-Ing. Francesco Maltoni (ex-FEV lead battery expert, Official Catena-X Qualified Advisory Provider) and Ihsan Ahmad (AI, quantitative modelling).",
  keywords:
    "Francesco Maltoni, Ihsan Ahmad, FEV battery expert, Catena-X Advisory Provider, battery passport, ASEAN battery advisory",
});
```

---

## 7. Contact page (`/contact`) — `client/src/components/pages/ContactPage.jsx`

### 7.1 Header

Existing copy retained.

### 7.2 Form

Existing implementation retained. No copy changes.

### 7.3 SEO meta

```js
export const CONTACT_META = buildMeta({
  path: "/contact",
  title: "Contact — Ichnos Protocol",
  description:
    "Talk to Ichnos Protocol about battery systems engineering, EU 2023/1542 battery-passport implementation, Catena-X integration consulting, or remanufacturing. Singapore + EU.",
  keywords:
    "contact Ichnos Protocol, battery systems advisory, battery passport consultation, Catena-X integration, ASEAN battery, EU 2023/1542",
});
```

---

## 8. Footer — `client/src/components/organisms/Footer.jsx`

### 8.1 Brand column (left)

- Logo as 1.2.
- Brand tagline as 1.3 **[A]**.

### 8.2 Company column

```js
{ heading: "Company", links: [
  { label: "Why Ichnos", to: "/", state: { scrollTo: "company" } },
  { label: "Team", to: "/team" },
]}
```

(Existing structure retained.)

### 8.3 Services column

```js
{ heading: "Services", links: [
  { label: "Engineering", to: "/services", state: { scrollTo: "engineering" } },
  { label: "Compliance",  to: "/services", state: { scrollTo: "compliance" } },
  { label: "Circularity", to: "/services", state: { scrollTo: "circularity" } },
]}
```

(Replaces v3's `Data services / Catena-X consulting / Engineering advisory`
triple. The pillar links match the v2 footer.)

### 8.4 Products column

```js
{ heading: "Products", links: [
  { label: "Battery Passport", to: "/passport" },
]}
```

(Phase B currently has this pointing at `/data`; Phase D flips to
`/passport` along with the route.)

### 8.5 Contact column (right)

- Existing structure retained: email, UEN, Submit an Inquiry, registered
  address, social icons.

### 8.6 Attribution row

- Single line, text as 1.4.

---

## 9. Cross-cutting tone & copy guardrails

### 9.1 Catena-X claims

The qualifier on the title is **runtime-controlled** by a single
boolean (see §0a). The spec's directive is "Always render the title via
the helper, never hard-code the qualifier or its absence."

- The full title — **Official Catena-X Qualified Advisory Provider** —
  is the canonical credential string. Every surface that displays it
  consumes the helper from `catenaXStatus.js`, which appends the muted
  "(qualification in progress)" suffix while the toggle is off and
  omits it once the toggle is flipped.
- Shortened forms in body copy when the title doesn't need to read as
  a formal credential:
  - "Catena-X Advisory Provider" (acceptable shortening of the title)
  - "Catena-X integration consulting" (acceptable when describing the
    service rather than the title — does not consume the helper)
- The Catena-X SUPPLIER ONBOARDING service stays marked "coming soon"
  per §4.3.2 / card 4 — that's a service-capacity statement,
  independent of the credential toggle.

**Never claim:** "Catena-X member" (we are not a member, we are a
listed Advisory Provider), "Catena-X certified" (not a Catena-X term),
"Catena-X partner" (a specific consortium relationship we do not hold).

**Implementer's gate:** lint or grep should fail the build if a literal
string `"(qualification in progress)"` appears anywhere other than
`catenaXStatus.js`. The only path that surface ever takes is through
the helper.

### 9.2 Forbidden vocabulary

- `Solana`, `blockchain`, `crypto`, `token`, `immutable ledger`,
  `decentralised` (UK or US spelling) — never appear in user-facing copy.
- `Kuala Lumpur`, `MM2H`, `Penang`, `Karawang`, `Cikarang` — never appear
  in user-facing copy.
- `APAC` — replaced by `ASEAN` everywhere.
- "data theatre" / "theatre" as a pejorative — removed.

### 9.3 Required vocabulary

- The region pair: **EU ↔ ASEAN** (or "European ↔ ASEAN" in narrative
  prose). Never "APAC".
- The legal entity: **Ichnos Protocol Pte. Ltd.** (full), or "Ichnos
  Protocol" (informal). Never "Ichnos" alone in the brand row.
- The standard: **Regulation (EU) 2023/1542** (full first-occurrence
  form per page), then "EU 2023/1542" or "the EU Battery Regulation".

### 9.4 Sentence-structure guardrails

- No section ends with the pattern _"That is the difference between X
  and Y."_ (the v3 rhetorical closer Francesco rejected).
- No more than one rhetorical question per page.
- No emoji in user-facing copy.
- **No em-dashes for subordinate clauses or asides.** Francesco's
  explicit instruction. The pattern _"X consults on the integration —
  schemas, EDC connectors, audit trail — and supports the ASEAN side"_
  is banned. Use plain sentences, colons, or parentheses instead.
  Acceptable rewrites:
  - **Colon** when the second part lists or specifies the first:
    _"Ichnos consults on the integration: schemas, EDC connectors,
    audit trail."_
  - **Period** when the second part is a full thought:
    _"Ichnos consults on the integration. The work covers schemas,
    EDC connectors, and audit trail."_
  - **Parentheses** (sparingly) for genuine asides:
    _"Ichnos consults on the integration (schemas, EDC connectors,
    audit trail)."_
  - The only place an em-dash remains acceptable is the brand row
    pattern _"Ichnos Protocol — Battery advisory…"_ where the dash
    separates the company name from its descriptor and reads as a
    title separator, not as a subordinate-clause interrupter.
- **No metaphorical "where X sits" phrasing.** Francesco's explicit
  instruction. Phrases like _"Where Ichnos sits in the value chain"_,
  _"Where we sit in the stack"_, and similar are banned: long, vague,
  and read as pretentious or colloquial. Use a direct, technical
  phrasing instead:
  - **"Ichnos role in the value chain"** (current §5.7 heading) —
    plain, precise.
  - _"Ichnos operates at the cell, module, and pack level"_ — when
    naming the position.
  - _"Ichnos's primary delivery zone"_ — when describing the scope
    of work.
    The verb "sits" is reserved for actual sitting; do not use it
    metaphorically for organisational, value-chain, or technical
    positioning. The same applies to "Where X lives", "Where X plays",
    "the space X occupies", and any other variant of the same
    metaphor.

### 9.5 No fragile text-matching tests

A general engineering-hygiene rule, derived from the
`messagingGuardrails.test.jsx` failure mode that motivated H1:
**never write a test whose assertion is a long literal string copied
from user-facing copy.** Such tests:

1. Fail loudly on every legitimate copy revision, costing review
   time and creating false signals.
2. Encode the same content twice (once in the constant, once in the
   test), so a change to the canonical source still has to be
   echoed in the test — pure duplication.
3. Drift away from runtime truth — the test passes because the
   string matches, not because the user sees the correct content.
4. Block surgical credential changes (the H1 case) by treating the
   credential text as a forbidden pattern.

**The rule, in three parts:**

- **Test behaviour, not copy strings.** Assert that a heading element
  exists, that a link points at the right route, that a CTA dispatches
  the right action — never that a paragraph contains a specific
  29-word sentence.
- **Import constants, do not duplicate them.** If a test genuinely
  needs to check a piece of copy (e.g., "the footer attribution row
  contains the company legal name"), import the constant from the
  same module the component imports and assert against
  `COMPANY_INFO.legalName`, not against a copy-pasted literal.
- **For credential / regulatory / messaging policy, use the runtime
  toggle.** The Catena-X title is rendered through
  `getCatenaXFullTitle()` (§0a). The test asserts the helper is
  consumed; it does not re-encode the helper's output.

**Specifically banned patterns** (this list will grow as drift is
observed):

- A test that greps a rendered component for a long literal sentence
  copied from a `constants/*.js` file.
- A test that hard-codes the canonical credential string
  (`"Official Catena-X Qualified Advisory Provider"`) anywhere
  outside `catenaXStatus.js`.
- A test that asserts a `forbidden words` list against rendered DOM
  text — that work belongs to a build-time `grep` check (see §11
  acceptance criteria), not to a runtime React test.

**Triage rule when a test fails on a copy change.** If a test would
have to be edited every time Francesco rewrites a paragraph, the test
is the wrong shape. Delete or rewrite it to assert behaviour, not
words.

---

## 10. Files to retire under Phase D

These were created in commit `9233592` (the rebrand) and become unreferenced
after §5 and §3 ship. Each must be deleted only after `grep -r '<basename>'
client/src/` returns no results.

- `client/src/components/pages/CatenaXPage.jsx`
- `client/src/constants/catenaXContent.js` _(if it exists)_
- `client/src/components/organisms/DataHero.jsx`
- `client/src/components/organisms/DataProblemSection.jsx`
- `client/src/components/organisms/DataSolutionSection.jsx`
- `client/src/components/organisms/DataFounderPillars.jsx`
- `client/src/components/organisms/DataSchemaMappingTable.jsx`
- `client/src/components/organisms/DataClosingCta.jsx`
- `client/src/components/templates/DataThemeLayout.jsx` — **rename, do
  not delete.** Rename to `SolanaThemeLayout.jsx` (per §1.6.3). The
  layout becomes dormant in v4 (no route consumes it) but is kept
  alongside the renamed `.theme-solana` CSS block so a future Battery
  Passport product page can adopt it without re-deriving the palette.
- **NEW file** `client/src/components/templates/CatenaXThemeLayout.jsx`
  (per §1.6.2). Thin wrapper that applies `.theme-catenax`. Consumed
  by `/passport` in `App.jsx`.
- `client/src/constants/dataContent.js` _(replaced by `passportContent.js`)_
- `client/src/components/pages/DataPage.jsx` _(replaced by `PassportPage.jsx`)_
- Corresponding `.test.jsx` files for each of the deleted organisms above
  (DataHero, DataProblemSection, DataSolutionSection, DataFounderPillars,
  DataSchemaMappingTable, DataClosingCta, CatenaXPage). The
  `theme-scoping.test.jsx` test file **stays and gets updated** per
  §1.6.5: the existing `.theme-passport` assertion renames to
  `.theme-solana`; a new `.theme-catenax` assertion covers the
  `/passport` route's active theme.
- `client/src/messagingGuardrails.test.jsx` — **delete entirely.** Per
  Francesco's decision (H1), the text-matching guardrail caused more
  regressions than it prevented and now actively blocks the canonical
  credential string. The runtime toggle in §0a is the single source of
  truth for the Catena-X title; no separate string-matching test is
  needed.

---

## 11. Acceptance criteria — Phase C and onwards

For Traycer to call each phase complete:

### Phase C — Services restoration (depends on A, B merged)

- [ ] `SERVICES_LIST` contains exactly 9 entries in the order specified in §4.2.
- [ ] All copy strings in §4.2 match verbatim (use the spec as the source of truth).
- [ ] `SERVICE_PILLARS` contains 3 entries in the order Engineering / Compliance / Circularity.
- [ ] `getServicesByPillar('engineering')` returns 3; `('compliance')` returns 4; `('circularity')` returns 1.
- [ ] Card 4 of Compliance renders with the `--coming-soon` visual treatment per §4.3.2.
- [ ] Card 3 of Compliance renders with the eyebrow per §4.3.2.
- [ ] `structuredData.js` `SERVICE_SCHEMAS` mirrors §4.2 entries.
- [ ] `SERVICES_META` matches §4.5 verbatim.
- [ ] All client tests pass; lint clean.
- [ ] `grep -r 'APAC' client/src/` returns zero.
- [ ] `messagingGuardrails.test.jsx` is **deleted** (per §10 / H1). The runtime toggle in §0a remains the source of truth for the Catena-X title; no string-matching guardrail replaces it.

### Phase D — `/passport` page

- [ ] `<Route path="/passport" ...>` exists in `App.jsx`.
- [ ] `/data` and `/catena-x` redirect to `/passport`.
- [ ] `NAV_ITEMS` "Battery Passport" entry `path` is `/passport`.
- [ ] `PassportPage.jsx` renders sections in the order §5.3–§5.9.
- [ ] All copy in §5 matches verbatim.
- [ ] The outbound Catena-X intro link points at `https://catena-x.net/en/about-us` (or whatever Francesco has confirmed) and opens in a new tab.
- [ ] `PASSPORT_META` matches §5.10.
- [ ] All files in §10 deleted (after grep-verify).
- [ ] All client tests pass; lint clean.

### Phase E — Homepage tone-down

- [ ] `HERO_CONTENT` matches §3.1 verbatim.
- [ ] `WHY_ICHNOS` constant exists and matches §3.2 verbatim.
- [ ] `PASSPORT_TEASER` constant exists and matches §3.4 verbatim.
- [ ] `HOMEPAGE_COMMITMENT`, `HOMEPAGE_OFFER_CARDS`, `HOMEPAGE_STACK_BAND` constants are removed.
- [ ] `LANDING_SECTION_IDS` is `['company', 'services', 'passport', 'contact']` (§2.5).
- [ ] `<LandingPage />` renders 5 sections in the order 3.1 → 3.5.
- [ ] `LANDING_META` description rewritten away from the v3 ASEAN-data-layer framing toward the advisory + integration framing.
- [ ] `Hero.jsx` consumes `headline` (not `tagline`); v3 `tagline` field removed from constant.
- [ ] All client tests pass; lint clean.

### Cross-cutting (any phase)

- [ ] `grep -rE "Kuala Lumpur|MM2H|APAC" client/src/` returns zero.
- [ ] `grep -rE "Solana|blockchain|crypto|token|immutable ledger|decentralised|decentralized" client/src/` returns zero.
- [ ] No section ends with "That is the difference between X and Y."

---

## 12. Out of scope for v4

- Backend, server, database, chat / RAG — no changes required.
- Brand vocabulary SSOT module (was PR #136 on the old repo) — not
  required by v4; the inline strings in `services.js`, `seoMeta.js`, and
  `landingContent.js` are the source of truth.
- The repository-level migration housekeeping (PRs #145, #146, #147) is
  unrelated to this spec.
- The v3 dark `.theme-passport` theme — **renamed and preserved**
  rather than consumed. Per Francesco's revised decision (Q: new
  Catena-X theme on `/passport`, old theme renamed Solana for future
  use), the dark theme renames to `.theme-solana` and stays in
  `index.css` as a dormant block. The matching layout file renames
  to `SolanaThemeLayout.jsx` and stays in the templates folder. No
  route consumes either in v4. A new `.theme-catenax` block and
  `CatenaXThemeLayout.jsx` are added and consume the `/passport`
  route. Full spec in §1.6.

---

## Appendix A — Verification commands for each phase

```bash
# Verbatim copy compliance
grep -c "From regulatory compliance to seamless integration into the circular value chain" client/src/constants/landingContent.js
# expect 1

grep -c "Integration and gap-bridging across the value chain into the Catena-X EU digital battery passport" client/src/constants/services.js
# expect 1

grep -c "Official Catena-X Qualified Advisory Provider" client/src/constants/services.js client/src/constants/teamContent.js
# expect ≥ 2

# Forbidden vocabulary
grep -rE "Kuala Lumpur|MM2H|APAC|Solana|blockchain|crypto|token|immutable ledger|decentrali[sz]ed" client/src/
# expect: no matches

# Pillar counts
node -e "const {SERVICES_LIST}=require('./client/src/constants/services.js'); ['engineering','compliance','circularity'].forEach(p=>console.log(p, SERVICES_LIST.filter(s=>s.pillar===p).length))"
# expect: engineering 3, compliance 4, circularity 1

# Tests + lint
cd client && npm run lint && npx vitest run
```
