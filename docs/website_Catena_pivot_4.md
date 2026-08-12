# website_Catena_pivot_4.md — Landing reorder, credential refocus, passport-page rebuild

**Version 4.0 — 2026-08-11 · Status: normative · ready for one Traycer run**
**Baseline:** `website_Catena_pivot_3.md` v3.11 **including its §9.1–9.12 rulings, which remain in force and are assumed MERGED before this run starts.** v4 governs the subjects below; pivot-3 governs status vocabulary, label law, testing model, excluded vocabulary. Where v4 names a date or claim, v4 wins (facts re-verified 2026-08-11).
**Conventions:** MUST/SHOULD/MAY as pivot-3. Reference code is normative as to behaviour.
**Copy style rule (Francesco, 2026-08-11): no em-dashes ("—") in any copy introduced by this spec** — site strings and diagram text use colons, commas or periods instead. (Existing fenced copy is untouched; spec prose is exempt.)

---

## 0. Execution contract — Traycer's standing questions, pre-answered

1. **Phases & caps.** Run as the phase list in §10. The 3-file cap holds unless a phase is marked *atomic*; every atomic phase here is pre-approved as a documented deviation (reason given in §10 — record it in the PR, do not re-ask).
2. **Atomicity rule (from pivot-3 §9.11/§9.12):** the commit boundary is the semantic flip, not the file count. Any consumer of a changed data shape lands in the same commit as the shape change.
3. **Guard placement (pivot-3 §7.2):** every new/loosened machine assertion lands in the earliest phase where it is green — guards that protect a later CSS/copy change land BEFORE that change.
4. **Tests locate by `data-testid` or role, never copy** (pivot-3 §7.0). DOM assertions compare against imported constants, never restated literals. Copy changes in this spec therefore require **zero** test-string rewrites except where a testid itself is new.
5. **Tier-3 changes in this run:** item 14's exact string changes (§5.4). No other tier-3 additions. Reason recorded per §7.3.
6. **Existing copy fences:** the five `catenax-*` card bodies and microlines remain fenced (pivot-3 §4.5). This spec moves headings around them; it does not rewrite them.
7. **Owner-assigned (NOT Traycer):** refining the diagram deck (`docs/diagrams/Ichnos_ValueChain_Diagrams.pptx`) and re-exporting the images; Lighthouse; three-viewport review; link unfurl. Everything else in this spec is implementable in the IDE.
8. **Images are already in the repo** (committed 2026-08-11): `client/public/diagrams/valuechain_full.jpg`, `client/public/diagrams/ichnos_role.jpg`. Embed as `<img>`; do not inline as JSX SVG.
9. **No route changes. No dependency changes. No IA changes** beyond section reordering inside existing pages.
10. **Green-before-commit** holds for every phase.

---

## 1. Verified facts — the only permitted versions of these claims (checked 2026-08-11)

| Claim | Verified state | On-site wording rule |
|---|---|---|
| Battery passport date | 18 Feb 2027 (Art. 77, Reg. (EU) 2023/1542) — unchanged | solid timeline item |
| Supply-chain due diligence | **Postponed to 18 Aug 2027 by Reg. (EU) 2025/1561** (from 18 Aug 2025); first annual report ≈ Aug 2028; Commission guidelines due 26 Jul 2026 | **dashed/deferred** timeline item; cite "Reg. (EU) 2025/1561" |
| Carbon-footprint declaration (EV) | **Delegated act still pending** as of Aug 2026; obligation applies per Art. 7 once the acts are in force (phasing by category: EV first, then industrial >2 kWh, LMT Aug 2028) | **dashed/deferred**: "pending delegated act — expected to converge on the 2027 passport window". MUST NOT print a hard past date (the original 18 Feb 2025 is superseded by the pending acts) |
| Recycled-content declaration | 18 Aug 2028 (EV/SLI/industrial), 18 Aug 2033 (LMT); minimum thresholds 18 Aug 2031 / 2036; delegated act pending | **dashed/deferred** |
| Harmonised labelling | 18 Aug 2026 (or 18 months after implementing acts if later) | solid |
| Removability/replaceability (portable) | 18 Feb 2027 | solid (optional item) |
| Performance/durability (industrial >2 kWh) | 18 Aug 2027 | solid (optional item) |
| Catena-X North America | **AIAG launched the Catena-X Hub North America** (ALSC 2025) | "expanding internationally — a North America hub operated with AIAG" |
| Catena-X China | **Tripartite Letter of Intent signed in Suzhou** (catena-x.net news) | "growing collaboration in China (Suzhou Letter of Intent)" — MUST NOT say "operating in China" |
| UNTP | **Interoperability testing of the UN Transparency Protocol announced by British Columbia, Catena-X and the Responsible Business Alliance** | "designed to interoperate across dataspaces — including interoperability testing with the UN Transparency Protocol (UNTP)" |
| **Zero-knowledge proofs** | **NOT a Catena-X mechanism. CLAIM CORRECTED.** Trust and integrity rest on W3C Verifiable Credentials presented via the Decentralized Claims Protocol (DCP) at every connector handshake, policy-enforced contracts, and signed data exchanges | The site MUST NOT attribute data integrity to zero-knowledge proofs. Use the §7.3 verbatim copy |
| Onboarding role | Cofinity-X performs onboarding as operating company; **Ichnos manages the process**, it does not onboard itself | say "we manage your registration and BPN with Cofinity-X"; MUST NOT say "we onboard you" |
| PCF twin authorship | The PCF digital twin is set up with/by the customer's **LCA partner**; Ichnos prepares the data exchange | say "we prepare the data exchange so your LCA partner sets up the PCF digital twin"; MUST NOT claim Ichnos performs the LCA |
| One-up / one-down visibility | Established Catena-X data-exchange principle (bilateral, tier-to-tier sharing; no chain-wide propagation) | permitted as written in §7.3 |
| Ichnos hosting | Per M4 architecture: EU-located servers, Ichnos-operated connector/twin hosting | say "EU-hosted, operated by Ichnos"; MUST NOT say "certified", "TISAX", or "compliant servers" as an unqualified badge — the permitted sentence is in §7.3 |

**Mechanism:** all timeline dates live in a NEW `client/src/constants/regulatoryDates.js` — each entry `{id, label, date|datePending, deferred: bool, source}` with a file-top `VERIFIED_AS_OF = "2026-08-11"`. The timeline renders from this file; nothing hardcodes a date in a component. (Same single-source discipline as `catenaXStatus.js`.)

---

## 2. Navbar — lockup, top-left (Francesco: confirmed yes)

- `Logo.jsx` call in `Navbar.jsx` gains the wordmark: mark image (`/brand/ichnos_mark_dualtone.svg`, current sizing) followed by text **"Ichnos Protocol"** — "Ichnos" `--color-text-primary` weight 700, "Protocol" `#0F71CB` weight 500, Fraunces NOT used here (nav stays sans). Implement inside `Logo.jsx` as an optional `withWordmark` prop (default true in navbar, false elsewhere) so the footer keeps its current white-mark usage.
- Mobile (<576px): wordmark hides (`d-none d-sm-inline` or CSS), mark alone remains. Alt text on the img stays "Ichnos Protocol"; the wordmark span is `aria-hidden="true"` (screen readers must not hear the name twice).
- Tests: `Logo.test.jsx` asserts wordmark renders when `withWordmark` and not when absent (testid `logo-wordmark`).

## 3. Hero — eyebrow moves below the subhead

New order inside the hero: **headline → subhead → eyebrow → CTA.** The eyebrow (`Based in Singapore · Serving ASEAN manufacturers · ${CATENA_X_STATUS_LINE}`) becomes a quieter credential line under the subhead (smaller size, `--color-text-secondary`, keep AA on the photo overlay). No copy changes. `Hero.jsx` + `Hero.test.jsx` (structural order via testids `hero-headline|subhead|eyebrow`).

## 4. Landing page — section order

New order in `LandingPage.jsx`:
1. Hero (with battery photo per pivot-3 §9.2/§9.6, already merged)
2. **What we do** (ServicesSnapshot — §6 headings apply here too)
3. **Why Ichnos** (text first)
4. **Credential strip** (moves BELOW the Why-Ichnos text — Francesco: confirmed; narrative then evidence)
5. Passport teaser
6. Contact section

`LandingPage.test.jsx`: assert section order by testid sequence. The credential strip keeps its own background band; verify spacing between Why-Ichnos band and strip ≥ `--spacing-xl`.

## 5. Why Ichnos + credential strip — content refocus

### 5.1 Credential card copy (exact target state of `CREDENTIALS`, §1.3 rules apply)

```js
// order = display order
{ id: 'catenax-member', label: 'Catena-X Association member',
  note: MEMBER_CARD_NOTE, cxLabel: 'member' },
{ id: 'catenax-qualified-advisor', label: 'Catena-X Qualified Advisor',
  note: ADVISOR_CARD_NOTE, cxLabel: 'advisor',
  href: 'https://catena-x.net' /* Logo Use Agreement §4: only permitted link target; at most one linked label per page */ },
{ id: 'dpp-expert-group', label: 'Digital Product Passport Expert Group',
  note: 'Member — expert group under the Catena-X Sustainability Committee' },
{ id: 'battery-experience', label: '10+ years in battery development',
  note: 'PEM RWTH Aachen & FEV, from cell production research to vehicle battery systems' },
```

New constants in `catenaXStatus.js` (single source, consumers = credentials.js; item-8 list updated):
- `MEMBER_CARD_NOTE = "Well connected across the network, especially with European OEMs and their supply chains."`
- `ADVISOR_CARD_NOTE = "Qualified Advisor, Attestation ID 868. Advising Asian manufacturers from Singapore, on site across ASEAN."`

Rules honoured: member = corporate connectivity/EU-OEM framing; advisor = Asia/Singapore convenience framing (Francesco's brief); **validity date REMOVED** (renewal-agnostic); "Qualified Advisor" text precedes the attestation ID; the PhD card becomes the experience card (degree stays in Why-Ichnos text and team page — no information lost). Both notes are §1.1/§1.2-clean ("well connected" is a marketing statement about the member's own network activity, not a status/conformance claim; it MUST NOT escalate to "official", "endorsed", "preferred partner").

### 5.2 Label optical sizing (Francesco: same visible size)

The advisor 16:9 SVG carries ~54% vertical clear space; the member SVG is tight-cropped. Equal `height` therefore renders the advisor mark roughly half the member's optical size (visible today). Fix by equalizing the **visible mark height** ≈ 34px on both:
- `.credential-strip__label-img--advisor { height: 74px; }` (34 ÷ 0.46)
- `.credential-strip__label-img--member { height: 34px; padding: 26px 10px; }` (clear space ≈ 0.75× visible height, per Brand Governance)
Values MAY be tuned ±15% for optical balance at review; the **ratio rule is normative**: advisor img height ≈ 2.1× member img height. Both keep `width:auto; object-fit:contain`. Same pairing in the footer at its smaller scale (`--advisor` ≈ 2.1 × `--member`).

### 5.3 Strip position
Below the Why-Ichnos text (§4). The strip's `aria-label="Credentials"` and heading wording per pivot-3 §9.8 stand.

### 5.4 Conformance deltas
- **Tier-3 item 14 REPLACED:** exact string becomes `"Qualified Advisor, Attestation ID 868. Advising Asian manufacturers from Singapore, on site across ASEAN."` (the `ADVISOR_CARD_NOTE` constant, asserted in `catenaXStatus.test.js`). *Recorded reason: factual claim about a credential; the expiry date is intentionally omitted as renewal-agnostic — the renewal obligation lives in the todo/ops calendar (renew by 2027-07-06), not in public copy.*
- `STATUS_STRING_EXPORTS` gains `MEMBER_CARD_NOTE`, `ADVISOR_CARD_NOTE`.
- The old `'eu-passport-2027'` credential stays deleted; `'phd-pem-rwth'` id is REPLACED by `'battery-experience'` — grep for the old id in tests/structuredData first (pivot-3 §2.2 rename procedure).

## 6. Services headings — titles and subtitles

Pillar model gains optional `subtitle`. Target state:
- **Engineering** (title) — subtitle: **"Technical depth across the battery circular value chain."**
- **Catena-X services** (title) — subtitle: **"Connect once. Answer every customer data request."** (demoted from H2 to subtitle; the current kicker "CATENA-X SERVICES" is removed — the pillar name IS the title now)
- Compliance / Circularity: no subtitle (allowed empty).
Applies on `/services` AND the landing ServicesSnapshot ("What we do" heading stays). `ServicesGroup.jsx` renders `<h2>{label}</h2><p class="pillar-subtitle">{subtitle}</p>`; heading level order must remain valid (h2 → h3 cards). Update `services.test.js`, `ServicesGroup.test.jsx`, `ServicesSnapshot.test.jsx` (structural, testid-located).

## 7. Passport page rebuild (`/passport`, constants in `passportContent.js`)

### 7.1 Milestones → timeline with a time arrow
Replace the "Status quo and milestones" block with a horizontal timeline component (`organisms/RegulatoryTimeline.jsx`, data from `regulatoryDates.js`):
- A left→right arrow axis; items as dots + labels, ordered by date; **today marker** ("Aug 2026") on the axis.
- **Solid ink items:** labelling (Aug 2026), battery passport (18 Feb 2027), durability (Aug 2027, optional), removability (Feb 2027, optional).
- **Dashed grey items (deferred/pending — `deferred: true`):** due diligence (18 Aug 2027, "postponed by Reg. (EU) 2025/1561"), carbon-footprint declaration ("pending delegated act"), recycled-content declaration (18 Aug 2028). Dashed connector stubs, `--color-text-secondary` labels, small "deferred/pending" tag.
- Mobile (<768px): the SAME data renders as a vertical list with a left axis (no horizontal scroll).
- Footnote under the timeline: `Dates verified ${VERIFIED_AS_OF}; deferred items track pending delegated acts.`

### 7.2 Value-chain graphic (the centrepiece)
In "The case for seamless value-chain data flow": embed `/diagrams/valuechain_full.jpg` full-width (`<img>`, `loading="lazy"`, `alt` = "EU battery-passport value chain: from mine through precursor, electrode, cell, module and pack to second life and recycling, with carbon-footprint, recycled-content and due-diligence documents verified by a notified body and published to the EU system"), wrapped in a link that opens the image full-size in a new tab (mobile zoom path). Keep a one-line lead-in; the long prose that duplicated this story is REPLACED by the image + the existing "who Ichnos works with" block. **Source of truth is the deck** `docs/diagrams/Ichnos_ValueChain_Diagrams.pptx` — when Francesco refines it, only the exported JPG is replaced (same filename), zero code change.

### 7.3 "The Catena-X data stack" — REPLACE body with this verbatim copy (verified §1)

> Catena-X is the automotive industry's shared data network, born in Europe and expanding internationally, with a North America hub operated with AIAG, growing collaboration in China (Suzhou Letter of Intent), and interoperability testing with the UN Transparency Protocol (UNTP) so that data can travel across dataspaces.
>
> Its principles matter more than its acronyms. **Your data stays yours:** every company keeps data sovereignty and decides who can discover its data, who can access which dataset, and under which contract policy. **Trade secrets don't travel:** data is exchanged bilaterally, one tier up and one tier down, so your process know-how never propagates along the chain. **Every request is verified:** each participant holds verifiable credentials, and its identity (Business Partner Number) is cryptographically checked at every data request. **Nothing moves without a contract:** exchanges run through a connector, the Eclipse Dataspace Connector (EDC), a piece of software each participant runs, which negotiates a machine-readable contract, enforces the agreed usage policy, and transfers the data directly between the two parties, encrypted, with no central database in between.
>
> Ichnos can run this for you: we host and operate the connector and digital-twin infrastructure on EU-located servers, managed by us, so your team gets a working Catena-X presence without building one.

(Keep the existing standards table below it — CX-0143, PCF models, EDC, Tractus-X, Cofinity-X — unchanged; it serves the technical reader. The ZKP claim is NOT added anywhere, per §1.)

### 7.4 "Ichnos role in the value chain" — graphic
Replace the text-band row (Raw materials → … → EU importer) with `/diagrams/ichnos_role.jpg` (`<img>`, alt = "Ichnos's role: making ASEAN component and cell manufacturing passport-ready, between raw-materials traceability and EU importers, with connection management (registration with Cofinity-X), passport data readiness with the LCA partner, and EU-hosted infrastructure operated by Ichnos"). Same replace-the-JPG upgrade path.

### 7.5 De-duplication: remove "What Ichnos does"
The section duplicates the services page (Francesco: confirmed). DELETE it; the role graphic (§7.4) plus one line — `Full service list on the Services page.` with the existing `See services →` link — remains. Update `PassportPage.test.jsx` (section removed, link present) and any `structuredData.js`/anchor references to the removed heading.

## 8. Mobile mandate (entire site, binding for this run)

At 390 px (and 768 px): navbar collapses to mark + burger; hero text over photo keeps AA; credential strip wraps 4→2→1 without the label images overflowing (`minmax(220px,1fr)` grid stays); services grids 3→1; the timeline switches to its vertical form; both diagram images scale full-width with the tap-to-open-full-size link; footer recognitions wrap. `theme-scoping.test.jsx` additions are NOT required for layout (jsdom can't assert layout) — this is the §7.4 manual matrix, extended with these items. Any fixed pixel width found in touched components is replaced with a responsive unit while in the file.

## 9. Conformance summary for this run

Machine: `regulatoryDates.js` exists and the timeline renders every entry (tier-1, testid per item id, `deferred` entries carry the `--deferred` class); tier-3 item 14 replacement (§5.4); item-8 list gains the two new note constants; existing guards (photo-overlay, palette, vocabulary) untouched and green; zero occurrences of "zero-knowledge", "ZKP", "compliant servers", "operating in China" (add these four to `FORBIDDEN` — they are v4's claim-accuracy guards; re-sweep the corpus on widening per pivot-3 §7.2).
Manual (owner): §8 matrix, Lighthouse, unfurl, and the §7.4 items from pivot-3.

## 10. Phases (each its own commit; caps pre-ruled)

| P | Scope | Files (≈) | Cap ruling |
|---|---|---|---|
| 1 | `regulatoryDates.js` + widened `FORBIDDEN` (guards first, green now) | 3 | within cap |
| 2 | Navbar lockup (`Logo.jsx`, `Navbar.jsx`, `Logo.test.jsx`) | 3 | within cap |
| 3 | Hero order + landing section order (`Hero.jsx`, `landingContent.js` untouched, `LandingPage.jsx`, 2 tests) | 4 | **atomic, pre-approved**: order flip + its structural tests are one semantic unit |
| 4 | Credentials refocus (`catenaXStatus.js`, `credentials.js`, `catenaXStatus.test.js`, `CredentialStrip.test.jsx`, strip/footer sizing CSS) | 5 | **atomic, pre-approved**: §9.12 rule — data shape + consumers + tier-3 swap in one commit |
| 5 | Services headings (`services.js`, `ServicesGroup.jsx` + 3 tests) | 5 | **atomic, pre-approved**: model field + renderer + structural tests |
| 6 | Passport page (`passportContent.js`, `RegulatoryTimeline.jsx` new, `PassportPage.jsx`, `PassportPage.test.jsx`, CSS) | 5 | **atomic, pre-approved**: section rebuild is one semantic unit |
| 7 | Mobile sweep of touched components + §8 fixes | ≤3 | within cap |

Deploy after green: PR → main → CI → merge → "Sync main → staging" → owner gates → promote.

## 11. Out of scope
Routes · chatbot & knowledge base · the five fenced Catena-X cards · fonts · `/catena-x` focus content · anything in pivot-3 not named here.
