# commercial_offer_page_pattern.md — the house pattern for offer pages

**Version 1.0, 2026-09-23 · Status: normative for every new commercial offer page**

Derived from the battery passport data readiness assessment page (`website_readiness_assessment_page.md`), which took three owner review passes to get right. Every rule below is a rule because a specific line was rejected, and the rejected line is quoted so the rule is arguable rather than a matter of taste.

**Scope.** Any page whose job is to convert a reader into a booked call or an enquiry about a paid engagement. Not the landing page, not `/services`, not `/team`.

**Inheritance.** This pattern sits under `website_Catena_pivot_3.md` (claim rules, label law, three-tier testing) and `website_Catena_pivot_4.md` (regulatory dates, credential copy). Where they conflict, they win. This document adds structure and copy discipline, and overrides neither.

---

## 1. Section order

This order is normative. It was arrived at by rebuilding the readiness page after the first version shipped in a different order and read as a brochure.

| # | Section | Job | Heading |
|---|---|---|---|
| 1 | Hero | What it is | none (h1 is the headline) |
| 2 | Why now | The external clock, stated as a mechanism | yes |
| 3 | To whom it applies | Routing: name both buyer types | yes |
| 4 | Audience panels | Self-sort, with prices | none (panel titles carry it) |
| 5 | Scope of the assessment | What you get | yes |
| 6 | Timeline | How it runs, week by week | yes |
| 7 | Prerequisites | What it costs the buyer in effort | yes |
| 8 | Disclaimer | What it is not | yes |
| 9 | CTA band | Act | short headline |
| 10 | What usually follows | Where it leads, unpriced | yes |
| 11 | FAQ | Objections | yes |
| 12 | CTA band | Act | **no headline, no second link** |

Three properties are load-bearing:

- **The offer is named before it is justified.** The reader knows what they are being sold by the end of the first screen.
- **The reader is told whether it applies to them**, rather than inferring it from two unlabelled cards.
- **Boundaries arrive before the first ask**, not after. That reads as candour; the other way round reads as backpedalling.

---

## 2. Every section gets a heading

The first readiness page shipped with the deliverables grid, the process steps, the prerequisites and the FAQ all unlabelled, because the spec had fenced no heading string for them. The owner's review marked all four by hand.

**Rule:** a reader skimming only the headings must be able to describe what the page offers. If a section has no heading, it has no place in the skim, and most readers only skim.

Use plain functional labels, not clever ones: `Scope of the assessment`, `Timeline`, `Prerequisites`, `FAQ`, `Disclaimer`.

**Implementation.** A content constant that holds a list gets the shape `{ heading, items }` — not a bare array with the heading bolted on at the component. The component reads the heading from the constant like everything else.

---

## 3. Copy rules

### 3.1 A heading is an assertion, not a tease

It must survive being read alone, with nothing above or below it. If it only makes sense once you have read the paragraph underneath, it is not a heading.

| Rejected | Why | Shipped |
|---|---|---|
| `What the date actually means for your timeline` | Announces that a point is coming without making it | `Suppliers must be data ready well in advance of the mandated passport date` |
| `Your data is needed before the deadline, not on it` | A slogan. Reads as clever; states nothing checkable | as above |

Both of those were written by Claude and both were rejected. The second was rejected **after** being offered as the fix for the first, which is the useful part: the failure mode repeats unless the rule is explicit.

### 3.2 Never leave a demonstrative pronoun to the reader

| Rejected | Shipped |
|---|---|
| `Who this applies to` | `To whom this assessment applies` |

On a page that has both an offering and a regulation in view, "this" is ambiguous, and the reader resolves it wrong or stops. Name the noun.

### 3.3 The headline says what the thing is

Not what it achieves, not how fast, not how clever.

| Rejected | Shipped |
|---|---|
| `Three weeks to know exactly where your battery data falls short.` | `Assess your readiness for the EU battery passport` |

The rejected version is an outcome claim with a number in it. The shipped version is what the reader would type into a search box, and what they need in the first five seconds of opening a link from a cold email on a phone.

### 3.4 The subhead enumerates the work, in order

Say the steps. Do not characterise them.

| Rejected | Shipped |
|---|---|
| `A fixed-scope assessment that maps every data point the EU battery passport will demand against what your systems actually hold today, and tells you what to do about the gap.` | `What data your customers will require from you, how it maps to the appropriate data models for your products and processes, where your systems fall short today, and what to do about it.` |

Four clauses, four stages of the work, in the order they happen. "Fixed-scope assessment that maps... and tells you" is a description of a category of thing; the replacement is a description of what arrives.

### 3.5 Address the buyer's own situation, not the abstract case

`for your products and processes` was the owner's addition and it does real work: it tells the reader the output is specific to them rather than a template. Prefer the possessive wherever it is true.

### 3.6 Never attribute conformance to an artifact

| Rejected | Shipped |
|---|---|
| `compliant data models` | `appropriate data models for your products and processes` |

A data model is not compliant. This is pivot-3 §1.2 and pivot-4's conformance-adjective ban, and it is the rule most likely to be broken by sales copy, because "compliant" is the word the buyer uses.

### 3.7 Never hedge in a CTA

| Rejected | Shipped |
|---|---|
| `Thirty minutes is enough to tell you whether this is worth doing.` | deleted |

It invites the reader to conclude it might not be worth doing. Delete hedges rather than soften them.

### 3.8 State consequences, not urgency

Urgency copy ages badly and reads as pressure. A consequence is durable and does the same work.

| Rejected | Shipped |
|---|---|
| `This is the last quarter in which finding out is still useful.` | `Starting later leaves your customer with the obligation to fill the gaps, in ways which might not pass an audit.` |

### 3.9 No copy may depend on the calendar

Anything that says "this quarter", "the new year", "the fourth quarter" or names a year becomes false without anyone touching it, and no test can see it. **Regulatory dates render from `regulatoryDates.js` only.** Everything else states a relationship, not a date.

This is enforced: the page-level date guard rejects any bare four-digit year, written month-and-year, or ISO date in the rendered page, except the one interpolated regulatory date.

---

## 4. CTA discipline

- **Two bands, no more.** One after the disclaimer, one after the FAQ. Those are the two highest-intent moments: full picture, and last objection answered.
- **The closing band is a button alone.** No headline, no fallback link. Nothing competes with the action at the moment the reader is most likely to take it.
- **Labels differ between positions.** Repeating the hero's label word for word in the mid band asks for the same thing twice in the same words and reads as a loop.
- **Name the meeting, not the sales stage.** `Book an introductory call` over `Book a scoping call` in the closing position. Keep a stated duration where it helps (`Book a 30-minute scoping call`): a time box is a friction reducer, not padding.
- **One primary action per band.** A quieter written fallback (`Or send the question in writing`) belongs on the mid band only.

---

## 5. Credibility: check the rest of the site before adding any

The readiness page shipped with an author paragraph and a five-item published-work list. The owner removed both as repetition. **One of those was repetition and the other was not**, and the difference is the lesson.

- The author paragraph duplicated facts already on `/team`, in the credential strip, in the Organization JSON-LD, and in the **global footer that renders on the page itself**. Genuine repetition.
- The published-work list contained five facts that existed nowhere else in the codebase. Removing it deleted them from the site.

**Rule:** before adding a credibility block to an offer page, grep the codebase for each fact. If it is already carried by the footer or by `/team`, do not repeat it here. If it is unique, adding it is a real decision with a maintenance obligation, and removing it later is a real loss — say so at the time.

**Corollary:** an offer page is not a CV. Credibility on these pages comes from the specificity of the deliverables, not from a list of achievements.

---

## 6. Prices

Inherited from `website_readiness_assessment_page.md` §4.2.1 and unchanged:

- Prices are text, never badges, pills or price-card headers, and never adjacent to a Catena-X mention.
- No price above the fold.
- Currencies render as codes (`SGD`, `EUR`), never symbols.
- One currency per panel. Never show two for the same tier.
- No price is typed into copy. Every figure reaches a surface through the pricing selector.
- No currency conversion anywhere, ever.

---

## 7. Machine guards to carry over

A new offer page starts with these, adapted:

| Guard | What it stops |
|---|---|
| Section-order assertion | A reordering that breaks the argument without anyone noticing |
| Page-wide date sweep, one interpolated date permitted | Calendar-dependent copy (§3.9) |
| Every content constant renders somewhere | Copy written and never wired up |
| Each rendered price equals the selector value | A stale figure |
| No Catena-X label asset in the page subtree | pivot-3 §4.4, trademark exposure |
| Every booking CTA resolves to the single booking constant | A second live booking link |
| No qualifier phrases (`introductory price`, `founding`, `limited places`) | Framing the price as provisional |

**Write guards against the failure, not against the wording.** The `introductory` pattern originally matched the bare word and blocked the legitimate CTA label "Book an introductory call". It was narrowed to `introductory price|offer|rate`, which is what the rule was always about. A guard that fires on correct copy will be weakened by whoever hits it next, so make it precise the first time.

---

## 8. Before you ship

1. Read the headings alone, in order. Do they describe the offer?
2. Read every heading in isolation. Does each one assert something?
3. Search the copy for `this`, `it`, `that` at the start of a heading or a section. Name the noun.
4. Search for any year, quarter or month not coming from `regulatoryDates.js`.
5. Grep each credibility claim against the rest of `client/src`.
6. Phone first, then desktop. Headline, subhead and CTA on the first screen without zooming.
7. Three viewports: 1440, 768, 390. No price styled as a badge; no Catena-X mention beside a price.

---

## 9. What this pattern does not cover

Page design and visual treatment · pricing strategy · the booking tool configuration · SEO beyond the shared summary constant · anything on `/services`, `/team` or the landing page.
