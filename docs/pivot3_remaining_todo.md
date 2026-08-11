# Pivot-3 — remaining to-do (audited 2026-08-11)

Audit basis: `website_Catena_pivot_3.md` v3.11 vs `origin/staging` (deployed) vs `Catena-X_Pivot` tip (pushed, = local HEAD).

## Verdict in one line

**The implementation on `Catena-X_Pivot` conforms to pivot-3 on every machine-checkable item sampled — the obsolete logo is a DEPLOY GAP, not a code gap.** Staging serves the pre-logo-swap tip (PR #153); the branch is 20 commits ahead of it.

Verified PASS on the branch tip: `Logo.jsx` → `/brand/` SVGs · full `/brand/` set incl. official QA label · all pivot-3 status constants (`CATENA_X_STATUS_LINE`, `TRADEMARK_NOTICE`, `CATENA_X_EXPERT_GROUP_NOTE`, member-label pair) · credentials (`catenax-member` first, `dpp-expert-group` renamed, `eu-passport-2027` removed) · `vocabulary.js` + test · `FooterRecognitions`/`FooterTrademark`/`CredentialLabel` + plaque CSS · webmanifest description/theme-color/icons · zero "Advisory Provider" in seoMeta · all 7 orphans deleted · wireframes/ deleted · index.css clean of teal/legacy hexes and gradient-text · hero eyebrow interpolates `CATENA_X_STATUS_LINE` · client/src clean of conformance-adjectives, "in progress" claims, "expert committee".

## P0 — see it live (the obsolete logo)

1. **Redeploy staging from the current branch tip.** Designed path: open **PR `Catena-X_Pivot` → `main`** (this is what triggers CI "Client/Server — Lint & Test", the Vercel preview, and E2E) → merge → run the **"Sync main → staging"** workflow (manual `workflow_dispatch`; it force-pushes main→staging and curls the two Vercel deploy hooks). Note: merging straight into `staging` again (as PR #153 did) works visually but runs no CI and is erased by the next sync.
2. **Commit the two files written to the working tree today:** `client/public/og-image.jpg` (regenerated 2026-08-11: dual-tone lockup + live hero headline + status line, replaces the 14 May pre-pivot file — closes pivot-3 §5 item 1) and `docs/website_Catena_pivot_2.md` (approved-phrasings line reconciled with pivot-3 §1.1 + historical note; the two §6-mandated amendments were verified already applied).

## P1 — conformance items not yet verifiable

3. **Server chatbot prompt sweep (pivot-3 §2 last row):** confirm the conformance-adjective cleanup in server prompt text landed (the sweep ticket). Could not be scanned remotely (OneDrive hydration). Grep: `catena-x[ -]?(compatible|compliant|conformant)` over `server/` excl. node_modules.
4. **§6 manual sweep areas:** `legal/` read in full (not just grepped), `e2e/`, `scripts/`, rest of `client/public/`.
5. **Guard self-test (§7.1 items 9–10):** full suite green incl. `vocabulary.test.js`; once, deliberately introduce a §1.2 term, watch it fail, revert.

## P2 — assets & external dependencies (Francesco-owned)

6. **Advisor `_neg_` label:** check `catena-x.academy/lana-download/qualified-advisor-logo/` (account-gated) for a negative/reversed variant → drop in `/brand/`, set `CATENA_X_LABEL_ASSET_NEG` — footer plaque retires by itself (§3.3 precedence 1).
7. **Member label:** countersign the *member* Logo Use Agreement (`cx-resources` → `info@catena-x.net`), download member label files → `CATENA_X_MEMBER_LABEL_ASSET(_NEG)`; then adopt the §3.5 label-keyed model (required only once the file exists).
8. **⚠ PCF Architecture & Interoperability Expert Group tender closes 14 Aug 2026 — three days.** Submit if still intended (§1 NOT_YET_HELD). On confirmation of any pending group, move its regex out of `NOT_YET_HELD` and update pivot-3 §1 in the same commit.
9. **Expert-group registered name:** when Stan Faldin confirms, verify the `dpp-expert-group` label; correction is one line in `credentials.js` (§1.1).
10. **Trademark guideline answer** from the Management Office: if it confirms the §4 reading, append the date as standing authority; if narrower, amend §4 before touching copy (§4.5).

## P3 — manual gates before promotion (§7.4–7.5)

11. Viewport review at 1440/768/390: no Catena-X label near services/pricing (§4.4), plaque not over busy footer imagery, "Catena-X" always plain text.
12. Lighthouse on the Vercel preview — not worse than baseline.
13. **Link-unfurl check of the new og-image** after deploy (real unfurl, not opening the file) — §7.4 item 20.
14. `seoMeta.js` / `structuredData.js` shared-claim parity read (§7.4 item 21).

## P4 — housekeeping

15. **Broken git worktree entry** `.claude/worktrees/inspiring-mirzakhani` (mangled Windows path) makes `git status` fatal — run `git worktree prune` in a terminal.
16. **Out-of-repo vocabulary (§8):** `EU_Battery_Passport/docs/Catena-X/presentations/IBS2026_Day3_Lecture4_prep.md:42` still mandates "membership: application in progress" — obsolete guardrail; talk is 28 Aug 2026.
17. **Qualification renewal by 2027-07-06** (attestation 868) — on lapse: `CATENA_X_LABEL_ASSET = null` + delete label file. A scheduled reminder ~May 2027 is recommended.
