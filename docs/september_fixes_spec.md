# september_fixes_spec.md: cleanup and reconciliation, September 2026

**Version 1.0, 2026-09-23. Status: normative for the `September-fixes` branch.**

This specification turns the owner's post-evaluation list of fifteen fixes into thirteen phases for Traycer. Each item was checked for soundness against the code, the deployment settings and the production database before it was specified; section 1 records what was found, and section 2 records the owner decisions the phases depend on. Where an item as requested would not have achieved what the owner wanted, the phase says so and specifies what does.

**Inheritance.** `website_Catena_pivot_3.md` (claim rules, label law, three-tier testing), `website_readiness_assessment_page.md` v1.13 (fenced copy, page guards), `commercial_offer_page_pattern.md` v1.0, and the conventions in `CLAUDE.md` (200-line source cap with tests exempt, Conventional Commits, one commit per phase, documentation updated in the same commit as the code it describes). Where those documents conflict with this one, they win, except where a phase below records an explicit amendment to them.

**Branch.** `September-fixes`, created from `origin/main` at `79b9232`, which already contains every commit from the `Consortium` branch (PRs #171 to #176). Phases are executed in order; P1 is time-critical.

---

## 1. Facts the phases rest on

Verified on 2026-09-23 against the repository, the Vercel API, the GitHub API and the production database.

1. **Production deploys from `release` by Vercel git integration**, for both projects. `ichnos-protocol` and `ichnos-protocol_server` each carry a `-git-release-` alias next to the production domains. The `Promote to Production` workflow's last four runs are pending, waiting, cancelled and failure. It has never completed, and production shipped on every push to `release` regardless. It waits because the GitHub `Production` environment requires a reviewer.
2. **The production database holds 7 `user_profiles` rows, all with NULL `consortium_preferred_start` and NULL `consortium_tier`.** Renaming the start option changes a CHECK constraint and no data.
3. **`POST /api/auth/verify-token` has no caller.** `useVerifyTokenMutation` is exported from `client/src/features/auth/authApi.js:54` and used nowhere in `client/src` or `e2e/`. The route (`authRoutes.js:27`) has no middleware, echoes the decoded token to whoever posts a valid one, and upserts nothing. The `CLAUDE.md` §11 row saying it upserts a user is wrong.
4. **`PageTransition` never shows its skeleton.** The skeleton is wrapped in `.page-fade-enter`, which is `opacity: 0`, and is replaced one animation frame later. The visible effect is a 300 ms opacity fade. If `requestAnimationFrame` never fires (hidden tab, prerender, some crawlers) the page stays blank with no timeout. No test covers the component. Every skeleton also contains a `NavbarSkeleton` although `PublicLayout` has already rendered the real navbar above it.
5. **Secrets in a public repository.** `VERCEL_SETTINGS.md:189` holds a production-Firebase QA account's email and password in plaintext. `e2e/.env.e2e` is force-tracked past `.gitignore` (line 9) and its values are copied into `e2e/ENV_REFACTOR_PLAN.md:87-104`. `e2e.yml:159` prints the Firebase API key to the job log. `e2e.yml:105` interpolates the repository-dispatch payload directly into a shell script. `e2e/tests/helpers/auth.js:119` hardcodes a sign-up password.
6. **No coverage provider is installed.** `@vitest/coverage-v8` is in no `package.json` and no `node_modules`, so `client/vite.config.js`'s `thresholds: { lines: 80 }` has never executed. The server has no vitest config and no coverage script.
7. **Prettier has no config and no ignore file.** `server/knowledge-base/` is 270 MB in 366 ignored files (PDFs, SQLite databases, a browser profile). `npm run format` in `server/` would walk it, and `npm run format:check` errors out on it today.
8. **Nothing in the repository is called "quality check".** No workflow, job or script carries that name. The README badges point at `Khorolev/Ichnos_Protocol`; the remote is `Ichnos-Protocol/Website`.
9. **CX-0160 is the Catena-X standard for battery passport data** (owner confirmation, 2026-09-23). The standard may be named. A conformance adjective beside it may not: IP Regulations 6.3 prohibits using the association's name "to advertise compliance with, or conformance to, Standards or technologies of the Association", pivot-3 §1.2 bans the family, and `vocabulary.js` does not yet catch the CX-numbered form.
10. **The consortium deadline test fails on 1 October 2026.** `ConsortiumPage.test.jsx:61-66` asserts the open-registration headline on the real clock.

---

## 2. Owner decisions

Defaults were applied where the owner had not ruled. Changing a default is a one-line reply; the phase text names the alternative.

| # | Decision | Default applied | Alternative |
|---|---|---|---|
| D1 | Landing hero headline | Option A below | Option C below, or the owner's line verbatim |
| D2 | Qualified Advisor label scope | Move: the label image leaves the landing strip and the footer (text card stays), renders once on Francesco's profile | Add only: strip and footer unchanged |
| D3 | `TRADEMARK_NOTICE` says the company is a Qualified Advisor; pivot-3 §1.5 says the qualification is Francesco's | Untouched (exact-match legal text) | Amend the notice under pivot-3 |
| D4 | CX-0160 wording | `passport data in the CX-0160 data model`; never "compliant", "conformant", "compatible" | none |
| D5 | Consortium currency (USD) against readiness currency (SGD, EUR) | Unchanged; the readiness tier is by reference, so no figure is duplicated | Reprice the tiers in one currency (a pricing decision, not specified) |
| D6 | Prettier configuration | Prettier defaults plus `endOfLine: "auto"` | Single quotes |
| D7 | Team page with one member | Title `Team` and the plural subtitle stay | Retitle |
| D8 | History rewrite for leaked secrets | No. Rotate, remove from HEAD, enable secret scanning and push protection | `git filter-repo` as a separate owner-run step |

**D1 in full.** The owner proposed `Bringing supply chain data integration, regulatory compliance, circularity and engineering from ASEAN to the EU` to replace `From regulatory compliance to seamless integration into the circular value chain.` The proposal is better than the current line: it names a place and names what is sold, and the current line does neither. It has two defects. The four services are not what travels from ASEAN to the EU; the batteries and their data do, so the sentence reads as exporting engineering to Europe. And "Bringing" has no subject.

- **Option A (default):** `Supply chain data, regulatory compliance, circularity and engineering for ASEAN battery makers selling into the EU.` Keeps the owner's four nouns, fixes the direction, says who it is for. 15 words.
- **Option C:** `Getting ASEAN-made batteries and their data ready for the EU market.` A sentence rather than a list, 11 words, closest to the readiness page rule that a headline says what the thing is.
- The subhead already lists five topics. With Option A two lists stack on the first screen; trimming the subhead is the owner's call and is not specified.

---

## 3. Rules that apply to every phase

- No date, quarter, month or year in copy except through `regulatoryDates.js`. No relative calendar phrase either ("this year", "next quarter").
- No figure typed into copy. Every price reaches a surface through a selector or an API.
- No conformance adjective beside Catena-X or beside a CX-numbered standard.
- Every booking CTA resolves to `BOOKING_URL` from `companyInfo.js`.
- Tests import constants; they do not restate strings.
- Each phase ends with `npm run lint && npm test` green in `client/` and `server/`, one Conventional Commit, and the documentation that describes the changed behaviour updated in that commit (`CLAUDE.md` and `AGENTS.md` kept aligned).
- Deleting a file, touching root configuration or CI, running a migration against production, and `git push` each require owner confirmation in automated mode (`CLAUDE.md` §17). Phases that need one name the files up front so the confirmation can be given once.

---

## 4. Phases

### P1. Consortium: withdraw the deadline

**Why.** Item 2 of the owner's list. The consortium is no longer time-limited. Six surfaces carry a date, the start-preference option is a month, and the page test breaks on 1 October.

**Changes.**

- `client/src/components/pages/ConsortiumPage.jsx`: delete `DEADLINE`, `HERO_CLOSED`, `pickHero` and the `useState` that picks the hero. One `HERO`: title `Join the consortium`, subtitle `One anchor company and up to five of its suppliers, one project, one test environment.` The "Register by" sentence goes. `OFFER_CARDS[2]` body becomes: `The readiness assessment comes first and is credited to the project. The group call is scheduled once the anchor company and its suppliers are registered, and the work starts after it. Scope and price are set out in the proposal; registered participants see the tier overview.`
- `client/src/constants/seoMeta.js:112`: remove `Register by 30 September 2026.`
- `client/src/components/pages/ConsortiumTiersPage.jsx:25-26`: `Thank you. You are registered for the consortium. We answer within five working days.`
- Start-preference option: value `nov_2026` label `November 2026` becomes value `asap` label `As soon as the group is formed`. `later` / `Later` stays. Change `client/src/constants/consortiumContent.js:80-83` and `server/src/validators/contactSchemas.js:38` in the same commit as migration `server/migrations/007_20260923_consortium_preferred_start_open.sql`: idempotent `UPDATE user_profiles SET consortium_preferred_start = 'asap' WHERE consortium_preferred_start = 'nov_2026'`, then `DROP CONSTRAINT IF EXISTS chk_user_profiles_consortium_preferred_start` and re-add it with `('asap', 'later')`.
- Tests that name the old value: `client/src/components/organisms/contactFormHarness.jsx:94`, `ContactRequestForm.submit.test.jsx:65`, `server/src/validators/contactSchemas.test.js:96,206-221`, `services/contactService.test.js:58`, `repositories/userRepository.test.js:30,410`, `repositories/contactRepository.consortium.integration.test.js:35,75,192`, `e2e/tests/consortium/consortium-journey.spec.js:60`, `e2e/tests/pages/ConsortiumPage.js:25-26,85`.
- Delete `ConsortiumPage.test.jsx:101-110` (the closed-state test).
- New shared test helper `client/src/test-utils/dateGuards.js` exporting `YEAR_PATTERN`, `MONTH_YEAR_PATTERN`, `ISO_DATE_PATTERN` (moved from `ReadinessAssessmentPage.test.jsx`) and `RELATIVE_TIME_PATTERN = /\b(this|next|last)\s+(year|quarter|month|week)\b/i`. `ConsortiumPage.test.jsx` and `ConsortiumTiersPage.test.jsx` gain a page-wide sweep that rejects all four. The readiness page test imports the same patterns and keeps its single permitted interpolated date.

**Docs.** `docs/IBS2026_consortium_cta_spec.md` gains a dated v7 amendment note at the top: deadline withdrawn, start option renamed, lines 52, 159, 447 to 459 and 473 superseded. `CLAUDE.md` §6.1 names migration 007.

**Owner actions.** Confirm `npm run migrate` against production.

**Acceptance.** With `vi.setSystemTime(new Date("2026-10-02"))` the page renders `Join the consortium`. No four-digit year, month name, ISO date or relative calendar phrase in the rendered consortium page or tiers page.

### P2. Readiness page: the gap sentence and the relative-time guard

**Why.** Item 8. `Not every gap is worth closing this year` depends on the calendar and passed the date guard because the guard looks for dates, not relative phrases.

**Changes.**

- `docs/website_readiness_assessment_page.md` becomes v1.14 with a recorded fenced-copy amendment to §4.3 item 2. New body: `Each missing or unusable data point rated by what it blocks: passport issuance, a customer's footprint calculation, a due diligence answer, or nothing yet. The report says which gaps to close first and which can wait.` §8 item 7 adds `RELATIVE_TIME_PATTERN` to the page sweep.
- `client/src/constants/readinessAssessmentContent.js:141` updated to the amended body.
- `ReadinessAssessmentPage.test.jsx` page sweep adds `RELATIVE_TIME_PATTERN` from `test-utils/dateGuards.js`.

**Acceptance.** `grep -r "worth closing" client/src docs/website_readiness_assessment_page.md` returns only the amendment record.

### P3. Price reconciliation between the readiness page and the consortium tiers

**Why.** Item 3. The consortium's readiness tier shows `USD 10,000 to 12,000` while the readiness page shows SGD 4,500 / 7,500 / 15,000 (founding) by audience, with EUR equivalents. The owner wants the assessment priced the same on both surfaces, and the higher consortium price explained by what it includes: implementation of the value-chain data flow through to passport data in the CX-0160 data model.

**Why not a copied figure.** The readiness price is a ladder by audience and currency, and the consortium tier is one USD range. Copying any figure to the server creates a second source that a test cannot pin to the first across packages. The honest single source is by reference.

**Changes.**

- `server/src/config/consortiumTiers.js:22`: `readiness: null`, with a comment: the readiness assessment is priced on its own page by audience and currency; a figure here would be a second source.
- `client/src/constants/consortiumContent.js`, `CONSORTIUM_TIER_DESCRIPTIONS`:
  - `readiness`: description gains `It is priced as the readiness assessment on its own page, and the fee is credited against the consortium tier you choose.`, plus `priceLink: ROUTE_READINESS_ASSESSMENT` and `priceLinkLabel: "Readiness assessment scope and price"`.
  - `pilot`, `consortium_anchor`, `consortium_supplier`: each description gains `The price covers implementation of the value chain data flow through to passport data in the CX-0160 data model, which is why it sits above the assessment.`
- `client/src/components/pages/ConsortiumTiersPage.jsx:72`: render `priceLink` as a router `Link` with `priceLinkLabel` when present; `priceLabel` renders as today when present.
- `client/src/constants/vocabulary.js` `FORBIDDEN` gains `/CX-\d{4}[\s-]*(?:compatible|compliant|conformant|conforming)/i` and `/(?:compatible|compliant|conformant)\s+with\s+CX-\d{4}/i`, with the IP Regulations 6.3 reason beside the existing Catena-X patterns.
- Tests: `server/src/config/consortiumTiers.test.js:41-57` accepts a null readiness label; `ConsortiumTiersPage.test.jsx` asserts the readiness card links to `ROUTE_READINESS_ASSESSMENT` and contains no digit; `readinessAssessmentContent.test.js` unchanged.

**Docs.** IBS spec v7 note: the tier pricing table line 330 is superseded for `readiness`. D5 recorded as a known inconsistency.

**Acceptance.** The readiness card on `/consortium/tiers` shows no figure and one link to the readiness page. The vocabulary sweep passes with the two new patterns.

### P4. Landing hero headline

**Why.** Item 5, decision D1.

**Changes.** `client/src/constants/landingContent.js:10-11` becomes the chosen line (Option A by default). `Hero.test.jsx` reads the constant, so it needs no change. Add `client/src/constants/landingContent.test.js` (create if absent) asserting the headline contains `ASEAN` and `EU`: that is the property the owner wanted and the old line lacked.

### P5. Services page booking band

**Why.** Item 6.

**Changes.**

- `client/src/constants/services.js`: `export const SERVICES_CTA = { label: "Book an introductory call" };`
- `client/src/components/pages/ServicesPage.jsx`: after the `SERVICE_PILLARS.map(...)` and before `<ContactSection />`, render `<CtaBand testId="services-cta" action={<BookingButton label={SERVICES_CTA.label} testId="services-cta-booking" />} />`. No headline, matching the readiness page's closing band.
- `ServicesPage.test.jsx`: the band is present, its action resolves to `BOOKING_URL`, it sits after `#circularity` and before the contact section. The existing "no price on the page" and "exactly one h1" tests stay.

### P6. Team page: remove Ihsan Ahmad, add the booking button, move the Qualified Advisor label

**Why.** Items 7 and 9. He no longer works at the company; the owner wants no trace on the site and a booking button under the team. The Qualified Advisor qualification is personal (pivot-3 §1.5, attestation 868), so the owner wants the label beside him on `/team`.

**Removal.**

- `client/src/constants/teamContent.js`: delete the second `TEAM_MEMBERS` entry and the `CAREER_TIMELINE_IHSAN` import. `teamTimelines.js:78-145`: delete `CAREER_TIMELINE_IHSAN`.
- `client/src/constants/structuredData.js`: `ORGANIZATION_SCHEMA.founder` becomes a single Person (lines 58 to 61); delete `COFOUNDER_PERSON_SCHEMA` (107 to 121) and its entry in `PAGE_STRUCTURED_DATA.team` (154 to 155).
- `client/src/constants/seoMeta.js:85,87`: `TEAM_META` description and keywords name Francesco only.
- `client/public/ihsan.png`: delete (owner-confirmed file deletion).
- `client/src/components/organisms/RecognitionBlock.test.jsx:106`: use a synthetic member id for the no-data path.
- New `client/src/constants/teamContent.test.js`: `TEAM_MEMBERS.map((m) => m.id)` equals `["francesco"]`; `PAGE_STRUCTURED_DATA.team` carries exactly one Person schema. No name appears in any test or guard.
- Not changed: the historical specifications under `docs/` (`newDesignEpic.md`, `designRefinementEpic.md`, the pivot specs v3 to v5) and `.claude/yolo-artifacts/`. They are dated design records, not site content. The owner may order a scrub separately.
- Owner action: search the Firestore `knowledge_base` collection for the name and remove any entry by hand. `server/src/helpers/chatHelpers.js` `SYSTEM_PROMPT` carries no team names (verified).

**Booking button.**

- `teamContent.js`: `export const TEAM_CTA = { label: "Book a call with me" };`
- `TeamPage.jsx`: directly after the `TEAM_MEMBERS.map(...)` loop and before `<VisionStatement />`, render `<CtaBand testId="team-cta" action={<BookingButton label={TEAM_CTA.label} testId="team-cta-booking" />} />`.
- `TeamPage.test.jsx`: band present, action resolves to `BOOKING_URL`, no second booking link in the page body.

**Label move (decision D2; conditional).** The repository's own rules confine label images to the landing credential strip and the footer (pivot-2 §2.2-3, pivot-3 §4.4) and record that new uses need association approval under the Logo Use Agreement (pivot-2 line 214). This part executes only after the owner attests, in the ticket, that the agreement permits the placement.

- `teamContent.js`: Francesco's entry gains `cxLabel: "advisor"`.
- `client/src/components/organisms/FounderProfile.jsx`: when `member.cxLabel` is set, render `<CredentialLabel label="Catena-X Qualified Advisor" cxLabel={member.cxLabel} href="https://catena-x.net" />` under the photo. Positive file, sized by height with `object-fit: contain`, clear space uncropped, unmodified. This is the page's one linked label; the footer never links.
- `client/src/constants/credentials.js:27,31`: remove `cxLabel` and `href` from the advisor entry, so the strip card and the footer entry render the text and note only. The member label is unchanged on both.
- Tests: `TeamPage.test.jsx` asserts exactly one `img[src*="Qualified-Advisor"]` in the page body and at most one `a[href="https://catena-x.net"]`; `CredentialStrip.test.jsx` and `FooterRecognitions.test.jsx` updated for a text-only advisor card.
- Docs: `docs/website_Catena_pivot_3.md` gains a dated amendment note; §4.4's confinement sentence becomes "the advisor label renders on the founder profile on `/team`; the member label on the landing strip and the footer"; §1.5 records the consequence; manual conformance item 17 is widened to "no Catena-X label within any services, pricing or case-study section, and the advisor label only beside the person the attestation names". The comment at `teamContent.js:5-11` is extended.

**Acceptance.** `/team` renders one profile, one Person schema, one booking button, and (if D2 executes) one advisor label image.

### P7. Remove PageTransition

**Why.** Item 1. Fact 4: the component is scenery, and defective scenery.

**Changes.**

- Delete (owner-confirmed): `client/src/components/templates/PageTransition.jsx`, `client/src/components/molecules/NavbarSkeleton.jsx`, `HeroSkeleton.jsx`, `ContentCardSkeleton.jsx`.
- Remove the wrapper and the skeleton constants from `LandingPage.jsx`, `TeamPage.jsx`, `ServicesPage.jsx`, `PrivacyPage.jsx`, `ContactPage.jsx`, `ConsortiumPage.jsx`, `ConsortiumTiersPage.jsx`. Children render directly.
- `client/src/index.css`: remove the `.navbar-skeleton-*` and `.page-fade-*` rules (lines 997 to 1025 today).
- Remove the `useReducedMotion` mocks that existed only for the transition: `LandingPage.test.jsx:7-8`, `ServicesPage.test.jsx:27-28`, `TeamPage.test.jsx:11-12`, `ConsortiumPage.test.jsx:34-35`, `ConsortiumTiersPage.test.jsx:49-50`. The hook itself stays; `useScrollToSection` uses it.
- Optional and not default: if the owner misses the fade, a `.page-enter` keyframe on the page root with a `prefers-reduced-motion: reduce` override gives the same effect with no JavaScript and no hang.

**Docs.** IBS spec line 427 superseded, recorded in the v7 note.

**Acceptance.** `grep -r "PageTransition\|Skeleton\|page-fade" client/src` returns nothing.

### P8. Production promotion: one mechanism

**Why.** Item 4. Fact 1: the workflow has never completed, production ships from `release` without it, and if it were approved it would promote the newest `main` preview, which can be ahead of `release`, over the production build Vercel already made. It cannot be made correct by approving it.

**Changes.**

- Delete `.github/workflows/promote-to-production.yml` (owner-confirmed, CI file). `release-policy-check.yml` and `ci.yml` stay. The human gate is the pull request into `release`, which the ruleset already requires.
- Docs: `AGENTS.md` lines 221 to 223 and 256 to 258 (promotion is Vercel's build of `release`), line 227 (`sync-staging.yml` is `workflow_dispatch` only, not dispatch-triggered), lines 265 to 267 (`e2e.yml` does call the Neon API to clean up preview branches). `DEPLOYMENT_GITHUB_ACTIONS.md`: sequence diagram and workflow table. `GITHUB_SETTINGS.md`: §3 and the verification matrix (the four `VERCEL_*` promotion secrets are no longer used; the `production` environment is optional). `DEPLOYMENT.md:273`. `README.md:11-15`: badges repointed to `Ichnos-Protocol/Website`, promote badge removed. `CLAUDE.md` §16 pointer sentence.

**Owner actions.** Delete the four unused secrets; keep or delete the `Production` environment; keep the `release` ruleset requiring a pull request.

**Acceptance.** A push to `release` produces exactly one Vercel production deployment per project and no GitHub Actions run.

### P9. Secrets

**Why.** Item 10. Fact 5.

**Order.** Rotate, then remove from HEAD, then rewire. Removal before rotation leaves the old values valid and visible in history.

1. **Owner rotates.** The QA account password named at `VERCEL_SETTINGS.md:189`. The E2E Firebase web API key, or restrict it by HTTP referrer and API in the Google Cloud console. Optionally re-provision the five E2E users.
2. **Remove from HEAD.** `git rm --cached e2e/.env.e2e`; delete `.gitignore` lines 8 and 9; move the root `.env.e2e.example` to `e2e/.env.e2e.example` with placeholder values and every variable name; delete `e2e/ENV_REFACTOR_PLAN.md` (a completed plan holding copies of the values); edit `VERCEL_SETTINGS.md:189` to drop the credential; `e2e/tests/helpers/auth.js:119` reads its sign-up password from `E2E_SIGNUP_PASSWORD`; `e2e/README.md:72` updated.
3. **Rewire `e2e.yml`.** Replace the "Load E2E config from committed file" step with `env:` mappings from repository variables (`vars.E2E_ADMIN_EMAIL`, `vars.E2E_ADMIN_UID`, the same for `USER`, `INCOMPLETE_USER`, `SUPER_ADMIN`, `MANAGE_ADMIN_TARGET`, plus `vars.E2E_BASE_URL`, `vars.E2E_API_BASE_URL`, `vars.FIREBASE_PROJECT_ID`, `vars.FIREBASE_AUTH_DOMAIN`, `vars.FIREBASE_STORAGE_BUCKET`) and secrets (`secrets.FIREBASE_API_KEY`, the five `secrets.E2E_*_PASSWORD`, `secrets.E2E_SIGNUP_PASSWORD`). Delete the log line at 159. Replace the payload dump at 105 with `env: PAYLOAD: ${{ toJSON(github.event.client_payload) }}` and `echo "$PAYLOAD"`. `e2e/playwright.config.js` loads `dotenv` from `e2e/.env.e2e` when the file exists, so local runs keep working with the now-ignored file. `provision-e2e-firebase-users.js` and `e2eEnvFile.js` keep reading the local file.
4. **Owner enables** secret scanning and push protection in the repository settings. A history rewrite is not part of this phase (D8).

**Docs.** `CLAUDE.md` §12; `AGENTS.md` line 222 and 278 to 285; `GITHUB_SETTINGS.md` matrix listing every new variable and secret by name.

**Acceptance.** `git ls-files | grep -i "\.env"` lists only `*.example` files. The E2E workflow passes on a manual dispatch.

### P10. Rate limiting with a shared store; delete the dead endpoint

**Why.** Item 12. Fact 3: the endpoint the owner pointed at has no caller. The shared store still matters: `express-rate-limit` with its default `MemoryStore` counts per serverless instance, so the global limit at `app.js:46-51` is not enforced in practice.

**Changes.**

- Delete `POST /api/auth/verify-token`: `server/src/routes/authRoutes.js:27`, `controllers/authController.js:23-39`, `services/authService.js:85-90`, `routes/authRoutes.test.js:191-220`, `services/authService.test.js:324-340`, `client/src/features/auth/authApi.js:31-35,54`, and the `CLAUDE.md` §11 row. Record the reason in the commit: no caller, no auth, echoed the decoded token.
- New `server/src/middleware/pgRateLimitStore.js` implementing the `express-rate-limit` `Store` contract (`init`, `get`, `increment`, `decrement`, `resetKey`) on the existing pool from `server/src/config/database.js`. Table `rate_limit_hits(key text primary key, hits integer not null, reset_at timestamptz not null)` from migration `server/migrations/008_20260923_rate_limit_hits.sql`. One `INSERT ... ON CONFLICT (key) DO UPDATE` per hit that resets `hits` and `reset_at` when `reset_at` has passed. Fail-open on a database error: log and return one hit, so a database blip does not turn every request into a 500. Under 120 lines, unit-tested with the existing `pg` mocking pattern. Fallback if the owner prefers a maintained package: `@acpr/rate-limit-postgresql`, listed in the `express-rate-limit` documentation.
- `server/src/app.js`: the global limiter keeps its window and limits and gains `store`, `standardHeaders: "draft-7"`, `legacyHeaders: false`. A second limiter on `/api/auth` (20 requests per 15 minutes per IP, preview relaxed the same way as the global one) is mounted before `authRoutes`. `/api/chat/message` keeps its database-backed daily quota.
- Tests: store unit tests (window reset, decrement, resetKey, fail-open); a route test asserting the `RateLimit` header and a 429 after the auth limit with the store mocked.

**Docs.** `CLAUDE.md` §11 (row removed), §13 (store named), §6.1 (table added). `AGENTS.md` mirrored.

**Owner actions.** Confirm migration 008 against production. Optional: if the Vercel plan includes Firewall rate limiting, a rule on `/api/auth/*` is a zero-code second layer.

**Acceptance.** On a preview, 21 requests to `/api/auth/me` from one IP inside 15 minutes return 429 on the 21st with a `RateLimit` header, across cold starts.

### P11. Coverage and CI wiring

**Why.** Items 11 and 13. "Fix quality check" is read as the declared gates that do not run: coverage, `format:check` (P12) and their absence from `ci.yml`, plus the stale badges (P8). If the owner meant something else, say so before this phase starts.

**Changes.**

- Install `@vitest/coverage-v8@^4` as a devDependency in `client/` and `server/` (devDependencies are pre-authorised).
- `client/vite.config.js` coverage: `include: ["src/**/*.{js,jsx}"]`, `exclude: ["src/**/*.test.{js,jsx}", "src/setupTests.js", "src/main.jsx", "src/test-utils/**", "src/constants/vocabulary.js", "src/constants/corpusScan.js"]`, `reporter: ["text-summary", "lcov"]`.
- New `server/vitest.config.js`: `environment: "node"`, coverage `include: ["src/**/*.js"]`, `exclude: ["src/**/*.test.js"]`, same reporters. `server/package.json` gains `"test:coverage": "vitest run --coverage"`.
- First ticket measures and reports line coverage per package and for `helpers/**` and `services/**`. Thresholds are then set from the measurement: global at the measured floor minus two points; `helpers/**` and `services/**` at 80 where met (`CLAUDE.md` §14.3), otherwise at the measured value with a dated ratchet note. Vitest accepts glob-keyed thresholds.
- `ci.yml`: `npm run test:coverage` replaces `npm test` in both jobs; `timeout-minutes` raised to 8 if the client run needs it.

**Docs.** `CLAUDE.md` §14.1 and the §15 checklist; `AGENTS.md` line 136 changes "target" to "enforced in CI".

**Acceptance.** Lowering any threshold below the measured value makes `npm run test:coverage` fail.

### P12. Prettier: adopt once, last

**Why.** Fact 7. Adoption is a one-commit decision that must not land inside another change. It is last so every earlier phase's diff stays readable.

**Changes.**

- Root `.prettierrc.json`: `{ "endOfLine": "auto" }` (D6; everything else default).
- `client/.prettierignore`: `dist/`, `coverage/`, `.vercel/`, `public/brand/`. `server/.prettierignore`: `knowledge-base/`, `scripts/python/`, `coverage/`, `.vercel/`, `migrations/`. `e2e/.prettierignore`: `playwright-report/`, `test-results/`.
- Scripts narrowed to code. `client`: `"format": "prettier --write \"src/**/*.{js,jsx,css}\""`, `"format:check": "prettier --check \"src/**/*.{js,jsx,css}\""`. `server`: the same over `"src/**/*.js" "scripts/**/*.js" "api/**/*.js"`. `e2e`: the same over `"**/*.js"` outside the ignore list.
- One commit that changes nothing else: `style: format the corpus with prettier`. Reviewed by `git diff --stat`, lint and tests green.
- Then `format:check` is added to `ci.yml` after `lint` in both jobs and to the `CLAUDE.md` §15 checklist. The §15 Prettier paragraph is rewritten to describe the adopted state.

**Acceptance.** `npm run format:check` is clean in all three packages and runs in CI.

### P13. Riders

- Delete `test.txt` at the repository root (owner-confirmed).
- `CLAUDE.md` §15 baseline counts refreshed after P12 (last verified: client 102 files / 959 tests, server 66 files).
- `AGENTS.md` mirrors every `CLAUDE.md` change made in P1 to P12.

---

## 5. Out of scope

Named so that Traycer does not ask: a 404 page for `path="*"`; an error boundary; `client/vercel.json` mixing legacy `routes` with `redirects` (it deploys today; verify in the Vercel build log if it ever fails); the CORS fallback to `localhost`; admin `GET` routes with side effects; bundle splitting; the chatbot `SYSTEM_PROMPT` claim wording; the E2E suite's skip rate; consortium currency (D5); `TRADEMARK_NOTICE` (D3); a history rewrite (D8).

---

## 6. Verification after the epic

- `npm run lint && npm test` green in `client/` and `server/`; `npm run test:coverage` green with thresholds; `npm run format:check` clean.
- P1: consortium page renders `Join the consortium` with the system clock at 2 October 2026.
- P3: the readiness card on the tiers page shows no digit and one link.
- P6: `/team` has one Person schema, one profile, one booking button.
- P8: a push to `release` yields one Vercel production deployment per project and no Actions run.
- P9: `git ls-files | grep -i "\.env"` shows only example files.
- P10: 429 on the 21st auth request from one IP on a preview.
- Owner checklist: rotate the two credentials before P9 lands; confirm migrations 007 and 008; attest the Logo Use Agreement before the D2 part of P6; check the Firestore knowledge base for the departed member's name.
