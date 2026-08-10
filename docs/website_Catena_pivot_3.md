# website_Catena_pivot_3.md — Specification

**Subject:** Catena-X status representation, label rendering, name use in copy, and excluded vocabulary on `ichnos-protocol.com`
**Version 3.11 — 2026-08-10 · Status: normative · in execution**
*(3.11, from T1 execution review: additional live conformance-adjective instances found in client copy and server prompt text beyond the two §2 exposures — the family was added to `FORBIDDEN` in 3.3 and the corpus was never re-swept with the new patterns. §7.2 gains the pattern-widening re-sweep rule so the class cannot recur; §2 records the finding; the `ALLOWED_EXCEPTIONS` contract is hardened: false positives only, never genuine violations.)*
*(3.10, from approach stress-test: the earliest-green-position rule generalised to every new guard, so the palette assertion precedes the CSS-changing phase; item 8's consumer scan tightened to a CI-worthy contract — comments and import statements stripped, one non-import usage required, failures aggregated — replacing 3.9's incorrect "unused imports are the linter's job", which `varsIgnorePattern` defeats for uppercase names; §5 orphan deletions get a cap-respecting grouping note.)*
*(3.9, from sequencing review: §7.2 gains the guard-placement rule — the vocabulary guard lands in the earliest green position, immediately after the corpus-cleaning phases; `STATUS_STRING_EXPORTS` added to `vocabulary.js` and item 8's assertion mechanised in `vocabulary.test.js`, with the ESLint `varsIgnorePattern` rationale recorded; item 13 split into a tier-3 constant assertion plus a tier-1 renders-the-constant DOM check, under a new rule: DOM assertions MAY compare against imported constants, MUST NOT restate literals.)*
*(3.7: per-surface test-id prefixes resolve the duplicate-testid collision; item 21 parity redefined as no-contradiction-plus-shared-wording; `:46/:48/:93` marked for deletion; dead `'wireframes'` skip entry dropped. 3.8, from blast-radius review: §1.5 personal-vs-corporate rule — `teamContent.js` stays Advisor-only **by design**, with one grammar fix (`an` → `a`); item 4 gains the describe-restructure guidance for `Footer.test.jsx`; item 22 splits the palette assertion between `theme-scoping.test.jsx` (index.css) and a new `LEGACY_HEXES` corpus scan (inline JSX styles); the `TEAM_META` keyword swap is recorded as a legality fix outside SEO discretion.)*

*Changelog. 3.1: §1.4 governance nouns, DPP Expert Group status, recorded trademark question. 3.2: three-tier testing model, `vocabulary.test.js`. 3.3: go-live audit — live 6.3 exposure in `site.webmanifest`, conformance-adjective ban, extended scan. 3.4: webmanifest description refined; `Catena-X-ready` barred. 3.5: five implementation-review questions resolved (plaque ships now; sweep scope settled; no `glob`; credential `SHOULD`s → `MUST`; DPP ungated); `seoMeta.js:68` promoted to live violation. **3.6: second-review pass — status constants get named consumers and one-wording-per-claim (§1.3, §2, §2.2); hero eyebrow sourced from `CATENA_X_STATUS_LINE`; conformance item 8 scoped so the two null asset constants are exempt (§7.1); §7.2 `FORBIDDEN` block aligned with §6's narrowed `crypto` patterns; orphan list extended with `footer-bg.jpg` and `vite.svg` (§5); trademark notice moved out of the component into constants, resolving a latent §1.3 conflict (§2.1); header block, §2.2/§1.1 contradiction, and stale `glob` references repaired. Everything in 3.0 stands.***

**Implementation framing.** This is **not** a behaviour-preserving refactor and **MUST NOT** be planned as one. Most of §2 changes user-visible copy deliberately; §7.0's testing-model correction is the only true refactor in the document. Visible copy change is the intent, and the three test tiers are the safety net — not the other way round.

**Outside any IDE's reach**, and owned by Francesco rather than the implementer: §5 `og-image.jpg` regeneration and its link-unfurl check, §7.4 manual viewport review, §7.5 Lighthouse, and the §8 cross-repo presentation brief.

**Baseline:** `website_Catena_pivot_2.md` v2.1 over `ichnos_website_CatenaX_pivot_spec_v5.md`. This document **adds to** both. Where it conflicts with either, this document governs for the four subjects named above; the baselines govern everything else.

> **Two baseline corrections, carried forward as fact.** pivot 2 names `ichnos_website_pivot_spec_v3.md` as its baseline; v3 → v4 → v5 is one series, each superseding the last, and pivot 2's own repo map describes **v5-era** artefacts. v5 is the content and IA baseline. pivot 2 also lists the routes as `/data (ex-/passport)`; the code is the reverse (`App.jsx:56-62`). Both are documentation errors. The code is correct — do not change it to match.

## Conventions

**MUST** / **MUST NOT** — required for conformance; a violation is a defect.
**SHOULD** — required unless there is a documented reason; deviation is recorded in the PR.
**MAY** — permitted.

Code blocks marked *reference implementation* are normative as to **behaviour**, not as to structure. An implementation that satisfies the stated behaviour and passes §7 conforms.

---

## 1. Status vocabulary

Ichnos Protocol Pte. Ltd. holds, as of August 2026:

| Status | Held | Instrument | Expires |
|---|---|---|---|
| Catena-X Qualified Advisor | Yes | Attestation ID 868; Qualified Advisor Logo Use Agreement, executed 29 Jun 2026 | 6 Jul 2027 |
| Ordinary member, Catena-X Automotive Network e.V. | Yes | Admission, Aug 2026 | Ongoing; 3 months' notice to fiscal-year end |
| Member, **Digital Product Passport Expert Group** | Yes | Added by Stan Faldin, Aug 2026; first meeting 11 Aug 2026 | — |
| DPP Regulations Expert Group | **Unconfirmed** | Sabrina wrote to Stan about both DPP groups; only DPP is confirmed | — |
| Battery Pass Modelling Expert Group | **Not yet** | Enquiry sent via onboarding reply | — |
| PCF Architecture & Interoperability Expert Group | **Not yet** | Intent declared in onboarding reply; tender closes 14 Aug 2026 | — |
| APJ Expert Group | **No** | Deferred by choice | — |
| Any Catena-X certification | **No** | — | — |
| Catena-X partner / Solution Partner status | **No** | — | — |

A status **MUST NOT** appear on the site before it is held. The three pending rows above are the near-term risk: each becomes true on a date nobody will remember to check.

### 1.1 Permitted status expressions

The site **MAY** use, and no others:

- `Catena-X Qualified Advisor`
- `Catena-X member` · `ordinary member of Catena-X Automotive Network e.V.`
- `member of the Catena-X Digital Product Passport Expert Group`
- `Catena-X member & Qualified Advisor` — the composed hero form; single source `CATENA_X_STATUS_LINE` (§2)

The list is semantic, not typographic: case, punctuation and composition variants of listed expressions are permitted (`Ordinary member — Catena-X Automotive Network e.V.` is the second expression with an em dash, not a new claim). **New claims are not.**

The third expression replaces the previous `approved for the Catena-X expert committee on Battery Passport`, which is now wrong in two ways at once — see §1.4.

**Ship this wording now; do not gate it on Stan Faldin's confirmation.** Membership of the group is a fact — Stan added Ichnos, and the first meeting was 11 Aug 2026. The only open item is whether the registered name reads *Digital Product Passport Expert Group*, *CX-DPP Expert Group*, or plain *Digital Product Passport* as the June 2026 collaborative-groups overview lists it. That is a precision question, not a truth question.

Holding the credential until confirmation would mean either leaving `expert committee on Battery Passport` live — wrong on two counts — or removing an earned credential from the site during the exact window the association is publicising the membership. Both are worse than a possible name variant. The note wording in §2.2 is chosen so that the claim stays true under every variant: it asserts membership *of the group* and the group's position *under the committee*, not a specific title. Correction, if needed, is one line in one constants file — which is precisely the condition under which shipping beats waiting.

### 1.2 Prohibited status expressions

The site **MUST NOT** contain, in any casing or word order:

- `Catena-X certified` — no certification is held
- `official Catena-X partner` · `Catena-X partner` — no partner status is held
- `powered by Catena-X`
- `we operate Catena-X` (in ASEAN or anywhere)
- `Catena-X Advisory Provider` · `Official Catena-X Qualified Advisory Provider` — retired v5-era wording
- any assertion that the membership **application is pending**, or that the **qualification** is pending
- `expert committee` used to mean an expert group — see §1.4
- `EU Battery Pass` used to mean the regulated passport — see §1.4
- **`Catena-X-compatible` · `Catena-X compliant` · `Catena-X-conformant` · `compatible with Catena-X`** — the conformance-adjective family. IP Regs 6.3 prohibits using the name *"to advertise compliance with, or conformance to, Standards or technologies of the Association"*, and a compatibility adjective is precisely such advertising. Say what is done (`Catena-X onboarding`, `we connect suppliers to Catena-X`), never what is conformed to. **A live instance exists:** `site.webmanifest` currently reads *"Catena-X-compatible ASEAN data layer…"* — see §2

`Catena-X member` was prohibited under pivot 2 §3.3 and is now permitted. That guardrail entry **MUST** be removed from pivot 2 §3.3, or the conformance grep in §7 will fail a true statement.

### 1.3 Single source of truth

Status strings **MUST** originate in `client/src/constants/catenaXStatus.js` and be consumed from there. A status string **MUST NOT** be hardcoded in a component — this applies to the trademark notice too (§2.1). Every exported status-string constant **MUST** have at least one consumer; a defined-but-unread status string is a defect, because it drifts silently. (Dormant *asset-path* constants are governed by §7.1 item 8, which exempts them while null — a path cannot drift in wording.)

**One wording per claim.** Where two surfaces state the same claim in the same words, the string **MUST** be imported from the constant, never retyped. A deliberately *different* presentation of a claim **MAY** exist only in a constants module (never a component), and the reason it differs **MUST** be documented beside it. This is the rule that prevents the near-duplicate drift the constants exist to stop.

### 1.4 Governance and artefact nouns

Two distinctions that the target audience makes and most outsiders do not. Getting either wrong on a site that claims Catena-X expertise costs more credibility than a plain error would, because the reader concludes you are describing an ecosystem you do not sit inside.

**Committee ≠ Expert Group ≠ Working Group.** These are three defined objects in the association's own structure: *"Committees prepare decision recommendations for the Board"*; *"Expert Groups within Committees support our committees in the preparation of Board decision recommendations"*; Working Groups are temporary teams. Ichnos sits in an **Expert Group** — Digital Product Passport, under the Sustainability Committee — not in a committee. The site currently says **"expert committee"**, a term that does not exist, in `catenaXStatus.js:23` and `credentials.js:14`. It **MUST NOT** be used.

**EU Battery Passport ≠ Battery Pass.** The **EU Battery Passport** is the instrument created by Regulation (EU) 2023/1542. **Battery Pass** is the name of a separate, German government–funded consortium whose Content Guidance the association cites, and after which the *Battery Pass Template Joint Modelling Expert Group* is named. Writing `EU Battery Pass` for the regulated passport conflates a law with a project, in front of people who sit in the group named after the project. The site is currently clean on this — the rule exists to keep it that way, because the error has already appeared once in draft material.

Where the passport is the regulatory instrument, the site **MUST** write `EU Battery Passport`. Where the reference is to the consortium or to the expert group, it **MUST** write the full proper name.

### 1.5 Personal vs corporate status

The two held statuses attach to **different legal persons**, and surfaces must not blur them:

- The **Qualified Advisor qualification is personal** — the operating model classes qualification labels as *individual*, and attestation 868 names Francesco. It belongs on personal surfaces: the team bio, `TEAM_META`, the founder profile.
- **Association membership and expert-group participation are corporate** — Ichnos Protocol Pte. Ltd. is the ordinary member. They belong on corporate surfaces: hero, footer, credentials, structured data, webmanifest.

Consequence: `teamContent.js` continues to state the Advisor qualification **only**, and that is a design decision, not an omission — *"Francesco is a Catena-X member"* would be imprecise, because he is not; the company is. A comment at the `catenaXStatus` import in `teamContent.js` **MUST** record this so the asymmetry is never "fixed". The bio **MAY** reference the company's membership in company terms (*"…at Ichnos Protocol, an ordinary member of the association…"*) if a later copy pass wants it, but nothing here requires it.

One repair while in that file: `teamContent.js:16` renders *"He is **an** ${CATENA_X_TITLE_BASE}"* → "He is an Catena-X Qualified Advisor". The article **MUST** become `a`. Copy fix, not a status change; §4.5's rewrite prohibition covers service copy, not grammar defects.

---

## 2. Required state — status representation

| Target | Required state |
|---|---|
| `constants/catenaXStatus.js` → `CATENA_X_QUALIFICATION_GRANTED` | `true` — correct today, no change. The dormant `false`-branch text `" (qualification in progress)"` is **retained deliberately** as the flip-back mechanism for a lapse; §7.2's patterns deliberately do not reach it |
| `constants/catenaXStatus.js` → `CATENA_X_TITLE_BASE` | `"Catena-X Qualified Advisor"` — correct today, no change |
| `constants/catenaXStatus.js` → `CATENA_X_MEMBERSHIP_NOTE` | `"Ordinary member — Catena-X Automotive Network e.V."` (em dash — reconciled with §2.2 so constant and credential are **one string**). **Consumer: `credentials.js` imports it as the member credential's `note`**; `structuredData.js` **MAY** also consume it |
| `constants/catenaXStatus.js` → `CATENA_X_COMMITTEE_NOTE` | **Rename to `CATENA_X_EXPERT_GROUP_NOTE`** — the old name perpetuates the §1.4 confusion — with value `"member of the Catena-X Digital Product Passport Expert Group"` (prose form, lowercase start, built for interpolation into sentences). The current value says *expert committee* (a term that does not exist) and *Battery Passport* (not the group's name). **Consumer: `structuredData.js` Organization/ProfessionalService description**, where the expert-group status **MUST** now be stated |
| `constants/catenaXStatus.js` → `CATENA_X_STATUS_LINE` | **New.** `"Catena-X member & Qualified Advisor"` — the composed hero form. Plain constant, not derived from `CATENA_X_TITLE_BASE` (deriving would need string surgery to elide the repeated "Catena-X"; fragile cleverness). Comment **MUST** note it elides the second "Catena-X" deliberately and changes in lockstep with `CATENA_X_TITLE_BASE`. **Consumer: the hero eyebrow** |
| `client/public/site.webmanifest` `description` | **Live IP-Regs 6.3 exposure — fix before go-live.** Currently *"Catena-X-compatible ASEAN data layer for the European battery passport."* — a conformance claim (§1.2) plus a non-standard passport name (§1.4). Replace with: `"Ichnos Protocol makes companies across the ASEAN battery value chain ready for the EU Battery Passport by connecting them to Catena-X."` Readiness is asserted against the **regulation**, connection against Catena-X — never write `Catena-X-ready`, which would re-enter §1.2 conformance territory |
| `client/index.html` static fallback meta | Clean of claims (verified 2026-08-10; "Catena-X onboarding" is descriptive). `SHOULD`: reorder "Singapore · Europe" to the ASEAN-first pattern of pivot 2 §3.4 when next touched |
| `constants/seoMeta.js:68` (`TEAM_META.keywords`) | **Live violation, not merely a target state.** Still contains the retired v5 wording `Catena-X Advisory Provider`, which §1.2 prohibits and the §7.2 `FORBIDDEN` set catches. Replace with `Catena-X Qualified Advisor`. Listed alongside the webmanifest as a current exposure. **SEO conservatism does not apply to this swap**: the string is a §1.2 legality defect, and the replacement is also the term buyers actually search — the association's own programme name |
| `constants/teamContent.js` | **Unchanged by design** (§1.5) — the bio and skills chip carry the personal qualification only; corporate membership stays on corporate surfaces. Two exceptions while in the file: the `an` → `a` grammar fix (§1.5), and the design-decision comment at the import |
| Further client copy carrying conformance adjectives | **Live §1.2 violations, found at T1 execution review (2026-08-10).** The 3.3 audit verified `index.html`, `site.webmanifest` and the constants named above — it did **not** re-sweep all of `client/src` with the then-new conformance-adjective patterns, and additional instances exist in client copy, their tests, and **server chatbot prompt text**. Exact file set: the ticket breakdown. Client instances **MUST** be cleaned **before the tier-2 guard lands** (§7.2 placement rule — they are inside its corpus); rewrites follow §1.2's replacement guidance (*say what is done, never what is conformed to*) and any test updates follow §7.0. Server prompt copy is remediated in the sweep ticket — it sits outside the guard's file set, but chatbot prompts are **outbound user-facing copy** and carry the same IP-Regs 6.3 weight as page copy, not mere hygiene |
| `constants/catenaXStatus.js` → `CATENA_X_MEMBER_LABEL_ASSET`, `..._NEG` | Defined, both `null`, with the lifecycle comment in §3.1. **Exempt from conformance item 8 while null** (§7.1) — dormant landing zone for the member label file, not status strings |
| `constants/catenaXStatus.js` → `TRADEMARK_NOTICE` | **New home for the §2.1 notice.** The string currently lives hardcoded in `molecules/FooterTrademark.jsx` — a component, which §1.3 prohibits for status claims, and the notice asserts two. Move the literal here; the component imports it. This also puts the tier-3 exact string and the §7.2 `REQUIRED` scan on the same file |
| `molecules/FooterTrademark.jsx` | Renders `TRADEMARK_NOTICE` by import — membership stated, **not** hardcoded as pending, no local string literal. Required text in §2.1 |
| `constants/credentials.js` | Carries a membership entry, **first in the array**, whose `note` **imports** `CATENA_X_MEMBERSHIP_NOTE` |
| `constants/landingContent.js` hero eyebrow | Final segment interpolates **`CATENA_X_STATUS_LINE`** (today it interpolates `CATENA_X_TITLE_BASE`) |
| `constants/seoMeta.js` | No `Catena-X Advisory Provider`. `Catena-X member` present where `Catena-X consulting` already appears |
| `constants/structuredData.js` | Status wording identical to `seoMeta.js` (pivot 2 §3.0-6 parity), **and consumes `CATENA_X_EXPERT_GROUP_NOTE`** in the organisation description |
| `constants/vocabulary.js` + `vocabulary.test.js` | **New.** Corpus vocabulary guard, specified in §7.2 |
| Credential components | Tests locate credentials by id, never by copy (§7.0), with a **distinct prefix per surface** because `CREDENTIALS` renders twice on a full page and duplicate test-ids make `getByTestId` throw: the strip carries `credential-` + id, the footer recognitions row carries `footer-recognition-` + id. §3.3's reference implementation carries the footer ids |

### 2.1 Trademark notice — required text

`molecules/FooterTrademark.jsx` **MUST** render exactly:

> Catena-X® is a registered trademark of Catena-X Automotive Network e.V. Ichnos Protocol Pte. Ltd. is an ordinary member of the association and a Catena-X Qualified Advisor. References to Catena-X standards and committees describe factual participation and do not imply certification of Ichnos products or endorsement by the association or its bodies.

The final sentence is load-bearing — it is the explicit disclaimer that makes descriptive name use elsewhere on the site safe (§4). It **MUST NOT** be removed or shortened. The notice appears **once**, site-wide, in the footer.

Two implementation constraints:

- The string **lives in `constants/catenaXStatus.js` as `TRADEMARK_NOTICE`** and is imported by `FooterTrademark.jsx` (§1.3 — the notice asserts status claims, and status claims do not live in components).
- The first sentence (`Catena-X® is a registered trademark of Catena-X Automotive Network e.V.`) **MUST** sit unbroken inside a single string literal. The §7.2 `REQUIRED` check scans raw source text; a concatenation split mid-sentence would make a present notice read as absent.

### 2.2 Credential set

`CREDENTIALS` **MUST** contain only items that are recognitions **of Ichnos**. The membership entry — note the import, which is what gives `CATENA_X_MEMBERSHIP_NOTE` its consumer (§1.3):

```js
import { CATENA_X_MEMBERSHIP_NOTE } from './catenaXStatus';

{
  id: 'catenax-member',
  label: 'Catena-X Association member',
  note: CATENA_X_MEMBERSHIP_NOTE, // 'Ordinary member — Catena-X Automotive Network e.V.'
}
```

It **MUST NOT** carry `isCatenaXLabel: true`. That flag currently means *"render the Advisor asset and link to catena-x.net"*; there is no member asset, and the Advisor asset **MUST NOT** stand in for it.

The existing `expert-committee` entry (`credentials.js:13-16`) **MUST** be corrected — the label is a term that does not exist and the note understates a status now actually held:

```js
{
  id: 'dpp-expert-group',
  label: 'Digital Product Passport Expert Group',
  note: 'Member — expert group under the Catena-X Sustainability Committee',
}
```

The note **MUST NOT** read `Member — Catena-X Sustainability Committee`: that parses as membership *of the committee*, which is not held and is exactly the committee/expert-group conflation §1.4 prohibits. The wording above states the true relation — member of the group, group under the committee. It **ships now, ungated** (§1.1); if Stan Faldin's confirmation later shows a different registered name, the correction is this label in this file, nothing else.

These two literals stay in `credentials.js` rather than importing `CATENA_X_EXPERT_GROUP_NOTE`, and that is deliberate, per §1.3's one-wording-per-claim rule: the prose constant serves sentence interpolation (structured data), while the card needs a label/note pair built to defeat the committee-membership misreading. Different presentation, different surface, reason documented — a comment in `credentials.js` **MUST** say so.

Two existing assertions match this label as a literal string: `organisms/CredentialStrip.test.jsx:43` and `:89`. **Do not simply update the strings.** Both are locating a node by its copy, which is the defect described in §7.0 — it is why the wrong governance term survived unchallenged. Instead:

- Give each credential a stable `data-testid` derived from its `id` — on the strip, `credential-` + id (e.g. `credential-dpp-expert-group`); the footer surface uses its own `footer-recognition-` prefix (§2 table, §3.3) so the two occurrences of each credential never collide — and re-point both assertions at it.
- `:43` then asserts the credential **renders**, not what it says. What it says becomes a §7.2 concern.
- `:89` keeps its real purpose — that this credential carries **no** `<a>` wrapper, which is what stops a second link competing with the one permitted Catena-X link — but locates the node by testid instead of by label text.
- `:46`, `:48` and `:93` assert the `eu-passport-2027` label and note. Those are **deleted, not re-pointed** — the entry they assert leaves `CREDENTIALS` under this section.

**The id `expert-committee` MUST be renamed to `dpp-expert-group`.** This was a `SHOULD`-level call in 3.2 and is now settled: the hyphenated form of the banned term is invisible to a whitespace-only regex, so leaving it would preserve the exact wrong noun inside the source, unguarded, waiting for someone to surface it as a label. §7.2's pattern is widened to `/expert[\s-]*committee/i` accordingly — which means the guard now *forces* this rename rather than merely recommending it. Grep `structuredData.js` and any DOM anchor for the old id first and update those references; do not keep the id to avoid the work.

`eu-passport-2027` ("EU battery passport from 18 Feb 2027") **MUST** be removed from `CREDENTIALS` — settled from `SHOULD` in 3.2. It is a market fact, not a recognition of Ichnos, so it fails the opening rule of this section, and it reads oddly under a heading called *Recognitions*. Removing it also keeps the strip at four cards: `.credential-strip__items` is `repeat(auto-fit, minmax(220px, 1fr))`, and five cards in the 1140 px container render at exactly 220 px and read as cramped. The `minmax` floor therefore stays at `220px` and **MUST NOT** be lowered. If the 18 Feb 2027 date is doing useful work as a market signal, move it into landing copy, where it is a fact about the world rather than a claimed credential.

---

## 3. Catena-X label rendering

### 3.1 Invariants

These hold for every Catena-X label — Qualified Advisor, member, and any future label — on every surface.

- The label **MUST** be the official file supplied by the association. A screenshot, a redraw, a file taken from the web, or a badge cropped from the attestation PDF **MUST NOT** be used.
- The label **MUST NOT** be modified. Operating Model, Data Space Governance: *"All labels are to be used in their original design only. Changes to the label, the wording, or the colour scheme shall not be conducted."* This prohibits inversion, recolouring, CSS `filter`, `transform` tricks, opacity changes to the artwork, and any redrawn variant.
- Aspect ratio **MUST** be preserved. Size by **height** with `width: auto` and `object-fit: contain`. `object-fit: cover` and fixed non-16:9 boxes **MUST NOT** be used.
- The file's transparent margin is **mandated clear space** and **MUST NOT** be cropped. Measured on `CX_Logo_Qualified-Advisor_CLR_RGB_pos_16x9@300.png`: canvas 8001 × 4501, visible mark bounded at (1126, 1149) → (6876, 3239) — ~72 % of canvas width, ~46 % of height. The label therefore sits airier than adjacent text elements. That is correct, not a layout bug.
- If the label is a hyperlink it **MUST** link only to `catena-x.net` (Logo Use Agreement §4). It **MUST NOT** link to an Ichnos page or a third party. At most one linked instance per page.
- Each label file path **MUST** be a single exported constant with a lifecycle comment naming the expiry and **Logo Use Agreement §6.1** (immediate revocation, no notice). Setting the constant to `null` **MUST** remove the image everywhere and fall back to text with no other code change.
- Advisor and member labels have **independent lifecycles** and **MUST NOT** share a constant.
- The Ichnos mark and any Catena-X label **MUST NOT** be composed into a single co-branded lockup, or placed with less separation than the label's own clear space (pivot 2 §2.2-3).

### 3.2 Light surfaces

The positive (`_pos_`) file renders directly. Current state on the homepage credential strip conforms; no change required.

### 3.3 Dark surfaces

The footer is the only sanctioned dark surface. The positive file is dark-text artwork over a pale isometric plinth (tan top ≈ `#E0C699`, blue-grey sides ≈ `#EEEFF1`→`#DDE3F3`) and is illegible on dark. It **MUST NOT** be inverted to solve this.

Required precedence:

1. Official **negative** variant available → render it bare.
2. Otherwise, official **positive** variant available → render it **unmodified** on a white clear-space plaque.
3. Otherwise → plain text.

Rule 1 **MUST** be evaluated first, so that supplying the negative file retires the plaque by setting one constant.

The plaque is not a modification of the label: it supplies the light background the artwork requires. It **MUST NOT** be tinted, and **MUST NOT** be placed over a busy region of the footer background image.

**This is a visible change, and it inverts an existing assertion.** The footer renders text-only today, and `organisms/Footer.test.jsx:224` asserts that no `<img>` appears in the recognitions block. Under this precedence, with the positive asset present and no negative variant, an `<img>` **will** render. That assertion **MUST NOT** simply be deleted: it was protecting a real rule — *never the positive file bare on dark* — and a naive rewrite loses that protection. Replace it with the rule it was standing in for:

> If an `<img>` renders inside footer recognitions while `CATENA_X_LABEL_ASSET_NEG` is null, it **MUST** be a descendant of `.footer-label-plaque`.

That assertion holds in all three precedence states, survives the arrival of the negative file (when the plaque disappears *and* `..._NEG` is non-null), and fails on exactly the defect the original test feared.

Reference implementation — `molecules/FooterRecognitions.jsx`:

```jsx
import { CREDENTIALS } from '../../constants/credentials';
import {
  CATENA_X_LABEL_ASSET,
  CATENA_X_LABEL_ASSET_NEG,
} from '../../constants/catenaXStatus';

/*
  Catena-X Qualified Advisor label on the dark footer.
    1. official negative variant → render bare
    2. official positive variant → render UNMODIFIED on a white plaque
    3. neither → plain text

  The positive file may not be inverted, recoloured or redrawn:
  "All labels are to be used in their original design only"
  (Operating Model — Data Space Governance). Giving it the light ground
  it was designed for is not a modification. Never crop the baked-in
  transparent clear space; never object-fit: cover.

  Lifecycle: the right expires with the qualification (renew by
  2027-07-06) and may be revoked at any time with immediate effect
  (Logo Use Agreement §6.1). Set CATENA_X_LABEL_ASSET to null on lapse —
  this falls through to text with no other change.
*/
function CatenaXFooterLabel({ label }) {
  if (CATENA_X_LABEL_ASSET_NEG) {
    return (
      <img
        alt={label}
        src={CATENA_X_LABEL_ASSET_NEG}
        loading="lazy"
        decoding="async"
        className="footer-label-img"
      />
    );
  }

  if (CATENA_X_LABEL_ASSET) {
    return (
      <span className="footer-label-plaque">
        <img
          alt={label}
          src={CATENA_X_LABEL_ASSET}
          loading="lazy"
          decoding="async"
          className="footer-label-img"
        />
      </span>
    );
  }

  return label;
}

export default function FooterRecognitions() {
  return (
    <div data-testid="footer-recognitions">
      <h6 className="footer-heading">Recognitions</h6>
      {/* footer-recognition-${id}, NOT credential-${id}: the same
          CREDENTIALS render in the strip too, and duplicate test-ids on a
          full-page render make getByTestId throw (§2). */}
      {CREDENTIALS.map(({ id, label, note, isCatenaXLabel }) =>
        isCatenaXLabel ? (
          <div
            className="footer-recognition"
            data-testid={`footer-recognition-${id}`}
            key={id}
          >
            <CatenaXFooterLabel label={label} />
            <p className="footer-text small mb-1">{note}</p>
          </div>
        ) : (
          <p
            className="footer-text small mb-1"
            data-testid={`footer-recognition-${id}`}
            key={id}
          >
            {label}
            {' — '}
            {note}
          </p>
        ),
      )}
    </div>
  );
}
```

An image followed inline by `" — note"` is not acceptable presentation; the Catena-X entry renders label-above-note while other entries keep the single-line form.

### 3.4 Required CSS

`.footer-label-img` is **referenced by the component today and never defined** in `index.css` — a latent defect that would surface the day a negative file is supplied. Both classes **MUST** exist:

```css
/* Catena-X label on the dark footer. The plaque exists only because no
   official negative variant has been supplied; it holds the UNMODIFIED
   positive file on the light ground that artwork requires. Delete the
   plaque and its wrapper span once CATENA_X_LABEL_ASSET_NEG is set. */
.footer-label-plaque {
  display: inline-block;
  background: #ffffff;
  border-radius: 4px;
  padding: 6px 10px;
  margin-bottom: var(--spacing-xs, 4px);
}

/* Aspect-preserved, never cropped or covered — the file's transparent
   margin is mandated clear space. */
.footer-label-img {
  height: 34px;
  width: auto;
  object-fit: contain;
  display: block;
}

.footer-recognition {
  margin-bottom: var(--spacing-sm, 8px);
}
```

`border-radius: 4px` matches `.credential-strip__item`. Height **MAY** be tuned for optical balance; aspect **MUST NOT**.

### 3.5 Multiple labels

While only one label asset exists, `isCatenaXLabel` as a boolean is sufficient. When a second label file is supplied, the boolean stops being expressive and the model **MUST** become label-keyed:

```js
export const CX_LABEL_ASSETS = {
  advisor: { pos: CATENA_X_LABEL_ASSET,        neg: CATENA_X_LABEL_ASSET_NEG,        alt: 'Catena-X Qualified Advisor' },
  member:  { pos: CATENA_X_MEMBER_LABEL_ASSET, neg: CATENA_X_MEMBER_LABEL_ASSET_NEG, alt: 'Catena-X Association member' },
};
```

Credentials then carry `cxLabel: 'advisor' | 'member'`, and `isCatenaXLabel` becomes derived (`Boolean(cxLabel)`) so the link rule in §3.1 continues to hold. Same precedence, same plaque, one lifecycle comment per label. This state is **not** required while `CATENA_X_MEMBER_LABEL_ASSET` is `null`.

---

## 4. Use of the Catena-X name in service and marketing copy

This section answers the question the IP Regulations raise, and it is the one place where getting the rule wrong is expensive in both directions.

### 4.1 The governing text

**IP Regulations Sec. 6.2:** *"Members may use the Association's name and logo solely to communicate their membership in the Association"*, subject to any Board-published trademark guideline.

**IP Regulations Sec. 6.3:** *"The Association's name and its trademark may not be used to advertise compliance with, or conformance to, Standards or technologies of the Association, and also may not in any other way be associated with any product or service of a Member, except as authorised by a separate written license agreement with the Association or a guideline approved by the… Management Board."*

These bind members. Ichnos is one.

### 4.2 The operative distinction

Sec. 6.3 governs the **Catena-X name and trademark as marks** — as badges attached to what a member sells. It does not, and cannot coherently, prohibit a member from stating factually what it works on. The Association itself defeats the literal reading: it operates a **Qualified Advisor** programme, publishes a public list of Qualified Advisory Providers on the Campus so that buyers can find advisors, and licenses each advisor a label to display. A qualification whose holders were forbidden to say what they are qualified in would have no function.

The line therefore falls between two kinds of use:

**Descriptive use — permitted.** Naming Catena-X to describe, truthfully, what the service does or which standards it works to. *"We connect ASEAN manufacturers to Catena-X."* *"We map production data to the `battery_pass` aspect model."* *"Catena-X services"* as a section heading meaning *services relating to Catena-X*.

**Mark use — prohibited without authorisation.** Attaching the name or trademark to the offering so that it reads as the Association's own, endorsed, or certified. *"Catena-X Certified Integration."* *"Ichnos Catena-X Solution."* Placing the Catena-X label beside a service card or a price. Wordmark styling that mimics the Catena-X logotype.

### 4.3 What the site MAY do

- Describe services in relation to Catena-X, factually, in the site's own voice.
- Use exact official names for official artefacts — KITs, standards, aspect models, committees — labelled as official and linked to their official source. This is the microline construction in pivot 2 §3.2 and it **SHOULD** be retained: it is the clearest available evidence that the site explains official concepts rather than appropriating them.
- Head a services section `Catena-X services`. The construction is descriptive, parallel to *"EU regulatory services"*, and does not assert endorsement.
- State membership and the Qualified Advisor qualification anywhere on the site (Sec. 6.2 expressly permits communicating membership).

### 4.4 What the site MUST NOT do

- Claim certification, conformance, endorsement, approval or partnership. §1.2 is the operative list.
- Present a Catena-X KIT, standard or component as an Ichnos product.
- Place any Catena-X **label or logo** on, beside, or within a services section, a pricing element, a case study, or any offering surface. **This is the sharpest rule in §4**, because it is the trademark association Sec. 6.3 aims at, and it is the rule most easily broken by a well-meaning design change. Labels are confined to the credentials strip and the footer recognitions row (pivot 2 §2.2-3).
- Style "Catena-X" as a brand mark in Ichnos copy — no logotype imitation, no lockup, no colour treatment that reads as the official wordmark. Plain text in the surrounding typeface.
- Use `Catena-X` as the leading element of a proprietary product or service **name** (as distinct from a descriptive section heading). `Catena-X onboarding services` is descriptive; `Catena-X Connect by Ichnos` is a product name and prohibited.

### 4.5 Required state of current copy

The service pillar `id: "catena-x"`, the group header `Catena-X services`, the group lede, the five `catenax-*` card bodies and their microlines all conform to §4.3 as written and **MUST NOT** be rewritten under this specification. `id` values are DOM anchors and test keys, are not user-visible, and are out of scope entirely.

Two obligations attach instead:

- The trademark notice in §2.1 **MUST** remain present and unabridged. It is what converts descriptive use into *documented* descriptive use.
- The Board-approved trademark guideline that Sec. 6.2 and 6.3 both defer to **is not in the association's published document set**. It has been requested from the Management Office with the onboarding reply (August 2026), together with this question, recorded verbatim so the answer maps cleanly onto a decision:

  > *"My reading is that the rule is aimed at claims of certification, conformance or endorsement, which we make nowhere and are careful to disclaim, and not at describing factually what we work on. Is that reading correct? Concretely: may we write on our website that we help suppliers connect to Catena-X, as long as no Catena-X label appears next to those services?"*

  **If the answer confirms the reading** — no change; append the confirmation date here as the standing authority.
  **If the answer is narrower**, amend §4 in a new version before touching any copy, and treat the services pillar naming, not the card bodies, as the first thing to give up.
  Until an answer arrives, §4 stands and the copy **MUST NOT** be changed.

---

## 5. Brand asset invariants

- **Open Graph image.** `client/public/og-image.jpg` **MUST** be generated from `/brand/ichnos_lockup_dualtone.svg` on white with the v5 §6.1 headline. It is currently the pre-pivot 14 May file while the brand changed on 23 July, and it is what every link preview renders — including the preview behind the association's welcome announcement. Referenced at `client/index.html:25,29`.
- **Logo sources.** The `/brand/ichnos_*` SVG set is authoritative. Fills are `#B3CB2D` (canopy), `#FFA600` (trunk and circuit roots), `#111` (wordmark), `#0F71CB` (mono variant), `#FFFFFF` (reversed) — the Catena-X brand pair and portal blue exactly, per pivot 2 §2. No other fill **MAY** appear in a brand asset.
- **Orphans.** `client/public/logo.png`, `logo-dark.png`, `Ichnos-protocol_logo_transparent.png`, `favicon.png`, `apple-touch-icon.png` — plus, confirmed in the 2026-08-10 implementation review: `client/public/footer-bg.jpg` (superseded by `bg-footer.jpg`, the only variant referenced, `index.css:95`; `designRefinementEpic.md:926` already required it gone) and `client/public/vite.svg` (untouched Vite scaffold default). All seven have zero code references and **MUST** be deleted. The comment at `index.css:110` naming the old PNGs as the source **MUST** be corrected. Deletions respect the repo's per-commit file cap with **coherent groupings, not arbitrary thirds** — e.g. the three wireframes as one unit; `logo.png` + `logo-dark.png` + the `index.css:110` comment that names them; the remaining brand PNGs; `footer-bg.jpg` + `vite.svg`.
- **Theme colour.** `site.webmanifest:8` `theme_color: #0F1419` contradicts `index.html:14` `#FAFBFC`. They **MUST** agree; `#FAFBFC` is correct.
- **Dead rules.** The defused `.gradient-text` rule at `index.css:349` has no consumer and **SHOULD** be deleted.
- **Palette invariants.** Inside `.theme-advisory` and `.theme-catenax`, the tokens `#0F71CB`, `#FFA600`, `#B3CB2D`, `#EAF1FE`, `#DCDCDC`, `#FAFBFC` **MUST** be present. Repo-wide, `#9945FF`, `#7B3FE4`, `#DC1FFF`, `#14F195`, `#00FFA3`, `#00A89A`, `#0F0F23`, `#0A1628` **MUST** be absent. `#FFA600` and `#B3CB2D` **MUST NOT** be used as a text colour. These invariants **MUST** be machine-asserted — `components/theme-scoping.test.jsx` currently checks `--color-bg-base` only, so a palette regression ships silently.

---

## 6. Excluded vocabulary

The Solana and blockchain direction is discontinued. The following **MUST NOT** appear anywhere in the repository, in code, copy, comments, metadata or legal text:

`solana` · `on-chain` · `onchain` · `web3` · `NFT` · `mint` (asset sense) · `DeFi` · `crypto` · `blockchain` · `distributed ledger`

Two exceptions, and no others: the company name **Ichnos Protocol**; and `wallet` **only** in the sense of *identity wallet* in a Catena-X connector context.

**`crypto` is narrowed rather than exception-listed.** A bare `/\bcrypto\b/i` matches Node's own `import { createHash } from "crypto"` in `server/` — legitimate, and unrelated to the discontinued direction. The correct fix is a tighter pattern, not an `ALLOWED_EXCEPTIONS` entry: exceptions accumulate, get copy-pasted, and are rubber-stamped on the next failure. Use `/\bcryptocurrenc/i` and `/\bcrypto[\s-]?(?:asset|wallet|token)/i`. Bare "crypto" in marketing prose effectively always co-occurs with `blockchain`, `web3`, `solana`, `NFT` or `DeFi`, each of which is caught independently.

pivot 2 §4.1 currently permits one architecture footnote (*"…fingerprinted and anchored on public infrastructure for tamper-evidence…"*). That permission **MUST** be withdrawn from pivot 2 §4.1, so the rule is zero occurrences with no exception clause for a later contributor to invoke.

`client/src` already conforms. Scope of the manual sweep, resolved:

| Area | Treatment |
|---|---|
| `server/`, `e2e/`, `scripts/` | **In scope.** Sweep with the narrowed `crypto` patterns above; no exception entry needed |
| `legal/` | **In scope, read in full.** Privacy policies and terms carry this language in prose a keyword sweep will miss |
| `client/index.html`, `client/public/` | **In scope.** Covered by the §7.2 test's explicit file list |
| `README.md` | **In scope.** Still documents a Solana architecture phase and a `#14F195`/`#9945FF` palette table. Developer-facing, so not an IP-Regs exposure — but a contributor who reads it will reintroduce the retired palette. Fix after the go-live-critical items, not before |
| `client/wireframes/*.html` | **Delete.** Dead Solana-era prototypes, unreferenced by any build or route. Stripping them (rather than deleting) yields files that are neither current design nor honest history; git retains them either way. Confirm no build config references them first. If any is still wanted as a visual reference, move it out of the repository — do not park it under `docs/` to inherit the exemption below |
| `docs/**` | **Exempt**, and excluded explicitly rather than by the glob happening to miss it. These documents are the corpus that defines the prohibitions and must quote every prohibited term to prohibit it |

**Two amendments to `docs/website_Catena_pivot_2.md` are mandated by this specification and are part of this work**, not separate: remove `Catena-X member` from the §3.3 forbidden-phrasings list (§1.2 — it is now a true statement, and the conformance grep would fail it), and withdraw the §4.1 permission for a single public-infrastructure anchoring footnote (above — the rule is zero occurrences, with no exception clause for a later contributor to invoke).

---

## 7. Conformance

### 7.0 Testing model — three tiers, and why

Conformance is asserted at three levels. They are separated deliberately, because collapsing them is itself a defect.

The failure this design corrects is real and already occurred in this codebase. `CredentialStrip.test.jsx:43` asserted `getByText('Expert committee — Battery Passport')`. That test passes **if and only if** `credentials.js` contains that string. It is a tautology with a test runner attached — it can never report that the string is wrong, and it did not, while the site displayed a governance term that does not exist in the association's structure. It asserted *consistency*; consistency with a wrong value is the failure mode, not the safeguard.

| Tier | Asserts | Locates by | Breaks when |
|---|---|---|---|
| **1 — structural** | Behaviour and DOM shape | `data-testid` or role, **never copy** | Behaviour changes |
| **2 — vocabulary** | Words that may never appear, and a few that must | Text scan over source files | A prohibited term is introduced |
| **3 — exact string** | A short, enumerated set of legally load-bearing strings | Exact match | A string with legal weight is altered |

Two rules govern the split.

**A component test MUST NOT locate an element by marketing copy.** Copy is free to change; behaviour is not. A test that breaks on a copy edit teaches the reader to update tests mechanically to match whatever the code now says — which is how a wrong string gets blessed by a passing suite.

Corollary: a DOM assertion **MAY** compare rendered text against an **imported constant** (`expect(node.textContent).toBe(TRADEMARK_NOTICE)`), and **MUST NOT** restate the string as a literal. The imported form can never drift — it fails exactly when the component stops rendering the source of truth, and it needs no manual update when the constant legitimately changes. The restated form is the tautology this section exists to kill.

**Tier 3 MUST stay small.** The value of an exact-match assertion is inversely proportional to how many exist. If every string is exact-matched, a failing string test carries no information and the reviewer simply updates it. If four exist and one fails, someone stops and thinks. Keeping tier 3 near-empty is what makes its survivors mean something.

### 7.1 Tier 1 — structural invariants

Each is covered by a test that locates its subject by `data-testid` or role.

1. With `CATENA_X_LABEL_ASSET_NEG` set, the footer renders the negative file bare and no plaque element exists in the DOM.
2. With `..._NEG` null and `CATENA_X_LABEL_ASSET` set, the footer renders the positive file inside a white plaque.
3. With both null, the footer renders text and no `<img>`.
4. Conditions 1–3 are covered in `organisms/Footer.test.jsx`. **Structure:** the file's current top-level eager `beforeEach` render blocks `vi.doMock` from taking effect, so the three states cannot be bolted on. Restructure it — the existing layout/nav/a11y assertions move **unchanged** under a "default state" `describe`, and each mocked precedence state gets a sibling `describe`, mirroring the pattern `CredentialStrip.test.jsx` already uses. Do **not** bolt an isolated `cleanup()`-plus-dynamic-re-import block onto the untouched file: two competing lifecycles in one suite is the kind of machinery future contributors are afraid to touch, and fear of a test file is how assertions rot. Splitting the label states into a second file is the recorded-deviation fallback if the restructure proves genuinely disruptive — not the plan.
5. Exactly one credential renders as a link, and its `href` is `https://catena-x.net`. Every other credential renders with no `<a>` wrapper.
6. Every credential in `CREDENTIALS` renders exactly once in the strip and once in the footer recognitions row — asserted per surface via the two prefixes: `credential-` + id in the strip, `footer-recognition-` + id in the footer. On a full-page render each testid is unique, so no assertion needs `getAllByTestId` or `within()` scoping to survive.
7. The footer trademark notice renders exactly once site-wide.
8. Every exported **status-string** constant in `catenaXStatus.js` has at least one consumer. **Scope:** the rule exists to stop wording drift, so it covers strings that state a status (`CATENA_X_TITLE_BASE`, `CATENA_X_MEMBERSHIP_NOTE`, `CATENA_X_EXPERT_GROUP_NOTE`, `CATENA_X_STATUS_LINE`, `TRADEMARK_NOTICE`). **Exempt while `null`:** `CATENA_X_MEMBER_LABEL_ASSET` and `..._NEG` — an asset path cannot drift in wording, and each is a pre-wired landing zone whose lifecycle comment (§3.1) documents the dormancy. The exemption ends the day either file arrives.
   **Mechanism — asserted in `vocabulary.test.js`, not by lint and not by review.** ESLint cannot do this job: the repo's `varsIgnorePattern: "^[A-Z_]"` exempts every UPPER_SNAKE_CASE constant from unused-variable reporting, which is precisely how the two dormant constants survived — do not swap this assertion for a lint rule later. `vocabulary.js` exports the five names as `STATUS_STRING_EXPORTS` (explicit enumeration beats introspection — adding a status constant is a reviewed act that also updates this list), and `vocabulary.test.js` reuses its existing `FILES` walk.
   **Scan contract — a naive identifier search is not CI-worthy, and the reason is the same `varsIgnorePattern`:** an *unused* uppercase import survives lint, so an import alone proves nothing, and a comment (`// TODO wire CATENA_X_STATUS_LINE`) satisfies a raw text search while wiring nothing. The scan **MUST**, per file: strip comments (the `stripBlockComments` pattern already in `theme-scoping.test.jsx`, plus line comments); strip **import statements, multiline-aware** (a line filter misses the identifier inside a multiline `import { … }` block — strip the full statement); then count an identifier as consumed only on **≥ 1 remaining occurrence** in a file other than `catenaXStatus.js` and its test. Failures **MUST** aggregate — one assertion reporting *every* unconsumed constant, not a fail-fast on the first.

### 7.2 Tier 2 — vocabulary, as a corpus test

**Required artefact: `client/src/constants/vocabulary.test.js`.** Not a component test — it reads source files as text and scans them. The repo already uses this pattern: `components/theme-scoping.test.jsx` reads `index.css` with `readFileSync` and asserts against raw text, with no DOM.

Scope **MUST** include components as well as constants — the file walk below covers all of `client/src/**/*.{js,jsx}` — because hardcoded strings in components are exactly what a constants-only sweep misses. (`FooterTrademark.jsx` hardcodes its notice today; §2.1 moves it to constants, and the walk covers both homes either way.)

**Two exclusions are mandatory, and omitting either makes the test fail against itself:**

- **The vocabulary module and its test.** They contain every prohibited term as a regex literal. Self-scanning is guaranteed failure.
- **All `*.test.{js,jsx}` files.** A test may legitimately assert that a string is *absent* — `expect(notice).not.toContain('application is in progress')` — and a naive scan reads that as an occurrence.

Excluding test files is correct on the merits, not just convenient: what ships to a reader is non-test source, and that is what the vocabulary rule governs.

**No new dependency, and no repo-root-relative paths.** Conformance item 25 forbids dependency changes, so `glob` **MUST NOT** be added; and Vitest runs with `cwd = client/`, so paths resolve from the client root. `fs.globSync` **SHOULD** be avoided too — its availability is Node-version dependent, and this test must not be the thing that breaks on a runtime upgrade.

Use the pattern the repo already has. `components/theme-scoping.test.jsx` locates `index.css` with `resolve(dirname(fileURLToPath(import.meta.url)), '..', 'index.css')` and reads it as text; this test is the same shape at directory scale:

```js
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const CLIENT_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');

// node_modules/dist are defensive (they never sit under src/ today, but
// survive a future widening of the walk root). 'wireframes' is deliberately
// NOT listed: §6 deletes that directory, and a skip entry for a directory
// that must not exist would quietly mask its reappearance.
const SKIP_DIRS = new Set(['node_modules', 'dist']);
const SKIP_FILES = /(\.test\.(js|jsx)|vocabulary\.js|vocabulary\.test\.js)$/;

function walk(dir, out = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) {
      if (!SKIP_DIRS.has(e.name)) walk(join(dir, e.name), out);
    } else if (/\.(js|jsx)$/.test(e.name) && !SKIP_FILES.test(e.name)) {
      out.push(join(dir, e.name));
    }
  }
  return out;
}

// Static shells are user-visible and sit outside the js/jsx walk — the one
// live 6.3 violation found in the 2026-08-10 audit was in site.webmanifest,
// which no component test and no js-only sweep would ever have touched.
export const FILES = [
  ...walk(resolve(CLIENT_ROOT, 'src')),
  resolve(CLIENT_ROOT, 'index.html'),
  resolve(CLIENT_ROOT, 'public/site.webmanifest'),
];
```

`readdirSync` with `withFileTypes` is available on every Node the project could plausibly run, and the walk is ten lines — cheaper than the dependency and cheaper than the version risk.

```js
// Terms that may never appear in client source. Regexes are deliberately
// narrow so that legitimate text does not trip them:
//  - EU Battery Pass\b(?!port) misses both "EU Battery Passport" and
//    "Battery Pass Modelling Expert Group" (no "EU " prefix).
//  - expert committee does not touch the trademark notice's
//    "standards and committees".
export const FORBIDDEN = [
  /Catena-X\s+certified/i,
  /official\s+Catena-X\s+partner/i,
  /powered\s+by\s+Catena-X/i,
  /we\s+operate\s+Catena-X/i,
  /expert[\s-]*committee/i, // hyphen form catches the stale `expert-committee` credential id
  /EU\s+Battery\s+Pass\b(?!port)/i,
  /Catena-X\s+Advisor(?:y)?\s+Provider/i,
  // Conformance-adjective family (IP Regs 6.3) — caught the live
  // site.webmanifest instance in the 2026-08-10 audit.
  /Catena-X[\s-]*(?:compatible|compliant|conformant|conforming)/i,
  /(?:compatible|compliant|conformant)\s+with\s+Catena-X/i,
  /(?:membership|application)[^.]{0,40}in\s+progress/i,
  /consultant\s+qualification[^.]{0,30}in\s+progress/i,
  // Solana sunset (§6). Bare \bcrypto\b is deliberately ABSENT — it would
  // match Node's own `import { createHash } from "crypto"`; §6 narrows the
  // pattern instead of exception-listing a builtin.
  /\bsolana\b/i, /on-?chain/i, /\bweb3\b/i, /\bNFT\b/,
  /\bDeFi\b/i, /\bcryptocurrenc/i, /\bcrypto[\s-]?(?:asset|wallet|token)/i,
  /\bblockchain\b/i, /distributed\s+ledger/i,
];

// Groups not yet joined (§1). Move an entry out only when membership is
// confirmed in writing, and update §1 in the same commit.
export const NOT_YET_HELD = [
  /Battery\s+Pass\s+Modelling/i,
  /PCF\s+Architecture/i,
  /DPP\s+Regulations/i, // Stan confirmed DPP only; Regulations group unconfirmed
  /\bAPJ\b/, /Asia,?\s+Pacific,?\s+Japan/i,
];

// Item 8 (§7.1): the status-string exports that must each have a consumer
// outside catenaXStatus.js. Enumerated, not introspected — adding a status
// constant is a reviewed act that updates this list in the same commit.
export const STATUS_STRING_EXPORTS = [
  'CATENA_X_TITLE_BASE',
  'CATENA_X_MEMBERSHIP_NOTE',
  'CATENA_X_EXPERT_GROUP_NOTE',
  'CATENA_X_STATUS_LINE',
  'TRADEMARK_NOTICE',
];

// Solana-era palette (§5), scanned as TEXT over the same file set. This is
// what catches an inline JSX style ({ color: '#9945FF' }) — a defect the
// CSS-only assertion in theme-scoping.test.jsx can never see.
export const LEGACY_HEXES = [
  /#9945FF/i, /#7B3FE4/i, /#DC1FFF/i, /#14F195/i,
  /#00FFA3/i, /#00A89A/i, /#0F0F23/i, /#0A1628/i,
];

// Must be present somewhere in client source.
export const REQUIRED = [
  /Catena-X® is a registered trademark of Catena-X Automotive Network e\.V\./,
];

// Escape hatch, audited. Each entry is an EXACT string permitted despite
// matching a FORBIDDEN pattern, with the reason it is permitted. Adding an
// entry is a reviewed decision, not a fix for a failing test. It exists for
// FALSE POSITIVES ONLY — legitimate text a narrow pattern wrongly matches.
// A genuine §1.2 violation is NEVER an exception: exempting a real
// conformance claim would gut the legal position this file guards.
export const ALLOWED_EXCEPTIONS = [
  // (empty — no exception is currently justified)
];
```

**Guard placement in the phase sequence.** Three `FORBIDDEN` patterns match live source today, and a fourth matches `catenaXStatus.js` and `credentials.js` — so a guard-first phase would commit a red suite, which the repo's green-before-commit rule forbids. The guard therefore lands in the **earliest green position**: immediately after the phases that clean its corpus (the status-constants/trademark/webmanifest work and the credentials group), and **before** the label-rendering and sweep phases, which it then guards. Landing it last would spend the guard on nothing. `vocabulary.js` and `vocabulary.test.js` ship **together** — pattern data with no test executing it asserts nothing, and the patterns have already had their standalone review here.

**The same rule governs every new guard, not just this one: land it in the earliest position where it is green.** Applied to the palette assertion (item 22): the current `index.css` already satisfies the planned token and legacy-hex checks, so the strengthened `theme-scoping.test.jsx` **MUST** land *before* the phase that edits `index.css` for the plaque — a guard that arrives one phase after the change it guards has missed its only customer.

The test **MUST** report the offending file, line and matched text on failure, so a hit is actionable without a manual search. `wallet` is deliberately **not** in `FORBIDDEN`: it is permitted in the sense of *identity wallet* in a Catena-X connector context (§6) and a blanket ban would produce false positives. Review it by hand.

**Pattern-widening re-sweep rule.** Whenever a pattern is added to `FORBIDDEN` or an existing one is widened, the full corpus — the test's file set *and* the §6 manual-sweep areas — **MUST** be re-swept with the new pattern in the same change, and every hit either fixed or ticketed **before** any "clean" claim is relied on. The lesson is from this project's own history, twice over: the `expert[\s-]*committee` widening in 3.6 was re-applied to source and forced the credential-id rename, but the conformance-adjective family added in 3.3 was verified only against the files then under audit — and the unswept remainder of `client/src` surfaced as live violations during T1 execution. A "clean" verdict is dated and pattern-scoped; it does not survive a pattern change.

The pattern set was stress-tested on 2026-08-10, and re-verified the same day after the 3.6 changes (narrowed `crypto`, widened `expert[\s-]*committee`): zero false positives against every §2 required string — including the em-dash membership note and `CATENA_X_STATUS_LINE` — with Node's `crypto` import, `cryptographic`, `Technical Committee for Modelling`, `EU Battery Passport`, `battery_pass`, the kanban label `In Progress` and the notice's `standards and committees` all passing, and every probed violation caught (including the stale `expert-committee` id, `crypto wallet`, `cryptocurrency`). One deliberate looseness: the `application … in progress` pattern could catch a generic UI status string (e.g. a form-submission state). If that ever happens, the string goes in `ALLOWED_EXCEPTIONS` with its reason — do not widen or delete the pattern.

9. `vocabulary.test.js` exists, runs over the §7.2 file set (the `client/src` walk plus `client/index.html` and `client/public/site.webmanifest`), and is green.
10. Adding any §1.2 prohibited expression to any source file turns it red — verified once, by deliberately introducing one and reverting.
11. `ALLOWED_EXCEPTIONS` is empty, or every entry carries a written reason.
12. The §6 sweep additionally covers `server/`, `e2e/`, `legal/`, `scripts/`, and the remainder of `client/public/` — everything outside the test's file set. `legal/` is read, not only grepped.

### 7.3 Tier 3 — exact-match, enumerated

This list is closed. Adding to it requires a reason recorded here.

13. **The footer trademark notice** matches §2.1 character for character, including the final non-endorsement sentence. *Reason: that sentence is the disclaimer on which the descriptive-use position in §4 rests. Shortening it is a legal regression, not a copy edit.* **Mechanism — two halves, neither sufficient alone:** `catenaXStatus.test.js` asserts `TRADEMARK_NOTICE` character-for-character (the tier-3 exact match — this is the one place the literal is legitimately restated, because comparing a constant to itself would assert nothing); `Footer.test.jsx` asserts the rendered node's `textContent` equals the **imported** constant (tier-1, testid-located, per the §7.0 corollary). The constant assertion alone would let the component drift back to a stale local literal — the §7.2 `REQUIRED` scan would still pass on the constant — and the DOM assertion alone would bless whatever the constant says.
14. **`Attestation ID 868 · valid to 06 Jul 2027`** in `credentials.js` matches exactly. *Reason: a factual claim about a credential, with an expiry that drives a removal obligation.*
15. **`CATENA_X_LABEL_ASSET`** equals the official filename exactly. *Reason: any other value means an unofficial file is being served, which breaches the Logo Use Agreement.*

Nothing else. In particular, no service card body, no card title, no lede, no hero eyebrow and no credential label is exact-matched — those are tier 2 concerns.

### 7.4 Manual conformance

Not automatable; verified by review before promotion.

16. No CSS `filter`, `transform`-based inversion, `object-fit: cover`, fixed non-16:9 box or opacity change applies to any label image.
17. No Catena-X label or logo appears within any services, pricing or case-study section — checked at 1440 px, 768 px and 390 px.
18. "Catena-X" appears in body copy as plain text in the surrounding typeface, never as a styled mark or logotype imitation.
19. Every official artefact name is linked to its official source.
20. `og-image.jpg` regenerated post-pivot and verified by a real link unfurl, not by opening the file.
21. `seoMeta.js` and `structuredData.js` state **no contradictory status claims, and any claim both make uses identical wording** (imported per §1.3). `structuredData.js` **MAY** state a superset — it carries the expert-group status (§2) which `seoMeta.js` does not, because schema.org descriptions have the length budget that meta descriptions and keyword lists lack, and forcing the extra claim into every meta string would degrade them for a formalism. Parity guards against *drift between shared claims*, not against one surface knowing more.

### 7.5 Assets and regression

22. Palette invariants in §5 machine-asserted, **split by what each home can see**: `theme-scoping.test.jsx` (which reads `index.css` as text) asserts the six tokens present in both theme blocks, the eight legacy hexes absent from `index.css`, and no direct `color:` declaration of `#FFA600`/`#B3CB2D`; `vocabulary.test.js` scans `LEGACY_HEXES` over its whole file set, which is what catches inline JSX styles. Var-indirection (`color: var(--color-accent-warm)`) is not machine-decidable from text and stays a §7.4 review point. "Repo-wide" in §5 means, for the *machine* assertion, shipped client source — `README.md` and `docs/**` hexes are governed by the §6 table (deferred task and explicit exemption respectively), and `client/wireframes/` is deleted outright.
23. `.footer-label-img` and `.footer-label-plaque` are defined in `index.css`.
24. All seven §5 orphan files absent (five PNGs, `footer-bg.jpg`, `vite.svg`); `site.webmanifest` and `index.html` theme colours agree.
25. Full test suite green; lint green; no route or dependency changes; Lighthouse on the Vercel preview not worse than baseline.

Tests are colocated at organism and page level. `molecules/FooterRecognitions.jsx`, `molecules/CredentialLabel.jsx` and `molecules/FooterTrademark.jsx` have no colocated tests and are covered through `organisms/Footer.test.jsx`, `organisms/CredentialStrip.test.jsx` and `pages/LandingPage.test.jsx`. `vocabulary.test.js` sits with the constants, as `theme-scoping.test.jsx` sits with the components it reads.

---

## 8. Out of scope

Routes and IA · hosting · the chatbot and its knowledge base · analytics · forms · the substance of the five `catenax-*` service cards, their microlines and the `/catena-x` focus list (§4.5) · service `id` values · anything in v5 not named here.

Outside this repository but subject to the same §1 vocabulary: `EU_Battery_Passport/docs/Catena-X/presentations/IBS2026_Day3_Lecture4_prep.md:42`, which still mandates *"membership: application in progress"* and prohibits the word "member". That guardrail is obsolete and the talk is on 28 Aug 2026.

---

## Appendix — provenance

- Membership and qualification status, label routes, governance quotations: `Battery_regulations_Advisory/Catena-X/CatenaXmembershipOnboarding.md` §0.1, §2.6, §2.7
- Label rules, label types, 12-month qualification validity, *"original design only"*, qualification labels supplied by an external authorised organisation: Operating Model — Data Space Governance, `catenax-ev.github.io/docs/next/operating-model/how-data-space-governance`
- Member and certification label distribution: `github.com/catenax-eV/cx-resources`, folder `catena-x-labels` — countersign the Logo Use Agreement, send to `info@catena-x.net`, then download. Advisor label distribution: `catena-x.academy/lana-download/qualified-advisor-logo/` (account-gated)
- IP Regulations Sec. 6.2 / 6.3, and the Articles, Antitrust Guidelines and Contribution Regulations: `EU_Battery_Passport/docs/Catena-X/260128_*.pdf`, all dated 28 Jan 2026. Each carries *"The English text constitutes a non-binding convenience translation only. The German text is binding."* §4 is written against the English column; if §4 is ever contested, read the German
- Label file geometry and colour values in §3.1 and §3.3 measured directly from `client/public/brand/CX_Logo_Qualified-Advisor_CLR_RGB_pos_16x9@300.png`
- Ichnos SVG fill values in §5 extracted directly from `client/public/brand/ichnos_*.svg`
- Raster icons pixel-audited 2026-08-10: `favicon-32.png`, `apple-touch-icon-180.png`, `icon-512.png` are 91–100 % exact Catena-X palette (`#FFA600` / `#B3CB2D`), zero Solana-era pixels; `site.webmanifest` icon paths all point to `/brand/`
- Vocabulary regex stress-test 2026-08-10: zero false positives on §2 required strings; all probed §1.2 violations caught; conformance-adjective gap found via the live `site.webmanifest` instance and closed in this version
