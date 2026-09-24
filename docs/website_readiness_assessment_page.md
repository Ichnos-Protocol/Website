# website_readiness_assessment_page.md — Data readiness assessment page

**Version 1.14, 2026-09-23 · Status: normative · shipped, September fixes P2**

*(1.14, September fixes P2. **(a) §4.3 item 2 loses its calendar-relative clause**, because it depended on a year that nothing in the toolchain can flag. The replacement states the same ranking without naming a period. **(b) §8 item 7(b) gains `RELATIVE_TIME_PATTERN`**, so the page sweep now catches the class, not only literal dates.)*

*(1.13, second owner review of the rendered page. **(a) §4.2.2 rewritten again.** The v1.12 heading was called jibberish and it was: "Your data is needed before the deadline, not on it" is a slogan, not a claim. The replacement states the obligation plainly, and the closing line now names the consequence that actually bites, which is the customer filling the gaps in ways that may not survive scrutiny. **(b) §4.2.0 heading and body replaced** with the owner's wording. "Who this applies to" was ambiguous about what "this" was. **(c) Four sections gain headings:** §4.3 "Scope of the assessment", §4.4 "Timeline", §4.5 "Prerequisites", §4.8 "FAQ". Four constants reshape from bare arrays to `{ heading, items | steps | lines | entries }`, matching the §4.6 shape from v1.12. **(d) The mid CTA becomes "Book an introductory call"**, so the page does not show the hero's label twice.)*

*(1.12, owner rework after reviewing the deployed staging page. The architecture holds; the copy and the section order did not. **(a) Section order rebuilt** to read as a consultation rather than a brochure: what it is, why now, who it applies to, what you get, how it runs, what we need, what it is not, act, where it leads, objections, act. §4.2.2 now precedes the panels, and a new §4.2.0 frames them. **(b) Fenced-copy amendments** to §4.1 (headline, subhead, meta), §4.2.2 (heading, body, closing) and §4.9 (both bands). **(c) §4.7 and §4.7.1 deleted.** The author facts are carried by the global footer on this very page; the five published-work facts leave the site entirely and are not relocated. **(d) §2.2 amended**: no top-level navbar entry still, but a child under Battery Passport is permitted. **(e) §2.3** grows from three entry points to five. **(f) §8 item 7** loses scope (c); the date sweep is now page-wide, which is stronger. §1, §5, §8 and §11 follow.)*

*(1.11, from Traycer's verification pass. One fenced-copy amendment: §4.5.1's hosting sentence said `a hosted service on EU servers operated by us` while the claim-discipline paragraph one line below mandated `EU-hosted, operated by Ichnos`. The fenced copy was wrong and now carries the required construction. Four other findings ruled without spec change: the route pin extracts `route:` mount arguments rather than any quoted string; both `.env.example` rows go now, since a template is not a live setting; the second booking-band assertion is declined as redundant with the shared `BookingButton` test; and the missing phase commits are reconstructed as two commits, not twelve.)*

*(1.10, ruling on the collision between §8 item 7 and §4.7.1 that T9 surfaced. **The guard was too broad and the copy is correct.** v1.9's item 7(b) banned every rendered four-digit year page-wide; that was an overreach in my wording, not a defect in the implementation, and it made `International Battery Summit 2026` unrenderable. §3 rule 4 exists to stop a **regulatory obligation date** being hardcoded and going stale when the regulation moves, which is why `18 February 2025` and `18 August 2025` sit in `FORBIDDEN`. An event title is the inverse case: it cannot go stale, and §4.7.1 rules 1 and 5 require exactly that checkable specificity. Item 7 is now scoped in three parts: Panel B remains the sole passport-date carrier; the page minus the published-work subtree rejects bare years, month-year forms and ISO dates; and inside published work, month-year and ISO forms stay barred while a bare year is permitted. The exclusion is drawn on the component's `data-testid` boundary rather than an allowed string, because §4.7.1 rule 5 and §11 item 5 both anticipate the list growing. New §4.7.1 rule 6 states the copy-side constraint. No rework to T8's guard beyond adding the subtree exclusion and the inner assertion.)*

*(1.9, ruling on the normative contradiction the T8 agent surfaced. **The §4.2.2 window renders no date, and the implementation was right to preserve the fenced copy.** Three statements conflicted: the fenced copy has no date and no placeholder; a §4.2.2 constraint bullet read as requiring one; and §8 item 7 asserted a window date existed. The bullet was a conditional about **how** a date renders, not an instruction that one must, and §3 rule 4's mechanism is a prohibition on hardcoded dates, which dateless copy satisfies. §4.2.2 now says the section is deliberately dateless and why: Panel B states the date, this section counts backwards from it, and restating it weakens the one move the section exists to make. §8 item 7 is replaced by a **stronger** pair: Panel B's date is the interpolated value, and no date literal appears anywhere in the page subtree, which guards every section rather than naming two. Separately, and not raised by the agent: §4.2.2's claim that the copy "stays true without maintenance" is false. It is written from Q4 2026, nothing can flag it because there is no date in it to go stale, and it becomes wrong in Q2 2027. New owner item §11.13. T8 needs no rework.)*

*(1.8, from Traycer's validation pass the same day, after it confirmed the 37/114 surface and the P0a/P0b/P0c/P2a/P2b shape. Two of its five findings were spec bugs that would have produced wrong tickets. **(a) The route-constant list was unbuildable.** §2.1 named twelve constants and omitted `/admin`, which the sweep covers and which `UserMenu.jsx:45` and `useAuthInit.js:45` both hold; the legacy parents were missing too, leaving `App.jsx`'s own `/data` and `/catena-x` literals with nothing to import. The set is now an explicit table of **fourteen**, with a matcher-ordering warning so `/consortium` cannot match inside `/consortium/tiers`. **(b) `BookingButton` was described as serving the §2.3 entry points**, which would have sent a visitor clicking "Data readiness assessment" on `/services` to Google Calendar. Booking CTAs and entry points are now separated explicitly, and `CtaBand` takes its action from its parent so one band serves both destinations. **(c) `BOOKING_URL` is the only name**; `CONTACT_INFO.booking` is not created, because v1.4 made an alias in §6.6 row 8 and then bypassed it in rows 9 and 11. **(d) New §6.6.1** on rollback: `VITE_CALENDLY_URL` stays in the live Vercel projects until the owner decommissions Calendly, and after cancellation the rule is roll forward only. **(e) The shared `stripNonConsuming` helper** goes to `constants/corpusScan.js` beside `vocabulary.js`, and into `SKIP_FILES` for the same reason `vocabulary.js` is there. §2.1, §5, §6.2, §6.6 and §9 follow.)*

*(1.7, from Traycer's third pass the same day. Its 37/114 measurement was independently confirmed, and its three new findings are all real. **(a) The anti-circularity pins needed a mechanism, not just a ruling.** `App.test.jsx` is inside the walk, so its literal mounts would trip the sweep that they exist to make safe. §2.1 now specifies all three parts: a skip set on the `CONSUMER_EXCLUDED` precedent (`vocabulary.test.js:180`), a positive assertion that the pin is still present so a future tidy-up cannot silently restore the circularity, and four added mounts, because `App.test.jsx` covers six routes today and leaves `/services`, `/team`, `/contact` and `/privacy` unpinned. **(b) `routes.js` uses flat literals, not composed child paths.** Composition would silently relocate the canonical readiness URL if the open `/passport` naming question is ever resolved; the parent/child relationship is asserted instead, so a parent rename fails loudly. **(c) New §2.1.2:** P2a's diff is protected from Prettier drift by a mechanical before/after `--list-different` comparison, not by diff review, because 169 of 233 client files are non-conformant and a quote flip across 37 files is not reliably visible by eye. **(d) New §7.2.1:** `structuredData.js` splits in **P8**, not P2a. Also noted, no action: `/catalog` at `MobileNavOverlay.test.jsx:174` is not a route and is correctly outside the swept set. §2.1, §7.2, §8 and §9 follow.)*

*(1.6, from Traycer's refactoring analysis the same day. All four of its risk findings verified against the code and accepted. **(a) P2's swept surface is 37 files and 114 occurrences, not the 13 v1.5 named nor the 27 Traycer measured** — 18 source files and 19 test files. §2.1 now lists the eleven unnamed source files. The v1.4 atomic pre-approval for P2 is **withdrawn**, because it was granted against an estimate wrong by 3x, and P2 splits into **P2a** (pure retrofit, all 37, guard last) and **P2b** (additive: new route, shell, `Breadcrumb`, both redirects). **(b) The sweep strips comments** via the existing `stripNonConsuming` helper, because `Navbar.jsx:77` quotes `'/passport'` in a comment about removed behaviour, and `vocabulary.js` strips only for its consumer scans, not for `FORBIDDEN`. A new bullet also fixes the guard's circularity: `App.test.jsx` and the sitemap assertion remain the two places that pin literal values. **(c) The `InquirySuccess` → `onBook` → modal chain has zero coverage** and P0b rewires exactly it, so a characterisation test against current behaviour lands first, as **P0a**. **(d) `BookingButton` moves from P3 to P0b** so `BookingModal` consumes it at birth instead of being rewritten three phases later. Also recorded: P0b regenerates `package-lock.json` in-commit, because CI runs `npm ci` and it fails hard on lockfile drift. §2.1, §5, §8 and §9 follow.)*

*(1.5, from Traycer's second verification pass the same day. Traycer confirmed all fourteen §6.6 rows and all six §6.7 rows against the code and raised four gaps, all now closed. **(a) The route guard could not have gone green as written.** New §2.1.1: `ROUTE_LANDING` is exported but excluded from the `routes.test.js` sweep, because `/` occurs 50 times across 24 files in `client/src`, two of them not route references at all (a path separator in `vocabulary.test.js:42`, a URL prefix check in `gdprApi.test.js:12`). The exclusion is reasoned, asserted and compensated by `App.test.jsx`'s existing behavioural coverage, not waved through. Traycer's count of five files was low by nineteen. **(b) `README.md` line 590 is a fourth statement of the 120-line cap**; it joins the §6.7 table with a recorded reason for why that is completing the owner's ruling rather than extending it. **(c) P0a is dropped and Traycer starts at P0b**, because all four convention edits are now in the tree: three in `010d56a` with spec v1.4, `README.md` with this version. **(d) `client/vercel.config.test.js` gains the two sibling-child redirect assertions**, making P2 thirteen files rather than twelve. Also corrected: `FooterNavColumns.jsx` holds seven route literals, not the one the v1.4 citation named. §2.1, §6.7, §8 and §9 follow.)*

*(1.4, owner rulings on the four mismatches Traycer raised against v1.3, all recorded the same day. **(a) The Calendly to Google migration is in scope and is a named sub-project, not a guard line.** v1.3 §6.2 treated `[Cc]alendly` as a FORBIDDEN widening that would land "if the corpus is already clean". The corpus is not clean: eleven live files, one npm dependency, two GDPR documents and two documented environment variables carry it. §6.6 is new and inventories every occurrence; §6.7 covers the legal and configuration documents; a new phase **P0** lands the whole migration before P1. `CalendlyModal` is renamed to `BookingModal` and adapted to the Google booking link, the `calendar-event` icon becomes the Google icon, and `react-calendly` is removed. **(b) Canonical route confirmed as `/passport/readiness-assessment`**, with `/data/readiness-assessment` and `/catena-x/readiness-assessment` both redirecting to it. v1.3 §2.1 anticipated one legacy sibling; the code has two. §2.1 is rewritten against the code. **(c) Route constants are extracted site-wide** into a new `constants/routes.js` with a colocated corpus guard, because leaving one consumer on a literal defeats the "zero hardcoded path strings" rule. **(d) The file-length cap is raised from 120 to 200 lines**, owner ruling, so `readinessAssessmentContent.js` ships as one cohesive file. `CLAUDE.md` §5.1 and §17 item 6 and `AGENTS.md` are updated in the same epic. §0, §2.1, §3, §5, §6.2, §8, §9, §10 and §11 all follow.)*

*(1.3, owner input the same day: §6.5 carries the owner's actual schedule settings (title, Monday to Friday 10:00 to 18:00 Kuala Lumpur, 60 day window) and step by step instructions for adding the personal calendar to the availability check; §6.2 records the booking link for P1; §4.2.1.1 rules 3 and 6 record the owner's rulings: the founding price is financed by the reference and the introduction, a client who declines pays the standard price, and a second client signing at the founding price before the flip takes on the same conditions. §11 items 1 and 3 updated.)*

*(1.2, owner decisions of 22 Sep 2026. **(a) Booking tool:** Calendly is replaced by a Google Calendar appointment schedule in the Ichnos Google Workspace account (Business Standard). §6.5 is rewritten for it. The §6.2 `?src=` attribution scheme is removed, because Google booking pages do not record URL parameters, and `BookingButton` loses its `src` prop. §0.7, §5, §6.1, §8 and §11 follow, and `[Cc]alendly` joins `FORBIDDEN`. **(b) First client prices:** each tier gets a founding price for its first signed client and reverts to its standard price afterwards. The founding price renders on the page as the tier's price, with no founding, introductory or cohort qualifier. The §4.2.1.1 founding block is removed from the page, the founding terms move to the engagement letter only, and the single `foundingCohortOpen` flag becomes one `foundingOpen` flag per tier. §4.2.1, §4.8, §7, §8, §9 and §11 follow.)*

*(1.1, from the commercial review the same day: the pricing model is rebuilt on two independent axes because v1.0's currency-by-panel scheme overlapped on the case that matters most, an EU-exporting Asian cell maker, and priced the party carrying the legal obligation at par with the tier below it. Tier C added. Tier A reframed as a founding-client cohort so the low anchor has a stated reason. Four sections added: the window (§4.2.2), what happens next (§4.5.1), published work (§4.7.1) and the Calendly configuration (§6.5). §1 gains the outbound-collateral reframe, which reorders what the page optimises for.)*

**Subject:** a new page under the battery passport route selling the fixed-scope **battery passport data readiness assessment**, as the site's first conversion-oriented offering surface.

**Baseline:** `website_Catena_pivot_3.md` v3.11 (status vocabulary, label law, three-tier testing model, excluded vocabulary) and `website_Catena_pivot_4.md` v4.0 including §13 (regulatory-date mechanism, credential state, copy style) are **both in force and assumed merged**. This document governs the new page only. Where it conflicts, pivot-3 governs claims and label law, pivot-4 governs dates and credential copy.

**Conventions:** MUST / MUST NOT / SHOULD / MAY as pivot-3. Reference code is normative as to behaviour, not structure.

**Copy style rule (pivot-4, still binding): no em-dashes in any copy introduced by this spec.** Fenced copy below uses colons, commas and periods.

---

## 0. Execution contract

1. **This run changes routes.** It is the first route addition since pivot-3, and it is deliberate: pivot-4 §11 put routes out of scope for *that* run only. §2 governs.
2. **Net dependency change is minus one.** No dependency is added: the booking integration is a link-out, not an embed (§6.1). One is removed: `react-calendly` (§6.6). Any proposal to add a calendar SDK, including Google's appointment schedule embed script or its script-free `<iframe>` embed, is a separate decision, not a Traycer judgement call.
3. Phases per §9. The 3-file cap holds unless a phase is marked *atomic*; every atomic phase here is pre-approved with its reason recorded. Do not re-ask.
4. **Commit boundary is the semantic flip, not the file count** (pivot-3 §9.11/§9.12). Any consumer of a changed data shape lands in the same commit as the shape change.
5. **Guards land in the earliest phase where they are green** (pivot-3 §7.2). The FORBIDDEN widening in §3 lands in the commit that deletes its last live occurrence. For `[Cc]alendly` that commit is **P0** (§6.6), not P1: v1.3 wrote "P1 if the corpus is already clean", and it is not. A red phase is never acceptable.
6. **Tests locate by `data-testid` or role, never by copy** (pivot-3 §7.0). DOM assertions compare against imported constants and MUST NOT restate literals.
7. **Owner-assigned, not Traycer:** creating and configuring the Google Calendar appointment schedule (§6.5, §11), deleting the Calendly account and its Vercel environment variables (§6.7, §11), legal review of the amended GDPR documents (§6.7), the live click-through check on desktop and mobile, Lighthouse, the three-viewport review, and re-verification of the membership claim in §4.7.
8. Green before commit, every phase.
9. **This epic carries one refactor that is not part of the new page, and it is deliberate: the Calendly to Google migration (§6.6, §6.7), landing as P0.** It is here rather than in a follow-up because §6.2 makes `BOOKING_URL` the single source for every booking CTA on the site, and a single source that coexists with a second live booking link is not a single source. P0 is self-contained, ships green on its own, and touches no file the new page needs. The route-constant extraction (§2.1) is the second refactor; it lands as **P2a**, with **P2b** adding the new route that is its first consumer (§9, split in v1.6).
10. **Verified starting state, measured 2026-09-22 before P0b.** `client`: 85 test files, 759 tests, all green; ESLint clean. `server`: 44 test files (4 skipped), 636 tests (20 skipped), all green; ESLint clean. **Every phase starts from this and ends at least this green.** Do not re-derive it, and do not start a phase on a red tree. Two traps this run must not fall into: `client`'s `npm test` used to be bare `vitest` (watch mode, hangs a non-interactive run); it is now `vitest run`, with `test:watch` for the interactive case. And **Prettier must not be run** — it is declared in both packages but has never been run corpus-wide, so `npm run format` would rewrite 169 client and 42 server files and make every diff in this epic unreadable. Match the file you are editing. CLAUDE.md §15 has the full note.
11. **File-length cap for this epic and afterwards: 200 lines for source files, not 120** (owner ruling, 22 Sep 2026). `CLAUDE.md` §5.1 and §17 item 6 and `AGENTS.md` are amended in P0. The function cap (20 lines) and the JSX-return cap (60 lines) are unchanged. `readinessAssessmentContent.js` ships as one cohesive file under the raised cap; it MUST NOT be split for the sake of the old number, and it MUST NOT be allowed to grow past the new one.

---

## 1. What this page is for

**Single job: convert a reader who already knows they have a data problem into a booked 30-minute scoping call.** Not to educate, not to rank, not to explain the regulation. `/passport` does the explaining and this page is where that traffic goes to act.

Five consequences that bind the rest of this document:

- **Success is booked calls.** Time on page, scroll depth and newsletter-style engagement are not goals and MUST NOT drive layout decisions.
- **This is an offering surface with a price anchor.** That triggers the sharpest rule in pivot-3 §4.4: **no Catena-X label or logo may appear on, beside or within this page.** §3 makes it machine-checkable rather than a matter of designer discipline.
- **There are no clients to name.** The page ships with zero case studies and zero named references, and MUST NOT be written in a way that implies prior engagements. **As of v1.12 the credibility carriers are the specificity of the deliverables (§4.3) and the credentials in the global footer.** The credential line and the published-work strip were removed by owner decision; §4.7 records what that costs.
- **This is outbound collateral that happens to have a URL.** It will not be found by search in the time that matters. Its real job is to be the link inside a cold email, opened on a phone in Jakarta or Shenzhen thirty seconds after that email arrives, by someone deciding whether the sender is serious. **That reorders the priorities:** above-the-fold clarity, mobile rendering and load time are load-bearing; keyword depth, FAQ length and long-form SEO are not. Where the two conflict, the phone wins. The §8 manual review is conducted on a phone first, desktop second.
- **The page does not compete on explaining the regulation.** Regulatory-interpretation consultancies already serve this buyer population, including Chinese exporters to the EU. The differentiators are data-space depth, standards participation and physical presence in ASEAN. Copy that re-explains what the regulation says is copy that puts Ichnos into a crowded comparison it does not win.

---

## 2. Placement and routing

### 2.1 Routing, settled against the code (v1.4)

pivot-3 records a standing documentation error: pivot-2 lists the routes as `/data (ex-/passport)` while `App.jsx` has it the other way round, and pivot-3's ruling is **the code is correct, do not change it to match**. That ruling still holds and this run does not resolve the naming question (§10).

**Code state, verified 22 Sep 2026.** `/passport` is the live battery passport page, under `CatenaXThemeLayout`. There are **two** legacy siblings, not one: `/data` and `/catena-x` each redirect to `/passport`, as a `Navigate replace` in `App.jsx` and as a `301` in `client/vercel.json`. Neither has a child route, so `/data/readiness-assessment` today falls through to `path="*" element={null}` and renders a blank page inside the site chrome, which is worse than a 404 because it returns 200.

**Canonical route, owner decision 22 Sep 2026:**

| Path | Behaviour |
|---|---|
| `/passport/readiness-assessment` | **Canonical.** The page renders here. Sitemap, `seoMeta.js` and the `BreadcrumbList` all name this path and only this path. |
| `/data/readiness-assessment` | 301 to canonical. |
| `/catena-x/readiness-assessment` | 301 to canonical. |

The owner asked for the page to be reachable at `/data/readiness-assessment`. It is, through the redirect. It is **not** canonical there, for one reason: `/data` itself is a redirect, so a canonical child under it would give the §2.4 breadcrumb a parent crumb pointing at a 301, and would put the page's only indexable URL underneath a path the site has already told search engines is superseded.

Both redirects land in **two places, in the same commit**, because the two mechanisms cover different traffic:

- `client/vercel.json` `redirects`, `statusCode: 301`, beside the two existing entries. This is what a search engine and a cold-email click see.
- `App.jsx` `<Route ... element={<Navigate replace to={...} />} />`, beside the two existing entries. This is what an in-app client-side navigation sees, and without it the SPA rewrite hands those paths to `path="*"` and renders the blank page described above.

The `path="*" element={null}` fallthrough is **not** fixed by this run. It is a real defect and it predates this spec; recorded in §10.

**Route constants, site-wide (v1.4).** v1.3 required "zero hardcoded path strings in components or tests" but no route-constants module exists, so the rule had nothing to bind to. This run creates one and retrofits every consumer.

- New `client/src/constants/routes.js`, named exports, `UPPER_SNAKE_CASE`. Values are the literal paths; this file is the only place in `client/src` where those literals may appear.
- **Exactly fourteen constants (v1.8).** v1.7 listed twelve and omitted `/admin`, which made the spec unbuildable: the sweep covers `/admin`, and `UserMenu.jsx:45` and `useAuthInit.js:45` both hold it, so they could not have been retrofitted. The legacy **parents** were also missing, leaving `App.jsx`'s existing `/data` and `/catena-x` literals with nothing to import.

| Constant | Value | Why it exists |
|---|---|---|
| `ROUTE_LANDING` | `/` | Exported, **not swept** (§2.1.1) |
| `ROUTE_ADMIN` | `/admin` | `AdminRoute`, `UserMenu`, `useAuthInit` |
| `ROUTE_SERVICES` | `/services` | |
| `ROUTE_TEAM` | `/team` | |
| `ROUTE_CONTACT` | `/contact` | |
| `ROUTE_CONSORTIUM` | `/consortium` | |
| `ROUTE_CONSORTIUM_TIERS` | `/consortium/tiers` | |
| `ROUTE_PRIVACY` | `/privacy` | |
| `ROUTE_PASSPORT` | `/passport` | Parent of the new page |
| `ROUTE_READINESS_ASSESSMENT` | `/passport/readiness-assessment` | Canonical |
| `ROUTE_LEGACY_DATA` | `/data` | Existing redirect source |
| `ROUTE_LEGACY_CATENA_X` | `/catena-x` | Existing redirect source |
| `ROUTE_LEGACY_DATA_READINESS` | `/data/readiness-assessment` | New redirect source |
| `ROUTE_LEGACY_CATENA_X_READINESS` | `/catena-x/readiness-assessment` | New redirect source |

  `/admin` is a route like any other and is swept and pinned like any other. Excluding it would leave two source files unretrofittable and a third of the router unguarded, for no reason: it is not secret, it is already in `App.jsx` in plain text, and the guard is about renames, not secrecy.

- **Matcher ordering, an implementation trap.** The sweep compares whole quoted strings, so `/consortium` must never match inside `/consortium/tiers`, nor `/passport` inside `/passport/readiness-assessment`, nor `/data` inside `/data/readiness-assessment`. Use exact string equality on the quoted content, or if a regex alternation is used, sort the values **longest first**. Getting this wrong silently under-reports and the phase ships looking green.
- **Every value is a flat literal. Child paths are NOT composed from their parents (v1.7).** Writing the child as parent-plus-segment looks tidy and is the wrong trade here. `/passport` is the single route in this codebase with a live, unresolved renaming dispute: pivot-2 and pivot-3 disagree, §10 keeps the question open, and `/data` and `/catena-x` are the scar tissue from the last move. Under composition, resolving that dispute would silently relocate the canonical readiness-assessment URL as a side effect of renaming its parent, changing a published and indexed address with no line in the diff saying so. Flat literals make every published URL explicit and greppable in one file.
- **The parent/child relationship is asserted, not enforced.** `routes.test.js` asserts that each of the three children starts with its parent: the canonical child with `/passport`, and each sibling child with `/data` and `/catena-x`. A parent rename then fails the suite loudly and a human decides whether the child moves with it. Loud beats silent; that is the whole ruling.
- The seven consumers the **new page** touches, retrofitted in P2a: `App.jsx`, `constants/navigation.js`, `constants/landingContent.js` (`ctaHref`), `constants/services.js` (five `passportLink` values), `constants/seoMeta.js` (`path`), `constants/structuredData.js` (the breadcrumb `path` entries) and `components/molecules/FooterNavColumns.jsx` (**seven** literals across its `MENUS` array: `/`, `/team`, `/services` four times, `/passport`, `/consortium`; v1.4 cited only the `/passport` line and undercounted). Partial extraction is rejected for the multi-character routes: a guard that permits one literal consumer does not guard anything.
- **Measured surface, 22 Sep 2026: 37 files, 114 occurrences** — 18 source files and 19 test files carry at least one swept (non-landing) route literal. §2.1's named list of seven is the files the *new page* touches, not the files the *guard* covers; v1.4 conflated the two. The unnamed eleven source files are `ContactFormProfile.jsx`, `ServiceCard.jsx` (a `linkTo` default), `ContactSection.jsx`, `CookieConsentBanner.jsx`, `Footer.jsx`, `Navbar.jsx`, `ServicesSnapshot.jsx`, `UserMenu.jsx` (three `navigate()` calls), `ConsortiumPage.jsx`, `passportContent.js` and `useAuthInit.js`. P2a carries all 37 (§9).
- Colocated `routes.test.js` enforces it, on the `vocabulary.js` pattern: walk `client/src`, skipping `routes.js` and `routes.test.js`, and assert no file contains a quoted string that exactly equals one of the **swept** route values. Test files are **in** the walk, because §0.6 already requires DOM assertions to compare against imported constants.
- **Comments are stripped before the sweep**, reusing the existing `stripNonConsuming` helper in `vocabulary.test.js` (extract it to a shared module rather than copying it). This is not a convenience: `Navbar.jsx:77` carries `'/passport'` inside a JSX comment documenting a `pathname === '/passport'` switch removed on 2026-08-12, and a raw-text sweep trips on it. `vocabulary.js` applies `stripNonConsuming` to its consumer scans and **not** to the `FORBIDDEN` corpus scan, so "on the `vocabulary.js` pattern" is ambiguous on exactly this point; this bullet resolves it. A route named in a comment is not a route reference.
- **The shared helper lives at `client/src/constants/corpusScan.js` (v1.8)**, beside `vocabulary.js`, imported by both `vocabulary.test.js` and `routes.test.js`. That is where the repo already keeps corpus-scan infrastructure, and `vocabulary.js` is the precedent: it sits in `constants/` and names itself in its own `SKIP_FILES`. **Add `corpusScan.js` to `SKIP_FILES` too**, for the same reason `vocabulary.js` is there: a scanner that scans itself goes red the day someone adds a `FORBIDDEN` pattern that happens to match one of its own regex sources, and that failure teaches nothing. Rejected: `helpers/`, which CLAUDE.md §5.5 reserves for app logic and this never runs in the app; a `test-utils/` directory, which would mean restructuring the existing `test-utils.jsx` React render harness for one unrelated file; and copying the function, which guarantees the two guards drift and one quietly stops stripping comments. **Separately, fix that comment** while P2a is in the file: it quotes a live route to describe behaviour that no longer exists, which is a stale comment independent of the guard.
- **Two places still assert literal values, so the guard is not circular (v1.6), and the mechanism is specified here (v1.7).** If a component and its test both import `ROUTE_PASSPORT`, neither can catch a wrong value in `routes.js`. The pins are `client/src/App.test.jsx`, which mounts `<App />` at literal paths and asserts the right page renders, and the `client/public/sitemap.xml` assertion in §8 item 24. The sitemap is static XML outside the walk and needs nothing. `App.test.jsx` is **inside** the walk, so the pin only survives if the sweep is told about it:

  1. **Skip it by name.** `routes.test.js` carries a skip set of `routes.js`, `routes.test.js` and `App.test.jsx`, on the exact precedent of `CONSUMER_EXCLUDED` in `vocabulary.test.js:180`, with a comment saying `App.test.jsx` is the value pin and is excluded deliberately rather than forgotten.
  2. **Assert the pin is still there.** `routes.test.js` also asserts that `App.test.jsx` still contains the literal string of every pinned route. Skipping alone lets a future tidy-up convert those mounts to constants and quietly restore the circularity with nothing going red. This assertion is what makes the skip safe, and its failure message must say why the literal has to stay.
  3. **Complete the pin in P2a.** `App.test.jsx` today mounts at `/`, `/admin`, `/passport`, `/consortium`, `/consortium/tiers`, `/data` and `/catena-x`: six routes plus both legacy redirects. It does **not** cover `/services`, `/team`, `/contact` or `/privacy`, so those four constants are currently unpinned and a wrong value in any of them would pass every test. P2a adds the four missing mounts. Four assertions to close the hole entirely.

  Rejected: moving the pins into `routes.test.js` as direct value assertions. `expect(ROUTE_PASSPORT).toBe("/passport")` restates the constant in the file next to it and proves nothing about routing. `App.test.jsx`'s pin is behavioural, which is strictly stronger.

#### 2.1.1 The landing route is exported but not swept (v1.5)

**Ruling, 22 Sep 2026.** `ROUTE_LANDING` is exported from `routes.js` like every other route, but the value `/` is **excluded from the `routes.test.js` sweep**. Every other route value is swept.

The measured problem: `'/'` or `"/"` appears **50 times across 24 files** in `client/src`. Two of those are not route references in any sense:

| Site | Use |
|---|---|
| `constants/vocabulary.test.js:42` | `relative(CLIENT_ROOT, file).split(sep).join("/")`, a path separator. The corpus guard's own sibling file would fail the route guard. |
| `features/gdpr/gdprApi.test.js:12` | `input.startsWith("/")`, a URL prefix check. |

The rest are genuine references to the landing route, spread across `navigate('/')` calls in `UserMenu`, `PrivacyPage`, `Navbar`, `MobileNavOverlay` and `NavDropdown`, `pathname === '/'` home checks in three components, `route: '/'` harness arguments in five test files, and a `<a href="/">` brand link in `Navbar.jsx:81`.

Three reasons the exclusion is correct rather than convenient:

1. **The guard protects against renames, and `/` cannot be renamed.** Every other route in the table could plausibly move: `/passport` has moved once already (§2.1), and `/data` and `/catena-x` are the scar tissue. The site root is the one path with no rename risk, so sweeping it buys nothing and costs 50 edits.
2. **A one-character value is not distinguishable from a separator by the sweep's own rule.** Any guard that fires on `vocabulary.test.js`'s `join("/")` is reporting on string length, not on routing.
3. **`ALLOWED_EXCEPTIONS` must not absorb this.** `vocabulary.js` states that the list "exists for FALSE POSITIVES ONLY" and that "adding an entry is a reviewed decision, not a fix for a failing test." Fifty legitimate uses are not false positives; they are evidence that the pattern is wrong. Using the exception list here would hollow out a mechanism the claim guards depend on.

**What still adopts `ROUTE_LANDING`, because P2a is editing those files anyway and it costs nothing:** `constants/seoMeta.js:48`, the four `{ name: "Home", path: "/" }` entries in `constants/structuredData.js`, and `FooterNavColumns.jsx:11`. Those are route **data**, they sit beside values the sweep does cover, and leaving them as literals next to imported siblings would be incoherent.

**What does not change, recorded so P2a does not grow:** the `navigate('/')` calls, the `pathname === '/'` home checks, the `<a href="/">` brand link, the `ProtectedRoute` and `renderWithProviders` `= '/'` defaults, and every test-harness `route: '/'`. Roughly eighteen files, zero rename risk, no benefit beyond uniformity.

**Compensating coverage.** The landing route is asserted behaviourally instead of lexically: `App.test.jsx` already renders `<App />` at `route: '/'` and asserts `LandingPage` mounts. That test is the landing route's guard, and it is a better one than a string sweep, because it fails if the route stops working rather than if someone types a slash.

#### 2.1.2 Protecting P2a's diff from formatting drift (v1.7)

P2a adds an import line to 37 files in a corpus that has never been formatted: no `.prettierrc` exists, 169 of 233 client source files differ from Prettier's output, and quote style splits roughly 141 single to 70 double with no file internally mixed (CLAUDE.md §15). An editor or agent that normalises quotes on save turns a mechanical retrofit into a diff nobody can review, and breaks CLAUDE.md's standing rule to match the file being edited.

**The rule** is already in CLAUDE.md §15: match the file you are editing, and do not run `npm run format`. P2a restates it because P2a is the phase most likely to break it.

**The check is mechanical, and it is the point of this section.** Diff review does not reliably catch a quote flip across 37 files. This does:

```bash
# in client/, BEFORE P2a
npx prettier --end-of-line auto --list-different "src/**/*.{js,jsx}" | sort > /tmp/fmt-before.txt
# ... P2a ...
npx prettier --end-of-line auto --list-different "src/**/*.{js,jsx}" | sort > /tmp/fmt-after.txt
diff /tmp/fmt-before.txt /tmp/fmt-after.txt   # MUST be empty
```

A file that was Prettier-non-conformant before and conformant after, or the reverse, was reformatted. The set must be identical, not merely similar. Baseline at `b431be6`: 169 files. Run this before opening the P2a pull request and paste the result into it.

**A second, cheaper assertion** catches a different failure: `routes.test.js` asserts every file that previously held a swept literal now imports from `routes.js`. That catches a file whose literal was deleted but never replaced, which the sweep alone would pass.

**Rejected: splitting P2a by directory.** Three commits with no semantic seam between them, each leaving the guard red until the last, which is the state P2a's single-commit shape exists to avoid. The diff is large because the corpus is large; the answer is a mechanical check, not smaller unreviewable pieces.

### 2.2 Not a top-level nav item, but a child under Battery Passport (v1.12)

The navbar gains no **top-level** entry. A fixed-scope paid engagement sitting in primary navigation alongside `Services` and `Team` reads as a product catalogue and dilutes the passport page it depends on for context.

**Owner amendment, 2026-09-23: a child under Battery Passport is permitted**, and lands. That is not the case the rule was written against: the entry is subordinate to the page that gives it context, which is what §2.2 was protecting, rather than competing with it one level up.

**Implementation constraint, load-bearing.** `NavDropdown` renders a dropdown parent as a `<button>`, never an anchor, and `Navbar.jsx` tests `item.children` before every other branch. A parent that kept its own `path` would therefore stop linking anywhere, silently. Battery Passport follows the existing **Company** pattern instead: parent with no `path`, and the route moved down to an `Overview` child beside `Readiness Assessment`. This also fixes active state, because `isDropdownActive` matches on children paths, so both `/passport` and the child light the parent.

### 2.3 Entry points (five since v1.12)

| Surface | Treatment |
|---|---|
| Battery passport page (`/passport`) | A CTA band at the foot of the page, after the existing `PassportOffer` strip. Primary button to the new route. |
| `/services`, Compliance pillar | The relevant card gains a text link to the new route. No new card, no price on the services page. |
| Landing page, passport teaser | A secondary text link beside the existing `See services →` pattern. Not a second button. |
| Navbar (v1.12) | A `Readiness Assessment` child under the `Battery Passport` dropdown, beside `Overview`. Never a top-level entry (§2.2). |
| Footer, Products column (v1.12) | First item, ahead of `Battery Passport`. Owner decision: the assessment is the offer with a price behind it. |

Two more were added by owner decision on 2026-09-23, taking the total to five: the **navbar**, as a child under Battery Passport (§2.2), and the **footer**, as the first item in the Products column, ahead of Battery Passport itself.

The first two of the original three are the owner's stated requirement ("reachable under services and from the data page", 22 Sep 2026); `/passport` is the page referred to there as the data page (§2.1). The third is retained from v1.0. All five import the route constant from `routes.js` (§2.1) and none types the path.

### 2.4 Breadcrumb

New `molecules/Breadcrumb.jsx`, rendered at the top of the page: **Battery passport → Data readiness assessment**. The first crumb links to the parent route constant. `structuredData.js` gains a `BreadcrumbList` node (§7.2).

---

## 3. Claim discipline for this page

This page is where the site's claim rules are most likely to be broken, because sales copy pulls toward exactly the words pivot-3 bans. Each rule below names its mechanism.

| # | Rule | Why | Mechanism |
|---|---|---|---|
| 1 | **No Catena-X label or logo asset renders anywhere in this page's subtree.** | pivot-3 §4.4: labels are confined to the credentials strip and footer recognitions, and MUST NOT appear on any offering surface. A priced page is an offering surface. | Tier-1: the page test asserts no `CATENA_X_LABEL_ASSET` or `_cropped` filename appears in the rendered subtree, and that neither `CredentialLabel` nor `FooterRecognitions` is mounted within the page component. The site footer sits outside the page component and is unaffected. |
| 2 | **The product name is `battery passport data readiness assessment`.** Never `Catena-X readiness assessment`, never `Catena-X assessment`. | pivot-3 §4.4: `Catena-X` MUST NOT lead a proprietary product or service name. Descriptive headings remain permitted. | Tier-2: add `Catena-X [Rr]eadiness`, `Catena-X [Aa]ssessment` to `FORBIDDEN`. `Catena-X-ready` is already barred (pivot-3 §3.4). |
| 3 | **No conformance adjectives.** The assessment produces an analysis and a plan. It MUST NOT be described as certifying, validating, approving or making anything compliant. | pivot-3 §1.2 and the §3.3 conformance-adjective ban. | Tier-2: existing patterns, re-swept per pivot-3 §7.2 on widening. |
| 4 | **No carbon-footprint deadline claim.** | The EV CFP delegated act is not adopted (verified 31 Aug 2026). The sell is passport-first, PCF-ready. | Page copy states PCF readiness only. Dates render from `regulatoryDates.js`; this page MUST NOT hardcode any date. |
| 5 | **Onboarding wording:** `we manage your registration and BPN with Cofinity-X`. Never `we onboard you`. | Cofinity-X is the operating company; Ichnos manages the process. | pivot-4 §1, existing guard. |
| 6 | **LCA wording:** `we prepare the data exchange so your LCA partner sets up the PCF digital twin`. Never a claim that Ichnos performs the LCA. | pivot-4 §1. | Fenced in §4.6 copy. |
| 7 | **Hosting wording:** `EU-hosted, operated by Ichnos`. Never `certified`, `TISAX` or `compliant servers`. | pivot-4 §1, existing FORBIDDEN entries. | Tier-2. |
| 8 | **No named client, no case study, no logo wall.** | There are none. | Manual review; the content model has no field for one. |
| 9 | **Price lines are text, not badges.** No price may be styled as a pill, tag, sticker or price-card header, and none may sit adjacent to any Catena-X mention. | Rule 1's design-pressure failure mode: a price tag beside a mark is the trademark association pivot-3 §4.4 exists to prevent. The two audience panels make this a live risk, because panels with prices pull toward pricing-table styling. | Manual review at three viewports. |
| 10 | **No currency conversion anywhere in the codebase.** No FX call, no computed equivalent, no "approx." display. | §4.2.1 rule 1. A converted price is a claim that goes stale silently and differs from the invoice. | Tier-2: add a FORBIDDEN pattern for conversion helpers introduced near the pricing constant, and a tier-1 assertion that each rendered figure equals its `PRICING` literal. |

---

## 4. Content model and copy

New constants file `client/src/constants/readinessAssessmentContent.js`. Every string below is **fenced copy**: it may be rendered, reordered or split across elements, but MUST NOT be rewritten under this specification without a recorded amendment.

**Section order is normative, and was rebuilt in v1.12** so the page reads as a consultation rather than a brochure. The rendered order is:

| # | Section | Reads as |
|---|---|---|
| 1 | §4.1 Hero | what it is |
| 2 | §4.2.2 The window | why now |
| 3 | §4.2.0 To whom this assessment applies, then §4.2 the two panels | who it is for |
| 4 | §4.3 Scope of the assessment | what you get |
| 5 | §4.4 Timeline | how it runs |
| 6 | §4.5 Prerequisites | what it costs you in effort |
| 7 | §4.6 Disclaimer | what it is not |
| 8 | §4.9 mid CTA band | act |
| 9 | §4.5.1 What usually follows | where it leads |
| 10 | §4.8 FAQ | objections |
| 11 | §4.9 final CTA band | act |

Three properties of that order are deliberate. The offer is named before it is justified. The reader is told explicitly whether it applies to them rather than inferring it from two cards. And the boundaries arrive **before** the first ask rather than after it, which reads as candour rather than backpedalling.

The numbering below is historical and no longer matches the rendered order; the table above governs.

### 4.1 Hero

**Fenced-copy amendment, 2026-09-23.** The v1.0 headline was an outcome claim with a number in it; the replacement says what the thing is, which is what a reader opening a cold-email link on a phone needs in the first five seconds. The subhead lost a clause, lost "assess" twice over (the headline already opens with it), and lost "compliant data models", which attributed a conformance property to an artifact and collided with §3 rule 3. The owner's wording, "the appropriate data models for your products and processes", is used: accurate, no conformance claim, and it tells the reader the mapping is specific to them.

```
headline: "Assess your readiness for the EU battery passport"

subhead: "What data your customers will require from you, how it maps to the
appropriate data models for your products and processes, where your systems
fall short today, and what to do about it."

meta: "Results in three weeks from kickoff. Remote, with one optional site
visit."

cta: "Book a 30-minute scoping call"
```

The `meta` line renders as body text beneath the subhead, in `--color-text-secondary`, above the CTA. Rule 9 applies.

**No price in the hero.** Pricing is per audience and per currency (§4.2.1), and a single hero figure would anchor one audience against the other's number. The panels immediately below carry it, which is also what makes them a routing device rather than decoration.

### 4.2 Two audience panels

Equal weight, side by side at 768px and above, stacked at 390px. Neither panel carries "recommended" or "most popular" styling, and the source order is A then B.

**Panel A**
```
eyebrow: "Your customer is asking"
title:   "You supply cells, electrodes or materials"
body:    "Your customer carries the passport obligation, not you. What they
carry it with is your data: composition, carbon footprint inputs, recycled
content, due diligence records, batch and lot identity. Suppliers who can
answer on day one keep the business. The ones who cannot get designed out
quietly, in the next sourcing round."
```

**Panel B**
```
eyebrow: "The obligation is yours"
title:   "You place batteries on the EU market"
body:    "From February 2027 every industrial, EV and LMT battery placed on
the EU market carries a passport, and the economic operator answers for it.
Most of the data it needs originates upstream, in companies you do not
control. The assessment tells you which of those data points you can
actually obtain, and which are structurally missing today."
```

The date in Panel B renders from `regulatoryDates.js` (the `battery-passport` entry), interpolated into the string. It MUST NOT be a literal in this file.

### 4.2.1 Pricing model

**Independent axes. Do not collapse them into one.** v1.0 tied currency to the audience panel, which broke on the single most valuable case: an EU-exporting Korean, Japanese or Chinese cell maker is simultaneously a cell manufacturer and an economic operator, and the two panels quoted that buyer effectively the same money for materially different work.

- **Axis 1, currency, follows the buyer's domicile and billing entity.** An ASEAN-domiciled buyer is quoted and invoiced in SGD from the Singapore entity, in the currency it budgets in. A buyer domiciled in the EU, or one that requires an EU-facing invoice, is quoted in EUR. Nothing about currency is derived from which panel the visitor read.
- **Axis 2, price, follows scope.** Three tiers, each existing in both currencies.
- **Axis 3, time, follows the first sale per tier (v1.2).** Each tier has a founding price, which applies until the first engagement letter in that tier is signed, and a standard price afterwards. §4.2.1.1 governs.

`PRICING` constant, owner-confirmed 22 Sep 2026:

| Tier | Scope | Founding SGD | Founding EUR | Standard SGD | Standard EUR |
|---|---|---|---|---|---|
| `component` | One material or component family, one site, one customer-facing data request. Active materials, electrodes, separator, electrolyte, cell housing. | **From 4,500** | **From 3,000** | **From 7,500** | **From 5,000** |
| `cell` | One reference cell or pack, its bill of materials, and the supplier tiers behind it. | **From 7,500** | **From 5,000** | **From 15,000** | **From 10,000** |
| `operator` | One reference product, multi-tier supplier map, the operator's own issuing path, and the incoming customer data requests it has to answer. | **From 15,000** | **From 10,000** | **From 25,000** | **From 16,000** |

Shape: per tier, `founding: { SGD, EUR }`, `standard: { SGD, EUR }` and a boolean `foundingOpen`, all `true` at launch. A single selector returns each tier's **current** price: `founding` while `foundingOpen` is true, `standard` otherwise. **Every consumer on the site (panels, FAQ, `seoMeta.js`, `structuredData.js`) reads the current price through that selector.** No consumer reads `founding` or `standard` directly, and no price is typed as a literal anywhere outside `PRICING`.

**Why tier `operator` sits clearly above `cell`, rather than at par.** The economic operator carries the Article 77 exposure, works to a fixed external date it cannot move, and holds the largest budget of the three. v1.0 priced that party at par with a cell maker doing a narrower piece of work. The tier with the most at stake and the most willingness to pay MUST NOT be the cheapest line on the page in its own currency.

**Mixed state, accepted (v1.2):** if tier `cell` has flipped to standard while tier `operator` is still at its founding price, both EUR figures stand at 10,000. This is transient, it ends with the operator tier's first contract, and the panels show the two tiers in different currencies, so the page never places them side by side.

**Panel price blocks.** Each panel renders the tiers relevant to its audience, in the currency that audience most commonly budgets in. This is a display default, not the quoting rule: the engagement letter follows domicile per axis 1.

**Panel A** (values shown are the launch state, all tiers at founding price)
```
"From SGD {component.SGD} for a single component family.
From SGD {cell.SGD} for a cell or a pack, including the suppliers behind it."

renders at launch as:
"From SGD 4,500 for a single component family.
From SGD 7,500 for a cell or a pack, including the suppliers behind it."
```

**Panel B**
```
"From EUR {operator.EUR} for a reference product, the supplier tiers behind
it, and the data requests your customers are already sending you."

renders at launch as:
"From EUR 10,000 for a reference product, the supplier tiers behind it, and
the data requests your customers are already sending you."
```

The `{tier.CURRENCY}` placeholders are interpolated from the current price selector. The fenced copy holds the placeholders, never the figures.

Five normative rules attach:

1. **These are independently set list prices, not conversions.** The code MUST NOT compute one currency from another, MUST NOT call any FX API, and MUST NOT display an "approximately" equivalent. Each figure is a literal in `PRICING` and moves only when the owner changes it.
2. **`PRICING` carries a `REVIEWED_AS_OF` date**, on the `regulatoryDates.js` pattern, and §8 gains an owner obligation to re-check the ladders against each other when EUR/SGD moves materially. Two ladders set independently will drift; the review is what keeps the drift deliberate.
3. **Currencies render as codes, never symbols:** `SGD`, `EUR`. No `€`, no `S$`. Keeps the corpus ASCII-clean and avoids symbol-rendering paths the site has never been tested against.
4. **A visitor is never shown both currencies for the same tier.** No toggle, no dual display, no "or local equivalent". The rendered panel shows one currency.
5. **No price appears above the fold** and none appears on `/services` (§2.3). A price is the second question, not the first.

### 4.2.1.1 First client prices: founding terms stay off the page

**Owner decision, 22 Sep 2026.** The first signed client in each tier pays that tier's founding price (§4.2.1). The page shows the founding price as the tier's price. **At launch every visitor therefore sees EUR 3,000 / 5,000 / 10,000 and SGD 4,500 / 7,500 / 15,000, never the standard prices, until that tier's first contract is signed and the tier flips.** The page does not say that the price is introductory, that it is reserved for a first client, or that it will rise. v1.1's "Founding client places" block is removed from the page and from `readinessAssessmentContent.js`.

Six rules:

1. **No qualifier on the page.** The page subtree MUST NOT contain `founding`, `introductory`, `cohort`, `early bird`, `launch price`, `launch offer`, `limited offer` or `limited places` (case insensitive; phrases rather than bare words, because §4.3's fenced copy legitimately says "product launches"), and MUST NOT show the standard price struck through beside the founding price. Tier-1 §8 item 9.
2. **No scarcity device.** No countdown, no number of remaining places, no "this month only". Kept from v1.1: a fabricated counter would damage the credibility the rest of the page is built to establish.
3. **The founding terms live in the scoping call and the engagement letter, never on the page.** The owner explains on the scoping call, before any proposal is sent, that the displayed price is financed by two things the client gives in return: a named reference once the work is delivered, and one introduction to a customer or supplier in the client's chain. The proposal and the engagement letter show the standard price, a founding discount down to the displayed price, and the founding client clause the discount is conditional on. **If the client declines the clause, the discount does not apply and the standard price is due.** The clause is a contractual term, not a marketing line.
4. **Tiers flip independently.** When the first engagement letter in a tier is signed, the owner sets that tier's `foundingOpen` to false the same week. The page then renders the standard price for that tier. The flip is a one line change to the flag and a normal deploy; nothing else in the code changes.
5. **Accepted risk, recorded.** v1.1 put a stated reason beside the low price because published guidance puts a small consumer goods brand's **entire** first year passport spend at roughly EUR 2,500 to 10,000, and a component price inside that band, with no reason given, invites a procurement officer to file Ichnos alongside consumer passport SaaS onboarding. The owner accepts that risk for the first sale in each tier. It ends when the tier flips.
6. **Transition cases, owner rulings of 22 Sep 2026.** (a) Every engagement letter issued at the founding price carries the founding clause. A second client in the same tier who signs at the founding price before the owner flips the flag gets the founding price on the same conditions as the first: reference and introduction. (b) After the flip, new letters are issued at the standard price. (c) A client who declines the clause pays the standard price (rule 3).

### 4.2.0 Who this applies to (v1.12, new)

Renders **between the window and the audience panels**, and nowhere else. It exists to make the two panels a routing device rather than decoration: without it the reader meets two cards with no instruction and has to infer that they are meant to self-sort into one. Naming both parties and saying the work differs is also what makes the price difference legible one section later.

**Owner wording, 2026-09-23 (second pass).** "Who this applies to" left "this" ambiguous on a page that has both an assessment and a regulation in view. The heading now names the assessment. The body also does something the first version did not: it says what Ichnos does about it, and states the preference for working along one value chain rather than picking off either end.

```
heading: "To whom this assessment applies"

body: "The passport obligation sits with the economic operator who places the
battery on the EU market, and the data come from its value chain. Ichnos works
with both, ideally along the same value chain."
```

Normative constraints:

- **No price and no date.** The panels immediately below carry every figure on the page and Panel B carries the only passport date. A figure here would duplicate one; a date here would fail §8 item 7.
- The section is a heading and one paragraph. It MUST NOT grow into a third audience card.

### 4.2.2 The window

Renders **immediately after the hero and before §4.2.0**, reordered by owner amendment 2026-09-23. The page now reads what it is, why now, who it applies to.

**Fenced-copy amendment, 2026-09-23.** The v1.0 copy was replaced wholesale. It was abstract where it needed to be concrete, and it was written from Q4 2026 in language that could not survive the calendar: "the fourth quarter", "the new year", "This is the last quarter in which finding out is still useful." The heading was a question about a date the section never stated.

The replacement states the mechanism instead of the mood: data has to travel up the chain and be aggregated before the finished battery carries a passport, so suppliers are needed earlier than the deadline suggests. The closing line states a **consequence of starting later** rather than naming a quarter, so it stays true without maintenance.

**Fenced-copy amendment, 2026-09-23 (second pass).** The v1.12 heading was a slogan rather than a claim, and it made the reader do the work of extracting the point. The heading now states the obligation directly. The body loses its closing clause, because the heading now carries it. The closing line names the consequence that actually bites: the customer is left filling the gaps, and what they fill them with may not hold up.

```
heading: "Suppliers must be data ready well in advance of the mandated
passport date"

body: "By the time the EU battery passport is mandatory, every supplier must
already have provided the data for the batteries entering the EU market. Data
from all suppliers is aggregated into the passport of a finished battery."

closing: "Starting later leaves your customer with the obligation to fill the
gaps, in ways which might not pass an audit."
```

**Note on "audit".** §4.6 says the assessment "is not a certification, an audit or a conformity assessment". The two uses do not collide: §4.6 is about what Ichnos performs, this line is about third-party scrutiny of the client's data. Keep them distinguishable. This section must never describe Ichnos as auditing anything.

Normative constraints:

- **No date renders here, and no token.** The section states no year, no quarter and no month. §8 item 7(b) now sweeps the whole page, so a year here fails, and `AssessmentWindow.test.jsx` independently bars both `\d{4}` and any `{` token in the constant. The owner's draft ended "Q4 of 2026 is the last quarter to realistically meet the deadline"; that would have failed both guards and gone false on 1 January 2027.
- The copy MUST NOT state a due diligence or carbon-footprint deadline. Due diligence is deferred to 18 August 2027 by Reg. (EU) 2025/1561 and the CFP delegated act is not adopted. This section speaks only to the passport obligation.
- No countdown timer, no animated clock, no "days remaining" component.
- **This copy no longer goes stale on its own.** Owner item §11.13 stays, because a quarterly read is still cheap insurance, but the specific liability it was written for is gone.

### 4.3 Scope of the assessment

Four deliverables, rendered as a grid, 2x2 at desktop, single column at 390px.

**Heading added 2026-09-23: `Scope of the assessment`.** v1.0 fenced no heading here, so the grid arrived with no label and the reader had to infer that four cards were the deliverable list. `ASSESSMENT_DELIVERABLES` reshapes from a bare array to `{ heading, items }`.

**Fenced-copy amendment, 2026-09-23 (September fixes P2).** Item 2's closing clause is replaced. The retired sentence was "Not every gap is worth closing this year, and the report says which ones are not." It is a relative calendar phrase: it goes false on a calendar that nothing in the toolchain watches, and it passed the §8 item 7 guard only because that guard looked for dates rather than relative phrases. The replacement states the same ranking without naming a period, and the guard is widened in the same commit to catch the class.

```
1. "Data point register"
   "Every data point the passport requires for your product category, mapped
   to the system, department or supplier that holds it today. The ones nobody
   holds are marked as such."

2. "Gap analysis with severity"
   "Each missing or unusable data point rated by what it blocks: passport
   issuance, a customer's footprint calculation, a due diligence answer, or
   nothing yet. The report says which gaps to close first and which can
   wait."

3. "Supplier data map"
   "For each gap that originates outside your company, which tier it sits in,
   which of your suppliers holds it, and what to ask them for. Written as a
   request you can forward."

4. "Sequenced remediation plan"
   "What to fix in-house, what to ask suppliers for, what needs a system
   change, and what can wait, ordered against your own product launches.
   Effort and owner per item, with no vendor lock-in assumed."
```

**Note for the implementer:** no deliverable states a count of data points. The published counts differ by source and are still moving, and a hardcoded number is a claim that goes stale. Do not add one.

### 4.4 Timeline

**Heading added 2026-09-23: `Timeline`.** `ASSESSMENT_PROCESS` reshapes to `{ heading, steps }`.

Three steps. **A new `molecules/ProcessSteps.jsx`**, not the pivot-4 `RegulatoryTimeline`: that organism is date-driven, renders from `regulatoryDates.js`, and carries deferred-state semantics that mean nothing here. Reusing it would couple a sales sequence to the regulatory-date single source. Build the small one.

```
Week 1: "Intake and scoping"
"One workshop with your quality, IT and procurement leads. We take your
product structure, your existing data systems, and one real product as the
reference case."

Week 2: "Mapping and gap analysis"
"We map the reference product against the regulation's data requirements and
the published data models the European supply chain is converging on, and
interview your systems owners wherever the data is ambiguous."

Week 3: "Report and walkthrough"
"You get the written report and a two-hour walkthrough with your team,
including the supplier requests you can send the following week."
```

### 4.5 Prerequisites

```
"One named owner, and roughly three days of their time across the three weeks."
"One reference product, ideally the one with your highest EU exposure."
"Read access to the systems holding your production and quality data, or a
structured export."
"Your bill of materials at the level you already maintain it. We do not need
recipes, formulations or anything you treat as a trade secret."
```

**Heading added 2026-09-23: `Prerequisites`.** `ASSESSMENT_INPUTS` reshapes to `{ heading, lines }`.

The last line is load-bearing. IP exposure is the first objection an Asian component supplier raises, and answering it before the call is a large part of what this page is for.

### 4.5.1 What happens next

v1.0 ended the page at the report. That is a commercial error: the assessment is priced as an entry product and an entry product only works if the buyer can see where the road goes. A reader who cannot see the road reads a one-off study and prices it accordingly.

**Name the path. Do not price it.** Pricing implementation on this page turns a conversion surface into a catalogue and invites a comparison the reader is not ready to make.

```
heading: "What usually follows"

body: "The report is designed to be useful on its own, including to a team
that takes it and acts without us. Where clients continue, it is usually one
of three ways: closing the data gaps with your own systems team and your
suppliers, standing up the exchange infrastructure so your customers can pull
what they need, or running that infrastructure as a hosted service:
EU-hosted, operated by Ichnos. Which of those makes sense is a conclusion
of the assessment, not a precondition for it."

link: "See the full service list"   → /services
```

Claim discipline: the third option is the M4 hosting architecture and MUST use the fenced wording from pivot-4 §1, `EU-hosted, operated by Ichnos`. **Fenced-copy amendment, 2026-09-23 (v1.11):** the sentence read `a hosted service on EU servers operated by us` from v1.0, which contradicted this paragraph and §3 rule 7 one line below it. The fenced copy now carries the required construction verbatim. This was a defect in the spec, not in the implementation, which correctly preserved the fenced string it was given. Never `certified`, `TISAX`, `compliant servers`. The first option explicitly includes the client proceeding **without** Ichnos, which is both true and the reason the paragraph is credible.

### 4.6 What it is not, headed "Disclaimer" (v1.12)

A scope boundary, rendered in a quieter treatment than the deliverables. It builds trust and it discharges claim rules 3 and 6 in visible copy.

**Amendment, 2026-09-23: the section gains the heading `Disclaimer`.** The four lines each open "It is not", and without a heading the reader has to work out what they are reading partway through the second one. The heading sets the expectation first and reads as professional caution rather than defensiveness. It is a heading **only**: it must never grow body copy that softens or qualifies the four lines beneath it, every one of which is load-bearing.

```
"It is not a certification, an audit or a conformity assessment. No notified
body role is implied and none is performed."

"It is not a life cycle assessment. Where footprint data is in scope, we
prepare the data exchange so your LCA partner sets up the PCF digital twin."

"It is not a software purchase. The report stands on its own and names what
you would need, including options that are not ours."

"It is not a passport. Issuing one is the work that follows, if you decide to
do it."
```

### 4.7 Who runs it, and 4.7.1 Published work: both REMOVED (v1.12)

**Owner decision, 2026-09-23.** Both sections are deleted from the page. `ASSESSMENT_AUTHOR` and `ASSESSMENT_PUBLISHED_WORK` are gone from `readinessAssessmentContent.js`, and `AssessmentAuthor.jsx` and `PublishedWork.jsx` are deleted.

**§4.7, the author line, was genuine duplication.** Every fact in it appears on at least two other surfaces, and three of the four reach the reader through the **global footer, which renders on this very page**: Catena-X Qualified Advisor, the Digital Product Passport expert group and the PEM RWTH Aachen / FEV background all sit in `FooterRecognitions`. The name, the doctorate and the career detail are on `/team` and in the Organization JSON-LD that every page emits. Removing the paragraph costs the reader nothing they cannot see by scrolling.

**§4.7.1, the published work, was not duplication, and its removal has a cost.** Verified against `client/src` on 2026-09-23: the International Battery Summit talk, the CX-0160 standard request, the PCF Interoperability expert group membership, the gap analysis against published supplier-side data models and the component-level aspect models existed **nowhere else in the codebase**. They now exist nowhere on the site. Only the "Digital Product Passport expert group" half of one item was carried elsewhere.

The owner was told this before deciding and chose deletion without relocation. Recorded here rather than lost, because:

1. **§1's premise changes.** It read "the credibility carriers are the credential line (§4.7), the published-work strip (§4.7.1) and the specificity of the deliverables (§4.3)". Two of the three are gone. What remains is the deliverables and the footer credentials, and §1 is amended to say so.
2. **Nothing in the toolchain will flag the absence.** No guard asserts these facts exist. Putting any of them back, here or on `/team`, is a fresh decision rather than a restoration.
3. **The differentiator §1 names is now unevidenced on the page.** §1 argues the page does not compete on explaining the regulation, and that the differentiators are data-space depth and standards participation. The standards-participation evidence was this list.

**The owner-gated membership sentence goes with it.** The "only Southeast Asian member of the Catena-X Association" line (v1.3 default: omit) has no section left to live in. If it is ever wanted, it needs a new home and the `VERIFIED_AS_OF` sibling that decision always required.

### 4.8 FAQ

**Heading added 2026-09-23: `FAQ`.** `ASSESSMENT_FAQ` reshapes to `{ heading, entries }`.

Native `<details>` / `<summary>`. **MUST NOT** be a JavaScript accordion: every answer must be present in the initial DOM for crawlers and for readers who never click.

```
Q: "Do we need to be in Catena-X for this?"
A: "No. The assessment is about your data, not about a platform. Catena-X
data models are used as the reference for how the data has to be shaped,
because they are the published ones the European supply chain is converging
on. If your route ends up elsewhere, MS 2818 in Malaysia or a customer's own
system, the same register and the same gap analysis still apply."

Q: "Our customer says our IMDS entry is enough. Is it?"
A: "It is not. IMDS was built for end-of-life vehicles and REACH. It carries
a small fraction of the passport's data points, at the wrong granularity,
with no time dimension and no access tiering. The assessment shows you
exactly which of your passport data points IMDS does and does not cover."

Q: "Will you see our recipes?"
A: "No. The assessment works at lot and batch identity level, and on the
properties your customers will be asked to report. Where a property would
expose a formulation, it is carried behind an identifier. Which data is
visible to whom is part of what the report specifies."

Q: "What does it cost, and what moves the number?"
A: "A single component family starts at SGD {component.SGD}. A cell or a pack,
with the suppliers behind it, starts at SGD {cell.SGD}. For a company placing
batteries on the EU market, where the assessment also covers your issuing path
and the data requests coming at you from customers, it starts at
EUR {operator.EUR}. The number moves with how many product families, sites
and source systems are in scope, and the scoping call fixes it before you
commit to anything."
```

The cost answer's `{tier.CURRENCY}` placeholders are interpolated from the current price selector (§4.2.1), exactly as in the panels. v1.1 held the figures as literals here, which would have gone stale at the first tier flip.

```

Q: "We are not in the EU. Does this apply to us?"
A: "The obligation sits with whoever places the battery on the EU market. If
that is your customer, the data still has to come from you, and the request
will arrive with a deadline attached. If you are the one placing it, the
obligation is directly yours."
```

### 4.9 CTA bands (two since v1.12)

**Fenced-copy amendment, 2026-09-23.** The v1.0 headline, "Thirty minutes is enough to tell you whether this is worth doing.", is **deleted**: it hedged, and invited the reader to conclude it might not be worth doing.

Two bands now, at the page's two highest-intent moments.

**Mid band**, after the disclaimer (§4.6), where the reader has the full picture and the boundaries have been stated. Its label changed on 2026-09-23: it repeated the hero's "Book a 30-minute scoping call" word for word, so the page asked for the same thing twice in the same words.

```
midHeadline:  "Find out what the passport will require of you."
midCtaLabel:  "Book an introductory call"
fallbackLabel: "Or send the question in writing"   → links to /contact
```

**Final band**, after the FAQ (§4.8), where the last objection has just been answered:

```
finalCtaLabel: "Book an introductory call"
```

The final band is a **button alone**: no headline, no fallback link. Nothing may compete with the action at the one moment the reader is most likely to take it, and a headline there would reintroduce the hedge this amendment removed. `CtaBand` omits the `h2` element rather than rendering it empty.

**Note on the label.** "Book an introductory call" trips the §4.2.1.1 rule 1 corpus sweep for `introductory`. That pattern was written against **pricing** qualifiers and is narrowed to the phrases it meant (`introductory price`, `introductory offer`, `introductory rate`) in both the constants test and the page test. The rule is unweakened: it still bars framing the price as introductory, which is what it exists for.

---

## 5. Components

| File | Kind | Note |
|---|---|---|
| `pages/ReadinessAssessmentPage.jsx` | page | Composition only. No copy literals. |
| `molecules/Breadcrumb.jsx` | new | Parent label and route from constants. |
| `molecules/BookingButton.jsx` | new, P0b | **Booking CTAs only.** The single implementation of "open the Google booking page": both bands on this page (§4.1, §4.9) and `BookingModal`'s body. Renders `BOOKING_URL` unchanged, with no appended parameters (§6.2), `target="_blank"`, `rel="noopener noreferrer"`. Each instance carries its own `data-testid`. **It is NOT used by the §2.3 entry points** (v1.8, see below). |
| `molecules/ProcessSteps.jsx` | new | §4.4. Not the regulatory timeline. |
| `organisms/AudiencePanels.jsx` | new | §4.2. |
| `organisms/DeliverablesGrid.jsx` | new | §4.3. |
| `organisms/ScopeBoundary.jsx` | new | §4.6. |
| `organisms/AssessmentAudience.jsx` | new, v1.12 | §4.2.0. Heading plus body, rendered immediately above `AudiencePanels` and nowhere else. Carries no price and no date: the panels below hold every figure and the only passport date, so an interpolation here fails the page guard. |
| `organisms/AssessmentFaq.jsx` | new | §4.8, `<details>` based. |
| `organisms/CtaBand.jsx` | new | §4.9. Renders a headline plus **an action passed in by its parent**, not a hardcoded `BookingButton`. On this page the action is a `BookingButton`; on the passport page in P7 it is a router `Link` to `ROUTE_READINESS_ASSESSMENT`. One band, two destinations, per the open/closed rule in CLAUDE.md §4.2. |

Two files outside this page change shape in **P0**, ahead of everything above (§6.6):

| File | Kind | Note |
|---|---|---|
| `constants/routes.js` | new, P2a | §2.1. Only place in `client/src` where a route literal may appear. |
| `organisms/BookingModal.jsx` | renamed, P0b | Was `CalendlyModal.jsx`. Keeps the Bootstrap `Modal` shell and the `{ isOpen, onClose }` contract, drops `react-calendly` and `VITE_CALENDLY_URL`, and renders `BookingButton` in the body. Its two call sites (`ContactForm`, `ContactPage`) update in the same commit, along with `CalendlyModal.test.jsx` → `BookingModal.test.jsx`. |

**`BookingButton` never points at the §2.3 entry points (v1.8).** v1.3's component table said it was "used by both bands and by the §2.3 entry points", and that sentence would have produced wrong tickets. The §2.3 entry points are internal navigation **to** `/passport/readiness-assessment`: a CTA band on the passport page, a text link on a `/services` card, a text link in the landing teaser. A visitor clicking "Data readiness assessment" on `/services` must land on the page, not on Google Calendar. The two concepts are:

| Concept | Component | Destination |
|---|---|---|
| Booking CTA | `BookingButton` | `BOOKING_URL`, new tab |
| Entry point | router `Link` to `ROUTE_READINESS_ASSESSMENT` | The page, same tab |

No third component is needed. The services and landing entry points are plain text links (§2.3 forbids a second button in the landing teaser), and the passport entry point is a `CtaBand` whose action is a `Link` styled as a button.

**`BookingButton` is built in P0b, not P3 (v1.6).** v1.4 had P0b ship an inline link-out and P3 rewrite that body onto `BookingButton` two phases later, which meant touching one file twice with P1 and P2 in between and running a second CTA implementation in the meantime. The button depends only on `BOOKING_URL` and on nothing in P1, P2 or the new page, so there is no reason it cannot be born with its first consumer. `BookingModal` renders it from the start, and P3 does not touch either file.

**Deleted in v1.12:** `organisms/AssessmentAuthor.jsx` and `organisms/PublishedWork.jsx`, with their tests (§4.7).

**`CtaBand` takes an optional headline since v1.12.** The page ends on a band that is a button alone, so the `h2` is omitted rather than emptied: an empty heading still occupies heading space and lands in the accessibility tree as a nameless heading. The passport page's use of the band is unaffected.

Every new class ships with its CSS rule in the same commit (pivot-4 rule ii). The new page reuses `.section-eyebrow` and MUST NOT apply `text-transform: uppercase` to it (pivot-4 rule iii: the class can contain `Catena-X`, whose casing CSS must not rewrite).

---

## 6. CTA mechanics

### 6.1 Link-out, not embed

The booking CTA is an anchor to the Google Calendar appointment schedule booking page, `target="_blank"`, `rel="noopener noreferrer"`.

**Rejected: an embedded calendar widget, including the inline booking page and the booking button script that Google Calendar offers under the schedule's share options.** It adds a third-party script and an iframe to the one page whose conversion depends on nothing going wrong, changes the cookie and privacy posture, and introduces a layout risk at 390px that the manual matrix would have to police forever. The link-out costs one click and zero dependencies. An embed may be revisited once the page has produced bookings and the friction is measured rather than assumed.

### 6.2 Single source, no attribution parameters

- `BOOKING_URL` is a single constant holding the booking page link exactly as Google Calendar gives it under the schedule's share link (a `https://calendar.app.google/...` short link, or the long `https://calendar.google.com/calendar/appointments/schedules/...` form). Every CTA on the site imports it. Zero hardcoded scheduling URLs. **Value, set by the owner on 22 Sep 2026: `https://calendar.app.google/5AE4mhXGnPj2GutF7`.** It lands in **P0**, not P1, because P0's migration needs it (§6.6).
- **`BOOKING_URL` is a source constant, not an environment variable** (v1.4). It lives in `client/src/constants/companyInfo.js` beside `CONTACT_INFO`, because it is public, identical in every environment, and needed at render time by components a test mounts directly. The Calendly link was an env var (`VITE_CALENDLY_URL`, plus an undocumented-in-code `CALENDLY_LINK`) and that bought nothing but a CI stub, a Vercel setting and two lines of documentation to keep in sync. Both variables are deleted in P0 (§6.7).
- **No source parameters are appended.** v1.1 appended `?src=` values for attribution through Calendly's UTM passthrough. Google appointment schedules do not record URL parameters on the booking, so the parameters would be dead code that the tests then protect. They are removed. `BookingButton` renders `BOOKING_URL` exactly and takes no `src` prop.
- **One name, not two (v1.8).** Every consumer imports `BOOKING_URL` directly: `Footer`, `ContactSection`, `BookingButton`, `BookingModal`. There is no `CONTACT_INFO.booking` pass-through. v1.4's §6.6 row 8 created one and rows 9 and 11 then bypassed it, which is the kind of two-names-one-value ambiguity that produces a wrong ticket. `CONTACT_INFO` holds contact coordinates the site displays as contact details; the booking link is an action target that four components use, only two of which are contact surfaces. `ContactSection` importing both constants is not a smell. Deleting the key outright also keeps the safety property recorded in the risk analysis: `Footer.test.jsx` and `ContactSection.test.jsx` assert by imported constant, so a missed call site yields `undefined`, React omits the `href`, the element loses its `link` role, and the test fails loudly rather than silently.
- **Attribution moves to the call.** At the booking volume the page can produce (§12), the owner asks on the scoping call how the prospect found the page and records the answer in the pipeline record. If attribution later needs to be systematic, the options are a fifth, optional booking form question or an analytics dependency. Either is a separate decision, not a Traycer judgement call.
- **Calendly leaves the codebase, and the site, and the paperwork.** v1.3 wrote this as a one-line guard widening. It is a sub-project: §6.6 inventories the code, §6.7 the legal and configuration documents, and §9 gives both a phase (**P0**). `[Cc]alendly` joins `FORBIDDEN` in that same commit, which is the commit that deletes its last live occurrence under `client/src`.

### 6.3 Fallback

Beneath the primary button on both bands, a plain text link to `/contact` (§4.9 `fallback`). It is deliberately quieter than the button: the decision was calendar-primary, and two equal-weight options on one page lowers conversion on both.

### 6.4 No email capture

This page has no form, no newsletter field and no gated download. The only conversion is the booked call.

### 6.5 Google Calendar appointment schedule configuration

The scheduling tool is a **Google Calendar appointment schedule** in the Ichnos Google Workspace account. Business Standard includes every appointment schedule feature this section relies on, including checking availability across several calendars, so there is no additional subscription. The following is owner-configured, not implemented in code, but it is specified here because the page's conversion rate depends on it as much as on the copy.

**Why Google and not Calendly (recorded 22 Sep 2026):** no extra cost on top of the existing Workspace plan; bookings land directly in the Ichnos calendar with a Google Meet link; prospects' booking data is processed by one vendor instead of two; and the personal calendar can block slots through calendar sharing, which the Calendly free plan cannot do (one connected calendar only). **Accepted loss:** Google records no source parameters, so booking attribution moves to the call (§6.2).

**Created in the Ichnos Workspace account, never in the personal Gmail account.** The schedule, its bookings and the Meet links belong to the company, and the confirmation mail the prospect receives comes from the Ichnos identity.

| Setting | Value | Why |
|---|---|---|
| Title | `Meeting with Francesco (Ichnos Protocol)` (owner setting, 22 Sep 2026) | Names the person and the company, so the calendar entry and the confirmation mail tell the invitee who the meeting is with. |
| Duration | 30 minutes | Matches the page copy. If the copy and the schedule disagree, the copy is wrong, not the schedule. |
| General availability | Monday to Friday, 10:00 to 18:00 Kuala Lumpur time, repeating weekly (owner setting, 22 Sep 2026) | Covers ASEAN, China and Korea business hours. 15:00 to 18:00 Kuala Lumpur is 08:00 to 11:00 in Central Europe in winter and 09:00 to 12:00 in summer, so European prospects still get morning slots. |
| Schedule time zone | Kuala Lumpur | The owner's working day. The booking page presents slots to the visitor; the §8 test booking confirms a visitor in another time zone sees the correct local times. The buyer population spans Jakarta, Seoul, Shenzhen and Central Europe, and a time zone error is a lost call that never reports itself. |
| Scheduling window | Bookable up to 60 days ahead; minimum notice 24 hours (owner setting, 22 Sep 2026) | The minimum notice guarantees the owner reads the screening answers before the call. |
| Buffer time | 15 minutes between appointments | Scoping calls run over when they are going well. |
| Maximum bookings per day | Two or three | The page exists to fill a calendar, not to shred the modelling and standards work that the offer is built on. |
| Check availability | The Ichnos primary calendar **and** the owner's personal Gmail calendar | A personal commitment must remove the slot from the booking page. See the setup note below. |
| Location / conferencing | Google Meet | Created automatically on each booking. No separate video tool. |
| Payment | Off | A booking fee filters hard, and filtering is what you do when demand exceeds delivery capacity. That is not the current condition. Revisit when the calendar is full. |
| Email verification | Off at launch | The page's traffic is prospects reached by outbound email, so spam bookings are unlikely, and a verification code is one more step on a phone. Turn it on if spam bookings appear. |
| Booking confirmation and reminders | Confirmation on; email reminders at 24 hours and 1 hour before | Reduces no shows across time zones. Google does not allow editing the reminder text, which is acceptable. |

**Setup note, personal calendar.** A calendar only appears in the schedule's availability list if the Ichnos account is subscribed to it, so the personal calendar has to be shared into the Ichnos account first. All steps on a computer at calendar.google.com; the phone app does not have these settings.

1. **Personal Gmail account:** Settings, then under "Settings for my calendars" the personal calendar, then "Share with specific people or groups", "Add people and groups", the Ichnos address, permission **"See all event details"**, Send. Google does not document whether a free/busy only share is accepted for availability checking; "See all event details" is the setting that works. The share stays read only, and the Workspace account never gets edit rights on the personal calendar.
2. **Ichnos account:** open the invitation email and click "Add this calendar", or in Google Calendar next to "Other calendars" click +, "Subscribe to calendar", and enter the personal Gmail address. The personal calendar now appears under "Other calendars".
3. **Ichnos account:** open the appointment schedule, "Edit appointment schedule", open the **Calendars** section, turn on "Check calendars for availability" and tick the personal calendar next to the Ichnos calendar. Save.
4. **Verify:** place a test event in the personal calendar and confirm the matching slot disappears from the booking page.

If the personal calendar still does not appear in step 3: confirm the schedule sits on the Ichnos **primary** calendar (Google notes that a schedule created on a shared calendar may not allow other calendars to be checked), and that the account shown top right in Google Calendar is the Ichnos account, not the personal one.

**Booking form: first name, last name and email are Google's fixed fields. Add the four screening questions below as additional items, each marked required:**

```
1. "Company and your role"
2. "What do you make: cells, packs, electrodes, active materials,
    components, or something else"
3. "Do you, or your customer, place batteries on the EU market?"
4. "What prompted this: a customer request, a tender, an internal
    programme, or general preparation?"
```

They do two jobs. They qualify the call before it happens, and they arrive as preparation material, so the owner opens a scoping call already knowing which tier applies and which of the two audience panels the buyer belongs to. Question 3 determines the tier on the spot. Question 4 distinguishes a live commercial trigger from research, which is the difference between a deal and a pleasant conversation.

### 6.6 Calendly to Google migration (v1.4, new)

**Owner decision, 22 Sep 2026: full migration, in scope, this epic.** Every Calendly reference on the site becomes a Google appointment-schedule reference, the modal is renamed and adapted, the dependency is removed, and the orphaned references go with them. This is **P0**, and it lands before any readiness-assessment file.

**Why it is not a follow-up.** §6.2 makes `BOOKING_URL` the single source for every booking CTA on the site. Shipping the new page while `/contact` still opens a Calendly embed would put two live booking links in front of the same prospect, pointing at two calendars with two different configurations, one of which (§11 item 1) the owner is about to cancel. A cancelled Calendly account behind a live button on `/contact` is a broken conversion path on the page the new CTAs fall back to (§6.3).

**Inventory, verified 22 Sep 2026. Fourteen files, one dependency.**

| # | File | Change |
|---|---|---|
| 1 | `client/package.json` | Delete the `react-calendly` dependency. `package-lock.json` regenerates in the same commit. |
| 2 | `client/src/components/organisms/CalendlyModal.jsx` | **Rename to `BookingModal.jsx`.** Keep the `react-bootstrap` `Modal` shell, the `{ isOpen, onClose }` prop contract and the visible title `Schedule a Call`. Delete the `InlineWidget` import and the `VITE_CALENDLY_URL` read. The body becomes one line of copy plus a link-out to `BOOKING_URL`, `target="_blank"`, `rel="noopener noreferrer"`. The `CALENDLY_URL ? … : …` fallback branch disappears with the env var: `BOOKING_URL` is a source constant and cannot be absent. |
| 3 | `client/src/components/organisms/CalendlyModal.test.jsx` | Rename to `BookingModal.test.jsx`. Assert the rendered href equals the imported `BOOKING_URL` exactly, per §8 item 4. Drop the missing-env-var branch test. |
| 4 | `client/src/components/organisms/ContactForm.jsx` | Import `BookingModal`. Rename local state `calendlyOpen` → `bookingOpen`. `onBook` keeps its name: it is already tool-neutral. |
| 5 | `client/src/components/organisms/ContactForm.test.jsx` | Follow the rename. |
| 6 | `client/src/components/pages/ContactPage.jsx` | Import `BookingModal`; rename `calendlyOpen` → `bookingOpen`. **`CONTACT_PAGE_INTRO` is user-visible copy and names Calendly** (`…follow up by email, LinkedIn, or a Calendly call`). It becomes `…or a scheduled call`. Naming the scheduling vendor in body copy bought nothing and is exactly the kind of line that rots on a tooling change. The `Schedule a call` button label is unchanged, so the e2e role selector holds. |
| 7 | `client/src/components/pages/ContactPage.test.jsx` | Follow the rename and the copy change. |
| 8 | `client/src/constants/companyInfo.js` | Add `export const BOOKING_URL` (§6.2). **Delete `CONTACT_INFO.calendly` outright; do not replace it with a `booking` alias (v1.8).** `CONTACT_INFO` keeps `email`, `linkedInCompany` and `linkedInFounder`. See §6.2's "one name" rule below. |
| 9 | `client/src/components/organisms/Footer.jsx` | `SOCIAL_LINKS` booking entry: url → imported `BOOKING_URL`, **icon `calendar-event` → `google`**. Label `Book a Meeting` unchanged. |
| 10 | `client/src/components/organisms/Footer.test.jsx` | Follow. Assert the href against the imported constant, never a literal (§0.6). |
| 11 | `client/src/components/organisms/ContactSection.jsx` | Booking `ContactLink`: href → imported `BOOKING_URL` (the component imports both `CONTACT_INFO` and `BOOKING_URL`; that is fine), **icon `calendar-event` → `google`**. Label `Book a Call` unchanged. |
| 12 | `client/src/components/organisms/ContactSection.test.jsx` | Follow. |
| 13 | `client/src/constants/vocabulary.js` | Add the `[Cc]alendly` and `react-calendly` patterns to `FORBIDDEN` (§8 tier-2). Green only once rows 1 to 12 have landed, which is why this is one commit. |
| 14 | `e2e/tests/pages/ContactPage.js` | The section comment names the Calendly modal. Update the comment. **No selector changes**: every locator is a role or test-id whose name this migration does not move, which is the §0.6 rule paying for itself. |

**The icon.** The owner's instruction is that the Calendly icon becomes the corresponding Google icon. Recorded honestly: the current glyph is `bi-calendar-event`, a generic calendar, not a Calendly brand mark, and **Bootstrap Icons ships no Google Calendar glyph**. The closest available mark is `bi-google`, the Google `G`, and that is what both call sites use. It reads correctly in the footer social row, where its neighbours (`bi-linkedin`, `bi-person-circle`) are also brand marks. If the `G` beside `Book a Meeting` reads as a sign-in affordance at the §8 item 16 three-viewport review, revert both call sites to `calendar-event` and record the reason here; that is a copy-and-icon judgement for the owner at review, not a Traycer decision.

**Rejected, recorded.** Embedding the Google appointment schedule in `BookingModal` via its script-free `<iframe>` share option. It would preserve the current in-modal flow and add no npm dependency, but §6.1 rejects embeds on the new page for cookie-posture and 390px layout reasons, and running an embed on `/contact` while the new page link-outs would give the site two different booking experiences to test and police. One mechanism, everywhere. Revisit with §6.1.

**Historical specification documents are records and are NOT rewritten.** `website_Catena_pivot_3.md`, `ichnos_website_CatenaX_pivot_spec_v3.md`, `newDesignEpic.md`, `designRefinementEpic.md`, `deploymentMigrationValidation.md` and `IBS2026_consortium_cta_spec.md` each mention Calendly as a statement about what was true when they were written. Editing them would falsify the record. They are outside the `FORBIDDEN` walk, which covers `client/src` plus `index.html` and `site.webmanifest` only, so they cannot turn the guard red. One of them carries an owner consequence rather than an edit: §11 item 9.

#### 6.6.1 Rollback, and the window that closes it (v1.8)

Rollback of the booking migration is time-limited, and the limit is not a code fact. Stated plainly because the two halves need different instructions:

**Before the owner cancels Calendly (§11.9c): revert P0b and P0c as a pair.** P0c's guard is green only because P0b landed, and P0c's GDPR edits describe P0b's world, so reverting one without the other leaves either a red corpus scan or a register describing a processor the site does not use.

**To keep that window real, `VITE_CALENDLY_URL` stays in Vercel until the decommission.** P0c deletes the `ci.yml` stub line and the two rows in `VERCEL_SETTINGS.md`, because those are documentation and CI scaffolding. It does **not** touch the live Vercel project settings. Deleting the variable while a revert is still plausible is what turns a clean revert into a broken one: the reverted `CalendlyModal` reads `import.meta.env.VITE_CALENDLY_URL`, and with the variable gone it falls through to its generic `https://calendly.com` fallback branch, which is a working-looking link to nobody's calendar. The variable is unread by the new code, so leaving it costs nothing.

**After cancellation: roll forward only.** Once the Calendly account is gone, reverting P0b restores code pointing at a scheduler that no longer exists. Restoring the environment variable does not help, because the variable was never the thing that broke. From that point the only correct response to a booking defect is to fix `BOOKING_URL` or the Google schedule. §11.9 already sequences deploy → verify → delete variables → cancel; this section says what each step costs you.

**The gate between them is §8 manual item 26**, the six-click walk of every live booking CTA. Do not start §11.9(b) until it passes.

### 6.7 Legal and configuration documents (v1.4, new)

**Owner decision, 22 Sep 2026: in scope.** Removing a named sub-processor while the register still names it makes the register wrong, and a Record of Processing Activities that is wrong is worse than one that is merely out of date.

| File | Change | Who |
|---|---|---|
| `legal/GDPR/ropa.md` | The sub-processor register row `Calendly \| Meeting scheduling \| Name, email \| USA \| Calendly DPA \| SCCs` is replaced by a Google row for appointment scheduling. **Drafted, not settled:** service `Meeting scheduling (Google Calendar appointment schedules, Google Workspace)`; data processed `Name, email, and the four §6.5 screening answers entered by the visitor on the Google booking page`; DPA `Google Workspace Cloud Data Processing Addendum`. **Location and transfer mechanism are left as `[VERIFY — legal]`**, matching the file's existing `[VERIFY]` convention on the xAI row. The existing Firebase row records Google as `USA / SCCs`, so the honest options are a second Google row or a merged one; that is a lawyer's call, not a Traycer one. Add a Review Log entry. | Traycer drafts, owner and lawyer confirm |
| `legal/GDPR/cookie-policy.md` | The third-party table row `Calendly \| Meeting scheduling \| https://calendly.com/privacy` is replaced by `Google Calendar \| Meeting scheduling \| https://policies.google.com/privacy`. Lower risk than the ROPA row: it is a disclosure of which third parties the site links to, and the link-out design (§6.1) means the booking page sets its cookies on Google's origin, not ours. | Traycer |
| `VERCEL_SETTINGS.md` | Delete the `CALENDLY_LINK` row and the `VITE_CALENDLY_URL` row. Add no replacement: `BOOKING_URL` is a source constant (§6.2). | Traycer |
| `e2e/ENV_REFACTOR_PLAN.md` | Delete the `VITE_CALENDLY_LINK` row. | Traycer |
| `.github/workflows/ci.yml` | Delete the `VITE_CALENDLY_URL: https://calendly.com/ci-stub` line from the Build step's env block. It is the last live Calendly string outside `client/src`. | Traycer |
| `CLAUDE.md`, `AGENTS.md` | The 200-line file cap (§0.11). `CLAUDE.md` §5.1 "Max file length" and §17 item 6 "if a file approaches 120 lines"; `AGENTS.md` line 107. **Landed ahead of the run in `010d56a`.** | Done |
| `README.md` | **Added v1.5.** Pre-Commit Checklist line 590, "No files exceed 120 lines" → 200. The fourth and last statement of the cap. **Landed with v1.5.** | Done |

**Note on §0 permissions.** `CLAUDE.md` §17 lists root config, CI/CD and `CLAUDE.md` itself as requiring explicit confirmation even in automated mode. The owner gave that confirmation on 22 Sep 2026 for exactly the files in this table, and for nothing else. Any other root-level or CI file is still gated.

**Why `README.md` is inside that confirmation and not a new decision (v1.5).** The owner's ruling was that the cap is 200. `README.md` line 590 is a fourth copy of a number the owner has already changed in the other three places, and a checklist that tells a contributor to enforce 120 while `CLAUDE.md` says 200 is a defect in the ruling's application, not a second ruling. Correcting it completes the owner's decision rather than extending it. Recorded explicitly because §6.7's own note says the confirmation covers this table and nothing else, and this line is what adds it to the table.

---

## 7. SEO and structured data

### 7.1 `seoMeta.js`

```
title:       "Battery passport data readiness assessment | Ichnos Protocol"
description: "A three week, fixed scope assessment mapping EU battery passport
data requirements against the data your systems hold today, with a gap
analysis and a sequenced remediation plan. From SGD {lowest current SGD}."

renders at launch as "... From SGD 4,500."
```

The meta description carries the **lowest** list price only. A meta description is read by every segment at once, so it cannot carry the ladder without contradicting §4.2.1 rule 4, and the entry price is the one that earns the click. It is read through the current price selector, not typed, so it cannot go stale when a tier is repriced or flips from founding to standard.

Per pivot-3 §7.4 item 21, `seoMeta.js` and `structuredData.js` MUST NOT state contradictory status claims, and any claim both make uses identical wording imported from the shared constant.

### 7.2 `structuredData.js`

Two additions:

- A `Service` node: `provider` references the existing Organization node, `serviceType: "Regulatory data readiness assessment"`, `areaServed` covering the ASEAN markets already listed on the organization, and an `offers` array of **six** `Offer` nodes, one per tier-and-currency combination of the **current** price, each carrying a `PriceSpecification` with its own `minPrice` and `priceCurrency` and a `name` distinguishing the tier. Values are read through the current price selector (§4.2.1), never restated, so the markup changes with the page when a tier flips. The offer names MUST NOT carry founding or introductory wording (§4.2.1.1 rule 1). The node MUST NOT carry any certification, accreditation or `hasCredential` claim.

  Six offers is not a contradiction of §4.2.1 rule 4: that rule governs what a *visitor* is shown in the rendered panels. Structured data is a machine surface, and omitting real list prices from it would make the markup an inaccurate description of the service.

  **Recorded fallback:** if rich-result testing shows the six offers rendering as a single confusing aggregate range spanning two currencies, drop to the three EUR-denominated offers only and record the reason here. EUR is the currency of the regulated market and the internationally comparable one, so it is the correct survivor if only one ladder can be expressed.
- A `BreadcrumbList` node matching §2.4.

### 7.2.1 Splitting `structuredData.js` (v1.7)

The file is 224 lines today and grandfathered over the 200-line cap. P8 takes it past 260, which meets CLAUDE.md §5.1's trigger: split a grandfathered file when you are already changing it for another reason.

**Split in P8, not in P2a.** P2a touches four breadcrumb `path` entries in this file, a four-line mechanical change inside a 37-file mechanical pass. Dropping a structural refactor into that commit destroys the one property that makes P2a reviewable, and puts the phase's only genuinely structural edit where nobody is looking for it. P8 is already rewriting this file's contents and is the right place.

**The seam already exists.** `service()` and `SERVICE_SCHEMAS` occupy lines 110 to 167 as a self-contained block. Extract those plus P8's new `Service` and `Offer` builders into a sibling module, leaving `ORGANIZATION_SCHEMA`, `WEBSITE_SCHEMA`, the two person schemas, `breadcrumb()` and `PAGE_STRUCTURED_DATA` in place. Both files land under the cap. `PAGE_STRUCTURED_DATA` stays the single import surface for `SeoHead`, so no consumer changes.

**If the owner decides at P8 review that the split is riskier than the growth**, that is a legitimate call, and then the fallback is honesty rather than silence: update CLAUDE.md §5.1's grandfathered list with the real new number in the same commit. A cap with an unrecorded exception is how the cap stops meaning anything.

### 7.3 Sitemap

`client/public/sitemap.xml` gains one `<url>` entry, `https://ichnos-protocol.com/passport/readiness-assessment`, `changefreq monthly`, `priority 0.9` (it matches `/services` and `/consortium`, the site's other conversion surfaces, and outranks `/passport` at 0.8 only if the owner says so at review; default `0.8`, same as its parent).

**Neither redirecting sibling child is listed** (§2.1). The sitemap already omits `/data` and `/catena-x` for the same reason and this run does not change that.

---

## 8. Conformance

**Tier-1, machine:**
1. The canonical route renders the page. **Both** legacy sibling children (`/data/readiness-assessment`, `/catena-x/readiness-assessment`) resolve to the canonical path in the `App.jsx` router test, asserted against the imported route constants.
2. Every constant in `readinessAssessmentContent.js` is rendered somewhere in the page (the pivot-3 item-8 consumer contract, applied to the new file).
3. Breadcrumb present, first crumb href equals the imported parent route constant.
4. Both CTA bands render `BookingButton` whose href equals the imported `BOOKING_URL` exactly, with no appended query parameters. `BOOKING_URL` is asserted to be an `https` URL on a Google Calendar booking host (`calendar.app.google` or `calendar.google.com`), which catches a leftover Calendly link without exact matching the operational URL.
5. All five FAQ answers are present in the initial DOM.
6. **Zero label assets in the page subtree** (rule 1), asserted as a not-contains against the imported asset constants.
7. **Dates, amended v1.9, scoped v1.10, simplified v1.12, extended v1.14.** Two assertions. (a) Panel B is the sole carrier of the passport-date token and its rendered value equals the interpolated `regulatoryDates.js` value. (b) Across the **whole page subtree**, after stripping that one token: no bare four-digit year, no written month-and-year, no ISO date, and no relative calendar phrase (`RELATIVE_TIME_PATTERN` from `constants/dateGuards.js`: `this|next|last` followed by `year|quarter|month|week`).

   v1.10's scope (c) and the published-work subtree exclusion are both **gone**, because §4.7.1 is gone (§4.7). The guard is now stronger than at any point in its history: one scope, no carve-out, covering every section including ones added later. The §4.2.2 rewrite was checked against it, which is why the new closing line states a consequence of starting later rather than naming a quarter.

8. Each rendered price equals the current price selector's value for its tier and currency; the rendered panels carry one currency each (§4.2.1 rule 4); no currency symbol character appears in the page subtree.
9. **Each tier's `foundingOpen` flag gates its price both ways**, asserted per tier: true renders the `founding` value, false renders the `standard` value, in the panels, the FAQ answer, the meta description and the structured data alike. The page subtree contains none of the §4.2.1.1 rule 1 words and no struck through price, asserted in both branches.
10. The §4.5.1 "what happens next" block renders and its link resolves to `/services` via the imported route constant.
11. ~~The §4.7.1 published-work list renders every item in its constant.~~ **Removed v1.12** with the section (§4.7). Replaced by a negative assertion: the page renders neither `assessment-author` nor `published-work`, so reinstating either is a visible decision rather than a quiet reappearance.
12. No price renders above the fold, asserted structurally: no `PRICING` value appears in the hero component's subtree.

**Tier-1, machine, added in v1.4 (P0b and P2a/P2b), extended v1.5 and v1.6:**

22. **`BookingModal` renders a link to `BOOKING_URL` exactly**, `target="_blank"`, `rel="noopener noreferrer"`, no appended query parameters, asserted against the imported constant. Lands in P0, ahead of item 4, and covers the two existing call sites (`ContactForm`, `ContactPage`) that item 4 does not reach.
23. **One booking link, site-wide.** The footer social entry, the `ContactSection` booking link and `BookingModal` all resolve to the same imported `BOOKING_URL` value. Asserted by identity against the constant, not by string equality between the three rendered hrefs, so a test cannot pass on two components that are wrong in the same way.
24. **Route-literal sweep** (§2.1). `routes.test.js` walks `client/src` excluding `routes.js` and its own file and asserts that no quoted string equals a **swept** route value. `ROUTE_LANDING` (`/`) is excluded from the swept set per §2.1.1; the exclusion is itself asserted, so that removing it is a visible act rather than a silent narrowing. A separate assertion reads `client/public/sitemap.xml` and requires the canonical route's `<loc>` to be present and neither sibling child's to be.
24c. **Route-constant integrity** (v1.7, P2a). Three assertions beyond the sweep: each child route starts with its parent (§2.1); `App.test.jsx` still contains the literal of every pinned route, including the four added in P2a; and every file that previously held a swept literal now imports from `routes.js`. The first catches a parent rename, the second catches a pin being tidied away, the third catches a literal deleted without a replacement.
24b. **The `InquirySuccess` booking chain** (v1.6, lands in **P0a**, before the refactor). Rendering `ContactForm`, driving `ContactRequestForm` to its success state, and clicking `Book a Meeting` opens the booking modal. Written first against the current `CalendlyModal`, then carried through P0b against `BookingModal`. Without it, P0b rewires a three-prop chain that nothing asserts, and `ContactForm.test.jsx:71`'s unqueried `calendly-modal` mock is the only trace of it in the suite.
24a. **`vercel.json` shape** (v1.5). `client/vercel.config.test.js` already asserts the `/data` and `/catena-x` 301s, the `/api` proxy and the SPA rewrite. P2b extends it with the two sibling-child redirects in the same shape: source, destination equal to the canonical route constant, `statusCode` 301. This asserts the configuration, not the deployed behaviour; manual item 27 still stands, because a correct config file and a correct live redirect are two different claims and only one of them is testable in Vitest.
25. **Breadcrumb parent is not a redirect.** The first crumb's href equals the passport route constant, and that constant is asserted to be a path the router renders a page for, not one it answers with `Navigate`. This is the machine form of the §2.1 ruling and it is what would have caught a canonical page hung under `/data`.

**Tier-2, corpus:** four new FORBIDDEN patterns:

- the two from §3 rule 2 (`Catena-X [Rr]eadiness`, `Catena-X [Aa]ssessment`), landing per §0.5;
- `/[Cc]alendly/` and `/react-calendly/`, both landing in **P0**, the commit that deletes their last live occurrence under `client/src` (§6.6).

The page's copy passes the existing vocabulary scan unchanged. The `react-calendly` pattern is redundant against the bare `calendly` one and is kept anyway: it names the dependency specifically, so a future `npm install` that reintroduces it fails with a message that says what to do.

**Tier-3:** **this run adds nothing.** The list stays closed at items 13 to 15. `BOOKING_URL` is configuration, not a claim: a wrong value is caught by the tier-1 sourcing assertion plus the owner's click check, and exact-matching it would freeze an operational URL behind a spec amendment.

**Manual, owner:**
13. **Phone first, desktop second** (§1). Open the live route on a real phone over a mobile connection before reviewing it on a laptop. The first screen must carry the headline, the subhead and the CTA without scrolling, and must be legible without zooming. This is the condition the page is actually used in.
14. Click the live booking link on desktop and on a phone, and complete one test booking end to end from a browser that is not signed in to either of the owner's Google accounts. Confirm: the booking lands in the Ichnos calendar with a Google Meet link; the four screening answers appear in the event; the confirmation mail carries the product name and the Ichnos identity; the booked slot disappears from the booking page. Repeat once from a device set to a Central European time zone and confirm the slots show in that local time.
15. Verify the §6.5 appointment schedule configuration item by item, in particular the four required screening questions, the daily maximum, the 24 hour minimum notice, and the personal calendar check: a test event in the personal Gmail calendar removes the matching slot from the booking page.
16. Three-viewport review at 1440, 768 and 390px, with rule 9 specifically checked: no price badge, no pricing-table styling on the panels, no Catena-X mention adjacent to a price.
17. Lighthouse on the new route.
18. ~~If §4.7's optional sentence shipped: re-verify against the current membership list.~~ **Removed v1.12:** §4.7 is gone, so there is no section for the sentence to ship in.
19. ~~Audit the §4.7.1 published-work list against reality before go-live.~~ **Removed v1.12:** the list is gone (§4.7).
20. **Pricing review.** Re-check the SGD and EUR ladders against each other whenever EUR/SGD moves materially, and update `PRICING.REVIEWED_AS_OF` on every change. The two ladders are set independently and will drift; the review is what keeps the drift deliberate.
21. **First client tracking, per tier.** Record each signed founding client in the pipeline record with the tier and the signing date. The week the first engagement letter in a tier is signed, set that tier's `foundingOpen` to false. A founding price left on the page after its tier's first contract is a price the next prospect in that tier will expect to pay.

**Manual, owner, added in v1.4. Items 26 and 27 gate P0's deploy, not the epic's:**

26. **Walk every booking CTA on the deployed site after P0 and before cancelling Calendly** (§11 item 9): the footer icon on three pages, the `ContactSection` link on `/` and on `/contact`, the `Schedule a call` button on `/contact`, and the booking prompt on the inquiry success screen. Each must open the Google booking page in a new tab. Six clicks, and they are the difference between a vendor migration and a site with dead buttons on it.
27. **Confirm both sibling redirects after P2b deploys**, on the deployed preview, not locally: `/data/readiness-assessment` and `/catena-x/readiness-assessment` must each land on the canonical path with a 301, and neither may render the blank 200 described in §2.1. `client/vercel.json` redirects do not apply to the Vite dev server, so this is the one §2.1 behaviour that a green local test suite cannot demonstrate.

---

## 9. Phases

| P | Scope | Cap ruling |
|---|---|---|
| **0a** | **Characterisation test for the `InquirySuccess` booking chain**, written against current Calendly behaviour, in `ContactForm.test.jsx`. One file. (v1.6: the 0a slot is reused; the four convention edits that v1.5 had here all landed ahead of the run, `CLAUDE.md` ×2 and `AGENTS.md` in `010d56a`, `README.md` in `8c5defc`. §6.7 records them as done.) | **New in v1.6, and it must land before 0b.** `InquirySuccess` "Book a Meeting" → `ContactRequestForm` `onBook` → `ContactForm` `setCalendlyOpen(true)` → modal is the only booking surface with zero automated coverage: `ContactForm.test.jsx:71` registers a `calendly-modal` mock that nothing ever queries, and `onBook` appears in no test file anywhere. P0b rewires exactly that chain. A test written after the refactor proves only that the new code does what the new code does. Written before, it proves behaviour was preserved. |
| **0b** | **Calendly → Google, code** (§6.6 rows 1 to 12): `BOOKING_URL` in `companyInfo.js` with `CONTACT_INFO.calendly` deleted and no alias (§6.2), `CalendlyModal` → `BookingModal` + its test, `ContactForm`, `ContactPage`, `Footer`, `ContactSection` and the four colocated tests, `react-calendly` dropped from `package.json` **and `package-lock.json` regenerated in the same commit**, **plus `molecules/BookingButton.jsx` + its test + its CSS, moved here from P3 (v1.6)** | **Atomic, pre-approved.** Fifteen files plus the lockfile, one semantic flip: the site's booking link changes vendor. §0.4 governs, so every consumer of `CONTACT_INFO.calendly` lands with its deletion. Splitting it ships a site with two booking vendors live at once, which is the exact state §6.2 exists to prevent. **`BookingButton` moves in from P3** so `BookingModal` consumes it at birth and the file is touched once, not twice across three phases; the button depends only on `BOOKING_URL` and nothing in P1 or P2, and it is additive, so it adds files without adding risk. **The lockfile is not optional:** CI runs `npm ci` with `cache-dependency-path: client/package-lock.json`, and `npm ci` fails hard when `package.json` and the lockfile disagree, before a single test runs. |
| **0c** | **Calendly → Google, guards and paperwork** (§6.6 rows 13 to 14, §6.7): `vocabulary.js` FORBIDDEN widening, `e2e/tests/pages/ContactPage.js` comment, `ci.yml`, `VERCEL_SETTINGS.md`, `e2e/ENV_REFACTOR_PLAN.md`, `legal/GDPR/ropa.md`, `legal/GDPR/cookie-policy.md` | **Atomic, pre-approved.** Seven files, no code paths. The guard goes green only because 0b landed, and the documents are wrong from the moment 0b lands, so the gap between 0b and 0c is a window in which the register misstates a sub-processor. Keep it to one commit. |
| 1 | `readinessAssessmentContent.js` + `PRICING` (three tiers, founding and standard values in two currencies, one `foundingOpen` flag per tier, the current price selector, `REVIEWED_AS_OF`) + `BOOKING_URL` + colocated tests + FORBIDDEN widening | Within cap. Guards first, green now. `PRICING` ships with its own test asserting three tiers with founding and standard values in both currencies, no conversion helper, a shaped `REVIEWED_AS_OF`, a boolean flag per tier, and the selector returning founding or standard per flag. |
| **2a** | **Pure refactor, no behaviour change.** `constants/routes.js` + `routes.test.js`, the retrofit of **all 37 measured consumers** (§2.1: 18 source, 19 test), the four missing `App.test.jsx` pin mounts (§2.1), and the stale `'/passport'` comment at `Navbar.jsx:77`. The guard lands last in this commit and is green at its end. **Formatting is checked mechanically, not by eye (§2.1.2).** | **Split from P2 in v1.6, and the v1.4 atomic pre-approval is withdrawn.** That approval was granted against an estimate of twelve files; the measured surface is 37 files and 114 occurrences (§2.1). An atomic ruling made on a number that was wrong by 3x does not bind. The seam is semantic, not cosmetic: 2a's flip is "route literals become constants" and 2b's is "a new route exists", so §0.4 is satisfied by two commits, not violated. 2a is mechanical and reviewable as one pass; 2b is where the thinking is. |
| **2b** | **Additive.** The new route constant's first use: `App.jsx` wiring, page shell, `Breadcrumb`, both sibling redirects in `App.jsx` and `client/vercel.json`, and the two new assertions in `client/vercel.config.test.js` (§8 item 24a). | **Atomic, pre-approved.** Five files. A route and its only consumer are one unit, and a redirect that lands without its target ships a loop. |
| 3 | Hero, `AudiencePanels` with price blocks read through the current price selector | **Atomic, pre-approved. Narrowed in v1.6:** `BookingButton` and the `BookingModal` body refactor both moved to P0b, so P3 no longer touches any file outside the new page. The price blocks cannot ship without the selector that governs them, which is what keeps this phase atomic. |
| 4 | §4.2.2 window, `DeliverablesGrid`, `ProcessSteps`, inputs block + CSS | Within cap if split; MAY run as two sub-commits. The window lands with this group because it renders between the panels and the deliverables. |
| 5 | §4.5.1 what-happens-next, `ScopeBoundary`, who-runs-it, §4.7.1 published work + CSS | Within cap if split. The three credibility sections are one semantic group: each is a claim surface and they are reviewed together. |
| 6 | `AssessmentFaq`, `CtaBand` + CSS | Within cap. |
| 7 | Entry points: passport CTA band, services card link, landing teaser link | **Atomic, pre-approved:** three consumers of one new route; a half-landed set ships dead ends. |
| 8 | `seoMeta.js`, `structuredData.js` **split per §7.2.1**, sitemap, mobile sweep of everything touched | **Within cap only because of the split.** `structuredData.js` is 224 lines and grandfathered over the 200 cap (CLAUDE.md §5.1); P8 adds a `Service` node with six `Offer` children and a `BreadcrumbList`, roughly +40 lines, taking it past 260. §5.1's stated trigger, "split one only when you are already changing it for another reason", is met here. |

Deploy after green: PR → main → CI → merge → "Sync main → staging" → owner gates → promote.

---

## 10. Out of scope

The `/data` versus `/passport` route-naming question (pivot-3's ruling stands: the code is correct) · chatbot and knowledge base · a pricing page · case studies of any kind · payment collection · the Supplier Kits page, which is a separate offer and needs its own spec · any change to the five fenced `catenax-*` cards · fonts.

**Moved *into* scope by v1.4, recorded so the boundary is legible:** the Calendly to Google migration (§6.6), the GDPR and configuration documents that name Calendly (§6.7), the site-wide route-constant extraction (§2.1) and the file-length cap change (§0.11). v1.3 left all four unphased, which is what Traycer's review surfaced.

**Explicitly still out of scope, v1.4:**

- **The `path="*" element={null}` fallthrough in `App.jsx`.** Any unmatched path returns HTTP 200 with the site chrome and a blank body, which is worse for both users and crawlers than a 404. §2.1's two redirects close the two cases this page creates; the general defect predates this spec, affects every route, and deserves a `NotFoundPage` and its own spec. **Do not fix it in this run:** a 404 page is a design surface, not a router edit.
- **Historical specification documents** that mention Calendly (§6.6, final paragraph). They are records of what was true when written.
- **The chatbot knowledge base**, which may describe the booking flow in prose the corpus guard does not reach. Verifying and updating it is owner work, §11 item 10.

---

## 11. Owner items before P0 and P3 can land

*(v1.4: item 1 now gates **P0**, not P3, because `BOOKING_URL` is what P0's migration repoints every existing booking CTA at. Its value is already recorded in §6.2, so P0 is not blocked; the open sub-items are configuration of the schedule behind that link.)*

1. **Google Calendar appointment schedule per §6.5, in the Ichnos Workspace account.** Done 22 Sep 2026: title, 30 minutes, Monday to Friday 10:00 to 18:00 Kuala Lumpur, 60 days ahead, 24 hours notice, booking link recorded in §6.2. **Open:** (a) share the personal Gmail calendar into the Ichnos account and tick it under "Check calendars for availability", per the §6.5 setup note; (b) confirm buffer time, maximum bookings per day, Google Meet, email reminders and the four required screening questions against the §6.5 table. If a Calendly event or account was ever set up for this offer, delete the event and cancel any paid plan, so a second booking link with the old configuration does not circulate in earlier emails.
2. **Prices: confirmed 22 Sep 2026.** All twelve values in §4.2.1 are owner decisions. Set `REVIEWED_AS_OF` to 2026-09-22 in P1.
3. **Write the founding client clause into the engagement letter template before the first letter goes out** (§4.2.1.1 rules 3 and 6): standard price, founding discount, the discount conditional on a named reference after delivery and one introduction to a customer or supplier in the client's chain, and the standard price due if the client declines. The second client and refusal cases are ruled in §4.2.1.1 rule 6. **Still open:** how the clause is enforced, since the reference falls due after delivery, when the discount has already been given. One option is that the discount becomes invoiceable if the reference or the introduction is not provided within an agreed period after delivery. Have the clause reviewed by a lawyer before the first letter.
4. ~~**Decide §4.7's optional membership sentence.**~~ **Closed v1.12 by deletion of §4.7.** The sentence needs a new home before it can be decided again, and the `VERIFIED_AS_OF` obligation still attaches to it.
5. ~~**Audit the §4.7.1 published-work list.**~~ **Removed v1.12:** the list no longer exists (§4.7). The obligation goes with it.
6. **Withholding tax stays off the page.** Indonesian Article 26 and the NBRI host fee are engagement-letter matters. Putting "fees quoted net of withholding" into public copy trades a small competence signal for a large amount of friction at exactly the wrong moment. Handle it in the scoping call and the engagement letter, where it belongs.
7. **Singapore GST.** Whether SGD prices are stated as GST-exclusive depends on Ichnos's registration status, and export of services to ASEAN customers is normally zero-rated. Confirm the treatment with your accountant, then decide whether the panel copy needs a "prices exclude GST where applicable" line. Default: no line, because at current turnover it says nothing and costs a sentence.
8. **Currency codes, never symbols**, per §4.2.1 rule 3. No `€`, no `S$`, anywhere in copy or tests.

**Added in v1.4, all arising from the Calendly to Google migration:**

9. **Decommission Calendly, in this order, and not before §6.6.1's window closes.** (a) Confirm P0 has deployed, pass §8 manual item 26 (the six-click walk of every live booking CTA), then **leave it one release window**. Until you start (b), a P0b+P0c revert is still clean; from (b) onward it is not, and after (c) the only correct response to a booking defect is to roll forward. §6.6.1 has the reasoning. (b) Delete the `CALENDLY_LINK` and `VITE_CALENDLY_URL` environment variables from **both** Vercel projects and every environment (Production, Preview), per §6.7. (c) Only then cancel the Calendly account or paid plan. Reversing (b) and (c) leaves the site building against a variable that no longer resolves to anything. **(d) A Calendly QR code was printed on slide S17 of the IBS 2026 consortium deck** (`docs/IBS2026_consortium_cta_spec.md`). That deck is in circulation. Cancelling the account kills that QR. Decide before cancelling whether to reissue the deck with the Google link, set up a Calendly redirect, or accept the breakage; the third is defensible for a deck presented in August, but it should be a decision rather than a discovery.
10. **Check the chatbot knowledge base and any outbound email template** for prose that names Calendly or describes the old booking flow. Neither is reachable by the corpus guard (§10). Update what you find.
11. **Get the amended `ropa.md` sub-processor row reviewed** (§6.7). Two open questions for the lawyer: whether Google appointment scheduling is a second Google row or folds into the existing Firebase one, and what to record as the transfer mechanism now that the Workspace Cloud Data Processing Addendum replaces the Calendly DPA. The row ships with `[VERIFY — legal]` in those two cells until that answer exists; do not let it ship with a guess in them.
12. **Review the Google `G` icon at the §8 item 16 three-viewport pass** (§6.6, "The icon"). Bootstrap Icons has no Google Calendar glyph. If `bi-google` beside `Book a Meeting` reads as a sign-in affordance rather than a booking one, revert both call sites to `calendar-event` and record the reason in §6.6.
13. **Re-read the §4.2.2 window copy every quarter, and rewrite it when it stops being true.** It is written from Q4 2026 and contains no date, so nothing in the toolchain can flag it: `finishes in the fourth quarter`, `starts in the new year`, and above all `This is the last quarter in which finding out is still useful`. That closing line is the sharpest sentence on the page while it is true and a liability the moment it is not. Diarise it with the §8 item 20 pricing review, which is already a recurring obligation. A rewrite is a fenced-copy amendment (§4) and needs a recorded reason.

---

## 12. What this page cannot fix

Recorded so that the page is not asked to carry weight it cannot hold.

**Delivery capacity is the binding constraint, not conversion.** Three-week assessments, at most two in parallel, against the standards work, the data model, M6 oversight and the expert-network calls. The realistic ceiling before the passport date is a handful of engagements. If the page converts better than that, the constraint moves to delivery immediately, and the correct response is to raise prices rather than to accept work that cannot be delivered well. A late or thin first engagement costs more than a missed one, because the founding-client exchange in §4.2.1.1 trades on the reference being good.

**The page has no traffic and cannot generate its own.** It converts attention that outbound, speaking, standards participation and the existing network produce. Shipping it changes nothing on its own. Its first real test is being the link in the next qualified outbound email, not a search ranking.

**It does not replace the qualified target list.** The page answers the questions a warm prospect has. It does not find prospects.
