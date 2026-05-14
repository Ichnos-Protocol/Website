# Design Refinement — Sweep 2 (Post-Audit Corrections + Three-Pillar Restructure)

> Targeted follow-on to `docs/designRefinementEpic.md`. The first epic landed the structural refactor and the corrective sweep that followed it cleaned six defects. A holistic audit then surfaced one critical credibility issue (founder timeline), four cleanup items, and three strategic refinements. This document specifies all eight as discrete tickets.
>
> The parent spec remains authoritative for everything not modified here. Locked content in this document supersedes the parent only for the specific surfaces named below.

---

## 1. Context and scope

What landed before this sweep:
- Theme split, Fraunces wiring, light advisory tokens, dark footer
- Six canonical services and `SERVICES_LIST` constants
- New landing-page composition (Hero → Services → Company → Passport → Contact)
- Team page with `TEAM_MEMBERS`, `FounderProfile`, `RecognitionBlock`, hidden Ihsan timeline
- Passport page self-contained (narrative + value props + maturity matrix + roadmap + CTA)
- `ChatPanel` molecule with `mode` + `persistState` contract
- `SeoHead` molecule with centralised meta + JSON-LD emission
- Navbar scrollspy + route-aware theme-switching logo
- SEO foundation: `seoMeta.js`, `structuredData.js`, `robots.txt`, `sitemap.xml`, `og-image.jpg`, `apple-touch-icon.png`, `site.webmanifest`

What this sweep adds:
- **F1** — Critical: complete and correct Francesco's career timeline
- **F2** — Cleanup: delete stale `landingContent.js` constants
- **F3** — Cleanup: delete stale `teamContent.js` constants
- **F4** — Cleanup: delete stale `navigation.js` exports
- **F5** — Footer brand description rewrite
- **M1** — Strategic decision: keep "Prototype Phase" badge on `/passport`
- **M2** — Three-pillar service restructure with cross-pillar delivery-method services
- **M3** — `ChatPanel` visual polish

---

## 2. F1 — Francesco's career timeline (critical)

Current `CAREER_TIMELINE_FRANCESCO` in `client/src/constants/teamTimelines.js` has wrong dates and skips 13 years of pre-doctorate career. LinkedIn is public; mismatch is a credibility hit for any FEV-tier reader doing diligence.

### Locked replacement content

Replace the entire `CAREER_TIMELINE_FRANCESCO` array with this nine-entry timeline. Order from earliest to latest.

```js
export const CAREER_TIMELINE_FRANCESCO = [
  {
    id: "ducati",
    year: "2005 – 2011",
    title: "Engine Design Engineer",
    organization: "Ducati Motor Holding",
    description:
      "Engineering design of engine components and subsystems in cooperation with structural and thermo-fluid dynamics analysts, test department, technology and materials specialists, and the SBK race department. Contributed to the 1098, 696, 796, 1100 evo, and 1199 engine programmes.",
  },
  {
    id: "technogym",
    year: "2011 – 2012",
    title: "Mechanical Designer",
    organization: "Technogym",
    description:
      "Design of rehabilitation machines (Selection Med product line) from concept to prototypes and SOP, including the relationship with TÜV for medical-device certification.",
  },
  {
    id: "fev-gasoline",
    year: "2012 – 2015",
    title: "Project Engineer — Gasoline Engines Design",
    organization: "FEV GmbH",
    description:
      "Concept design and layout of automotive engine systems and components for customer programmes; 3D modelling, manufacturing drawings, and supplier interface.",
  },
  {
    id: "fev-motorcycle",
    year: "2015 – 2016",
    title: "Motorcycle Engine Design Leader",
    organization: "FEV GmbH",
    description:
      "Led a newly founded motorcycle engine design team within FEV.",
  },
  {
    id: "fev-hybrid",
    year: "2016 – 2017",
    title: "Project Engineer — Hybrid & Electric Propulsion",
    organization: "FEV GmbH",
    description:
      "Development of electrical drives — first dedicated electrification role.",
  },
  {
    id: "rwth-pem",
    year: "2017 – 2021",
    title: "Research Associate — Production Engineering of E-Mobility Components (PEM)",
    organization: "RWTH Aachen University",
    description:
      "Doctoral research on automotive battery systems for the circular economy, with a focus on remanufacturing — recognised with the 3rd-place RWTH Innovation Award. Lectured on battery recycling at the PEM Chair.",
  },
  {
    id: "fev-lead-expert",
    year: "2022 – 2025",
    title: "Lead Expert — Battery Systems",
    organization: "FEV Europe GmbH",
    description:
      "Led a battery passport pilot project and directed the internal software work that turned real-time battery data into passport-compliant output. Contributed to Horizon EU grant proposals on adjacent topics.",
  },
  {
    id: "sigma-school-upskill",
    year: "2025",
    title: "Self-directed upskilling in software engineering and AI integration",
    organization: "Sigma School — 12-Week Software Development Bootcamp",
    description:
      "Intensive bootcamp in web development and AI integration, undertaken in preparation for founding Ichnos Protocol and leading its digital workstreams.",
  },
  {
    id: "ichnos",
    year: "2026 – Present",
    title: "Founder",
    organization: "Ichnos Protocol Pte. Ltd.",
    description:
      "Founded as a battery advisory practice that also builds a digital Battery Passport platform aligned with EU Regulation 2023/1542 and Malaysian MS 2818.",
  },
];
```

### Notes for Traycer

- All nine entries are mandatory. Do not drop pre-doctorate roles to "shorten" the timeline — the pre-FEV history is exactly what supports the mechanical-development, project-management, and leadership service claims.
- Dates match Francesco's public LinkedIn (`https://www.linkedin.com/in/maltonif/`) and the imported CV PDF. Do not adjust them.
- The Ichnos entry description is the **advisory-first** version. The previous "Founded the company to build the next-generation Battery Passport — beyond compliance, toward real utility." copy is removed; do not bring it back.
- The pre-doctorate IMA and PIV-drives internships from LinkedIn are intentionally omitted — they are trainee-level and add length without value.
- `CAREER_TIMELINE_IHSAN` is unchanged.

### Tests

Update `FounderProfile.test.jsx` / `CareerTimeline.test.jsx` / `TeamPage.test.jsx` snapshot expectations to reflect the new nine-entry timeline. Assert that:
- The total entry count is nine.
- The first entry's `organization` is exactly `"Ducati Motor Holding"`.
- The last entry's `organization` is exactly `"Ichnos Protocol Pte. Ltd."`.
- The 2025 entry is the Sigma School entry (not "Web developer" or anything else).
- The FEV Lead Expert entry's date range is exactly `"2022 – 2025"`.

---

## 3. F2 — `landingContent.js` cleanup

The new `LandingPage` consumes only `HERO_CONTENT` from `client/src/constants/landingContent.js`. The other exports are dead code from the previous landing composition.

### Action

1. Run a repo-wide grep for each of the following identifiers and confirm zero non-self consumers:
   - `PROBLEM_CARDS`
   - `SOLUTION_CONTENT`
   - `WHY_ICHNOS_CARDS`
   - `SERVICES_PREVIEW`
2. If a consumer exists (e.g., an old organism still referencing one), either delete that consumer or migrate it before deleting the constant.
3. Delete the four constants from `landingContent.js`. Keep `HERO_CONTENT`.
4. Re-run the test suite. Any test that breaks indicates a hidden consumer — handle case-by-case.

### Notes

- `SOLUTION_CONTENT.heading` literally reads `"The Ichnos Battery Passport"` — a passport-page concern bleeding into a landing-page constants file. Its deletion removes a real drift risk.
- Be especially careful with `WHY_ICHNOS_CARDS` (4 entries including an "ASEAN + EU Reach" card). Confirm it isn't referenced by an outdated `WhyIchnos` organism still imported somewhere.

---

## 4. F3 — `teamContent.js` cleanup

`TeamPage` consumes `TEAM_MEMBERS` and `TEAM_PAGE_HEADER` only. Two other exports are unused and one directly conflicts with the new positioning.

### Action

1. Confirm no non-self consumers of:
   - `CORE_COMPETENCIES`
   - `SECTION_HEADINGS`
2. Delete both from `teamContent.js`.
3. Keep `TEAM_MEMBERS`, `TEAM_PAGE_HEADER`, and `VISION_STATEMENT` (the last is consumed by `VisionStatement.jsx`).

### Notes

- `CORE_COMPETENCIES` includes a "Software Development" competency with the description *"Full stack web development — building digital solutions that bridge the gap between engineering and technology."* This directly contradicts the battery-first positioning and would be a credibility hit if it ever rendered on the team page.
- `SECTION_HEADINGS` references "Core Competencies", "Career Highlights", "Our Vision" — sub-section labels from the previous team-page composition that no longer apply.

---

## 5. F4 — `navigation.js` cleanup

`Navbar.jsx` consumes only `NAV_ITEMS` and `LANDING_SECTION_IDS`. The remaining exports are leftovers with stale section IDs.

### Action

1. Confirm no non-self consumers of:
   - `COMPANY_NAV_ITEMS` (references `'why-ichnos'`)
   - `LANDING_SECTIONS` (references `'problem'`, `'solution'`, `'why-ichnos'`)
   - `NAV_LINKS`
   - `PRODUCT_NAV_ITEMS`
2. Delete all four exports.
3. The remaining file contents are `NAV_ITEMS` (the canonical four-entry navbar config) and `LANDING_SECTION_IDS` (the scrollspy target list). That's all that should remain.

### Notes

- Include `.test.jsx` files in the grep. A stale test passing against a stale export is the hardest dead-code signal to detect.
- If `MobileNavOverlay.jsx` or similar still imports one of the stale exports, update it to use `NAV_ITEMS` instead.

---

## 6. F5 — Footer brand description

Current text in `client/src/components/organisms/Footer.jsx`:
```js
const BRAND_DESCRIPTION = 'Battery consulting and battery passport solutions.';
```

### Locked replacement

```js
const BRAND_DESCRIPTION = 'Engineering, compliance, circularity.';
```

### Notes

- Three nouns mirror the hero's locked headline ("Engineering. Compliance. Circularity.") — brand consistency between hero and footer.
- Use **"circularity"**, never **"sustainability"**, anywhere on the site. The hero word is the locked term.

---

## 7. M1 — `/passport` "Prototype Phase" badge (decision: keep)

The badge currently renders inside `PassportHero` (the `statusBadge` field of `PASSPORT_PAGE_CONTENT`).

### Decision

Keep it. No code change.

### Rationale (for future reference)

- The badge is honest — the passport platform is in prototype phase per the maturity matrix and technology roadmap.
- The primary commercial target (FEV / battery advisory clients) is not buying the passport — they are buying the advisory services. The badge does not affect them.
- The badge subtly signals authenticity to passport prospects ("we are building this, not selling vaporware") which is a long-term moat.
- When the platform graduates to production phase, the badge text and styling should be revisited.

---

## 8. M2 — Three-pillar service restructure (Engineering · Compliance · Circularity) + cross-pillar delivery methods

### Strategic intent

The hero already uses "Engineering. Compliance. Circularity." as the tagline. Propagate this into the services menu so the visual identity, navigation, and commercial offer all reinforce one another. Outside the pillars, render **Technical Lead — Battery Systems** and a new **Agile Project Management — Battery Programs** service as **cross-pillar delivery methods** — they apply to any pillar engagement and don't sit cleanly inside one.

### Final service inventory (seven services, two groupings)

**Pillar services (5)**:

| Pillar | id | Title |
|---|---|---|
| Engineering | `battery-systems-safety` | Battery Systems & Safety Engineering |
| Engineering | `battery-mechanical-development` | Battery Mechanical Development |
| Compliance | `eu-apac-compliance-bridge` | EU–APAC Battery Compliance Bridge |
| Compliance | `battery-passport-implementation` | Battery Passport Implementation |
| Circularity | `remanufacturing-recycling-circular-economy` | Battery Remanufacturing, Recycling & Circular Economy |

**Cross-pillar delivery methods (2)**:

| id | Title |
|---|---|
| `technical-lead-battery-systems` | Technical Lead — Battery Systems |
| `agile-project-management` | Agile Project Management — Battery Programs |

### New service: Agile Project Management — Battery Programs

Add this new entry to `SERVICES_LIST`. Locked content:

```js
{
  id: "agile-project-management",
  icon: "bi-kanban",
  title: "Agile Project Management — Battery Programs",
  tagline:
    "Sprint cadence, requirement traceability, and cross-functional coordination for battery development efforts.",
  description:
    "Methodology, milestone management, and stakeholder coordination for battery system development programmes. Backed by PSM I certification (Professional Scrum Master™ I) and thirteen years of cross-functional project engineering across Ducati, Technogym, and FEV — from gasoline engines and motorcycle design through electrification and vehicle battery systems.",
  pillar: null,
  deliveryMethod: true,
},
```

### `services.js` data-model changes

Extend each entry in `SERVICES_LIST` with two new fields:

- `pillar: "engineering" | "compliance" | "circularity" | null`
- `deliveryMethod: boolean` (defaults to `false`; only `true` for the two cross-pillar entries)

The locked mapping is the table above. Do not rearrange the array order — within the array, all five pillar services come first (in their existing order), followed by the two delivery-method services. Specifically:

1. `battery-systems-safety` — engineering
2. `battery-mechanical-development` — engineering
3. `eu-apac-compliance-bridge` — compliance
4. `battery-passport-implementation` — compliance
5. `remanufacturing-recycling-circular-economy` — circularity
6. `technical-lead-battery-systems` — delivery method
7. `agile-project-management` — delivery method (new)

This is a renumbering: prior Card 3 (Technical Lead) moves to position 6 in the array. Prior Card 4 moves to position 3. Prior Card 5 moves to position 5 (unchanged). Prior Card 6 moves to position 4. This is intentional — the array order now reflects pillar grouping, which simplifies render logic.

Helper utilities to add to `services.js` (or a sibling helper file):

```js
export const SERVICE_PILLARS = [
  {
    id: "engineering",
    label: "Engineering",
    anchor: "engineering",
  },
  {
    id: "compliance",
    label: "Compliance",
    anchor: "compliance",
  },
  {
    id: "circularity",
    label: "Circularity",
    anchor: "circularity",
  },
];

export const DELIVERY_METHODS_HEADER = {
  label: "Delivery Models",
  anchor: "delivery-models",
  intro:
    "Two engagement formats available across every pillar — pick the one that matches how your team needs to consume our expertise.",
};

export function getServicesByPillar(pillarId) {
  return SERVICES_LIST.filter((s) => s.pillar === pillarId);
}

export function getDeliveryMethodServices() {
  return SERVICES_LIST.filter((s) => s.deliveryMethod === true);
}
```

### Render strategy

**`/services` page** (full depth view): grouped layout with H2 per pillar plus a "Delivery Models" section.

```
<h1>Services</h1>
<p>{intro paragraph — battery-first positioning}</p>

<section id="engineering">
  <h2>Engineering</h2>
  {2 cards: Battery Systems & Safety, Battery Mechanical Development}
</section>

<section id="compliance">
  <h2>Compliance</h2>
  {2 cards: EU–APAC Bridge, Battery Passport Implementation}
</section>

<section id="circularity">
  <h2>Circularity</h2>
  {1 card: Battery Remanufacturing, Recycling & Circular Economy}
</section>

<section id="delivery-models">
  <h2>Delivery Models</h2>
  <p>{DELIVERY_METHODS_HEADER.intro}</p>
  {2 cards: Technical Lead, Agile Project Management}
</section>
```

Each pillar section gets the anchor ID for footer-link targeting.

**Landing `ServicesSnapshot`** (summary view): keep a flat grid for visual density, but add a small **pillar badge above each card title**. Cards retain their current visual treatment.

```jsx
<Card>
  <Card.Body>
    <Icon ... />
    <span className="pillar-badge">{ENGINEERING | COMPLIANCE | CIRCULARITY | DELIVERY METHOD}</span>
    <h3>{title}</h3>
    <p>{tagline}</p>
  </Card.Body>
</Card>
```

Visual treatment of the pillar badge (light theme):
- Small caps, 11-12px
- Letter-spacing ~0.05em
- Color: `var(--color-accent-cyan)` for Engineering/Compliance/Circularity pillars
- Color: `var(--color-accent-warm)` (the amber tone) for Delivery Methods — so they are visually distinct from pillar services
- Position: above the card title, below the icon

Below the seven-card grid, keep the existing **"See full services →"** link to `/services`.

**Footer Services column** expansion:

Replace the current single "Battery Advisory" link with three pillar links **and one delivery-models link**:

```js
{
  heading: 'Services',
  testId: 'footer-col-services',
  links: [
    { label: 'Engineering', to: '/services', state: { scrollTo: 'engineering' } },
    { label: 'Compliance', to: '/services', state: { scrollTo: 'compliance' } },
    { label: 'Circularity', to: '/services', state: { scrollTo: 'circularity' } },
    { label: 'Delivery Models', to: '/services', state: { scrollTo: 'delivery-models' } },
  ],
},
```

The `useScrollToSection` hook must already handle `state: { scrollTo: 'xxx' }` for landing anchors — extend it (or verify it works) for `/services` anchors. If the hook is landing-specific, generalise it to handle anchor scrolls on any route or add a sibling hook for the services page.

### Schemas: structured data update

`structuredData.js` already exports `SERVICE_SCHEMAS` covering the six prior services. **Add a seventh** entry for `Agile Project Management — Battery Programs`. Use the existing `service()` helper:

```js
service(
  "Agile Project Management — Battery Programs",
  "Sprint cadence, requirement traceability, and cross-functional coordination for battery development efforts. Backed by PSM I certification and thirteen years of cross-functional project engineering.",
),
```

Append it to the `SERVICE_SCHEMAS` array. `PAGE_STRUCTURED_DATA.services` consumes it via spread, so no other change is needed.

### Tests

- `services.js` helper-function tests: `getServicesByPillar('engineering')` returns 2; `getServicesByPillar('compliance')` returns 2; `getServicesByPillar('circularity')` returns 1; `getDeliveryMethodServices()` returns 2 (Technical Lead + Agile PM).
- `ServicesSnapshot.test.jsx`: each rendered card displays the correct pillar badge text; the "Engineering" badge appears on 2 cards, "Compliance" on 2, "Circularity" on 1, "Delivery Method" on 2.
- `ServicesPage.test.jsx`: the page renders four `<section>` regions with IDs `engineering`, `compliance`, `circularity`, `delivery-models`; each region contains the expected service titles.
- `Footer.test.jsx`: the Services column has 4 links with the correct labels and `scrollTo` states.

---

## 9. M3 — `ChatPanel` visual polish

The `ChatPanel` molecule (`client/src/components/molecules/ChatPanel.jsx`) is the most prominent lead-gen surface on `/` and `/contact`. Its inline rendering must look like a confident, modern chat interface — not like a placeholder textarea.

### Visual contract (light advisory theme; molecule must also degrade gracefully on the dark passport theme even though it isn't rendered there)

| Element | Specification |
|---|---|
| Container | Rounded corners (12px radius), subtle 1px border using `var(--color-border)`, soft drop shadow `0 4px 12px rgba(15, 20, 25, 0.04)`, white background. Fixed height ~480px in inline mode (per spec §18.8). |
| Header strip (optional) | If present, ~48px tall, with the Ichnos brand mark (small, ~24px) on the left and an "AI assistant" or "Battery Advisory Chat" label. Subtle bottom border separating header from message area. |
| Welcome message | Visible by default on first render. Bot bubble, left-aligned, opening line: *"Hi — tell me about your battery program. I can help with EU 2023/1542, MS 2818, FMEA, mechanical design, or anything else."* Keep it under 25 words. |
| User message bubble | Right-aligned. Background: `var(--color-accent-cyan)` with white text. Border radius: 16px on the user-facing corner side; 16px on the others except 4px on the lower-right (so the bubble visually "points" from the user). Max-width ~75% of the panel width. |
| Bot message bubble | Left-aligned. Background: `var(--color-bg-alt)` (the light-grey rhythm token) with `var(--color-text-primary)` text. Same border-radius shape but with the small corner on the lower-left. Optional small "I" avatar circle (24px, `var(--color-accent-cyan)` background) to the left of the bubble. |
| Message spacing | 12px vertical gap between bubbles; 16px between user-bot turn pairs. |
| Input area | Fixed at the bottom of the panel. Single-line text input with rounded corners (24px / pill shape); placeholder text *"Type your message…"*. A round 40×40 send button on the right using `var(--color-accent-cyan)` background, white paper-plane icon (`bi-send-fill`). Disabled state when input is empty. |
| Scroll behaviour | Message area auto-scrolls to the latest message on send. Smooth scroll, not jump. |
| Empty state (rare — only if welcome message somehow doesn't render) | Light placeholder text in the message area, centred, 50% opacity. |
| Loading / typing indicator | When awaiting bot response: three-dot animated indicator in a left-aligned bot bubble shape. Subtle. |
| Disclaimer line | Below the input area, very small (11px), low-contrast: *"Responses are AI-generated. We follow up personally on every conversation that becomes a lead."* |

### Implementation notes

- Keep `ChatPanel.jsx` ≤ 120 lines. Extract the bubble component (`ChatBubble.jsx`) and the input area component (`ChatInputArea.jsx` may already exist) into separate molecules if needed.
- New CSS classes in `client/src/index.css` rather than inline styles, per CLAUDE.md §5.2.
- Suggested class names: `.chat-panel`, `.chat-panel__header`, `.chat-panel__messages`, `.chat-panel__bubble--user`, `.chat-panel__bubble--bot`, `.chat-panel__input-row`, `.chat-panel__send-btn`, `.chat-panel__disclaimer`.
- Modal mode should reuse these styles. The only difference between modal and inline modes is the outer wrapping (overlay + backdrop vs section card).
- No emoji in welcome or disclaimer copy.

### Verification

- Visual smoke on Vercel preview at desktop (≥ 1024px) and mobile (≤ 480px). Bubbles wrap correctly; input area stays fixed; send button is reachable on mobile keyboards.
- Lighthouse contrast: user-bubble text on cyan background must pass AA (4.5:1). If `var(--color-accent-cyan)` is too light for white text, darken the bubble background by ~10% or switch text to `var(--color-text-primary)`. Test before merging.
- The disclaimer line must be readable but visually subordinate. Around 60% opacity of `var(--color-text-secondary)`.

---

## 10. Phasing

Phases of ≤3 source files each, per `CLAUDE.md` §17.23. Suggested grouping:

| # | Ticket | Files |
|---|---|---|
| 1 | F1 — Francesco timeline correction | `teamTimelines.js`, `CareerTimeline.test.jsx`, `TeamPage.test.jsx` (or `FounderProfile.test.jsx`) |
| 2 | F2 + F3 — `landingContent.js` and `teamContent.js` cleanup | `landingContent.js`, `teamContent.js` (+ test files only if they reference deleted exports) |
| 3 | F4 — `navigation.js` cleanup | `navigation.js`, any consumer file with stale imports |
| 4 | F5 — Footer brand description | `Footer.jsx`, `Footer.test.jsx` |
| 5 | M2 (a) — `services.js` data-model extension + new Agile PM service | `services.js`, `structuredData.js`, `services.test.js` (new if absent) |
| 6 | M2 (b) — `ServicesSnapshot` pillar badges | `ServicesSnapshot.jsx`, `ServicesSnapshot.test.jsx`, `index.css` (badge styles only) |
| 7 | M2 (c) — `ServicesPage` pillar grouping | `ServicesPage.jsx`, `ServicesPage.test.jsx`, `index.css` (section styles) |
| 8 | M2 (d) — Footer Services column expansion + scroll behaviour | `Footer.jsx`, `Footer.test.jsx`, `useScrollToSection.js` (or sibling) |
| 9 | M3 — `ChatPanel` visual polish | `ChatPanel.jsx`, `ChatBubble.jsx` (new if extracted), `index.css` (chat styles) |

Each phase ends with a Conventional Commit. M1 ships no code, only the documented decision in this file.

---

## 11. Verification additions (extends `docs/designRefinementEpic.md` §15)

- [ ] `CAREER_TIMELINE_FRANCESCO` has nine entries in the locked order. The first is Ducati 2005–2011; the last is Ichnos 2026–Present.
- [ ] No file references `PROBLEM_CARDS`, `SOLUTION_CONTENT`, `WHY_ICHNOS_CARDS`, or `SERVICES_PREVIEW`.
- [ ] No file references `CORE_COMPETENCIES` or `SECTION_HEADINGS` (from `teamContent.js`).
- [ ] No file references `COMPANY_NAV_ITEMS`, `LANDING_SECTIONS`, `NAV_LINKS`, or `PRODUCT_NAV_ITEMS`.
- [ ] Footer renders `"Engineering, compliance, circularity."` as the brand description (lowercase except the leading E; period at the end).
- [ ] `SERVICES_LIST` has seven entries; `getServicesByPillar` and `getDeliveryMethodServices` return the expected counts.
- [ ] `/services` renders four labelled sections (Engineering, Compliance, Circularity, Delivery Models) with the correct anchor IDs.
- [ ] `ServicesSnapshot` cards each show a pillar/delivery-method badge.
- [ ] Footer Services column has four links: Engineering · Compliance · Circularity · Delivery Models — each scrolling to the matching `/services` anchor.
- [ ] `structuredData.js` `SERVICE_SCHEMAS` has seven entries.
- [ ] `ChatPanel` inline mode renders the welcome bubble on first load; user bubbles are right-aligned with cyan background and white text; bot bubbles are left-aligned with light-grey background; AA contrast passes; disclaimer is present and legible but visually subordinate.

---

## 12. Execution policy

Inherits all locked decisions from `docs/designRefinementEpic.md` §18. The following additions apply specifically to this sweep:

### 12.1 "Circularity" is the third-pillar word

Not "sustainability". The hero word is the locked term across the entire site: hero headline, footer brand description, services pillar label, anchor IDs (`#circularity`), JSON-LD service grouping, all of it. If a copy or label drift toward "sustainability" surfaces in implementation, treat it as a defect.

### 12.2 Pre-doctorate timeline entries are non-negotiable

The Ducati / Technogym / pre-2017 FEV roles are the credibility chain that supports the Engineering pillar's claims. Do not abridge or omit them. Adjustments to phrasing are fine if dates and organisations stay exact.

### 12.3 "Agile Project Management" is a delivery method, not a pillar service

Render it under "Delivery Models", never inside Engineering / Compliance / Circularity. Same for Technical Lead. The two together form a small "how we deliver" section after the three pillars on `/services`, and they get the warm-amber badge on the landing snapshot.

### 12.4 Stale-constant deletion: import-audit first, delete second

Never delete an export without first proving nothing imports it. Include `.test.jsx` files in the audit. If a stale test imports a stale constant, the test goes first.

### 12.5 ChatPanel must look like a chat product

The visual contract in §9 is the bar. If the implementation lands as a styled `<textarea>` with no message bubbles, no welcome message, and no send button styling, the phase has not landed — it's a stub. Reject the PR.

---

## 13. PR review checklist additions (extends `docs/designRefinementEpic.md` §19)

When a PR touches the surfaces in this sweep, add the following section checks alongside the parent spec's checklist:

**Timeline**:
- [ ] `CAREER_TIMELINE_FRANCESCO` length is exactly 9
- [ ] First entry's `organization` is `"Ducati Motor Holding"`
- [ ] Last entry's `organization` is `"Ichnos Protocol Pte. Ltd."`
- [ ] 2025 entry is Sigma School, not "Web developer" or similar
- [ ] FEV Lead Expert dates are exactly `"2022 – 2025"` (not 2020–2025)
- [ ] Ichnos entry description leads with "advisory practice" not "Battery Passport"

**Stale-constant deletion**:
- [ ] No deleted export still appears in any `import` statement repo-wide (grep verified, including `.test.jsx`)
- [ ] All tests pass after deletion
- [ ] No reintroduction of "Web developer" or "Software Development" competency

**Three pillars**:
- [ ] All seven services have a `pillar` field (one of `"engineering" | "compliance" | "circularity" | null`)
- [ ] Exactly two services have `deliveryMethod: true` (Technical Lead, Agile Project Management)
- [ ] `/services` renders four sections in order: Engineering, Compliance, Circularity, Delivery Models
- [ ] `ServicesSnapshot` shows a pillar/delivery-method badge on each card
- [ ] Footer Services column has four links (Engineering · Compliance · Circularity · Delivery Models)
- [ ] No use of "Sustainability" anywhere — only "Circularity"

**ChatPanel polish**:
- [ ] Welcome bubble visible on first inline render
- [ ] User and bot bubbles visually distinct (alignment, color, shape)
- [ ] Send button styled as a round cyan icon button
- [ ] Disclaimer line present below input
- [ ] AA contrast on user bubble text
- [ ] Mobile breakpoint (≤ 480px) renders bubbles without horizontal overflow

---

## 14. Out of scope

- Adding new services beyond the seven defined here
- Reintroducing "Sustainability" terminology
- Changing the four-entry navbar
- Changing the locked landing IA (Hero → Services → Company → Passport → Contact)
- Changing the founder bio paragraphs (only the **timeline** is touched in F1)
- Backend / server changes
- Database changes
- Vercel / CI infrastructure changes
- Refactoring the existing chat backend (only the `ChatPanel` molecule's visual rendering)
- Adding internationalisation
- Producing a marketing case-study page

---

## 15. Notes for Traycer

- Do not re-ask anything answered in §12 of this document or in §18 of the parent `designRefinementEpic.md`.
- Locked copy is locked: every quoted string in §2, §6, §8, and §9 is the final text. Do not paraphrase.
- Locked ordering is locked: the seven-service array order in §8, the pillar order (Engineering → Compliance → Circularity → Delivery Models), the nine-entry timeline order.
- When in genuine doubt, raise the question as a PR comment and complete the rest of the phase against the best-effort interpretation. Do not block.
- Each phase lands as its own PR with a Conventional Commit. Tests for the phase ship in the same PR as the code.
