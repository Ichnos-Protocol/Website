# website_readiness_assessment_page.md — Data readiness assessment page

**Version 1.3, 2026-09-22 · Status: normative · ready for one Traycer run**

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
2. **One new dependency is permitted and only one:** none. The booking integration is a link-out, not an embed (§6.1). Any proposal to add a calendar SDK, including Google's appointment schedule embed script, is a separate decision, not a Traycer judgement call.
3. Phases per §9. The 3-file cap holds unless a phase is marked *atomic*; every atomic phase here is pre-approved with its reason recorded. Do not re-ask.
4. **Commit boundary is the semantic flip, not the file count** (pivot-3 §9.11/§9.12). Any consumer of a changed data shape lands in the same commit as the shape change.
5. **Guards land in the earliest phase where they are green** (pivot-3 §7.2). The FORBIDDEN widening in §3 lands in P1 only if the corpus is already clean of each pattern; any pattern with live occurrences lands in the commit that deletes its last occurrence. A red P1 is never acceptable.
6. **Tests locate by `data-testid` or role, never by copy** (pivot-3 §7.0). DOM assertions compare against imported constants and MUST NOT restate literals.
7. **Owner-assigned, not Traycer:** creating and configuring the Google Calendar appointment schedule (§6.5, §11), the live click-through check on desktop and mobile, Lighthouse, the three-viewport review, and re-verification of the membership claim in §4.7.
8. Green before commit, every phase.

---

## 1. What this page is for

**Single job: convert a reader who already knows they have a data problem into a booked 30-minute scoping call.** Not to educate, not to rank, not to explain the regulation. `/passport` does the explaining and this page is where that traffic goes to act.

Five consequences that bind the rest of this document:

- **Success is booked calls.** Time on page, scroll depth and newsletter-style engagement are not goals and MUST NOT drive layout decisions.
- **This is an offering surface with a price anchor.** That triggers the sharpest rule in pivot-3 §4.4: **no Catena-X label or logo may appear on, beside or within this page.** §3 makes it machine-checkable rather than a matter of designer discipline.
- **There are no clients to name.** The page ships with zero case studies and zero named references, and MUST NOT be written in a way that implies prior engagements. The credibility carriers are the credential line (§4.7), the published-work strip (§4.7.1) and the specificity of the deliverables (§4.3).
- **This is outbound collateral that happens to have a URL.** It will not be found by search in the time that matters. Its real job is to be the link inside a cold email, opened on a phone in Jakarta or Shenzhen thirty seconds after that email arrives, by someone deciding whether the sender is serious. **That reorders the priorities:** above-the-fold clarity, mobile rendering and load time are load-bearing; keyword depth, FAQ length and long-form SEO are not. Where the two conflict, the phone wins. The §8 manual review is conducted on a phone first, desktop second.
- **The page does not compete on explaining the regulation.** Regulatory-interpretation consultancies already serve this buyer population, including Chinese exporters to the EU. The differentiators are data-space depth, standards participation and physical presence in ASEAN. Copy that re-explains what the regulation says is copy that puts Ichnos into a crowded comparison it does not win.

---

## 2. Placement and routing

### 2.1 The parent route must be read from the code, not from the specs

pivot-3 records a standing documentation error: pivot-2 lists the routes as `/data (ex-/passport)` while `App.jsx:56-62` has it the other way round, and pivot-3's ruling is **the code is correct, do not change it to match**. That ruling still holds and this run does not resolve the naming question (§10).

**Therefore:** read `App.jsx` first. The battery passport page's live path is the parent. The new page is that path plus `/readiness-assessment`.

- Canonical child path: `<live passport path>/readiness-assessment`.
- If the sibling name (`/data` or `/passport`, whichever is not live) resolves at all, its `/readiness-assessment` child MUST issue a permanent redirect to the canonical path. If it does not resolve, add nothing.
- The route constant lives beside the existing route definitions, and every link in §2.3 imports it. **Zero hardcoded path strings in components or tests.**

### 2.2 Not a top-level nav item

The navbar does not gain an entry. A fixed-scope paid engagement sitting in primary navigation alongside `Services` and `Team` reads as a product catalogue and dilutes the passport page it depends on for context.

### 2.3 Entry points (exactly three, all landing in P6)

| Surface | Treatment |
|---|---|
| Battery passport page | A CTA band at the foot of the page, after the existing `PassportOffer` strip. Primary button to the new route. |
| `/services`, Compliance pillar | The relevant card gains a text link to the new route. No new card, no price on the services page. |
| Landing page, passport teaser | A secondary text link beside the existing `See services →` pattern. Not a second button. |

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

Section order is normative.

### 4.1 Hero

```
headline: "Three weeks to know exactly where your battery data falls short."

subhead: "A fixed-scope assessment that maps every data point the EU battery
passport will demand against what your systems actually hold today, and tells
you what to do about the gap."

meta: "Fixed scope. Three weeks. Remote, with one optional site visit."

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

### 4.2.2 The window

Renders immediately after the audience panels, before the deliverables. This section is the highest-conversion element on the page and it costs nothing but arithmetic.

The reader knows the February 2027 date. What the reader has not done is count backwards from it. The page does that for them, honestly, and lets the arithmetic do the work that urgency copy would otherwise do badly.

```
heading: "What the date actually means for your timeline"

body: "Working backwards from the passport obligation: a remediation plan
is only useful if there is time to run it. Closing a supplier data gap
takes a quarter, because it moves at your supplier's pace, not yours. A
system change to carry a new field takes longer. An assessment that
finishes in the fourth quarter leaves one clear quarter to act in. One
that starts in the new year leaves the gaps you find unclosed on the day
the obligation applies."

closing: "This is the last quarter in which finding out is still useful."
```

Normative constraints:

- The passport date is interpolated from `regulatoryDates.js`, never a literal (rule 4 in §3).
- The copy MUST NOT state a due diligence or carbon-footprint deadline. Due diligence is deferred to 18 August 2027 by Reg. (EU) 2025/1561 and the CFP delegated act is not adopted. This section speaks only to the passport date.
- No countdown timer, no animated clock, no "days remaining" component. The arithmetic is stated in prose and stays true without maintenance.

### 4.3 What you get

Four deliverables, rendered as a grid, 2x2 at desktop, single column at 390px.

```
1. "Data point register"
   "Every data point the passport requires for your product category, mapped
   to the system, department or supplier that holds it today. The ones nobody
   holds are marked as such."

2. "Gap analysis with severity"
   "Each missing or unusable data point rated by what it blocks: passport
   issuance, a customer's footprint calculation, a due diligence answer, or
   nothing yet. Not every gap is worth closing this year, and the report says
   which ones are not."

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

### 4.4 How it runs

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

### 4.5 What we need from you

```
"One named owner, and roughly three days of their time across the three weeks."
"One reference product, ideally the one with your highest EU exposure."
"Read access to the systems holding your production and quality data, or a
structured export."
"Your bill of materials at the level you already maintain it. We do not need
recipes, formulations or anything you treat as a trade secret."
```

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
what they need, or running that infrastructure as a hosted service on EU
servers operated by us. Which of those makes sense is a conclusion of the
assessment, not a precondition for it."

link: "See the full service list"   → /services
```

Claim discipline: the third option is the M4 hosting architecture and MUST use the fenced wording from pivot-4 §1, `EU-hosted, operated by Ichnos`. Never `certified`, `TISAX`, `compliant servers`. The first option explicitly includes the client proceeding **without** Ichnos, which is both true and the reason the paragraph is credible.

### 4.6 What it is not

A scope boundary, rendered in a quieter treatment than the deliverables. It builds trust and it discharges claim rules 3 and 6 in visible copy.

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

### 4.7 Who runs it

Text only. **No label images on this route** (rule 1).

```
"The assessment is run by Francesco Maltoni, Dr.-Ing., Catena-X Qualified
Advisor and member of the Digital Product Passport expert group, with more
than ten years in battery development at PEM RWTH Aachen and FEV."
```

**Optional second sentence, owner-gated:** the "only Southeast Asian member of the Catena-X Association" line is a strong differentiator and a factual claim with a shelf life (verified against the membership list of 3 Aug 2026). If it ships, it lands as its own constant with a `VERIFIED_AS_OF` sibling, following the `regulatoryDates.js` pattern, and §8's manual list gains a re-verification obligation at every membership-list refresh. If the owner does not want that maintenance obligation, omit the sentence. **Default: omit.**

### 4.7.1 Published work

The page has no case studies because there are no clients. It does have evidence of a different kind, and that evidence is stronger than a logo wall for this buyer: it shows the author working inside the standard the buyer will have to comply with.

A compact list, rendered as text beneath §4.7. Each item links to its public source where one exists, and carries no client name.

```
heading: "Published work"

items:
 - "Conference talk, International Battery Summit 2026, Jakarta: EU battery
    regulation compliance, digital product passports and upstream cell data
    infrastructure."
 - "Standard request submitted against CX-0160, the Catena-X battery passport
    standard, on component and upstream supplier integration."
 - "Member of the Digital Product Passport expert group and the PCF
    Interoperability expert group."
 - "Gap analysis of the EU passport data points against the published
    supplier-side data models."
 - "Component-level aspect models, validated against the Catena-X semantic
    framework."
```

Five rules:

1. **Every item is a fact with a date behind it**, held in the constant alongside the copy so the owner can audit the list against reality. Nothing aspirational, nothing in progress described as done.
2. The standard-request item MUST NOT imply the request has been accepted, adopted or published. Submission is the claim; acceptance is not.
3. No Catena-X label or logo accompanies this list (§3 rule 1). It sits on an offering surface.
4. Expert-group membership uses the pivot-4 §12.1 construction: member **of** the group, group **under** the committee. Never a phrasing that reads as an official role in the association.
5. The list is a `MAY` for items the owner cannot evidence on request. If a prospect asks for the underlying document and it cannot be shared, the item still has to be verifiable as having happened.

### 4.8 FAQ

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

### 4.9 Closing CTA band

```
headline: "Thirty minutes is enough to tell you whether this is worth doing."
cta:      "Book a scoping call"
fallback: "Or send the question in writing"   → links to /contact
```

---

## 5. Components

| File | Kind | Note |
|---|---|---|
| `pages/ReadinessAssessmentPage.jsx` | page | Composition only. No copy literals. |
| `molecules/Breadcrumb.jsx` | new | Parent label and route from constants. |
| `molecules/BookingButton.jsx` | new | Single CTA implementation, used by both bands and by the §2.3 entry points. Renders `BOOKING_URL` unchanged, with no appended parameters (§6.2). Each instance carries its own `data-testid` for tests. |
| `molecules/ProcessSteps.jsx` | new | §4.4. Not the regulatory timeline. |
| `organisms/AudiencePanels.jsx` | new | §4.2. |
| `organisms/DeliverablesGrid.jsx` | new | §4.3. |
| `organisms/ScopeBoundary.jsx` | new | §4.6. |
| `organisms/AssessmentFaq.jsx` | new | §4.8, `<details>` based. |
| `organisms/CtaBand.jsx` | new | §4.9, reused by the passport page entry point in P6. |

Every new class ships with its CSS rule in the same commit (pivot-4 rule ii). The new page reuses `.section-eyebrow` and MUST NOT apply `text-transform: uppercase` to it (pivot-4 rule iii: the class can contain `Catena-X`, whose casing CSS must not rewrite).

---

## 6. CTA mechanics

### 6.1 Link-out, not embed

The booking CTA is an anchor to the Google Calendar appointment schedule booking page, `target="_blank"`, `rel="noopener noreferrer"`.

**Rejected: an embedded calendar widget, including the inline booking page and the booking button script that Google Calendar offers under the schedule's share options.** It adds a third-party script and an iframe to the one page whose conversion depends on nothing going wrong, changes the cookie and privacy posture, and introduces a layout risk at 390px that the manual matrix would have to police forever. The link-out costs one click and zero dependencies. An embed may be revisited once the page has produced bookings and the friction is measured rather than assumed.

### 6.2 Single source, no attribution parameters

- `BOOKING_URL` is a single constant holding the booking page link exactly as Google Calendar gives it under the schedule's share link (a `https://calendar.app.google/...` short link, or the long `https://calendar.google.com/calendar/appointments/schedules/...` form). Every CTA on the site imports it. Zero hardcoded scheduling URLs. **Value for P1, set by the owner on 22 Sep 2026: `https://calendar.app.google/5AE4mhXGnPj2GutF7`.**
- **No source parameters are appended.** v1.1 appended `?src=` values for attribution through Calendly's UTM passthrough. Google appointment schedules do not record URL parameters on the booking, so the parameters would be dead code that the tests then protect. They are removed. `BookingButton` renders `BOOKING_URL` exactly and takes no `src` prop.
- **Attribution moves to the call.** At the booking volume the page can produce (§12), the owner asks on the scoping call how the prospect found the page and records the answer in the pipeline record. If attribution later needs to be systematic, the options are a fifth, optional booking form question or an analytics dependency. Either is a separate decision, not a Traycer judgement call.
- **Calendly leaves the codebase.** `[Cc]alendly` joins `FORBIDDEN` for `client/src`, landing per §0.5: in P1 if the corpus is already clean, otherwise in the commit that deletes the last occurrence.

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

### 7.3 Sitemap

The canonical route is added. The redirecting sibling path (§2.1) is not.

---

## 8. Conformance

**Tier-1, machine:**
1. The route renders the page; the redirect sibling resolves to the canonical path.
2. Every constant in `readinessAssessmentContent.js` is rendered somewhere in the page (the pivot-3 item-8 consumer contract, applied to the new file).
3. Breadcrumb present, first crumb href equals the imported parent route constant.
4. Both CTA bands render `BookingButton` whose href equals the imported `BOOKING_URL` exactly, with no appended query parameters. `BOOKING_URL` is asserted to be an `https` URL on a Google Calendar booking host (`calendar.app.google` or `calendar.google.com`), which catches a leftover Calendly link without exact matching the operational URL.
5. All five FAQ answers are present in the initial DOM.
6. **Zero label assets in the page subtree** (rule 1), asserted as a not-contains against the imported asset constants.
7. Panel B's date and the §4.2.2 window date are both the interpolated `regulatoryDates.js` value, not literals.
8. Each rendered price equals the current price selector's value for its tier and currency; the rendered panels carry one currency each (§4.2.1 rule 4); no currency symbol character appears in the page subtree.
9. **Each tier's `foundingOpen` flag gates its price both ways**, asserted per tier: true renders the `founding` value, false renders the `standard` value, in the panels, the FAQ answer, the meta description and the structured data alike. The page subtree contains none of the §4.2.1.1 rule 1 words and no struck through price, asserted in both branches.
10. The §4.5.1 "what happens next" block renders and its link resolves to `/services` via the imported route constant.
11. The §4.7.1 published-work list renders every item in its constant (item-8 consumer contract).
12. No price renders above the fold, asserted structurally: no `PRICING` value appears in the hero component's subtree.

**Tier-2, corpus:** three new FORBIDDEN patterns, the two from rule 2 and `[Cc]alendly` from §6.2, each landing per §0.5; the page's copy passes the existing vocabulary scan unchanged.

**Tier-3:** **this run adds nothing.** The list stays closed at items 13 to 15. `BOOKING_URL` is configuration, not a claim: a wrong value is caught by the tier-1 sourcing assertion plus the owner's click check, and exact-matching it would freeze an operational URL behind a spec amendment.

**Manual, owner:**
13. **Phone first, desktop second** (§1). Open the live route on a real phone over a mobile connection before reviewing it on a laptop. The first screen must carry the headline, the subhead and the CTA without scrolling, and must be legible without zooming. This is the condition the page is actually used in.
14. Click the live booking link on desktop and on a phone, and complete one test booking end to end from a browser that is not signed in to either of the owner's Google accounts. Confirm: the booking lands in the Ichnos calendar with a Google Meet link; the four screening answers appear in the event; the confirmation mail carries the product name and the Ichnos identity; the booked slot disappears from the booking page. Repeat once from a device set to a Central European time zone and confirm the slots show in that local time.
15. Verify the §6.5 appointment schedule configuration item by item, in particular the four required screening questions, the daily maximum, the 24 hour minimum notice, and the personal calendar check: a test event in the personal Gmail calendar removes the matching slot from the booking page.
16. Three-viewport review at 1440, 768 and 390px, with rule 9 specifically checked: no price badge, no pricing-table styling on the panels, no Catena-X mention adjacent to a price.
17. Lighthouse on the new route.
18. If §4.7's optional sentence shipped: re-verify against the current membership list.
19. Audit the §4.7.1 published-work list against reality before go-live, and again whenever an item is added. Every line must be a thing that happened, on a date, evidenceable on request.
20. **Pricing review.** Re-check the SGD and EUR ladders against each other whenever EUR/SGD moves materially, and update `PRICING.REVIEWED_AS_OF` on every change. The two ladders are set independently and will drift; the review is what keeps the drift deliberate.
21. **First client tracking, per tier.** Record each signed founding client in the pipeline record with the tier and the signing date. The week the first engagement letter in a tier is signed, set that tier's `foundingOpen` to false. A founding price left on the page after its tier's first contract is a price the next prospect in that tier will expect to pay.

---

## 9. Phases

| P | Scope | Cap ruling |
|---|---|---|
| 1 | `readinessAssessmentContent.js` + `PRICING` (three tiers, founding and standard values in two currencies, one `foundingOpen` flag per tier, the current price selector, `REVIEWED_AS_OF`) + `BOOKING_URL` + colocated tests + FORBIDDEN widening | Within cap. Guards first, green now. `PRICING` ships with its own test asserting three tiers with founding and standard values in both currencies, no conversion helper, a shaped `REVIEWED_AS_OF`, a boolean flag per tier, and the selector returning founding or standard per flag. |
| 2 | Route constant, `App.jsx` wiring, page shell, `Breadcrumb`, redirect | **Atomic, pre-approved:** a route and its only consumer are one semantic unit. |
| 3 | Hero, `AudiencePanels` with price blocks read through the current price selector, `BookingButton` + CSS | **Atomic, pre-approved:** the button is the page's reason to exist, and the price blocks cannot ship without the selector that governs them. |
| 4 | §4.2.2 window, `DeliverablesGrid`, `ProcessSteps`, inputs block + CSS | Within cap if split; MAY run as two sub-commits. The window lands with this group because it renders between the panels and the deliverables. |
| 5 | §4.5.1 what-happens-next, `ScopeBoundary`, who-runs-it, §4.7.1 published work + CSS | Within cap if split. The three credibility sections are one semantic group: each is a claim surface and they are reviewed together. |
| 6 | `AssessmentFaq`, `CtaBand` + CSS | Within cap. |
| 7 | Entry points: passport CTA band, services card link, landing teaser link | **Atomic, pre-approved:** three consumers of one new route; a half-landed set ships dead ends. |
| 8 | `seoMeta.js`, `structuredData.js`, sitemap, mobile sweep of everything touched | Within cap. |

Deploy after green: PR → main → CI → merge → "Sync main → staging" → owner gates → promote.

---

## 10. Out of scope

The `/data` versus `/passport` route-naming question (pivot-3's ruling stands: the code is correct) · chatbot and knowledge base · a pricing page · case studies of any kind · payment collection · the Supplier Kits page, which is a separate offer and needs its own spec · any change to the five fenced `catenax-*` cards · fonts.

---

## 11. Owner items before P3 can land

1. **Google Calendar appointment schedule per §6.5, in the Ichnos Workspace account.** Done 22 Sep 2026: title, 30 minutes, Monday to Friday 10:00 to 18:00 Kuala Lumpur, 60 days ahead, 24 hours notice, booking link recorded in §6.2. **Open:** (a) share the personal Gmail calendar into the Ichnos account and tick it under "Check calendars for availability", per the §6.5 setup note; (b) confirm buffer time, maximum bookings per day, Google Meet, email reminders and the four required screening questions against the §6.5 table. If a Calendly event or account was ever set up for this offer, delete the event and cancel any paid plan, so a second booking link with the old configuration does not circulate in earlier emails.
2. **Prices: confirmed 22 Sep 2026.** All twelve values in §4.2.1 are owner decisions. Set `REVIEWED_AS_OF` to 2026-09-22 in P1.
3. **Write the founding client clause into the engagement letter template before the first letter goes out** (§4.2.1.1 rules 3 and 6): standard price, founding discount, the discount conditional on a named reference after delivery and one introduction to a customer or supplier in the client's chain, and the standard price due if the client declines. The second client and refusal cases are ruled in §4.2.1.1 rule 6. **Still open:** how the clause is enforced, since the reference falls due after delivery, when the discount has already been given. One option is that the discount becomes invoiceable if the reference or the introduction is not provided within an agreed period after delivery. Have the clause reviewed by a lawyer before the first letter.
4. **Decide §4.7's optional membership sentence.** Default is omit.
5. **Audit the §4.7.1 published-work list.** Five items are drafted from the project record. Confirm each is accurate as stated, that the standard request is described at the right stage (submitted, not adopted), and that you would be comfortable being asked for evidence of any of them on a call.
6. **Withholding tax stays off the page.** Indonesian Article 26 and the NBRI host fee are engagement-letter matters. Putting "fees quoted net of withholding" into public copy trades a small competence signal for a large amount of friction at exactly the wrong moment. Handle it in the scoping call and the engagement letter, where it belongs.
7. **Singapore GST.** Whether SGD prices are stated as GST-exclusive depends on Ichnos's registration status, and export of services to ASEAN customers is normally zero-rated. Confirm the treatment with your accountant, then decide whether the panel copy needs a "prices exclude GST where applicable" line. Default: no line, because at current turnover it says nothing and costs a sentence.
8. **Currency codes, never symbols**, per §4.2.1 rule 3. No `€`, no `S$`, anywhere in copy or tests.

---

## 12. What this page cannot fix

Recorded so that the page is not asked to carry weight it cannot hold.

**Delivery capacity is the binding constraint, not conversion.** Three-week assessments, at most two in parallel, against the standards work, the data model, M6 oversight and the expert-network calls. The realistic ceiling before the passport date is a handful of engagements. If the page converts better than that, the constraint moves to delivery immediately, and the correct response is to raise prices rather than to accept work that cannot be delivered well. A late or thin first engagement costs more than a missed one, because the founding-client exchange in §4.2.1.1 trades on the reference being good.

**The page has no traffic and cannot generate its own.** It converts attention that outbound, speaking, standards participation and the existing network produce. Shipping it changes nothing on its own. Its first real test is being the link in the next qualified outbound email, not a search ranking.

**It does not replace the qualified target list.** The page answers the questions a warm prospect has. It does not find prospects.
