# Pivot-3 — remaining to-do (updated 2026-08-11 PM, after Carina Gliese's onboarding reply; reconciled against the shipped state after the §9 final run T1–T5)

Audit basis: `website_Catena_pivot_3.md` v3.11 + Brand Governance v1.1 (now on file) + official label pack (now in repo).

## P0 — go-live blockers

1. **Redeploy staging from the current branch tip** (unchanged): pull → push → PR `Catena-X_Pivot` → `main` → merge on green CI → run "Sync main → staging". The obsolete navbar logo on staging-client is purely the stale deploy.
2. **Wire the official label SVGs — DONE 2026-08-11** (files committed to `client/public/brand/`; shipped in T1–T5, tests per pivot-3 §7):
   - `CATENA_X_LABEL_ASSET` → `"/brand/CX_Logo_Qualified-Advisor_CLR_RGB_pos_16x9.svg"` — **shipped**; the constant points at the official 6 KB SVG and the 349 KB PNG is deleted. Tier-3 item 15 was **created, not updated** — it had never actually been asserted — and widened to four exact-filename assertions, items 15a–15d (pivot-3 §7.3, §9.9-Q3). 16:9 canvas carries the mandated clear space — same sizing rules (height + `width:auto` + `contain`, never crop).
   - `CATENA_X_LABEL_ASSET_NEG` → `"/brand/CX_Logo_Qualified-Advisor_RGB_neg_16x9.svg"` — **shipped**. The footer now renders the negative variant **bare** (pivot-3 §3.3 precedence 1), so Footer.test state 1 is the live default. The plaque branch, its CSS and its mocked precedence `describe` **stay in place as the lapse-resilience path and MUST NOT be deleted** (§9.1; `index.css` and §3.4 now both say *dormant, not dead*).
   - `CATENA_X_MEMBER_LABEL_ASSET` → `"/brand/Association_member_Logo_RGB_pos.svg"`, `CATENA_X_MEMBER_LABEL_ASSET_NEG` → `"/brand/Association_member_Logo_RGB_neg.svg"` — **both shipped**, so the pivot-3 §3.5 label-keyed model is live: `CX_LABEL_ASSETS` + `cxLabel: 'advisor' | 'member'`, and the `catenax-member` credential renders the member label (pos in strip, neg in footer). The clear-space obligation for the tight-cropped member SVG (1497×384, no built-in margin) is satisfied by `.footer-label-img--member` / `.credential-strip__label-img--member` (`box-sizing: content-box`, padding ≈ 0.75× rendered height). Exact geometry remains a §7.4 manual review point — gate still open.
   - Item-8 consumer scan — **shipped**: `ASSET_PATH_EXPORTS` added to `vocabulary.js` and scanned by a **separate** asset-path consumer rule in `vocabulary.test.js` (consumers may live in `catenaXStatus.js` itself, unlike the status-string rule).
   - `client/public/brand/CX_Logo_Qualified-Advisor_CLR_RGB_pos_16x9@300.png` — **deleted**.
   - Link rule unchanged: at most one linked label per page, `https://catena-x.net` only. Shipped form: link semantics key on `href` (advisor-only), and `isCatenaXLabel` was **removed entirely** rather than derived (§9.11-Q3) — there is no derived boolean to look for.
3. **Battery background restore (Francesco's request, 2026-08-11).** `bg-advisory.jpg` (the light-grey EV-battery-pack assembly photo) ships and is referenced only by `.advisory-page-hero` (`index.css:1068-1075`). Historical cause of the "disappearance": the overlay used to be `linear-gradient(rgba(245,247,250,.85), rgba(232,236,241,.95))`, nearly opaque. Current shipped overlay is stated in sub-option (a). Options (Francesco to pick, both trivial):
   - a) **DONE 2026-08-11** — subpage heroes (`/services`, `/team`, `/passport`): `.advisory-page-hero`'s overlay lowered to `rgba(245,247,250,.66) → rgba(232,236,241,.80)`. The raw-photo guard in `theme-scoping.test.jsx` now requires an overlay before any `url()` layer, and all rgba alphas ≥ .66 across `.advisory-page-hero` and `.theme-catenax .hero-section`.
   - b) **PENDING (T7)** — landing hero battery background: apply the identical two-layer background to the `.theme-catenax` hero section (keeps text on the pale wash, AA-safe since text sits on ≥.66 white overlay — re-check contrast in the §4.4 manual pass). This is the final, independently revertible commit and has **not** shipped.
   - DECIDED (§9.9): (a) AND (b), landing as its own final revertible commit.
   - **OPEN — owner/binary task:** `bg-advisory.jpg` re-encode. A 377 KB 1920×1080 q85 file is on the branch (`efc062d`, down from the 4.0 MB original), but the re-encode stays on this list as an owner-held item until Francesco signs off on the encode quality at the 1440/768/390 viewports (item 14). Not closed by T1–T6.
   - Manual gates still open on both sub-options: AA text contrast over the wash (§4.4 pass) and the 1440/768/390 viewport review (item 14).

## P1 — association actions from Carina's email (2026-08-11)

4. **⚠ PCF Architecture & Interoperability Expert Group — application form closes 14 Aug 2026 (3 days):** submit via the Microsoft Forms link in Carina's email.
5. **Battery Pass Modelling Group:** await/answer intro from Johann Schütz (johann.schuetz@catena-x.net, group coordinator); group profile already on file.
6. **Testimonial consent:** reply to Carina confirming (or declining) use of the quote + name/title/company/year/logo in the "Why Organizations Join Us" section on catena-x.net. Brief email suffices.
7. **LinkedIn welcome post:** slot being coordinated by Carina with Comms — await date; post file: `Catena-X/Welcome/IchnosProtocol_CatenaX_LinkedInWelcomePost.pptx`. Any co-branded visual must follow Brand Governance "Cooperations" layout (CX logo left, partner right, fixed spacing, no custom lockups).
8. **APJ Expert Group:** deferred by choice — revisit after network building (Carina: joining mid-term is possible).

## P2 — conformance & docs

9. **pivot-3 §4.5 standing authority: RECORDED 2026-08-11** (Carina Gliese confirmed the descriptive-use reading in writing: *"it is perfectly acceptable to state on your website that you help suppliers connect to Catena-X"*). Repo copy of `website_Catena_pivot_3.md` amended; §4 copy stays as-is with the confirmation date as authority.
10. Server chatbot prompt sweep verification (unchanged from previous list).
11. §6 manual sweep areas: `legal/` read in full, `e2e/`, `scripts/`, rest of `client/public/` (unchanged).
12. Guard self-test (§7.1 items 9–10) (unchanged).
13. og-image: **DONE** (regenerated 2026-08-11, committed in `35d9fc2`) — link-unfurl check after the staging/prod deploy remains (§7.4-20).

## P3 — manual gates before promotion (unchanged)

14. Viewport review 1440/768/390 — now including: no label near services/pricing (§4.4), member-label clear space respected, neg labels legible on the dark footer, battery-background text contrast if restored.
15. Lighthouse on preview vs baseline. 16. seoMeta/structuredData parity read.

## P4 — housekeeping

17. Delete `_to_delete/` at repo root (git-ignored debris from the lock cleanup).
18. Qualification renewal by **2027-07-06** (attestation 868); membership: ongoing, 3-months' notice to fiscal-year end. Scheduled reminder ~May 2027 recommended.
19. IBS2026 briefing doc guardrail fix (out-of-repo) before the 28 Aug talk (unchanged).

## P5 — backlog from the BASF PACIFIC benchmark (2026-08-11, post-deploy)

20. Static FAQ section on `/` or `/catena-x`, generated from the chatbot knowledge pack (pending workstream) — BASF pattern, SEO value, §1/§4 vocabulary applies.
21. Testimonial slot once a real client quote exists.
22. `/contact`: show a named support inbox alongside the form.
(§9.2-optional landing-hero battery image upgraded to RECOMMENDED in this run — see pivot-3 §9.6.)
23. Content polish (post-deploy): tighten landing PASSPORT_TEASER to 2 sentences; converge "European battery passport"→"EU Battery Passport" where the instrument is meant; insights/"recent thinking" block; demo proof block on /passport when ready. (pivot-3 §9.7)
