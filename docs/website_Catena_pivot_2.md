# website_Catena_pivot_2.md — Surgical Catena-X pivot spec for ichnos-protocol.com

**Version 2.1 — 2026-07-23** (supersedes v2.0 of same date; palette corrected to Catena-X brand green+orange, logo assets delivered, Catena-X label rules per the signed Logo Use Agreement, deltas vs `ichnos_website_pivot_spec_v3.md`).
**Consumer of this spec:** Traycer AI (plans file-level changes against the existing repo — React + Vite SPA, routes `/`, `/services`, `/data` (ex-`/passport`), `/catena-x`, `/team`, `/contact`).
**Nature of changes:** SURGICAL. Re-token colors, swap logo assets, add one services card group, sweep status copy. **No redesign, no IA restructure, no framework/route changes, no content rewrites beyond what is quoted verbatim below.**
**Relationship to `ichnos_website_pivot_spec_v3.md` (June 2026, same folder):** v3 governs content/messaging structure and remains valid EXCEPT where §0.1 below supersedes it. This spec (pivot 2) adds the visual layer, the status upgrade, and the ASEAN-SME service cards.
**Visual target reference:** `ichnos_homepage_mockup.html` (delivered 2026-07-23) — color/token application reference only, not layout.

---

## 0.1 Deltas vs `ichnos_website_pivot_spec_v3.md` — STATUS UPGRADE (do this first)

v3 was written while the qualification was pending. Facts changed; sweep the whole site:

| v3 said (June 2026) | Now true (July 2026) — replace with |
|---|---|
| "Catena-X consultant qualification — application in progress" (everywhere) | **"Catena-X Qualified Advisor"** |
| Guardrail: never say "qualified" | **Superseded — "Qualified Advisor" is now the correct, held status.** Still NEVER: "member", "certified", "partner" |
| (no committee mention) | **"Approved for the Catena-X expert committee on Battery Passport"** (exact phrasing; no implied endorsement) |
| (membership not addressed / "join later") | **"Catena-X membership: application in progress"** |
| Audience 3 (ASEAN manufacturers) deferred — "addressed via outreach, not the site" | **Promoted to an on-site audience**: the new Catena-X service cards (§3) speak directly to ASEAN SMEs |
| Reviewer-facing `/catena-x` page (§5.6 of v3) | Keep the page and its focus list — now under the achieved status; it documents what the Qualified Advisor listing covers |

v3's other guardrails stay in force (no Solana/blockchain in public copy, "we feed your passport; we do not replace it", full chain "materials → precursors → electrodes → cells → modules", on-site availability, KL · Singapore · Europe).

**Attestation facts (evidence on file):** Catena-X Consultant Qualification Basic Training completed — **validity 06 Jul 2026 → 06 Jul 2027, Attestation ID 868**, signed Ganser/Otto. Together with the executed Logo Use Agreement this entitles display of the Qualified Advisor logo. **Renewal: requalify before 2027-07-06** or remove status claims and label.

---

## 0.2 Repo map — file-precise targets (verified against the actual repo, 2026-07-23)

Repo root: `Ichnos_Protocol/` — `client/` (React + Vite SPA, atomic design, content centralized in `client/src/constants/*`), `server/` (API + Grok/X.ai chatbot per `CLAUDE.md` §8). **Follow `CLAUDE.md` conventions. Every component has a colocated `*.test.jsx` — each change below must update its tests or the suite fails.**

| Spec section | Exact target in repo |
|---|---|
| **P1 tokens** | `client/src/index.css` — themes are SCOPED CLASSES. Real current values: `.theme-solana` (dark `#0A1628`, gradient `#14F195` Solana green…) → **delete the class, `components/templates/SolanaThemeLayout.jsx`, its route usage, and update `components/theme-scoping.test.jsx`**. `.theme-catenax` is currently a **dark** crypto-style theme (`--color-bg-base:#0F0F23`, accent `#00B0E1`, warm `#FFC107`) → **rewrite to the light official set**: bg `#FAFBFC`, alt `#F0F3F7`→`#EAF1FE`, surface `#FFFFFF`, text `#111111`/`#252525`, `--color-accent-primary:#0F71CB`, `--color-accent-warm:#FFA600`, add `--color-brand-green:#B3CB2D`, border `#DCDCDC`; kill `.theme-catenax .gradient-text` and dark `hero-cta-btn` overrides. `.theme-advisory` (light, teal `#00A89A`) stays unless Francesco says otherwise. |
| **P1 fonts** | Current: Inter body + Fraunces display (v3-sanctioned). Libre Franklin swap is **optional** — skipping it is acceptable; do not mix three families. |
| **P2 logo** | `client/src/components/atoms/Logo.jsx` — `LOGO_SOURCES`: `light`/`advisory` → `/brand/ichnos_mark_dualtone.svg`; `dark`/`passport` → `/brand/ichnos_mark_white.svg`. Assets already at `client/public/brand/` (committed 2026-07-23). Favicons: update `client/index.html` links + `client/public/site.webmanifest` to `/brand/favicon.svg`, `/brand/favicon-32.png`, `/brand/apple-touch-icon-180.png`, `/brand/icon-512.png`. Regenerate `client/public/og-image.jpg` from `/brand/ichnos_lockup_dualtone.svg` on white with the v3 §6.1 headline. Old `logo.png` / `logo-dark.png` / `Ichnos-protocol_logo_transparent.png` removable after reference swap. Update `Logo.test.jsx`. |
| **§0.1 status sweep** | `client/src/constants/catenaXStatus.js` — **set `CATENA_X_QUALIFICATION_GRANTED = true`**; change `CATENA_X_TITLE_BASE` from `"Official Catena-X Qualified Advisory Provider"` to **`"Catena-X Qualified Advisor"`** (exact attestation/label wording; drop "Official"); add `CATENA_X_MEMBERSHIP_NOTE = "Catena-X membership: application in progress"` for surfaces that mention membership; committee line where relevant: "approved for the Catena-X expert committee on Battery Passport". Update consumers: `CatenaXQualifierSpan.jsx`, `constants/seoMeta.js`, `constants/structuredData.js`, `catenaXStatus.test.js` + dependent tests. |
| **§3 SME cards** | `client/src/constants/services.js` — `SERVICES_LIST` entries carry `{id, icon, title, tagline, description, pillar}`. Add the five §3.2 cards under a **new pillar `"catena-x"`** with stable ids `catenax-get-connected`, `catenax-digital-twins`, `catenax-battery-passport`, `catenax-production-planning`, `catenax-pcf` (ids are DOM anchors + test keys — mirror in `structuredData.js`). Render the "In Catena-X terms" microline as a muted footer line in `ServiceCard.jsx`/`ServicesGroup.jsx`. Update `services.test.js`, `ServicesPage.test.jsx`, `ServicesGroup.test.jsx`. |
| **§2.2 label placement** | Trust strip → `components/organisms/RecognitionBlock.jsx`; footer row → `components/organisms/Footer.jsx`. Official label files (when received) → `client/public/labels/`. Lifecycle comment: `{/* Catena-X QA label — right expires with qualification (renew by 2027-07-06); remove on lapse or association notice (Logo Use Agreement §6) */}` |
| **QA** | Full test suite green; `client/public/sitemap.xml` + `seoMeta.js` refreshed; §3.3/§4.1 guardrail greps zero-hit; Lighthouse not worse. |

---

## 0. How to execute (phasing for Traycer)

Run as four independent phases, each its own branch/PR, in this order:

| Phase | Scope | Risk |
|---|---|---|
| P1 | Color tokens + typography | Low — mechanical |
| P2 | Ichnos logo swap (SVG variants) | Low |
| P3 | New "Catena-X services" cards + geographic reframe | Medium — content |
| P4 | Web3-vocabulary sweep + Catena-X trademark/disclaimer + QA | Low |

Before P1, Traycer MUST produce an **inventory**: every color definition in the repo (Tailwind config, CSS custom properties, styled-components themes, inline styles, SVG fills) and every gradient/`backdrop-filter`. Map each to a role in §1.2 before editing. Do not find-and-replace hexes blindly — replace **by role**.

---

## 1. Phase 1 — Color palette (Catena-X design tokens)

### 1.1 Canonical target palette

Source of truth: the official Catena-X portal design system (`eclipse-tractusx/portal-shared-components`, published as `@catena-x/portal-shared-components` on npm). These are the literal tokens the Catena-X portal ships with:

| Token | Hex | Role on our site |
|---|---|---|
| `--cx-blue` | `#0F71CB` | Primary: buttons, links, active nav, icons, focus rings |
| `--cx-blue-dark` | `#0D55AF` | Hover/pressed states of primary |
| `--cx-blue-pale` | `#EAF1FE` | Tinted section backgrounds, icon chips, hero tint |
| `--cx-blue-pale-2` | `#D4E3FE` | Borders on tinted elements, secondary hover fill |
| `--cx-amber` | `#FFA600` | **Brand color 1 (Catena-X orange).** Logo trunk/circuit-roots, section kickers' accent rules, icon chips, card top-rules, diagram accents. NEVER text on white |
| `--cx-green` | `#B3CB2D` | **Brand color 2 (Catena-X green).** Logo canopy, sustainability/circularity accents, secondary chips. NEVER text |
| `--cx-green-dark` | `#8FA31F` | Depth shade of green in graphics only |
| `--ink-1` | `#111111` | Headings |
| `--ink-2` | `#252525` | Body text |
| `--ink-3` | `#666666` | Secondary text |
| `--ink-4` | `#888888` | Muted/captions |
| `--border-1` | `#DCDCDC` | Default borders/dividers |
| `--surface-0` | `#FFFFFF` | Cards |
| `--surface-1` | `#F9F9F9` | Alternate section background |
| `--surface-2` | `#FAFBFC` | Page background (already the site's theme-color — keep) |
| success | `#00AA55` | Positive states only |
| error | `#D91E18` | Errors only |
| info | `#676BC6` | Info states only |
| focus shadow | `rgba(15,113,203,.4)` | Focus outlines |

**Palette hierarchy (v2.1 correction):** the Catena-X **brand** identity is **orange + green** (`brand01`/`brand02` in the official portal theme); **blue** is the portal's **interaction** color. Apply accordingly: orange+green carry the brand expression (logo, kickers, icon chips, accents, illustration highlights); `#0F71CB` blue is reserved for interactive elements (links, buttons, focus, active nav) — exactly how Catena-X's own portal uses it. Buttons stay blue with white text (passes AA); if an amber CTA variant is ever wanted, it must use `#111111` text (passes ~8.6:1), never white.

Drop-in CSS custom-property block (matches the mockup):

```css
:root{
  --cx-blue:#0F71CB; --cx-blue-dark:#0D55AF;
  --cx-blue-pale:#EAF1FE; --cx-blue-pale-2:#D4E3FE;
  --cx-amber:#FFA600; --cx-green:#B3CB2D; --cx-green-dark:#8FA31F;
  --ink-1:#111111; --ink-2:#252525; --ink-3:#666666; --ink-4:#888888;
  --border-1:#DCDCDC;
  --surface-0:#FFFFFF; --surface-1:#F9F9F9; --surface-2:#FAFBFC;
}
```

### 1.2 Role-based replacement map

After the inventory, apply by role (typical Solana-era values shown as hints — the repo may use variations; match by role, not only by hex):

| Current role (hints) | Replace with |
|---|---|
| Solana purple / violet accents (`#9945FF`, `#7B3FE4`, `#DC1FFF`, purple-500/600 classes) | `#0F71CB` |
| Solana neon green (`#14F195`, `#00FFA3`, emerald/teal neons) | `#B3CB2D` **only if decorative**; if it was a text/link color → `#0F71CB` |
| Purple→green hero/CTA **gradients** | Solid `#0F71CB`; hero background → `linear-gradient(180deg,#EAF1FE 0%,#FAFBFC 88%)` |
| Dark page/hero backgrounds (near-black, `#0B0B14`-style) | `#FAFBFC` page, white cards, `#EAF1FE` tinted sections |
| Glassmorphism (`backdrop-filter: blur`, translucent white/black cards) | Solid `#FFFFFF` cards, `1px solid #DCDCDC` border, shadow `0 1px 3px rgba(17,17,17,.06), 0 8px 24px rgba(15,113,203,.07)`, radius 12px |
| Light-on-dark text | `#111111`/`#252525` on light surfaces |
| Glow/neon box-shadows | Remove, or focus ring `0 0 0 3px rgba(15,113,203,.4)` on interactive elements |

**Hard rules:** `#FFA600` and `#B3CB2D` never carry text and never sit under text lighter than `#111` (contrast fails on white). All body text pairs must pass WCAG AA (4.5:1). Primary buttons: white text on `#0F71CB` (passes).

### 1.3 Typography (same phase, one commit)

Swap display/body font to **Libre Franklin** (the Catena-X portal typeface; SIL OFL via Google Fonts), weights 300/400/500/600/700. Fallback stack: `-apple-system,'Segoe UI',Roboto,sans-serif`. If the repo self-hosts fonts, add the woff2 files rather than the Google CDN. Do not change the type scale or spacing — font family only.

---

## 2. Phase 2 — Ichnos logo: banyan tree in Catena-X dual-tone

**Decided direction (v2.1, Francesco 2026-07-23):** dual-tone banyan in the **Catena-X brand pair** — **canopy in CX green `#B3CB2D`**, **trunk + branch skeleton + circuit-board roots in CX orange `#FFA600`**. The circuit roots read as copper traces: production data flowing from the tree into the network.

**STATUS: DONE — assets delivered 2026-07-23** to `Ichnos Protocol\brand\` (this folder). Traycer only swaps file references; no image work needed.

| File | Use |
|---|---|
| `brand/ichnos_mark_dualtone.svg` | Header/nav mark, light surfaces (default) |
| `brand/ichnos_lockup_dualtone.svg` | Tree + ICHNOS PROTOCOL wordmark — hero/OG/print |
| `brand/ichnos_mark_white.svg`, `brand/ichnos_lockup_white.svg` | Footer / dark surfaces |
| `brand/ichnos_mark_black.svg`, `brand/ichnos_lockup_black.svg` | Black master (print, single-color contexts) |
| `brand/ichnos_mark_mono_blue.svg` | Optional small-size/watermark variant in portal blue |
| `brand/favicon.svg`, `brand/favicon-32.png`, `brand/apple-touch-icon-180.png`, `brand/icon-512.png` | Favicon + touch icons (transparent) |

Integration notes for Traycer: copy `brand/` into the repo's public assets; header uses `ichnos_mark_dualtone.svg` + wordmark text (or the lockup); replace favicon links (`<link rel="icon" href="/favicon.svg">` + `sizes="32x32"` PNG fallback + apple-touch-icon); regenerate the OG image (v3 §6.1) with `ichnos_lockup_dualtone.svg` on white. SVGs are SVGO-optimized (~100–150 KB); serve with compression; do not inline them in JSX.

### 2.1 Conversion pipeline (ARCHIVED — executed 2026-07-23; kept only for reproducibility. Color values in the snippets below predate the green+orange decision; the delivered assets above are authoritative.)

**Step 0 — check for a vector source first.** If the logo exists as AI/EPS/PDF/Figma, export SVG directly and skip Step 1.

**Step 1 — vectorize (only if raster-only).** Two options:

```bash
# Option A — vtracer (best if the current logo has multiple colors/antialiasing)
vtracer --input logo.png --output logo_vec.svg --colormode color --filter_speckle 4 --mode polygon

# Option B — potrace via ImageMagick (best for clean single-color output)
magick logo.png -alpha remove -colorspace Gray -threshold 60% logo_bw.pbm
potrace logo_bw.pbm -s --flat -o logo_mono.svg
```

Use the largest/cleanest raster available (≥1024px). Tune `-threshold` (40–70%) until the silhouette is faithful.

**Step 2 — normalize to black.** Flatten every `fill`/`stroke` to `#111111`, remove embedded styles, run SVGO. This produces the canonical **black master** (`logo_black.svg`) — the neutral intermediate the user requested.

**Step 3 — semantic split.** In Inkscape/Figma (or by path inspection), separate paths into two groups and class them: `class="canopy"` (foliage) and `class="trunk"` (trunk + aerial roots + ground line, if any).

**Step 4 — recolor via classes** (keeps one geometry, N color variants):

```xml
<svg viewBox="..." xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Ichnos Protocol">
  <style>
    .canopy{fill:#B3CB2D}.canopy-depth{fill:#8FA31F}
    .trunk{fill:#0F71CB}
    .mono &gt; *{fill:#0F71CB}      /* variant hook */
    .white &gt; *{fill:#FFFFFF}     /* variant hook */
  </style>
  <!-- paths here -->
</svg>
```

Automated recolor of the black master (Node, no deps):

```js
const fs = require('fs');
let s = fs.readFileSync('logo_black.svg','utf8');
// after classing paths in Step 3:
s = s.replace(/class="canopy"([^>]*?)fill="#111111"/g,'class="canopy"$1fill="#B3CB2D"')
     .replace(/class="trunk"([^>]*?)fill="#111111"/g,'class="trunk"$1fill="#0F71CB"');
fs.writeFileSync('logo_dualtone.svg', s);
```

**Deliverable set** (place in the repo's asset dir, e.g. `/public/brand/`):

| File | Colors | Use |
|---|---|---|
| `ichnos_dualtone.svg` | green canopy / blue trunk | Header, light surfaces (default) |
| `ichnos_mono_blue.svg` | all `#0F71CB` | Small sizes, watermarks |
| `ichnos_white.svg` | all `#FFFFFF` | Footer / dark surfaces |
| `ichnos_black.svg` | all `#111111` | Print, the master |
| `favicon.svg` + `favicon-32.png` | dual-tone, simplified (drop depth shade & fine roots below 48px) | Favicon/app icons |

Wordmark lockup: "Ichnos" in `#111111`, "Protocol" in `#0F71CB`, Libre Franklin 700/500 (as in the mockup header).

*Interim placeholder:* the mockup contains a geometric dual-tone banyan SVG (Appendix D) usable until the real mark is converted. **Preferred: Francesco attaches the original logo file and the converted SVG set gets produced for him — then Traycer only swaps file references.**

### 2.2 Catena-X Qualified Advisor logo — display rules (per the SIGNED Logo Use Agreement)

**Status: the Logo Use Agreement between Catena-X-Verein and Ichnos Protocol Pte. Ltd. was executed 29 June 2026** (countersigned Ganser/Otto). The site MAY display the **Catena-X Qualified Advisor logo**. Rules, encoded from the agreement and the association's brand governance:

1. **Official files only.** Use exactly the digital data record the association supplies for the *Qualified Advisor* role (Agreement §1.1–1.2; the labels tie to the Operating Model's "Data Space Governance — Catena-X Labels"). Never a screenshot, a re-draw, or a file from the web. If the data record hasn't arrived yet, request it referencing the executed agreement (`info@catena-x.net`).
2. **Unmodified, always.** No recoloring, stretching, cropping, effects, or clear-space violations (Brand Governance dos & don'ts). Serve from the repo, e.g. `/public/labels/`.
3. **Placement (two spots):** (a) the credentials/trust strip on `/` — the "Qualified Advisor" credential card carries the official label; (b) a footer "Recognitions" row. **Not** in the navbar, and **not** fused with the Ichnos logo as a co-brand lockup.
4. **Hyperlink rule (Agreement §4):** if the label is clickable, it may link **only to Catena-X websites** (`https://catena-x.net`). Never link it to Ichnos pages or third parties.
5. **Third parties (Agreement §3.3–3.4):** passing the label files to contractors (Traycer, Kamran) is allowed only briefly and only for technical installation; inform them the files carry no rights and must not be redistributed. Note this in the PR description.
6. **Lifecycle (Agreement §5–6):** the right lasts exactly as long as the Advisor qualification. Add a code comment at the label component: `<!-- Catena-X QA label: remove immediately if qualification lapses or on association notice (Logo Use Agreement §6) -->`. New *uses* beyond the agreed role display require association approval before publication.
7. **Trademark hygiene (ship in P4):** first prominent mention as "Catena-X®"; footer notice: *"Catena-X® is a registered trademark of Catena-X Automotive Network e.V. Ichnos Protocol Pte. Ltd. is a Catena-X Qualified Advisor; its membership application is in progress. References to Catena-X standards and committees describe factual participation and do not imply certification of Ichnos products or endorsement by the association or its bodies."*

---

## 3. Phase 3 — Services: add the "Catena-X services" card group

**Surgical rule:** existing service structure stays as per `ichnos_website_pivot_spec_v3.md` §5.2 (Section A data services / Section B Catena-X consulting / Section C advisory) — restyle tokens only. **The cards below EXPAND v3's Section B** (currently a one-paragraph teaser) into an SME-facing card grid, cross-linked to `/catena-x`. The `/catena-x` page keeps its v3 focus list (it documents the Qualified Advisor listing scope); these cards are its plain-language storefront.

**Audience calibration (applies to every string below):** written for **SME owners/plant managers in ASEAN**, not Catena-X specialists. No unexplained acronym. Plain sentences. Their situation: they supply materials/components/cells, their EU customers are starting to ask for data, they have an ERP or spreadsheets — not a dataspace team.

### 3.1 Group header (verbatim copy)

> **Kicker:** Catena-X services
> **H2:** Connect once. Answer every customer data request.
> **Lede:** Catena-X® is the automotive industry's shared data network — the channel through which EU customers will request battery data. Based in Singapore, we get ASEAN manufacturers connected and make the data flow: from your production floor into your customers' systems and the EU Battery Passport.

### 3.2 The cards (verbatim copy — 4 cards, 1 optional)

Each card = **plain-language body** + a one-line *"In Catena-X terms"* microline (smaller, muted `#666`, official terms linked). This structure is the definition-collision firewall: we **explain** official concepts, we never **redefine** them — the official name always appears, labeled as such, linked to its official page.

**Card 1 — Get connected to Catena-X**
Body: *Joining the network means registering your company, getting your network ID, and setting up the secure "mailbox" your customers' systems talk to. We handle the whole path — registration through an official onboarding provider, identity and credentials, and the connector choice that fits your size (managed service or self-hosted). No dataspace team required.*
Microline: In Catena-X terms: [onboarding via an Onboarding Service Provider (OSP)](https://catena-x.net) · Business Partner Number (BPN) · [Eclipse Dataspace Connector (EDC)](https://eclipse-tractusx.github.io/docs-kits/kits/connector-kit/adoption-view).

**Card 2 — Your products as digital twins**
Body: *Every batch and every cell you ship gets a digital twin — a structured data record your customer can look up, if you allow it. We model your products in the formats the network understands, register the twins, and connect the pipeline to what you already run: ERP, MES, or spreadsheets. We meet your data where it is.*
Microline: In Catena-X terms: [Industry Core KIT](https://eclipse-tractusx.github.io/docs-kits/category/industry-core-kit) · Digital Twin Registry (DTR) · SAMM aspect models.

**Card 3 — Flow into the EU Battery Passport**
Body: *From 18 February 2027, batteries sold in the EU carry a digital passport — and if you make materials, electrodes or cells, part of that passport is your data. We map your production data to the passport fields, validate it against the official formats, and set up the flow to your customer's passport: correct, on time, and only what you choose to share.*
Microline: In Catena-X terms: [EcoPass KIT](https://eclipse-tractusx.github.io/docs-kits/kits/eco-pass-kit/adoption-view/) · `battery_pass` aspect model · EU Battery Regulation 2023/1542.

**Card 4 — Production planning & data exchange**
Body: *The same connection that feeds the passport can carry your day-to-day business data: demand forecasts and capacity requests from your customers, delivery and stock information from you — structured and automatic, instead of email chains and Excel versions. Being easy to plan with is a competitive advantage; we set it up.*
Microline: In Catena-X terms: [Demand & Capacity Management (DCM) KIT](https://eclipse-tractusx.github.io/docs-kits/category/dcm-kit) · [PURIS](https://eclipse-tractusx.github.io/docs-kits/category/puris-kit) (short-interval production & stock data).

**Card 5 (optional — include if grid balance needs a 5th/6th card)** — **Carbon footprint, per product**
Body: *EU customers increasingly ask for a carbon footprint per product, not per company. We help you calculate product carbon footprints from your real energy and material data and exchange them in the format the network verifies.*
Microline: In Catena-X terms: [PCF KIT](https://eclipse-tractusx.github.io/docs-kits/category/pcf-exchange-kit) · `pcf` aspect model.

### 3.3 Non-collision rules (enforce in copy review)

- Ichnos sells **advisory and integration services**; the cards must never read as if Ichnos *is* Catena-X, operates it, or that these KITs are Ichnos products.
- Official terms appear **only** in the microlines (plus the group lede's one ® mention), always by their exact official names, always linked.
- Forbidden phrasings anywhere on the site: "Catena-X certified" (no certification held), "Catena-X member" (application in progress), "official Catena-X partner" (the correct term is *Qualified Advisor*), "we operate Catena-X in ASEAN", "powered by Catena-X", and v3's now-stale "consultant qualification — application in progress" (superseded — see §0.1).
- Approved phrasings: "Catena-X Qualified Advisor", "approved for the Catena-X expert committee on Battery Passport", "Catena-X membership: application in progress".

### 3.4 Geographic reframe (small copy sweeps, same PR)

- Priority order everywhere: **ASEAN first, Singapore as base, EU as the destination market** (regulatory anchor stays EU — that's the "why now").
- Eyebrow/hero badge pattern: `Based in Singapore · Serving ASEAN manufacturers · Catena-X Qualified Advisor`.
- Sweep copy for Europe-first orderings ("Singapore & Europe" → "Singapore · ASEAN · EU market access") and flip; example lines mentioning countries should use ASEAN examples (Indonesia, Malaysia, Thailand) before EU ones.

---

## 4. Phase 4 — Vocabulary sweep, trademark, QA

### 4.1 Web3-era vocabulary sweep

Grep the repo for: `Solana`, `on-chain`, `onchain`, `web3`, `token` (asset sense), `NFT`, `mint`, `DeFi`, `crypto`, `wallet`.

- **"Ichnos Protocol" (company name) stays.**
- "Solana": keep at most one technical footnote in the architecture section, phrased: *"Each published passport version is fingerprinted and anchored on public infrastructure for tamper-evidence — hash only, never product data on-chain."* (Naming Solana explicitly is optional; if named, only in this footnote.)
- "wallet": allowed **only** as "identity wallet" in the Catena-X connector context; remove any crypto-wallet sense.
- Remove/replace all others.

### 4.2 Acceptance checklist (Traycer must verify before each PR merge)

- [ ] Inventory-to-role mapping table committed in the PR description (P1)
- [ ] Zero occurrences of old accent hexes / purple-green gradients / `backdrop-filter` blur cards (P1)
- [ ] All text-color pairs pass WCAG AA; `#FFA600`/`#B3CB2D` never used as text color (P1)
- [ ] Libre Franklin loads; no FOUT regression beyond `font-display: swap` (P1)
- [ ] Logo variants render at header, footer, favicon sizes; aria-labels present (P2)
- [ ] Catena-X QA label: official file only, unmodified, placed per §2.2 (trust strip + footer), links only to catena-x.net, lifecycle comment present (P2/P4)
- [ ] §0.1 status sweep complete: zero occurrences of "application in progress" applied to the *qualification*; "Qualified Advisor" used; membership still "application in progress" (P3/P4)
- [ ] New cards match §3.2 verbatim; every microline term links to its official page (P3)
- [ ] Forbidden phrasings (§3.3) return zero grep hits (P3/P4)
- [ ] Trademark footer notice present once, site-wide footer (P4)
- [ ] Visual pass on: home, services, about/contact, 390px mobile widths (all phases)
- [ ] Build + lint green; no route or dependency changes introduced

### 4.3 Out of scope (do NOT touch)

Site structure/routes, hosting setup, the chatbot and its knowledge base (separate workstream), analytics, forms, existing non-services copy except where §3.4/§4.1 name it.

---

## Appendix A — Reference: mockup token usage
See `ichnos_homepage_mockup.html` for applied examples: hero tint gradient, credential cards (white, `#DCDCDC` border, 3px `#0F71CB` top rule), icon chips on `#EAF1FE`, chips/pills style, blue CTA band, `#111111` footer.

## Appendix B — Sources (verify before shipping claims)
- Portal design tokens: `eclipse-tractusx/portal-shared-components` → `src/theme.ts` (`#0F71CB`, `#0D55AF`, `#EAF1FE`, `#D4E3FE`, `#FFA600`, `#B3CB2D`, LibreFranklin)
- Label process: `github.com/catenax-eV/cx-resources` (Logo Use Agreement → `info@catena-x.net`; Brand Governance dos/don'ts)
- KITs: `eclipse-tractusx.github.io/docs-kits` (Industry Core, EcoPass, DCM, PURIS, PCF, Connector)
- EU Battery Regulation (EU) 2023/1542 — passport from 18 Feb 2027

## Appendix C — Project-internal references
- `claude/website_redesign_direction.md` (decisions log, 2026-07-23)
- `claude/M4_catena_x_hosting_architecture.md` (three-layer architecture; anchor phrasing)
- `claude/M3_plan_upstream_cell_semantics.md` (standards versions: SAMM 2.1.0, serial_part/batch 4.0.0, SLBAB 4.0.0, battery_pass 6.1.0, PCF 7.0.0, CX-0131)

## Appendix D — Interim placeholder mark (geometric dual-tone banyan)
```svg
<svg width="40" height="40" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Ichnos Protocol">
  <ellipse cx="32" cy="20" rx="20" ry="13" fill="#B3CB2D"/>
  <circle cx="15" cy="26" r="8" fill="#B3CB2D" opacity=".9"/>
  <circle cx="49" cy="26" r="8" fill="#B3CB2D" opacity=".9"/>
  <ellipse cx="32" cy="14" rx="11" ry="7" fill="#8FA31F" opacity=".5"/>
  <path d="M32 30v24" stroke="#0F71CB" stroke-width="4.5" stroke-linecap="round"/>
  <path d="M22 34c0 8-3 12-6 20M42 34c0 8 3 12 6 20" stroke="#0F71CB" stroke-width="3" stroke-linecap="round"/>
  <path d="M27 36c-1 6-2 10-3 18M37 36c1 6 2 10 3 18" stroke="#0F71CB" stroke-width="2.2" stroke-linecap="round" opacity=".7"/>
  <path d="M10 55h44" stroke="#0D55AF" stroke-width="3" stroke-linecap="round"/>
</svg>
```
