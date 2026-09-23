# september_fixes_spec.md: cleanup and reconciliation, September 2026

**Version 1.2, 2026-09-23. Status: normative for the `September-fixes` branch.**

v1.2 answers Traycer's architecture validation of v1.1 (risks R9, R10, R11 and four questions; section 2.1). Every migration becomes additive and the owner runs all three up front; the one contraction moves to P14. P1 ships alone before 30 September. P13 splits into a configuration commit and a formatting commit, with CI enforcement in P14. The Qualified Advisor guard is specified by probe lists rather than by a regex, and the rewritten attribution surfaces get positive assertions. Traycer's P3a/P3b split is accepted.

v1.1 records the owner's rulings on every decision that v1.0 left open (section 2), widens two phases accordingly (P3 gains a two-currency price list keyed on where the registrant is based; P7 reconciles every surface that attributes the Qualified Advisor qualification to the company), drops credential rotation from P10, and adds section 5, which answers the questions Traycer is expected to ask.

This specification turns the owner's post-evaluation list of fifteen fixes into fourteen phases for Traycer. Each item was checked for soundness against the code, the deployment settings and the production database before it was specified; section 1 records what was found. Where an item as requested would not have achieved what the owner wanted, the phase says so and specifies what does.

**Inheritance.** `website_Catena_pivot_3.md` (claim rules, label law, three-tier testing), `website_readiness_assessment_page.md` v1.13 (fenced copy, page guards), `commercial_offer_page_pattern.md` v1.0, and the conventions in `CLAUDE.md` (200-line source cap with tests exempt, Conventional Commits, documentation updated in the same commit as the code it describes). Where those documents conflict with this one, they win, except where a phase below records an explicit amendment to them.

**Branch.** `September-fixes`, created from `origin/main` at `79b9232`, which already contains every commit from the `Consortium` branch (PRs #171 to #176). Phases run in order; P1 is time-critical.

---

## 1. Facts the phases rest on

Verified on 2026-09-23 against the repository, the Vercel API, the GitHub API and the production database.

1. **Production deploys from `release` by Vercel git integration**, for both projects. `ichnos-protocol` and `ichnos-protocol_server` each carry a `-git-release-` alias next to the production domains. The `Promote to Production` workflow's last four runs are pending, waiting, cancelled and failure. It has never completed, and production shipped on every push to `release` regardless. It waits because the GitHub `Production` environment requires a reviewer.
2. **The production database holds 7 `user_profiles` rows, all with NULL `consortium_preferred_start` and NULL `consortium_tier`.** Renaming the start option changes a CHECK constraint and no data.
3. **`POST /api/auth/verify-token` has no caller.** `useVerifyTokenMutation` is exported from `client/src/features/auth/authApi.js:54` and used nowhere in `client/src` or `e2e/`. The route (`authRoutes.js:27`) has no middleware, echoes the decoded token to whoever posts a valid one, and upserts nothing. The `CLAUDE.md` §11 row saying it upserts a user is wrong.
4. **`PageTransition` never shows its skeleton.** The skeleton is wrapped in `.page-fade-enter`, which is `opacity: 0`, and is replaced one animation frame later. The visible effect is a 300 ms opacity fade. If `requestAnimationFrame` never fires (hidden tab, prerender, some crawlers) the page stays blank with no timeout. No test covers the component. Every skeleton also contains a `NavbarSkeleton` although `PublicLayout` has already rendered the real navbar above it.
5. **Secrets in a public repository.** `VERCEL_SETTINGS.md:189` holds a production-Firebase QA account's email and password in plaintext. `e2e/.env.e2e` is force-tracked past `.gitignore` (line 9) and its values are copied into `e2e/ENV_REFACTOR_PLAN.md:87-104`. `e2e.yml:159` prints the Firebase API key to the job log. `e2e.yml:105` interpolates the repository-dispatch payload directly into a shell script. `e2e/tests/helpers/auth.js:119` hardcodes a sign-up password. The owner has ruled (D8) that none of these values will be rotated.
6. **No coverage provider is installed.** `@vitest/coverage-v8` is in no `package.json` and no `node_modules`, so `client/vite.config.js`'s `thresholds: { lines: 80 }` has never executed. The server has no vitest config and no coverage script.
7. **Prettier has no config and no ignore file.** `server/knowledge-base/` is 270 MB in 366 ignored files (PDFs, SQLite databases, a browser profile). `npm run format` in `server/` would walk it, and `npm run format:check` errors out on it today.
8. **Nothing in the repository is called "quality check".** No workflow, job or script carries that name. The README badges point at `Khorolev/Ichnos_Protocol`; the remote is `Ichnos-Protocol/Website`.
9. **CX-0160 is the Catena-X standard for battery passport data** (owner confirmation, 2026-09-23). The standard may be named. A conformance adjective beside it may not: IP Regulations 6.3 prohibits using the association's name "to advertise compliance with, or conformance to, Standards or technologies of the Association", pivot-3 §1.2 bans the family, and `vocabulary.js` does not yet catch the CX-numbered form.
10. **The consortium deadline test fails on 1 October 2026.** `ConsortiumPage.test.jsx:61-66` asserts the open-registration headline on the real clock.
11. **The Qualified Advisor qualification is Francesco Maltoni's, not the company's** (pivot-3 §1.5; attestation 868 names him; owner ruling D3). Seven surfaces attribute it to the company today: `CATENA_X_STATUS_LINE` in the hero eyebrow, the second sentence of `TRADEMARK_NOTICE`, the advisor card in `CREDENTIALS` (landing strip and footer), the Organization description in `structuredData.js:45`, `DEFAULT_OG_IMAGE_ALT` in `seoMeta.js:33`, the Why-Ichnos paragraph at `landingContent.js:22` ("the practice ... as a Catena-X Qualified Advisor"), the eyebrow of `PassportOffer.jsx:13`, and the chatbot `SYSTEM_PROMPT` at `server/src/helpers/chatHelpers.js:9` ("Ichnos Protocol is a Catena-X Qualified Advisor").
12. **Exchange rates used for D5**: USD 1 = SGD 1.275 and USD 1 = EUR 0.874, mid-market, 22 September 2026. Figures are rounded to the nearest thousand (nearest five hundred inside a range) and then fixed; nothing on the site converts.
13. **Delivery mechanics.** No workflow or startup hook runs migrations; the owner runs `npm run migrate` by hand. Every push of a server change to `origin` produces a Vercel preview whose Neon branch is forked from the production database at that moment, and E2E runs on it automatically. A contracting migration applied to production before the code that writes the new value is deployed therefore breaks production and every new preview until that code lands. An additive migration breaks nothing, whichever side of the deploy it runs on.

---

## 2. Owner decisions (ruled 2026-09-23)

| # | Decision | Ruling |
|---|---|---|
| D1 | Landing hero headline | `Getting ASEAN battery value chains and their data ready for the EU market` |
| D2 | Qualified Advisor label | Move to Francesco's profile on `/team`. The label image leaves the landing strip and the footer; both keep a text card. The owner's confirmation stands as the Logo Use Agreement attestation. |
| D3 | Who holds the qualification | Francesco, not the company. Every surface that claims otherwise is reconciled (P7) and guarded. |
| D4 | CX-0160 wording | `passport data in the CX-0160 data model`. Never "compliant", "conformant" or "compatible" beside it. |
| D5 | Consortium currency | EUR for customers based in the European Union, SGD for customers based in ASEAN, converted once from the USD figures at the rates in fact 12. Registrants based elsewhere see SGD (the company is Singapore-based). |
| D6 | Prettier configuration | Prettier defaults plus `endOfLine: "auto"`. The owner has no preference; this is the smallest config that survives a Windows checkout with `* text=auto`. |
| D7 | Team page with one member | Title `Team` and the plural subtitle stay; a new member is expected. |
| D8 | Leaked credentials | Not rotated. The cleanup removes them from HEAD and from the workflow's log output and feeds CI from GitHub variables and secrets holding the same values. Accepted risk, recorded here so nobody reopens it. |
| D9 | Migrations | The owner runs every production migration by hand and wants them front-loaded. Consequence in section 2.1: every migration in this epic is additive. |

### 2.1 Rulings on Traycer's architecture validation (2026-09-23)

Traycer reported three risks and four questions against v1.1.

- **R9 (critical), a migration-only push produces a red intermediate state.** Ruling: Traycer's option D, made stronger by D9. Every migration in this epic is additive. 007 becomes expand-only and keeps `nov_2026` in the CHECK beside `asap`; 008 adds a nullable column; 009 adds a table. The owner runs all three against production up front, in one sitting, before any code lands. Nothing is red in between, in production or on a preview branch forked from it, because old code and new code both satisfy the expanded constraint. The contraction (the `UPDATE` to `asap`, then a CHECK of `('asap', 'later')`) is migration 010 in P14, run only after P1 has been in production. P1 still ships alone and first: the production hero flips to "The first round closed" on 1 October and `ConsortiumPage.test.jsx` goes red on the real clock the same day, so P1 is merged to `main` and released before 30 September, ahead of P2. That is a copy and CI reason, not a database reason.
- **R11 (critical), P13a cannot pass the gate it adds.** Ruling: Traycer's option A, the seventeen-ticket sequence. P13a adds the configuration, the ignore files and the narrowed scripts, measures the formatted output in a disposable copy, and records the cap ruling; it neither wires CI nor treats `format:check` as a gate. P13b is the pure formatting commit and the first on which `format:check` is green. P14 wires `format:check` into CI and the checklist. Cap ruling for `CLAUDE.md` §5.1: content-constant files, whose length follows the copy they hold and not any logic, are exempt from the 200-line cap in the way test files are. P13a names the files its dry run pushes past 200 lines and records them in §5.1 as content-exempt, not grandfathered.
- **R10 (significant), the 40-character guard misses the live long-form claim.** Ruling: Traycer's option A, with the regex demoted to implementation. The normative artefact is the pair of probe lists in P7: every prohibited probe must match the guard and no permitted probe may, and `vocabulary.test.js` asserts both. Two traps are recorded there so the first draft does not repeat them.
- **Q4, positive assertions.** Ruling: Traycer's option A. The guard proves the corporate claim is absent; five positive assertions, listed in P7, prove the qualification is still stated and attributed to Francesco.
- **P3a/P3b.** Traycer's split is accepted: P3a establishes and persists `region` (form, validator, column, repositories, admin surfaces); P3b consumes it for pricing (config, helper, service, tier copy, link). P3a lands first. Null rows fall back to SGD and the API shape is unchanged.

---

## 3. Rules that apply to every phase

- No date, quarter, month or year in copy except through `regulatoryDates.js`. No relative calendar phrase either ("this year", "next quarter").
- No figure typed into client copy. Every price reaches a surface through the readiness pricing selector or the consortium tiers API. On the server, figures exist once, as numbers, in `consortiumTiers.js`.
- No conformance adjective beside Catena-X or beside a CX-numbered standard. No sentence in which the company, the practice or Ichnos "is" or acts "as" a Qualified Advisor.
- Every booking CTA resolves to `BOOKING_URL` from `companyInfo.js`.
- Tests import constants; they do not restate strings. The two tier-3 exact-match literals (`TRADEMARK_NOTICE`, `ADVISOR_CARD_NOTE`) are restated only in `catenaXStatus.test.js`, as today.
- Each phase ends with `npm run lint && npm test` green in `client/` and `server/`, and the documentation that describes the changed behaviour updated in the same commit (`CLAUDE.md` and `AGENTS.md` kept aligned).
- Every migration in this epic is additive and safe to run before its code lands (section 2.1, R9). A contraction is a separate numbered file, run only after the code that stops writing the old value has been in production.
- Each P below is one Traycer epic. Traycer's own three-file phases apply inside it: constants land before their consumers, and a test is updated in the same Traycer phase as the code it pins, so the tree is green after every Traycer phase. Commit messages carry the epic number, for example `feat(client): withdraw the consortium deadline (P1)`.
- **Owner confirmation.** `CLAUDE.md` §17 requires explicit confirmation for file deletions, root and CI edits, and migrations against production. The owner's approval of this spec version is that confirmation for every deletion and every root or CI edit named in a phase below. Running a migration against production stays a separate confirmation at the moment it happens.

---

## 4. Phases

### P1. Consortium: withdraw the deadline

**Why.** Item 2 of the owner's list. The consortium is no longer time-limited. Six surfaces carry a date, the start-preference option is a month, and the page test breaks on 1 October.

**Changes.**

- `client/src/components/pages/ConsortiumPage.jsx`: delete `DEADLINE`, `HERO_CLOSED`, `pickHero` and the `useState` that picks the hero (keep any other state). One `HERO`: title `Join the consortium`, subtitle `One anchor company and up to five of its suppliers, one project, one test environment.` The "Register by" sentence goes. `OFFER_CARDS[2]` body becomes: `The readiness assessment comes first and is credited to the project. The group call is scheduled once the anchor company and its suppliers are registered, and the work starts after it. Scope and price are set out in the proposal; registered participants see the tier overview.`
- `client/src/constants/seoMeta.js:112`: remove `Register by 30 September 2026.`
- `client/src/components/pages/ConsortiumTiersPage.jsx:25-26`: `Thank you. You are registered for the consortium. We answer within five working days.`
- Start-preference option: value `nov_2026` label `November 2026` becomes value `asap` label `As soon as the group is formed`. `later` / `Later` stays. Migration `server/migrations/007_20260923_consortium_preferred_start_expand.sql` is expand-only: `ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS chk_user_profiles_consortium_preferred_start`, then re-add it with `('nov_2026', 'asap', 'later')`. No `UPDATE`. The owner runs it against production before any code lands (section 2.1). The code then changes in this phase: `client/src/constants/consortiumContent.js:80-83` and `server/src/validators/contactSchemas.js:38` accept `asap` and `later` only. Update the header comment of `consortiumContent.js`: the option values restate the CHECK of migration 006 as amended by 007, minus the retired `nov_2026`, which the database tolerates until migration 010 (P14) removes it.
- Tests that name the old value: `client/src/components/organisms/contactFormHarness.jsx:94`, `ContactRequestForm.submit.test.jsx:65`, `server/src/validators/contactSchemas.test.js:96,206-221`, `services/contactService.test.js:58`, `repositories/userRepository.test.js:30,410`, `repositories/contactRepository.consortium.integration.test.js:35,75,192`, `e2e/tests/consortium/consortium-journey.spec.js:60` (`preferredStart: 'As soon as the group is formed'`), `e2e/tests/pages/ConsortiumPage.js:25-26,85` (comments).
- Delete `ConsortiumPage.test.jsx:101-110` (the closed-state test). Add one test that sets the system time to 2 October 2026 and asserts the heading `Join the consortium`.
- New `client/src/constants/dateGuards.js`, test data only in the manner of `vocabulary.js`: exports `YEAR_PATTERN`, `MONTH_YEAR_PATTERN`, `ISO_DATE_PATTERN` (moved from `ReadinessAssessmentPage.test.jsx`, which imports them from here) and `RELATIVE_TIME_PATTERN = /\b(this|next|last)\s+(year|quarter|month|week)\b/i`. Add `dateGuards.js` to `SKIP_FILES` in `vocabulary.js` beside `corpusScan.js`, for the same reason. `ConsortiumPage.test.jsx` and `ConsortiumTiersPage.test.jsx` gain a page-wide sweep of the rendered text against all four patterns; the readiness page test keeps its single permitted interpolated date.

**Docs.** `docs/IBS2026_consortium_cta_spec.md` gains a dated v7 amendment block at the top, at most fifteen lines: deadline withdrawn, start option renamed, lines 52, 159, 447 to 459 and 473 superseded. `CLAUDE.md` §6.1 names migrations 007 and 010.

**Owner action.** Run 007, with 008 and 009, against production before this phase's code is pushed (section 2.1).

**Release.** P1 is merged to `main` and released on its own before 30 September 2026, ahead of every other phase.

**Acceptance.** With the system clock at 2 October 2026 the page renders `Join the consortium`. No four-digit year, month name, ISO date or relative calendar phrase in the rendered consortium page or tiers page.

### P2. Readiness page: the gap sentence and the relative-time guard

**Why.** Item 8. `Not every gap is worth closing this year` depends on the calendar and passed the date guard because the guard looks for dates, not relative phrases.

**Changes.**

- `docs/website_readiness_assessment_page.md` becomes v1.14 with a recorded fenced-copy amendment to §4.3 item 2, in the format the file already uses for its §4.2.2 and §4.9 amendments. New body: `Each missing or unusable data point rated by what it blocks: passport issuance, a customer's footprint calculation, a due diligence answer, or nothing yet. The report says which gaps to close first and which can wait.` §8 item 7 adds `RELATIVE_TIME_PATTERN` to the page sweep.
- `client/src/constants/readinessAssessmentContent.js:141` updated to the amended body.
- `ReadinessAssessmentPage.test.jsx` page sweep adds `RELATIVE_TIME_PATTERN` from `constants/dateGuards.js`.

**Acceptance.** `grep -r "worth closing" client/src docs/website_readiness_assessment_page.md` returns only the amendment record.

### P3. Prices: the readiness tier by reference, and the consortium tiers in EUR or SGD

**Why.** Items 3 and D5. Today the consortium's readiness tier shows `USD 10,000 to 12,000` while the readiness page shows a ladder by audience (SGD 4,500 / 7,500 / 15,000 at the founding price, with EUR equivalents). The owner wants the assessment priced the same on both surfaces, the higher consortium price explained by what it includes, and the consortium tiers shown in EUR to European customers and in SGD to ASEAN ones.

**Why the readiness tier is by reference.** The readiness price is a ladder by audience and currency; the consortium tier is one figure. Copying any figure to the server creates a second source that a test cannot pin to the first across packages. The single source is a link.

**Split.** P3a is the region answer (everything under "Changes, region"); P3b is the pricing (everything under "Changes, prices"). P3a lands first. Migration 008 is additive and is run up front by the owner (section 2.1).

**Changes, region.**

- New registration answer `region`: label `Where is your company based?`, radio, required, options `{ value: "asean", label: "ASEAN" }`, `{ value: "eu", label: "European Union" }`, `{ value: "other", label: "Elsewhere" }`. Constants `CONSORTIUM_REGION_LABEL` and `CONSORTIUM_REGION_OPTIONS` in `consortiumContent.js`; `FIELD_DEFS` entry in `ConsortiumFields.jsx` directly after `position`.
- Migration `server/migrations/008_20260923_consortium_region.sql`: `ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS consortium_region VARCHAR(10) CONSTRAINT chk_user_profiles_consortium_region CHECK (consortium_region IN ('asean', 'eu', 'other'))`. Nullable, because existing rows predate the question.
- `server/src/validators/contactSchemas.js`: `CONSORTIUM_REGIONS = Object.freeze(["asean", "eu", "other"])`, `region: z.enum(CONSORTIUM_REGIONS)` in `consortiumSchema` (required for every new or updated registration).
- `client/src/hooks/useConsortiumForm.js`: `EMPTY_VALUES` gains `region: ""`; `ROW_TO_VALUE` gains `consortium_region: "region"`.
- `server/src/repositories/userRepository.js`: `CONSORTIUM_COLUMNS` gains `consortium_region`; `UPDATE_CONSORTIUM_SQL` gains `consortium_region = $13` appended after the existing parameters, and `buildConsortiumParams` pushes `data.region` last, so no existing parameter is renumbered.
- `server/src/repositories/adminRepository.js`: `CONSORTIUM_EXPORT_COLUMNS` (line 25) and the aliased select (line 281) gain `consortium_region` / `"consortiumRegion"`. `client/src/components/molecules/ConsortiumRegistrantDetail.jsx` `DETAIL_FIELDS` gains `{ label: 'Region', key: 'consortiumRegion' }` after `Preferred start`.
- Tests: `ConsortiumFields.test.jsx`, `useConsortiumForm` tests, `contactSchemas.test.js` (accepts the three values, rejects others and absence), `contactService.test.js`, `userRepository.test.js` (parameter list length and order), `contactRepository.consortium.integration.test.js`, `adminRepository` tests that enumerate export columns, `contactFormHarness.jsx:38-44` fixture gains `consortium_region: "asean"`, `e2e/tests/pages/ConsortiumPage.js` gains `regionRadio(label)` and `fillRegistration` takes `region`, `consortium-journey.spec.js` passes `region: 'ASEAN'`.

**Changes, prices.**

- `server/src/config/consortiumTiers.js` replaces `CONSORTIUM_TIER_PRICE_LABELS` and `CONSORTIUM_RECURRING_FEES` with numbers, once:

  | Tier | EUR | SGD |
  |---|---|---|
  | `readiness` | none (by reference) | none (by reference) |
  | `pilot` | 26,000 | 38,000 |
  | `consortium_anchor` | 39,000, plus 7,000 per additional supplier tenant | 57,000, plus 10,000 per additional supplier tenant |
  | `consortium_supplier` | 7,000 | 10,000 |
  | `member` | on request | on request |
  | `not_sure` | none | none |
  | Managed operations, per tenant and year | 5,000 to 6,000 | 7,500 to 9,000 |
  | Passport data maintenance, per year | 4,500 to 7,000 | 6,500 to 10,000 |

  Shape: `CONSORTIUM_TIER_PRICES = { pilot: { EUR: 26000, SGD: 38000 }, consortium_anchor: { EUR: 39000, SGD: 57000, extraTenant: { EUR: 7000, SGD: 10000 } }, consortium_supplier: { EUR: 7000, SGD: 10000 } }`; `CONSORTIUM_RECURRING_FEE_RANGES = { managedOperations: { EUR: [5000, 6000], SGD: [7500, 9000] }, passportMaintenance: { EUR: [4500, 7000], SGD: [6500, 10000] } }`; `CONSORTIUM_REGION_CURRENCY = { eu: "EUR", asean: "SGD", other: "SGD" }`; `CONSORTIUM_DEFAULT_CURRENCY = "SGD"`. The `readiness` and `not_sure` entries are absent; `member` keeps the string `on request`. The file header records the USD source figures and the rates and date from fact 12, so a future reprice starts from a known base.
- New pure helper `server/src/helpers/consortiumPricing.js`: `formatAmount(currency, n)` returns `EUR 26,000` (code, space, thousands separators, no symbol); `formatTierPriceLabel(tierId, currency)` returns `null` for an absent tier, the string for `member`, `EUR 39,000 (+ EUR 7,000 per additional supplier tenant)` for the anchor, and the plain amount otherwise; `formatRecurringFees(currency)` returns the three strings: `Dataspace licence, passed through at cost.`, `Managed operations: EUR 5,000 to 6,000 per tenant and year.`, `Passport data maintenance: EUR 4,500 to 7,000 per year.` Unit-tested for both currencies.
- `server/src/services/consortiumService.js`: `getPermittedTiers` reads `profile.consortium_region`, resolves `currency = CONSORTIUM_REGION_CURRENCY[region] ?? CONSORTIUM_DEFAULT_CURRENCY`, and returns `tiers: permitted.map((id) => ({ tierId: id, priceLabel: formatTierPriceLabel(id, currency) }))` and `recurringFees: formatRecurringFees(currency)`. The response shape is unchanged: `{ tiers: [{ tierId, priceLabel }], recurringFees, termNote, capacityNote }`.
- `client/src/constants/consortiumContent.js` `CONSORTIUM_TIER_DESCRIPTIONS`:
  - `readiness`: description gains `It is priced as the readiness assessment on its own page, and the fee is credited against the consortium tier you choose.`, plus `priceLink: ROUTE_READINESS_ASSESSMENT` and `priceLinkLabel: "Readiness assessment scope and price"`. `consortiumContent.js` therefore imports from `./routes`, and joins the allow-list in `routes.test.js` (between `landingContent.js` and `navigation.js`).
  - `pilot`, `consortium_anchor`, `consortium_supplier`: each description gains `The price covers implementation of the value chain data flow through to passport data in the CX-0160 data model, which is why it sits above the assessment.`
- `client/src/components/pages/ConsortiumTiersPage.jsx:72`: render `priceLabel` as today when present, and `priceLink` as a router `Link` with `priceLinkLabel` when present.
- `client/src/constants/vocabulary.js` `FORBIDDEN` gains `/CX-\d{4}[\s-]*(?:compatible|compliant|conformant|conforming)/i` and `/(?:compatible|compliant|conformant)\s+with\s+CX-\d{4}/i`, with the IP Regulations 6.3 reason beside the existing Catena-X patterns.
- Tests: `consortiumTiers.test.js` (numbers positive integers, both currencies present for every priced tier, object frozen); `consortiumPricing.test.js`; `consortiumService.test.js` (EUR for `eu`, SGD for `asean`, `other` and null; `readiness` label null; keys unchanged); `consortiumRoutes.test.js` unchanged in shape; `ConsortiumTiersPage.test.jsx` asserts the readiness card links to `ROUTE_READINESS_ASSESSMENT` and contains no digit; `readinessAssessmentContent.test.js` unchanged.

**Docs.** IBS spec v7 block: the pricing table at line 330 is superseded by this section; readiness tier by reference; one currency per registrant. `CLAUDE.md` §6.1 names migration 008.

**Owner actions.** Migration 008 is run up front (section 2.1). Adjust any figure in the table before P3b starts if the rounding is not to taste; the figures live in one file afterwards.

**Acceptance.** A registrant with `region = eu` sees every figure prefixed `EUR`, one with `asean` or `other` sees `SGD`, and the readiness card shows no figure and one link.

### P4. Landing hero headline

**Why.** Item 5, decision D1.

**Changes.** `client/src/constants/landingContent.js:10-11` becomes `Getting ASEAN battery value chains and their data ready for the EU market` (no trailing full stop; the readiness page headline sets the pattern). `Hero.test.jsx` reads the constant, so it needs no change. Add `client/src/constants/landingContent.test.js` (none exists) asserting the headline contains `ASEAN` and `EU`.

### P5. Services page booking band

**Why.** Item 6.

**Changes.**

- `client/src/constants/services.js`: `export const SERVICES_CTA = { label: "Book an introductory call" };`
- `client/src/components/pages/ServicesPage.jsx`: import `CtaBand` from `../organisms/CtaBand` and `BookingButton` from `../molecules/BookingButton`; after the `SERVICE_PILLARS.map(...)` and before `<ContactSection />`, render `<CtaBand testId="services-cta" action={<BookingButton label={SERVICES_CTA.label} testId="services-cta-booking" />} />`. No headline, matching the readiness page's closing band.
- `ServicesPage.test.jsx`: the band is present, its action resolves to `BOOKING_URL`, it sits after `#circularity` and before the contact section. The existing "no price on the page" and "exactly one h1" tests stay.

### P6. Team page: remove Ihsan Ahmad, add the booking button

**Why.** Item 7. He no longer works at the company; the owner wants no trace on the site and a booking button under the team.

**Removal.**

- `client/src/constants/teamContent.js`: delete the second `TEAM_MEMBERS` entry and the `CAREER_TIMELINE_IHSAN` import. `teamTimelines.js:78-145`: delete `CAREER_TIMELINE_IHSAN`.
- `client/src/constants/structuredData.js`: `ORGANIZATION_SCHEMA.founder` becomes a single Person (lines 58 to 61); delete `COFOUNDER_PERSON_SCHEMA` (107 to 121) and its entry in `PAGE_STRUCTURED_DATA.team` (154 to 155).
- `client/src/constants/seoMeta.js:85,87`: `TEAM_META` description and keywords name Francesco only.
- `client/public/ihsan.png`: delete.
- `client/src/components/organisms/RecognitionBlock.test.jsx:106`: use a synthetic member id for the no-data path.
- New `client/src/constants/teamContent.test.js`: `TEAM_MEMBERS.map((m) => m.id)` equals `["francesco"]`; `PAGE_STRUCTURED_DATA.team` carries exactly one Person schema. No name appears in any test or guard.
- Not changed: the historical specifications under `docs/` (`newDesignEpic.md`, `designRefinementEpic.md`, the pivot specs v3 to v5) and `.claude/yolo-artifacts/`. They are dated design records, not site content.
- Owner action: search the Firestore `knowledge_base` collection for the name and remove any entry by hand. `server/src/helpers/chatHelpers.js` `SYSTEM_PROMPT` carries no team names (verified).

**Booking button.**

- `teamContent.js`: `export const TEAM_CTA = { label: "Book a call with me" };`
- `TeamPage.jsx`: directly after the `TEAM_MEMBERS.map(...)` loop and before `<VisionStatement />`, render `<CtaBand testId="team-cta" action={<BookingButton label={TEAM_CTA.label} testId="team-cta-booking" />} />`.
- `TeamPage.test.jsx`: band present, action resolves to `BOOKING_URL`, no second booking link in the page body.

**Acceptance.** `/team` renders one profile, one Person schema and one booking button. `grep -ri "ihsan" client/src client/public` returns nothing.

### P7. The Qualified Advisor qualification is personal: move the label, reconcile the claims

**Why.** Items 9 and D3, decision D2. Pivot-3 §1.5 already states that the qualification is Francesco's and belongs on personal surfaces. Fact 11 lists eight surfaces that attribute it to the company anyway. This phase moves the label image to his profile and rewrites each claim so the holder is named.

**Status strings, `client/src/constants/catenaXStatus.js`.**

- Line 49: `CATENA_X_STATUS_LINE = "Catena-X member, founded by a Qualified Advisor"`. The hero eyebrow reads `Based in Singapore · Serving ASEAN manufacturers · Catena-X member, founded by a Qualified Advisor`.
- Lines 56 to 57, `TRADEMARK_NOTICE`, second sentence becomes two: `Ichnos Protocol Pte. Ltd. is an ordinary member of the association. Its founder, Francesco Maltoni, is a Catena-X Qualified Advisor.` First and last sentences unchanged. The literal restatement in `catenaXStatus.test.js:59` is updated; `Footer.test.jsx:396` compares the DOM to the constant and needs no change.
- Lines 41 to 42, `ADVISOR_CARD_NOTE = "Francesco Maltoni holds Qualified Advisor attestation 868. Advising Asian manufacturers from Singapore, on site across ASEAN."` (the words "Qualified Advisor" still precede the attestation number, per pivot-4). Literal restatement in `catenaXStatus.test.js:71` updated.
- Add `export function getCatenaXFounderLine() { return "Founded by a " + getCatenaXFullTitle(); }` beside `getCatenaXFullTitle`, so the qualifier suffix mechanism still applies when the qualification is not granted. Add `getCatenaXFounderLine` to the consumer-check list in `vocabulary.js` only if that list covers functions; it covers constants (`STATUS_STRING_EXPORTS`), so no change there.

**Corporate surfaces rewritten.**

- `client/src/constants/credentials.js:23-32`: label `Catena-X Qualified Advisor (founder)`; delete `cxLabel` and `href`. The strip and the footer render the text label and the note for this entry, as they do for the expert-group entry. `Footer.test.jsx:351` (advisor negative asset) is deleted, `:376-379` expects one label image, `:381-390` expects `CREDENTIALS.filter(({ href }) => href)` to have length 0 and its comment now points at `TeamPage.test.jsx` for the single linked instance. `CredentialStrip.test.jsx:43-131` is rewritten for one image (member) and zero links.
- `client/src/constants/structuredData.js:45`, Organization description: `${COMPANY_INFO.tagline} Ichnos Protocol brings ASEAN battery manufacturers into the European data flow so EU importers and customers receive a compliant, traceable battery passport. ${CATENA_X_MEMBERSHIP_NOTE}, and ${CATENA_X_EXPERT_GROUP_NOTE}. ${getCatenaXFounderLine()}.` The Person schema at line 86 keeps `getCatenaXFullTitle()`.
- `client/src/constants/seoMeta.js:33`: `DEFAULT_OG_IMAGE_ALT = \`Ichnos Protocol: ${COMPANY_INFO.tagline} ${getCatenaXFounderLine()}.\``
- `client/src/constants/landingContent.js:22`, second Why-Ichnos paragraph: `The practice covers battery systems engineering, safety, mechanical development, and remanufacturing. Francesco is a ${CATENA_X_TITLE_BASE}, and through that qualification the practice extends into the EU battery-passport ecosystem. Ichnos brings ASEAN battery manufacturers into the European data flow so EU importers and customers get a compliant, traceable passport embedded in their supply chain infrastructure.` `WhyIchnosSection.jsx` still splits on `CATENA_X_TITLE_BASE` for the qualifier span.
- `client/src/components/organisms/PassportOffer.jsx:12-15`: delete the eyebrow paragraph and the two imports it used. The passport page is a corporate offering surface; the founder's qualification is stated on `/team`, in the hero eyebrow and in the footer. `PassportPage.test.jsx:129` (the `passport-offer-eyebrow` assertion) is deleted.
- `server/src/helpers/chatHelpers.js:9`: the sentence `Ichnos Protocol is a Catena-X Qualified Advisor, an ordinary member of Catena-X Automotive Network e.V., and a member of the Catena-X Digital Product Passport Expert Group.` becomes `Ichnos Protocol is an ordinary member of Catena-X Automotive Network e.V. and a member of the Catena-X Digital Product Passport Expert Group. Its founder, Francesco Maltoni, is a Catena-X Qualified Advisor.` `chatHelpers.test.js:226-230` keeps its three `toContain` assertions and gains `expect(SYSTEM_PROMPT).not.toMatch(CORPORATE_ADVISOR_CLAIM)` with the pattern below.

**Label on the profile.**

- `teamContent.js`: Francesco's entry gains `cxLabel: "advisor"`.
- `client/src/components/molecules/CredentialLabel.jsx`: optional prop `variant` (`"strip"` default, `"profile"`), selecting the class base `credential-strip__label-img` or `founder-credential-label`. Everything else unchanged.
- `client/src/components/organisms/FounderProfile.jsx`: when `member.cxLabel` is set, `FounderPhoto` renders `<CredentialLabel label="Catena-X Qualified Advisor" cxLabel={member.cxLabel} href="https://catena-x.net" variant="profile" />` under the photo. Positive file, unmodified, sized by height with `width: auto; object-fit: contain`, clear space uncropped. This is the page's one linked label.
- `client/src/index.css`: delete `.credential-strip__label-img--advisor` (404 to 409) and `.footer-label-img--advisor` (310 to 324) and the comment at 400 that explains their ratio; add `.founder-credential-label { height: 74px; width: auto; object-fit: contain; }` (the pivot-4 §5.2 strip height for the advisor file, tunable ±15%).
- `TeamPage.test.jsx`: exactly one `img[src*="Qualified-Advisor"]` in the page body, exactly one `a[href="https://catena-x.net"]`, and it wraps that image.

**Guards.**

- `vocabulary.js` gains an exported `CORPORATE_ADVISOR_CLAIM_PATTERNS` array, spread into `FORBIDDEN`, with the reason beside it (pivot-3 §1.5, owner ruling D3). The regexes are Traycer's to write. The probes below are normative: `vocabulary.test.js` asserts that every prohibited probe matches at least one pattern and that no permitted probe matches any. `chatHelpers.test.js` copies the patterns literally, with a comment naming their origin, since the packages share no module.
  - Prohibited probes (each must match): `Ichnos Protocol is a Catena-X Qualified Advisor, an ordinary member of Catena-X Automotive Network e.V., and a member of the Catena-X Digital Product Passport Expert Group.` · `Ichnos Protocol Pte. Ltd. is an ordinary member of the association and a Catena-X Qualified Advisor.` · `The practice covers battery systems engineering, safety, mechanical development, and remanufacturing and extends into the EU battery-passport ecosystem as a Catena-X Qualified Advisor.` · `Ichnos Protocol, a Catena-X Qualified Advisor, works with ASEAN manufacturers.` · `As a Catena-X Qualified Advisor, Ichnos Protocol connects suppliers to Catena-X.` · `The company is a Catena-X Qualified Advisor.`
  - Permitted probes (none may match): `Ichnos Protocol Pte. Ltd. is an ordinary member of the association. Its founder, Francesco Maltoni, is a Catena-X Qualified Advisor.` · `Francesco is a Catena-X Qualified Advisor, and through that qualification the practice extends into the EU battery-passport ecosystem.` · `Founded by a Catena-X Qualified Advisor.` · `Catena-X member, founded by a Qualified Advisor` · `He is a Catena-X Qualified Advisor, working to bring ASEAN battery manufacturers into the Catena-X data space.` · `Francesco Maltoni holds Qualified Advisor attestation 868.` · `Catena-X Qualified Advisor (founder)` · `Catena-X integration (Catena-X Qualified Advisor)` · `Dr.-Ing. Francesco Maltoni (ex-FEV lead battery expert, Catena-X Qualified Advisor)`.
  - Traps: `Pte. Ltd.` and `e.V.` contain full stops, so a sentence bound written as `[^.]*` splits the notice before its subject; and the notice's old form has `is an ordinary member of the association and` between the subject and the title, so a pattern that requires `is a` directly before `Qualified Advisor` misses it. The guard is accepted when it passes both probe lists and the corpus sweep without any entry in `ALLOWED_EXCEPTIONS`.
- The manual sweep for this phase is the list in fact 11 plus `README.md`, `client/index.html` and `client/public/site.webmanifest` (all three verified clean today).

**Positive assertions (Q4).** The guard proves the corporate claim is gone; these prove the qualification is still stated and attributed. Each derives its expectation from the constant or function it pins.

- `structuredData.test.js`: the Organization description contains `getCatenaXFounderLine()` and `CATENA_X_MEMBERSHIP_NOTE`; the Person schema description contains `getCatenaXFullTitle()`.
- `seoMeta.test.js`: whichever exported meta carries the default Open Graph alt text contains `getCatenaXFounderLine()`.
- `WhyIchnosSection.test.jsx`: the rendered second paragraph contains `Francesco is a ` immediately followed by `CATENA_X_TITLE_BASE`.
- `TeamPage.test.jsx`: the one `img[src*="Qualified-Advisor"]` sits inside the profile section of the member whose id is `francesco`, and its `alt` is the advisor credential label.
- `chatHelpers.test.js`: the prompt contains `Its founder, Francesco Maltoni, is a Catena-X Qualified Advisor` and matches none of the copied guard patterns.

**Docs.** `docs/website_Catena_pivot_3.md` gains a dated amendment block at the top; §1.5 adds "corporate surfaces may say that the founder holds the qualification, attributed by name or as founder, and must not say that the company holds it"; §2 rows for `CATENA_X_STATUS_LINE`, the §2.1 required notice text and the `credentials.js` row are updated; §4.4's confinement sentence becomes "the advisor label renders on the founder profile on `/team`; the member label on the landing strip and the footer"; manual conformance item 17 adds "and the advisor label only beside the person the attestation names". `docs/website_Catena_pivot_4.md`: the credential card block and the `ADVISOR_CARD_NOTE` value are marked superseded by this section. The comment at `teamContent.js:5-11` is extended. `CLAUDE.md` §13 adds one line under claims.

**Acceptance.** `grep -rn "is a Catena-X Qualified Advisor\|as a Catena-X Qualified Advisor" client/src server/src` returns only sentences whose subject is Francesco. The vocabulary sweep passes with the new pattern. `/` and the footer show one label image (member); `/team` shows one (advisor), linked.

### P8. Remove PageTransition

**Why.** Item 1. Fact 4: the component is scenery, and defective scenery.

**Changes.**

- Delete `client/src/components/templates/PageTransition.jsx`, `client/src/components/molecules/NavbarSkeleton.jsx`, `HeroSkeleton.jsx`, `ContentCardSkeleton.jsx`.
- Remove the wrapper and the skeleton constants from `LandingPage.jsx`, `TeamPage.jsx`, `ServicesPage.jsx`, `PrivacyPage.jsx`, `ContactPage.jsx`, `ConsortiumPage.jsx`, `ConsortiumTiersPage.jsx`. Children render directly.
- `client/src/index.css`: remove the `.navbar-skeleton-*` and `.page-fade-*` rules (lines 997 to 1025 today).
- Remove the `useReducedMotion` mocks that existed only for the transition: `LandingPage.test.jsx:7-8`, `ServicesPage.test.jsx:27-28`, `TeamPage.test.jsx:11-12`, `ConsortiumPage.test.jsx:34-35`, `ConsortiumTiersPage.test.jsx:49-50`. The hook itself stays; `useScrollToSection`, `Navbar` and `MobileNavOverlay` use it.
- Not specified: a replacement fade. If the owner misses it, a `.page-enter` keyframe on the page root with a `prefers-reduced-motion: reduce` override gives the same effect with no JavaScript and no hang.

**Docs.** IBS spec line 427 superseded, recorded in the v7 block.

**Acceptance.** `grep -r "PageTransition\|Skeleton\|page-fade" client/src` returns nothing.

### P9. Production promotion: one mechanism

**Why.** Item 4. Fact 1: the workflow has never completed, production ships from `release` without it, and if it were approved it would promote the newest `main` preview, which can be ahead of `release`, over the production build Vercel already made. It cannot be made correct by approving it.

**Changes.**

- Delete `.github/workflows/promote-to-production.yml`. `release-policy-check.yml` and `ci.yml` stay. The human gate is the pull request into `release`, which the ruleset already requires.
- Docs: `AGENTS.md` lines 221 to 223 and 256 to 258 (promotion is Vercel's build of `release`), line 227 (`sync-staging.yml` is `workflow_dispatch` only), lines 265 to 267 (`e2e.yml` does call the Neon API to clean up preview branches). `DEPLOYMENT_GITHUB_ACTIONS.md`: sequence diagram and workflow table. `GITHUB_SETTINGS.md`: §3 and the verification matrix (the four `VERCEL_*` promotion secrets are no longer used; the `production` environment is optional). `DEPLOYMENT.md:273`. `README.md:11-15`: every badge repointed to `Ichnos-Protocol/Website`, promote badge removed. `CLAUDE.md` §16 pointer sentence.

**Owner actions.** Delete the four unused secrets; keep or delete the `Production` environment; keep the `release` ruleset requiring a pull request.

**Acceptance.** A push to `release` produces exactly one Vercel production deployment per project and no GitHub Actions run.

### P10. Secrets: remove from HEAD and from logs, same values

**Why.** Item 10. Fact 5 and ruling D8: the values stay valid; the repository stops carrying them and the workflow stops printing them.

**Changes.**

1. **Remove from HEAD.** `git rm --cached e2e/.env.e2e`; delete `.gitignore` lines 8 and 9 so `.env.*` covers it again; move the root `.env.e2e.example` to `e2e/.env.e2e.example` with placeholder values and every variable name the workflow and the scripts read (`FIREBASE_API_KEY`, `FIREBASE_PROJECT_ID`, `FIREBASE_AUTH_DOMAIN`, `FIREBASE_STORAGE_BUCKET`, the five `E2E_*_EMAIL` and `E2E_*_UID` pairs, `E2E_BASE_URL`, `E2E_API_BASE_URL`, `E2E_SIGNUP_PASSWORD`); delete `e2e/ENV_REFACTOR_PLAN.md`; edit `VERCEL_SETTINGS.md:189` to drop the email and password (the row's "Why" column is enough); `e2e/tests/helpers/auth.js:119` reads its sign-up password from `process.env.E2E_SIGNUP_PASSWORD`; `e2e/README.md:72` and the header comment of `provision-e2e-firebase-users.js` point at the new example path.
2. **Sync values to GitHub.** `e2e/scripts/helpers/e2eSyncGitHub.js` gains `syncVariablesToGitHub(variables, repoRoot)`, the same shape as `syncToGitHub` but calling `gh variable set NAME --body VALUE`. `provision-e2e-firebase-users.js --sync-only` pushes the non-secret names above as repository variables and `FIREBASE_API_KEY` plus the six passwords as secrets. Unit tests beside `e2eSyncGitHub.test.js`. The owner runs `node e2e/scripts/provision-e2e-firebase-users.js --sync-only` once from the local `e2e/.env.e2e` (now ignored, still present on the owner's machine) before step 3 lands.
3. **Rewire `e2e.yml`.** Replace the "Load E2E config from committed file" step with `env:` mappings from `vars.*` for the non-secret names and `secrets.*` for `FIREBASE_API_KEY`, `E2E_SIGNUP_PASSWORD` and the five `E2E_*_PASSWORD` values. Delete the log line at 159. Replace the payload dump at 105 with `env: PAYLOAD: ${{ toJSON(github.event.client_payload) }}` and `echo "$PAYLOAD"`. `e2e/playwright.config.js` loads `dotenv` from `e2e/.env.e2e` when the file exists, so local runs keep working.
4. **Owner enables** secret scanning and push protection in the repository settings.

**Docs.** `CLAUDE.md` §12 (the committed-file exception is gone); `AGENTS.md` line 222 and 278 to 285 (targets come from repository variables, not a committed file); `GITHUB_SETTINGS.md` matrix lists every variable and secret by name.

**Acceptance.** `git ls-files | grep -i "\.env"` lists only `*.example` files. A manual dispatch of the E2E workflow passes, and its log contains no API key.

### P11. Rate limiting with a shared store; delete the dead endpoint

**Why.** Item 12. Fact 3: the endpoint the owner pointed at has no caller. The shared store still matters: `express-rate-limit` with its default `MemoryStore` counts per serverless instance, so the global limit at `app.js:46-51` is not enforced in practice.

**Changes.**

- Delete `POST /api/auth/verify-token`: `server/src/routes/authRoutes.js:27`, `controllers/authController.js:23-39`, `services/authService.js:85-90`, `routes/authRoutes.test.js:191-220`, `services/authService.test.js:324-340`, `client/src/features/auth/authApi.js:31-35,54`, and the `CLAUDE.md` §11 row.
- Migration `server/migrations/009_20260923_rate_limit_hits.sql`: `CREATE TABLE IF NOT EXISTS rate_limit_hits (key TEXT PRIMARY KEY, hits INTEGER NOT NULL, reset_at TIMESTAMPTZ NOT NULL)`. Additive; run up front by the owner (section 2.1). The table sits unused until this phase's code lands.
- New `server/src/repositories/rateLimitRepository.js` (SQL stays in the repository layer, `CLAUDE.md` §5.4): `incrementHit(key, windowMs)` runs one `INSERT ... ON CONFLICT (key) DO UPDATE` that resets `hits` to 1 and `reset_at` to now plus the window when `reset_at` has passed, and increments otherwise, returning `{ hits, resetAt }`; `decrementHit(key)`; `resetKey(key)`; `getHit(key)`.
- New `server/src/middleware/pgRateLimitStore.js`: a class implementing the `express-rate-limit` `Store` contract (`init(options)` captures `windowMs`; `get`, `increment`, `decrement`, `resetKey` delegate to the repository, with a `prefix` option). Fail-open: a repository error is logged and `increment` returns `{ totalHits: 1, resetTime }`, so a database blip does not turn every request into a 500. Under 120 lines each, unit-tested with the existing `pg` mocking pattern.
- `server/src/app.js`: the global limiter keeps its window and limits and gains `store: new PgRateLimitStore({ prefix: "global:" })`, `standardHeaders: "draft-7"`, `legacyHeaders: false`. A second limiter with `prefix: "auth:"`, 20 requests per 15 minutes per IP (preview relaxed the same way as the global one), is mounted on `/api/auth` before `authRoutes`. `/api/chat/message` keeps its database-backed daily quota. `trust proxy` is already set, so the default IP key generator sees the client address.
- Tests: repository and store unit tests (window reset, decrement, resetKey, fail-open); a route test asserting the `RateLimit` header and a 429 after the auth limit with the store mocked.

**Docs.** `CLAUDE.md` §11 (row removed), §13 (store named), §6.1 (table added). `AGENTS.md` mirrored.

**Owner actions.** Migration 009 is run up front (section 2.1). Optional: if the Vercel plan includes Firewall rate limiting, a rule on `/api/auth/*` is a zero-code second layer.

**Acceptance.** On a preview, 21 requests to `/api/auth/me` from one IP inside 15 minutes return 429 on the 21st with a `RateLimit` header, across cold starts.

### P12. Coverage and CI wiring

**Why.** Items 11 and 13. "Fix quality check" is read as the declared gates that do not run: coverage, `format:check` (P13) and their absence from `ci.yml`, plus the stale badges (P9).

**Changes.**

- Install `@vitest/coverage-v8@^4` as a devDependency in `client/` and `server/`.
- `client/vite.config.js` coverage: `include: ["src/**/*.{js,jsx}"]`, `exclude: ["src/**/*.test.{js,jsx}", "src/setupTests.js", "src/main.jsx", "src/test-utils.jsx"]`, `reporter: ["text-summary", "lcov"]`.
- New `server/vitest.config.js`: `environment: "node"`, coverage `include: ["src/**/*.js"]`, `exclude: ["src/**/*.test.js"]`, same reporters. `server/package.json` gains `"test:coverage": "vitest run --coverage"`.
- First ticket measures and reports line coverage per package and for `helpers/**` and `services/**`. Thresholds are then set in the same ticket: global at the measured floor minus two points; `helpers/**` and `services/**` at 80 where met (`CLAUDE.md` §14.3), otherwise at the measured value with a dated ratchet note. Vitest accepts glob-keyed thresholds.
- `ci.yml`: `npm run test:coverage` replaces `npm test` in both jobs; `timeout-minutes` raised to 8 if the client run needs it.

**Docs.** `CLAUDE.md` §14.1 and the §15 checklist, with the measured numbers; `AGENTS.md` line 136 changes "target" to "enforced in CI".

**Acceptance.** Lowering any threshold below the measured value makes `npm run test:coverage` fail.

### P13. Prettier: configure, then format, in two commits

**Why.** Fact 7 and R11. Adoption must not land inside another change, and the configuration must be reviewable on its own, which it cannot be if the same commit rewrites 244 files. Late in the epic so every earlier diff stays readable.

**P13a, configuration (no gate).**

- Root `.prettierrc.json`: `{ "endOfLine": "auto" }` (D6; everything else default).
- `client/.prettierignore`: `dist/`, `coverage/`, `.vercel/`, `public/brand/`. `server/.prettierignore`: `knowledge-base/`, `scripts/python/`, `coverage/`, `.vercel/`, `migrations/`. `e2e/.prettierignore`: `playwright-report/`, `test-results/`.
- Scripts narrowed to code. `client`: `"format": "prettier --write \"src/**/*.{js,jsx,css}\""`, `"format:check": "prettier --check \"src/**/*.{js,jsx,css}\""`. `server`: the same over `"src/**/*.js" "scripts/**/*.js" "api/**/*.js"`. `e2e`: the same over `"**/*.js"` (Prettier skips `node_modules` on its own). Markdown, JSON and SQL are not formatted.
- Dry run in a disposable copy of the tree (a `git worktree`, deleted afterwards): record the number of files that change per package and the list of source files that exceed 200 lines after formatting.
- `CLAUDE.md` §5.1 cap ruling (section 2.1, R11): content-constant files are exempt from the 200-line cap, listed by name from the dry run as content-exempt. `AGENTS.md` mirrored.
- `ci.yml` and the §15 checklist are untouched. `format:check` fails on this commit by construction and is not run as a gate.

**P13b, the formatting commit.** `style: format the corpus with prettier`, and nothing else. `format:check` is green from this commit on. Reviewed by `git diff --stat`, lint and tests green.

**Acceptance.** After P13b, `npm run format:check` is clean in all three packages.

### P14. Riders and closing gates

- `ci.yml`: `format:check` runs after `lint` in both jobs. `CLAUDE.md` §15 checklist gains it; the §15 Prettier paragraph is rewritten to describe the adopted state.
- Migration `server/migrations/010_20260923_consortium_preferred_start_contract.sql`: idempotent `UPDATE user_profiles SET consortium_preferred_start = 'asap' WHERE consortium_preferred_start = 'nov_2026'`, then drop and re-add `chk_user_profiles_consortium_preferred_start` with `('asap', 'later')`. The owner runs it only after P1 has been in production. The `consortiumContent.js` header comment then names 010 as the current constraint source.
- Delete `test.txt` at the repository root.
- `CLAUDE.md` §15 baseline counts refreshed after P13b (last verified: client 102 files / 959 tests, server 66 files).
- `AGENTS.md` mirrors every `CLAUDE.md` change made in P1 to P13.

---

## 5. Questions Traycer is expected to ask, answered

1. **An epic touches more than three files.** Each P is an epic; Traycer's three-file phases run inside it in the order constants, consumers, tests. See section 3.
2. **A test file exceeds 200 lines.** Test files are exempt from the cap (`CLAUDE.md` §5.1).
3. **Who confirms a deletion or a CI edit?** The owner's approval of this spec, per section 3. Migrations against production remain a live confirmation.
4. **`consortiumContent.js` will import a route constant. Does `routes.test.js` fail?** Only until the file is added to the allow-list, which P3 does. `services.js` is the precedent.
5. **Where do the shared date patterns live, given `test-utils.jsx` is a file, not a directory?** `client/src/constants/dateGuards.js`, listed in `SKIP_FILES` of `vocabulary.js` like the other scanner data files.
6. **Should the readiness `PRICING` move to the server so the consortium can reuse it?** No. It is public copy by design (readiness spec §4.2.1); the consortium readiness tier is by reference.
7. **Existing rows hold `nov_2026`?** None do (fact 2). Migration 007 keeps the `UPDATE` so the file stays idempotent on any database.
8. **What does a registrant with `region = other` or with no region see?** SGD (D5). The service defaults to `CONSORTIUM_DEFAULT_CURRENCY`.
9. **Does the tiers API response gain a `currency` field?** No. Each label carries its code; the shape stays `{ tierId, priceLabel }`.
10. **Is the region required when a registrant updates an existing registration?** Yes. The same schema validates both paths, and the form is prefilled from the row when the value exists.
11. **Does `member` differ by currency?** No. `on request` in both.
12. **`CATENA_X_LABEL_ASSET_NEG` loses its only renderer when the footer stops showing the advisor label. Does the asset-consumer rule fail?** No. That rule counts `CX_LABEL_ASSETS` in the same file as the consumer. The file stays in `public/brand/` for a future dark surface.
13. **The footer advisor entry now shows its note. Is that intended?** Yes, exactly as the expert-group entry does.
14. **Does the advisor label on `/team` have to be linked?** It is linked to catena-x.net, the only permitted target, and it is the page's only linked label. The footer never links.
15. **Should `PassportOffer` keep an eyebrow with the founder line instead of losing it?** No. The passport page is an offering surface; pivot-3 §4.4 keeps labels off it and §1.5 keeps the personal qualification on personal surfaces.
16. **Should the `docs/` files that mention the departed member be edited?** No (P6). They are dated records.
17. **Where does the rate-limit SQL go?** In `rateLimitRepository.js`. The store class in `middleware/` holds no SQL (`CLAUDE.md` §5.4).
18. **Fail-open or fail-closed for the store?** Fail-open, logged. A limiter that returns 500 on a database blip is a bigger outage than the abuse it prevents at this traffic.
19. **Who sets the coverage thresholds, and to what?** The P12 ticket measures first, then sets them in the same ticket; the numbers are recorded in `CLAUDE.md` §15.
20. **Does Prettier format Markdown, JSON or SQL?** No. Scripts are narrowed to code globs (P13).
21. **The GitHub environment is named `Production` and the workflow says `production`.** Irrelevant after P9 deletes the workflow.
22. **Does the `Hero` test need the trailing punctuation of the old headline?** No. It reads the constant.
23. **Does the hero eyebrow test change?** No. `Hero.test.jsx` reads `HERO_CONTENT.eyebrow`; the string changes through `CATENA_X_STATUS_LINE`.
24. **The `CORPORATE_ADVISOR_CLAIM` pattern: does it hit Francesco's own bio?** No. The subject alternatives are the company, the practice and Ichnos; `He is a Catena-X Qualified Advisor` does not match.
25. **P10 removes the committed file but the same values are still in history.** Yes. Ruling D8, recorded in section 2.
26. **Can migration 007 run before P1's code is deployed?** Yes. It is expand-only; old code writes `nov_2026` and new code writes `asap`, and both pass the CHECK. That is the point of D9.
27. **Does the consortium journey on a preview pass between 007 and P1?** Yes, for the same reason. The E2E spec's label changes with P1, in the same commit as the client option.
28. **When does the contraction run?** Migration 010, at P14, after P1 has been in production. Until then the database tolerates a value the validator no longer accepts, which is harmless.
29. **Must P13a pass `format:check`?** No. It adds the configuration and measures; P13b is the first green commit; P14 makes it a CI gate.
30. **Which files become content-exempt from the 200-line cap?** The ones P13a's dry run pushes past 200, named in `CLAUDE.md` §5.1 in that commit. The rule is that their length follows the copy, not the logic.
31. **What is the exact regex for the Qualified Advisor guard?** Traycer's to write. The two probe lists in P7 are normative and the test asserts both; a draft that passes them without an `ALLOWED_EXCEPTIONS` entry is accepted.

---

## 6. Out of scope

Named so that Traycer does not ask: a 404 page for `path="*"`; an error boundary; `client/vercel.json` mixing legacy `routes` with `redirects` (it deploys today; verify in the Vercel build log if it ever fails); the CORS fallback to `localhost`; admin `GET` routes with side effects; bundle splitting; the E2E suite's skip rate; a history rewrite (D8); credential rotation (D8); repricing beyond the conversion in P3.

---

## 7. Verification after the epic

- `npm run lint && npm test` green in `client/` and `server/`; `npm run test:coverage` green with thresholds; `npm run format:check` clean.
- P1: consortium page renders `Join the consortium` with the system clock at 2 October 2026.
- P3: an `eu` registrant sees `EUR` on every figure; an `asean` registrant sees `SGD`; the readiness card shows no digit and one link.
- P6: `/team` has one Person schema, one profile, one booking button.
- P7: the vocabulary sweep passes; `/` shows one label image, `/team` one, linked.
- P9: a push to `release` yields one Vercel production deployment per project and no Actions run.
- P10: `git ls-files | grep -i "\.env"` shows only example files; the E2E log shows no API key.
- P11: 429 on the 21st auth request from one IP on a preview.
- Owner checklist: run migrations 007, 008 and 009 against production before any code is pushed, and 010 after P1 is in production; merge and release P1 before 30 September; run the sync script once before P10 step 3; check the Firestore knowledge base for the departed member's name; adjust the P3 figures if the rounding is not to taste.
