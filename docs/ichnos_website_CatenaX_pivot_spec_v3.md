# Ichnos Protocol — Website Pivot Spec (Epic)

**Version:** 3.0 — refined June 2026 (supersedes v2.0)
**Owner:** Francesco
**Target site:** `ichnos-protocol.com` (React + Vite SPA, current routing: `/`, `/services`, `/team`, `/passport`, `/contact`)

> **Why v3.0 exists — this site is now part of a Catena-X application.**
> Francesco is completing the Catena-X Academy basic training and will apply for the **Catena-X consultant qualification**. The qualification listing form asks for a website link and **only accepts it if the site clearly states the focus of the applicant's Catena-X consulting services**. The Catena-X reviewer will therefore read this website as part of the application. The site now has two jobs at once: (1) convert European data/advisory customers, and (2) satisfy a Catena-X reviewer that this is a credible, committed Catena-X consulting practice. Every Catena-X mention is written for both readers.
>
> **What changed vs v2.0**
> - **Catena-X stance reversed — and made truthful to the live application.** v2 used "Catena-X-aligned only, no application claim." v3 says **"Catena-X consultant qualification — application in progress"** wherever Catena-X is mentioned, plus an explicit, repeated **commitment to onboard ASEAN battery manufacturers into Catena-X**. We still never claim a status not yet held (not "qualified", not "member", not "certified" until each is true).
> - **New: a dedicated Catena-X consulting page/section (§5.6)** that mirrors the qualification-form focus areas in Francesco's own words, so the reviewer can verify the website against the ticked focus boxes.
> - **New: the mission/commitment narrative (§3b)** — onboard ASEAN into Catena-X; later build Catena-X business applications (on Tractus-X) for ASEAN battery makers' EU-compliance needs; help EU importers source ASEAN materials, precursors, electrodes, cells, and modules with a *passport-ready* dataset (and optional quality data).
> - **Scope broadened** from "cells & modules" to the full upstream chain: **materials → precursors (pCAM/CAM) → electrodes → cells → modules**, framed around the **EU importer / economic operator** who is legally responsible for the passport.
> - **On-site availability** made explicit and prominent (ASEAN sites and EU client locations, whenever needed).
> - Solana/blockchain remains fully dropped from public copy (carried over from v2).
> - Regulatory citations and the evidence base (Appendix B) carried over and kept.

---

## 1. Context

The current site (June 2026 snapshot) positions Ichnos Protocol as:

> "Battery advisory practice and Battery Passport platform builder, based in Singapore and operating across Europe and APAC."

with Solana prominently featured on `/passport` and an undifferentiated audience ("OEMs, Tier-1 suppliers, and recyclers").

This no longer reflects the company. As of June 2026 Ichnos has pivoted, and is actively entering the Catena-X ecosystem as a consulting practice and data provider:

- **Product:** from "we build a battery passport" → **"we provide Catena-X-compatible upstream data — materials, precursors, electrodes, cells, modules — from ASEAN manufacturing, so EU importers have a passport-ready dataset."**
- **Layer:** from competing with the passport-app vendors (Path.Era, Siemens, Spherity, AVL, DigiProd Pass) → **complementing them as the ASEAN carbon-and-provenance data origination layer, and as a Catena-X consulting practice for ASEAN onboarding.**
- **Catena-X relationship:** **Catena-X consultant qualification — application in progress** (Academy basic training completed). Public copy signals committed entry, never an unearned status.
- **Tech narrative:** blockchain drops out of public messaging entirely. The customer-facing layer is Catena-X-compatible schemas and EDC connectors; data integrity is a signed, tamper-evident audit trail — implementation-agnostic.
- **Audience:** **(a)** EU battery-passport ecosystem buyers (data customers) and EU importers/economic operators; **(b)** European cell makers, OEMs, materials and testing bodies, second-life players needing ASEAN access (advisory customers); **(c)** the **Catena-X reviewer** assessing the consultant listing.

The advisory practice is the near-term revenue line; the data services are the differentiating product; the Catena-X consulting focus is what the qualification listing requires the site to state. All three must be visible and credible without blurring.

> **Strategic anchor.** This site implements the positioning in `Ichnos_CatenaX_Strategy_Memo.docx` (this folder): Ichnos sits **upstream of the complete passport and downstream of the mines**, owning the **carbon-footprint and material-provenance data** for ASEAN-made materials and cells. v3 adds the **Catena-X consulting** dimension on top, because the website is now a credential as well as a sales tool.

## 2. Strategic goals for this epic

1. Make Ichnos look like a serious upstream data layer **and a committed Catena-X consulting practice for ASEAN**, not a one-person passport-platform startup.
2. Land MS 2818 article readers on positioning that matches the LinkedIn outreach.
3. **Pass the Catena-X reviewer's website check** for the consultant qualification: the site must state the focus of the Catena-X consulting services (§5.6) and signal genuine commitment to the ecosystem.
4. **Signal commitment, truthfully.** Wherever Catena-X appears: *"consultant qualification — application in progress"* and *"committed to onboarding ASEAN into Catena-X."* Never claim "qualified", "member", "certified", or "partner" before it is true.
5. Preserve the engineering-advisory line as the distinct, near-term revenue engine, and make **on-site availability** (ASEAN and EU) explicit.
6. Keep blockchain/Solana out of public messaging; describe data integrity in implementation-agnostic terms.

## 3. Audiences (priority order)

| Priority | Audience | What they need from the site |
|---|---|---|
| 0 | **Catena-X reviewer** (consultant-qualification listing) | Clear statement of Catena-X consulting focus (§5.6); evidence of genuine commitment and competence; no false status claims |
| 1 | EU OEMs, tier-1 cell makers, **EU importers/economic operators**; passport-app vendors and issuers (Path.Era, Siemens, Spherity, AVL, DigiProd Pass); OEM-internal passport teams | Upstream ASEAN data — materials, precursors, electrodes, cells, modules — carbon, provenance, composition (and optional quality), Catena-X-compatible, via EDC |
| 2 | EU cell makers, OEMs, materials companies, testing bodies, second-life startups, consultancies, law firms with ASEAN exposure | Engineering advisory + Catena-X onboarding support: supplier diligence, regulatory readiness, system architecture, PM, expert witness |
| 3 *(deferred)* | ASEAN material/cell/pack manufacturers (data-source partners across Indonesia and Malaysia) | Data partnership and Catena-X onboarding (we collect & onboard, they share). Addressed via outreach, not the site |

The site should make audiences 1 and 2 obvious in the first scroll, and make the Catena-X consulting focus (audience 0) unmistakable on `/services` and `/catena-x` (§5.6).

### 3a. Where Ichnos sits in the stack (landscape)

| Value-chain layer | Who covers it today | Ichnos relationship |
|---|---|---|
| Mine → refinery (raw-material traceability) | Minespider, Circulor, Re\|Source (customers incl. Volvo, Mercedes, BMW) | **Upstream of us.** We consume their refined-metal data as an input. |
| **Materials → precursors → electrodes → cells → modules (ASEAN)** | **— gap; no site-level provider for ASEAN-made battery materials & cells —** | **This is the layer Ichnos fills**, and onboards into Catena-X. |
| Passport issuance & identity | Path.Era, Siemens, Spherity, AVL, DigiProd Pass, OEM-internal teams | **Downstream of us.** We feed their passports; we do not replace them. |
| Standards & governance | Catena-X, IDTA, Battery Pass Consortium | **We conform, and we advise others to conform.** Catena-X-compatible schemas + EDC; consulting on onboarding. |

**Messaging consequence:** every customer-facing sentence reinforces *"we feed your passport, we do not replace it,"* and every Catena-X sentence reinforces *"we are bringing ASEAN into Catena-X."*

### 3b. Our commitment to Catena-X and ASEAN (mission — render a short version on `/` and `/catena-x`)

A clearly stated, repeated commitment. The public copy is a condensed version of this; the reviewer should be able to read the intent unambiguously.

- **Onboard ASEAN into Catena-X.** Ichnos is committed to bringing ASEAN battery-material and cell manufacturers — Indonesia and Malaysia first — into the Catena-X data space, using deep battery-domain and EU-regulatory expertise to guide their data readiness and onboarding. *(Catena-X consultant qualification: application in progress.)*
- **Build the business applications ASEAN will need.** Beyond advisory, Ichnos intends to develop Catena-X business applications (on the Eclipse Tractus-X reference implementations) tailored to ASEAN manufacturers' need to comply with the EU Battery Regulation — turning a compliance burden into a market-access asset.
- **Make EU sourcing of ASEAN supply compliant by default.** Ichnos helps European companies source ASEAN materials, precursors (pCAM/CAM), electrodes, cells, and modules with the data already in place — so the **EU importer / economic operator** placing the battery on the EU market has a **passport-ready dataset** (carbon footprint, due diligence, material composition) and, optionally, **quality data** — ready to populate the EU battery passport.
- **On the ground, on site, whenever needed.** Carbon-footprint validation and due-diligence verification require physical presence. Ichnos is based in Kuala Lumpur and is available to be on site at ASEAN manufacturing locations, and at European client sites, whenever needed.

## 4. Scope

**In scope**

- Homepage hero, sub-hero, primary CTAs, page meta, commitment band
- `/services` — re-order, rewrite, re-categorise into data services + advisory + **Catena-X consulting**
- `/passport` — rebuild as the Catena-X data-services page; rename to `/data` (§6.2)
- **`/catena-x` (new) or a clearly anchored `/services` section** — states the Catena-X consulting focus for the reviewer (§5.6)
- `/team` — Francesco bio reflecting the pivot + Catena-X commitment
- `/contact` — meta + AI-assistant example prompts
- `sitemap.xml`, footer copy, nav labels, OG image, per-page `<Helmet>`, Organization JSON-LD

**Out of scope**

- Visual redesign; tech-stack changes; co-founder (Ihsan Ahmad) bio rewrite (review separately, §5.4); admin/API/privacy pages; multi-language; blog/case studies.

## 5. Page-by-page requirements

### 5.1 Homepage (`/`)

#### After

- **Title:** `Ichnos Protocol — ASEAN data layer for the European battery passport`
- **Meta description:** `Catena-X-compatible carbon, provenance, composition (and quality) data for ASEAN-made battery materials, cells, and modules — passport-ready for EU importers. Battery-systems advisory and Catena-X onboarding for ASEAN. Kuala Lumpur · Singapore · Europe.`
- **Hero headline (display, Fraunces):** *"The ASEAN data layer for the European battery passport."*
- **Hero sub-headline:** *"We bring ASEAN battery manufacturers into Catena-X, and deliver Catena-X-compatible carbon, provenance, and composition data — from materials to modules — so European importers have a passport-ready dataset. Catena-X consultant qualification: application in progress."*
- **Hero CTAs:** Primary `[ Talk to us ]` → `/contact`; Secondary `[ Read the MS 2818 series ]` → external LinkedIn (new tab, `rel="noopener"`).
- **Commitment band (new, directly under hero — one line, reviewer-visible):**
  *"Committed to onboarding ASEAN into Catena-X — from supplier data readiness to passport-ready data for EU importers. Catena-X consultant qualification in progress."*
- **Below-commitment — three cards (replace existing six-service grid):**

  **Card 1 — Upstream data services**
  *Catena-X-compatible carbon, provenance, composition (and optional quality) data for ASEAN-made materials, precursors, electrodes, cells, and modules, delivered via EDC connectors. Designed to feed downstream passport issuers and give EU importers a passport-ready dataset.*
  Link: `Explore data services →` → `/data`

  **Card 2 — Catena-X consulting (ASEAN onboarding)**
  *Helping ASEAN manufacturers and their European partners reach Catena-X data readiness, work through the onboarding steps, build the business cases, and implement Catena-X-compliant software on Tractus-X — while staying ahead of the EU Battery Regulation.*
  Link: `Catena-X consulting →` → `/catena-x` (§5.6)

  **Card 3 — Battery-systems advisory**
  *Practitioner-led advisory for European cell makers, OEMs, materials, testing bodies, and second-life players with ASEAN exposure. Supplier diligence, regulatory readiness, system architecture, project management.*
  Link: `Explore advisory →` → `/services`

- **"Where we sit in the stack":** render the §3a band — *Raw materials (Minespider, Circulor, Re\|Source) → **ASEAN materials → cells → modules (Ichnos)** → Passport & identity (Path.Era, Siemens, Spherity, AVL) → EU importer / OEM.* One sentence: *"We sit between the refinery and the finished passport, where ASEAN-made supply currently has no data layer — and we onboard that supply into Catena-X."*
- **"Recent thinking":** featured links to the MS 2818 article series.
- **Drop from homepage:** Solana, blockchain, "we are building a passport platform," "passports that work in production not just on paper," generic "OEMs, Tier-1 suppliers, and recyclers."

### 5.2 Services (`/services`)

Three sections now: **data services** (flagship product), **Catena-X consulting** (the qualification focus — summarised here, full detail on `/catena-x`), and **engineering advisory** (near-term revenue).

#### Section A — Upstream data services for the Catena-X passport ecosystem (lead with this)

1. **Material, electrode, cell, module & pack data — Catena-X-compatible.**
   *Source-level data across the ASEAN chain — materials, precursors (pCAM/CAM), electrodes, cells, modules: chemistry; composition by mass percentage of cobalt, lithium, nickel, lead; manufacturer identity under ISO/IEC 15459; manufacturing site; batch; agreed process parameters. The canonical Annex XIII data set, delivered via Eclipse Dataspace Connector (EDC) into your passport stack — passport-ready for the EU importer.*

2. **Site-level carbon footprint data — EU-methodology-compliant.**
   *Per-model, per-site, per-batch carbon footprint on the actual site grid mix, real process energy, and raw-materials transport, calculated under the EU's harmonised rules for EV batteries (Article 7 / Annex II, JRC CFB-EV, the delegated act, building on the EU PEF method). Real numbers from real sites. Ties to the manufacturer's / importer's Article 7 declaration.*

3. **Due-diligence and ESG data — OECD- and CSDDD-aligned, on-site verified.**
   *Site indicators on labour, environmental management, and provenance traceability of cobalt, lithium, natural graphite, nickel. Site verification by our team. Ties to Articles 47–53 / Annex XIV under EU 2023/1542 and to the CSDDD (EU 2024/1760).*

4. **Optional: quality data.**
   *Where the EU importer or OEM wants more than the regulatory minimum — incoming-quality and supplier-quality indicators captured at source alongside the passport data.*

#### Section B — Catena-X consulting (ASEAN onboarding) — *see `/catena-x` for the full focus list*

A short teaser block linking to `/catena-x` (§5.6): *"We guide ASEAN manufacturers and their European partners through Catena-X: data readiness, the onboarding steps, business cases, use-case and Tractus-X implementation, bilateral data relationships, release-driven technical change, and the regulatory requirements behind it all. Catena-X consultant qualification: application in progress."*

#### Section C — Engineering advisory for European buyers operating in ASEAN

5. **Supplier diligence and qualification (ASEAN).** On-the-ground site visits, qualification reports, process reviews, qualification-test witnessing across Indonesia, Malaysia, Thailand, Vietnam.
6. **Regulatory readiness and supply-chain liaison.** EU 2023/1542, MS 2818, TKDN, ASEAN certification briefings; liaison with MARii, SIRIM, BKPM, KEMENPERIN; quarterly briefings and on-call retainer.
7. **System architecture, project management, and expert witness.** Battery-systems engineering from the FEV practice — architecture, BMS, cybersecurity, second-life; named subcontractor and expert witness for EU–ASEAN battery transactions.

#### Meta

- **Title:** `Services — Ichnos Protocol`
- **Description:** `Catena-X-compatible data services (materials to modules) for EU importers and passport issuers, Catena-X consulting for ASEAN onboarding, and battery-systems advisory. Singapore + Kuala Lumpur.`

### 5.3 Passport page — rebuild as data-services page (`/data`)

Rename `/passport` → `/data` with a 301 redirect (§6.2). Narrative: Problem → Solution → Positioning. Pre-demo state ships now with a briefing CTA.

##### A. Hero
- **Headline:** *"Data services for the battery passport, from where the cells are actually made."*
- **Sub-headline:** *"Catena-X-compatible carbon, provenance, and composition data for ASEAN-made materials, electrodes, cells, and modules — passport-ready for the EU importer. We feed your passport; we do not replace it."*
- **Status badge:** *"Catena-X consultant qualification: application in progress. Committed to onboarding ASEAN into Catena-X. Working demo: coming soon."*
- **CTAs:** Primary `[ Book a 30-minute briefing ]` → Calendly; Secondary (post-demo) `[ See the demo ]`.

##### B. Frame the problem — the data gap from refinery to cells and modules
**Headline:** *"Between the refinery and the finished cell, there is no data — and none of it is in Catena-X yet."*

Stack diagram (left to right): `Mining → Refinery → [ ASEAN materials · electrodes · cells · modules ] → Pack & EU importer/OEM → Vehicle → Second life`, with *Minespider · Circulor · Re\|Source* under the covered upstream and *Path.Era · Siemens · Spherity · AVL · Catena-X* under the covered downstream, and **"— gap —"** under the ASEAN middle.

Explanation: mine→refinery is covered; the OEM/passport layer is covered on Catena-X; the **ASEAN materials-to-modules middle is not**, and **no provider operates at site-level depth there, nor onboards that supply into Catena-X.** That is the gap Ichnos fills.

**Why this matters now:**
- Indonesia is the world's largest nickel producer (roughly half of global mined nickel and rising) and the largest MHP battery-grade intermediate hub. *(Confirm against Roland Berger Battery Monitor 2024/2025 — Appendix B.)*
- ASEAN capacity is ramping: HLI Green Power (Hyundai·LG, ~10 GWh NCMA, operating since 2024); CBL·Dragon (CATL·IBC·Antam, ramping toward 15 GWh); Wuling (Cikarang); Polytron LFP (Purwakarta); Malaysia following (PEC Corp, Penang). *(Capacity figures: owner to confirm/date before launch.)*
- The EU battery-passport requirement (Annex XIII) applies from **18 February 2027**. Without an ASEAN data layer in Catena-X, every battery containing an Indonesian- or Malaysian-made cell is non-compliant by default.

**The three compliance items most exposed to the gap** — carbon footprint (Article 7 / Annex II), due diligence (Articles 47–53 / Annex XIV + CSDDD 2024/1760), and material composition & provenance (Annex XIII). *(Carbon transparency is an asset for the decarbonising producer and a liability for the high-carbon one — so we sell it first to producers who benefit from telling the truth, per the strategy memo.)*

##### C. Frame the solution
**Headline:** *"A Catena-X-compatible data layer, collected at source in ASEAN — and onboarded into Catena-X."*

Ichnos collects data directly from ASEAN sites (materials → modules), normalises it into Catena-X-compatible schemas, signs it for chain-of-custody, and delivers it via standard EDC connectors. The EU importer / economic operator — and the passport stack they use (Path.Era, Siemens, Spherity, AVL, OEM-internal) — consumes it as any Catena-X-compatible feed. **We also guide the ASEAN supplier through Catena-X onboarding so the data flows natively.**

**Three data tiles** (material composition & manufacturing; site-level carbon footprint; due-diligence & ESG) **+ optional quality data**, each tied to the relevant EU article/annex. Schema-mapping table (Annex XIII / Article 7 / Articles 47–53 → AAS+SAMM / CX-0143 sub-aspects) retained for technical reviewers.

**How we deliver:** Catena-X-compatible schemas; EDC connector endpoints (each party runs its own EDC; the sovereign-exchange model the EU Data Act, Reg. 2023/2854, supports); a signed, tamper-evident audit trail (implementation-agnostic, invisible to the consumer).

**Three steps for the customer:** tell us which ASEAN suppliers and which tiles; we collect, sign, stage in Catena-X format, and onboard the supplier; you consume via EDC — your existing passport, your existing workflow, with the EU importer's dataset passport-ready.

**Standards supported:** Catena-X (primary); EU 2023/1542 (Art. 7, Arts. 47–53, Annex II/XIII/XIV, Art. 77); JRC CFB-EV/IND; EU PEF (EC Rec. 2021/2279); CSDDD (2024/1760); EU Data Act (2023/2854); DIN DKE SPEC 99100; MS 2818; ISO/IEC 15459; OECD Due Diligence Guidance.

##### D. Position the founder and the firm
**Founder paragraph** (as v2): Dr.-Ing. Francesco Maltoni, ex-FEV lead battery expert, FEV battery DPP pilot, ABPE 2025 speaker, author of the MS 2818 series.

**Four pillars:**
1. **Battery-systems credibility.** Ex-FEV Aachen, Dr.-Ing.; author of the MS 2818 analysis series. We speak the regulation and the engineering at once.
2. **On-the-ground in ASEAN, on site whenever needed.** Based in Kuala Lumpur (MM2H); visa-free/visa-on-arrival access across Indonesia, Vietnam, Thailand, Singapore, the Philippines; Singapore-incorporated for clean EUR/SGD/USD invoicing. At a Penang site within hours, Karawang or Cikarang within a day — and at European client sites when needed. **For carbon and due-diligence verification, someone has to be physically at the site. That is the difference between data services and data theatre.**
3. **Catena-X by commitment.** Catena-X consultant qualification — application in progress (Academy basic training completed). Committed to onboarding ASEAN manufacturers into Catena-X and to building Catena-X business applications (on Tractus-X) for their EU-compliance needs. Schemas, EDC connectors, and a data-sovereignty model built to the ecosystem's standards. *(Alignment and commitment — no claim of membership or certification not yet held.)*
4. **Regulatory depth.** EU 2023/1542 and its annexes, the JRC carbon rules, CSDDD, DIN DKE SPEC 99100, MS 2818 — current requirements and how to fulfil them.

**Credibility row:** FEV alumnus · RWTH Aachen PEM · ABPE 2025 speaker · Singapore-incorporated · Author, MS 2818 series · Catena-X consultant qualification in progress.

##### E. Future phases — INTERNAL ONLY (carried from v2, de-Solana'd)
Public page ships **Phase 1 only**. Phase 2 (independent SoH baseline) and Phase 3 (sourcing/marketplace layer) stay out of public materials until Francesco approves. Roadmap documented in `Ichnos_CatenaX_Strategy_Memo.docx`. No ledger/tokenization framing. Renders as nothing on the site.

##### F. Closing CTA strip
*"Catena-X consultant qualification in progress · committed to onboarding ASEAN into Catena-X · working demo coming soon."* + `[ Book a 30-minute briefing ]`.

##### Drop
Solana/blockchain copy, "staged architecture … blockchain-backed production", "user engagement features", "compliant data foundations for OEMs exporting between Europe and ASEAN" (vague).

##### Meta
- **Title:** `Data services for the battery passport — Ichnos Protocol`
- **Description:** `Catena-X-compatible carbon, provenance, composition (and quality) data for ASEAN-made materials, cells, and modules — passport-ready for EU importers. We feed your passport; we do not replace it. EU 2023/1542, EDC, DIN DKE SPEC 99100, MS 2818.`

### 5.4 Team (`/team`)

**Francesco bio (replace):** *"Dr.-Ing. Francesco Maltoni is the founder of Ichnos Protocol. He spent his engineering career at FEV in Germany as lead battery expert in battery-system engineering — owning sustainability requirements with customers, leading a battery digital-product-passport pilot on the in-house BMS/cloud-BMS practice, and presenting at Advanced Battery Power Europe 2025. He is the author of a published three-part analysis of Malaysia's MS 2818 battery-passport standard, and is completing the Catena-X consultant qualification to lead ASEAN onboarding into the Catena-X data space. Based in Kuala Lumpur."*

**Ihsan Ahmad bio:** out of scope; flag for separate review.

**Meta — Title:** `Team — Ichnos Protocol`; **Description:** `Founders of Ichnos Protocol. Dr.-Ing. Francesco Maltoni (ex-FEV lead battery expert, Catena-X consultant qualification in progress) and Ihsan Ahmad (AI, quantitative modelling).`

### 5.5 Contact (`/contact`)

- **Meta description:** `Talk to Ichnos Protocol about Catena-X-compatible ASEAN data services, Catena-X onboarding, or battery-systems advisory. AI assistant, email, LinkedIn, Calendly. Kuala Lumpur + Singapore + EU.`
- AI-assistant example prompts → *"What data do you collect from ASEAN sites?"*, *"How do you onboard an ASEAN supplier into Catena-X?"*, *"Can you be on site for a supplier-diligence visit in Indonesia?"*, *"How do you connect to Catena-X / EDC?"*. Drop "building your passport".

### 5.6 Catena-X consulting (NEW — `/catena-x`, or an anchored `/services#catena-x` section)

> **Reviewer-facing page.** This page exists so the Catena-X consultant-qualification reviewer can confirm the website states the focus of the Catena-X consulting services. It mirrors the focus areas selected on the qualification form, in Francesco's own words, with the ASEAN/battery angle. Keep the wording close to the official focus areas so the mapping is obvious.

- **Page headline:** *"Catena-X consulting — bringing ASEAN battery supply into the data space."*
- **Intro:** *"Ichnos Protocol provides Catena-X consulting with a single focus: getting ASEAN battery-material and cell manufacturers, and their European partners, ready for and into Catena-X — so the data the EU Battery Regulation demands flows natively. Catena-X consultant qualification: application in progress (Catena-X Academy basic training completed)."*

**Our Catena-X consulting focus** *(mirrors the qualification-form focus areas):*

1. **Catena-X data readiness — and how to reach it.** Assessing where an ASEAN supplier's data stands today and the concrete path to readiness.
2. **Guidance through each step of the Catena-X onboarding process.** Walking suppliers (and their EU customers) through registration, identity, connector, and clearance steps.
3. **Catena-X business cases.** Building the case that turns EU-compliance cost into market-access advantage for ASEAN exporters and EU importers.
4. **Use-case implementation.** Standing up the battery-passport, PCF, and due-diligence use cases end to end.
5. **Implementation of Catena-X-compliant software** (e.g. Eclipse Tractus-X reference implementations), including the path toward dedicated business applications for ASEAN compliance needs.
6. **Bilateral business relationships between client and supplier via Catena-X.** Setting up sovereign, contract-governed data exchange between an EU importer and an ASEAN supplier.
7. **Technical changes required by Catena-X releases.** Keeping implementations current across release cycles.
8. **Current regulatory requirements and how to fulfil them.** EU 2023/1542 (carbon, due diligence, passport), MS 2818, and how Catena-X data satisfies them.

**Our commitment** *(render the §3b condensed version here):* onboard ASEAN into Catena-X; build the business applications ASEAN compliance will need; make EU sourcing of ASEAN supply passport-ready for the importer; be on site whenever needed.

- **CTA:** `[ Talk to us about Catena-X onboarding ]` → `/contact`.
- **Meta — Title:** `Catena-X consulting for ASEAN — Ichnos Protocol`; **Description:** `Catena-X consulting focused on onboarding ASEAN battery manufacturers and their EU partners: data readiness, onboarding steps, business cases, use-case and Tractus-X implementation, bilateral data relationships, release changes, and EU Battery Regulation compliance. Consultant qualification in progress.`

## 6. Cross-cutting changes

### 6.1 Global meta and SEO — per §5.1; regenerate OG image (1200×630) with the new headline + commitment line + stack band; Twitter `summary_large_image`.

### 6.2 sitemap.xml — add `/data` (priority 0.9) and `/catena-x` (priority 0.8); 301 `/passport` → `/data`; update all `<lastmod>`.

### 6.3 robots.txt — no change.

### 6.4 Nav and footer
- Top nav: `Home · Services · Data · Catena-X · Team · Contact` (add **Catena-X**; rename `Passport` → `Data`).
- Footer tagline: *"Catena-X-aligned ASEAN data layer for the European battery passport — Catena-X consultant qualification in progress. Kuala Lumpur · Singapore · Europe."* Drop all Solana/blockchain language.

### 6.5 Messaging guardrails (apply across every page)

**Always say**
- "We feed your passport; we do not replace it."
- "Catena-X consultant qualification — application in progress" (the standard phrase for Catena-X status).
- "Committed to onboarding ASEAN into Catena-X."
- "Passport-ready dataset for the EU importer / economic operator."
- "Materials, precursors, electrodes, cells, modules" (full chain).
- "On site whenever needed."
- "Catena-X-compatible" / "Catena-X-aligned" (for the technical layer).

**Never say (remove on sight in QA)**
- "Solana", "blockchain", "crypto", "token", "immutable ledger", "decentralised".
- "We build / are building a battery passport", "passport platform".
- "Catena-X **qualified** consultant", "Catena-X **member**", "Catena-X **certified**", "Catena-X **partner**" — **until each status is genuinely held.** Use "application in progress" / "committed" instead.
- "Passports that work in production, not just on paper."
- Generic audience: "OEMs, Tier-1 suppliers, and recyclers" as a catch-all.

> Status discipline matters precisely because the reviewer will check: claiming "qualified" or "member" before it is true would undermine the very application the site supports. "Application in progress" + visible commitment is both truthful and persuasive.

### 6.6 Structured data (JSON-LD) — `Organization` block: legal name *Ichnos Protocol Pte. Ltd.*, URL, logo, `sameAs` (LinkedIn ×2), `description` per homepage meta, `areaServed` (EU, ID, MY, SG), `knowsAbout` (battery passport, EU 2023/1542, Catena-X, carbon footprint, due diligence, MS 2818).

## 7. Implementation breakdown (sub-stories)

1. **Global meta + homepage** (hero, commitment band, three cards, stack band, JSON-LD). ~3.5 h.
2. **Services page** rewrite into three sections (data / Catena-X consulting teaser / advisory). ~4 h.
3. **`/data` rebuild** (Problem→Solution→Positioning, schema-mapping, four pillars, pre/post-demo toggle, 301, sitemap). ~7 h.
4. **`/catena-x` new page** (§5.6 focus list + commitment + meta + nav). ~2.5 h.
5. **Team bio** update. ~30 min.
6. **Contact** meta + AI-assistant prompts. ~30 min.
7. **Footer/nav** alignment (+ Catena-X nav item). ~1 h.
8. **OG image** regeneration. ~2 h.
9. **QA pass.** Render all pages; validate Helmet + 301 + JSON-LD; run the messaging-guardrail grep (§6.5): zero "Solana/blockchain/crypto/token"; zero "qualified/member/certified/partner" status claims (only "application in progress"/"committed"); `/catena-x` focus list present and matching the qualification form. ~2 h.

Total: ~23 hours.

## 8. Acceptance criteria

- **Catena-X application readiness (new, gating)**
  - `/catena-x` (or `/services#catena-x`) clearly states the Catena-X consulting focus, matching the focus areas ticked on the qualification form.
  - Every Catena-X status reference reads "consultant qualification — application in progress" or "committed"; **zero** "qualified/member/certified/partner" claims.
  - Commitment to ASEAN onboarding is visible on `/`, `/data`, and `/catena-x`.
- **Discoverability** — titles/descriptions updated; sitemap current; `/passport` 301→`/data`; `/catena-x` indexed; OG image updated; JSON-LD validates.
- **Content** — homepage leads with ASEAN-data-layer + Catena-X commitment; services split into data/consulting/advisory; `/data` reads as upstream provider; full chain (materials→modules) and EU-importer framing present; on-site availability explicit.
- **Messaging integrity** — zero Solana/blockchain; zero false-status claims; zero "passport platform" phrasing.
- **Functional / no regressions** — routes load; AI prompts updated; Lighthouse no worse; Firebase auth and contact form intact.

## 9. Open questions for Francesco

*(Resolved)*
- **Catena-X status →** RESOLVED (v3): "consultant qualification — application in progress" + explicit ASEAN-onboarding commitment everywhere; no membership/certification claim until held.
- **Future-phases →** internal-only, de-Solana'd, → strategy memo.
- **Partner naming →** generic for v1.

*(Still open)*
1. **`/catena-x` as its own page vs an anchored `/services` section.** A standalone page reads more strongly to the reviewer and is easier to link from the qualification form; recommended. Confirm.
2. **Become an Association member now, or after qualifying?** Recommendation (separate advice): qualify first (mandatory for listing; membership not required), join later as a strategic move into the relevant Expert Group. The site copy assumes "qualification in progress, not yet a member."
3. **URL rename `/passport` → `/data`** with 301. Confirm.
4. **Ihsan Ahmad bio** under the pivot.
5. **CTA wording** (`[Talk to us]` vs `[Book a 30-min briefing]`).
6. **MS 2818 article URLs** for homepage + hero secondary CTA.
7. **Capacity / nickel figures** (§5.3 B) — confirm against Roland Berger before launch.
8. **Languages** — English-only assumed.

---

*Implementation-ready. Once the remaining open questions are answered, the §7 sub-stories can be ticketed independently.*

---

## Appendix A — Glossary
*(Carried from v2 — Catena-X, EDC, AAS/SAMM/CX-0143, MES/ERP, PEF/PEFCR, JRC CFB-EV/IND/LMT, Annexes II/XIII/XIV, Articles 47–53, EU Data Act 2023/2854, HPAL, ISO/IEC 15459, MM2H, MS 2818. Add: **pCAM/CAM** — precursor and cathode active material, the chemical intermediates between refined metal and the electrode. **Catena-X consultant qualification** — the Catena-X Academy training + qualification (validity 12 months) that is mandatory to be listed as an advisory service provider; membership in the Catena-X Association is not a prerequisite.)*

## Appendix B — Evidence base (sources held in this project)
*(Carried from v2.)* Regulation & standards in `Regulations and Standards/` (EU 2023/1542; JRC CFB-EV/IND/LMT; EC Rec. 2021/2279 PEF; DIN DKE SPEC 99100; MS 2818 / MS 2697; CSDDD 2024/1760; EU Data Act 2023/2854; IRMA; Mercedes raw-material report; TPI/DPP Indonesia ESG decks). Market context: `Source articles/Roland_Berger_Batterymonitor_2024_2025.pdf` — **confirm the Indonesian nickel share and ASEAN capacity figures (§5.3 B) before launch.** Strategy: `Ichnos Protocol/Ichnos_CatenaX_Strategy_Memo.docx`. Knowledge base: `Battery Passport Framework/battery_passport_framework.md` and `Regulations and Standards/BatteryPassport/BATTERY_REGULATIONS_KNOWLEDGE_BASE.md`.
