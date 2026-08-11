# Pivot-3 — remaining to-do (updated 2026-08-11 PM, after Carina Gliese's onboarding reply)

Audit basis: `website_Catena_pivot_3.md` v3.11 + Brand Governance v1.1 (now on file) + official label pack (now in repo).

## P0 — go-live blockers

1. **Redeploy staging from the current branch tip** (unchanged): pull → push → PR `Catena-X_Pivot` → `main` → merge on green CI → run "Sync main → staging". The obsolete navbar logo on staging-client is purely the stale deploy.
2. **Wire the official label SVGs** (files committed to `client/public/brand/` on 2026-08-11 — Claude Code task, tests per pivot-3 §7):
   - `CATENA_X_LABEL_ASSET` → `"/brand/CX_Logo_Qualified-Advisor_CLR_RGB_pos_16x9.svg"` (replaces the 349 KB PNG with the official 6 KB SVG; **update tier-3 item 15's exact-filename assertion**). 16:9 canvas carries the mandated clear space — same sizing rules (height + `width:auto` + `contain`, never crop).
   - `CATENA_X_LABEL_ASSET_NEG` → `"/brand/CX_Logo_Qualified-Advisor_RGB_neg_16x9.svg"` → **footer plaque retires automatically** (pivot-3 §3.3 precedence 1; Footer.test state 1 now becomes the live state). Delete the plaque CSS + wrapper per the comment once verified.
   - `CATENA_X_MEMBER_LABEL_ASSET` → `"/brand/Association_member_Logo_RGB_pos.svg"`, `CATENA_X_MEMBER_LABEL_ASSET_NEG` → `"/brand/Association_member_Logo_RGB_neg.svg"`. **Both non-null ⇒ pivot-3 §3.5 label-keyed model (`CX_LABEL_ASSETS` + `cxLabel: 'advisor'|'member'`) is now REQUIRED** — the `catenax-member` credential renders the member label (pos in strip, neg in footer). ⚠ The member SVG is tight-cropped (1497×384, no built-in margin): give it CSS clear space ≈ 0.75× its rendered height on all sides (Brand Governance: clear space = figurative-mark height); never over busy background.
   - Item-8 consumer scan: the two member constants lose their null-exemption the moment they are set — wire consumers in the same commit.
   - Delete `client/public/brand/CX_Logo_Qualified-Advisor_CLR_RGB_pos_16x9@300.png` after the swap (obsolete duplicate of the official SVG).
   - Link rule unchanged: at most one linked label per page, `https://catena-x.net` only.
3. **Battery background restore (Francesco's request, 2026-08-11).** `bg-advisory.jpg` (the light-grey EV-battery-pack assembly photo, 5120×2880) still ships and is referenced only by `.advisory-page-hero` (`index.css:1038-1044`) under a nearly opaque overlay `linear-gradient(rgba(245,247,250,.85), rgba(232,236,241,.95))` — that is why it "disappeared". Options (Francesco to pick, both trivial):
   - a) Make it visible again on the subpage heroes (`/services`, `/team`, `/passport`): lower the overlay to `rgba(245,247,250,.66) → rgba(232,236,241,.80)`.
   - b) Also give the landing hero the same treatment: apply the identical two-layer background to the `.theme-catenax` hero section (keeps text on the pale wash, AA-safe since text sits on ≥.66 white overlay — re-check contrast in the §4.4 manual pass).
   - Recommendation: (a) now, (b) as taste call after seeing (a) on preview. Perf note: 4 MB source — export a ~1920w/85q version (~300 KB) while touching it; same filename.

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
