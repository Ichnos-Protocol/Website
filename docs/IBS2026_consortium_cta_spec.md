# IBS 2026 call to action: the consortium, the deck and the website

> **This file is the maintained version** (decided 23 Aug 2026). The copy in the EU_Battery_Passport
> repo (`docs/Catena-X/presentations/IBS2026_consortium_cta_spec.md`) is frozen at v5 and carries a
> stale-copy notice; keep this one up to date, never the other.

Status: spec v6, 23 Aug 2026. Supersedes v5 section 4. The standalone `consortium_registrations`
table of v5 is replaced by the **shared-record design**: the consortium answers are columns on
`user_profiles`, every consortium submission goes through the existing contact submit path and
writes a `contact_requests` row, and a small `/api/consortium` router serves the reads. Basis: the
Traycer "Refactoring Analysis" and "Refactoring Approach" documents of 23 Aug, reviewed the same day
(section 7 records the refinements). Sections 1 to 3 are decided and the deck side is implemented
(`build/build_ibs_deck_v2.js`, S15 to S18). Section 4 is the website implementation, written against
the `Ichnos_Protocol` repository on branch `Consortium` (HEAD `4d79377`); every file and line cited was
read on 22 or 23 Aug. Pricing source: `project-pricing.md` (EU_Battery_Passport repo,
`docs/Catena-X/presentations/`). House rules apply (repo `CLAUDE.md`): no dashes, name the actor and
the verb, no metaphors, exact Catena-X vocabulary.

## 1. Decisions taken (22 and 23 Aug)

1. **Words.** "Consortium" is the group offer; "pilot" is the offer for a single company. No other
   words. "Chain" stays only as a description of the value chain.
2. **URL.** `https://ichnos-protocol.com/consortium` (the deck's QR carries `?src=ibs2026`), printed
   on S16 and S18. The page must resolve from the first scan on 28 Aug.
3. **Prices.** None on the deck, none on the public page (Option B). Prices appear only on the gated
   tier page after registration, served by an authenticated endpoint, never in the client bundle
   (section 4.5); the position given in the form decides which tiers and prices are shown.
4. **Certificate management** is a bonus use case after the passport data is addressed and the use
   cases are proposed to the expert group.
5. **Equipment suppliers and institutes** join the consortium as members: use-case input and
   activated-cell data, no connection to the Catena-X network, a lower member rate. Nothing is funded
   or signed; the deck names roles, the invitations are spoken.
6. **Registration is the existing contact record, extended** (23 Aug). One person is one Firebase
   account plus one `user_profiles` row; the consortium answers, the tier and the consortium status are
   columns on that row. Every consortium submission goes through `POST /api/contact/submit` and writes
   a `contact_requests` row marked `kind = 'consortium'` when it carries no question, so it appears on
   the kanban. The same form component serves `/contact` (modal) and `/consortium` (inline). After
   registration the tier page appears; the logged-in user selects the tier of interest; Francesco sees
   the registrants in the admin dashboard and exports them as a group into Google Workspace to organize
   the first consortium call. No mailing list is built on the site.
7. **Deferred:** footer link and homepage teaser (later). The navbar entry is in scope.
8. **Sequencing** (23 Aug): the refactors land first as a separate, mergeable batch proven
   behaviour-neutral by the existing suite (Batch A); the feature is added on top as additive work
   (Batch B). Migration 006 is applied by hand to the parent Neon branch before any merge. Section 4.10.

## 2. The commercial model (from `project-pricing.md`)

- The consortium is priced as a chain: an anchor company with an EU customer pays for the project,
  supplier seats are priced near cost, no `total / n`. Readiness assessment as the paid qualification
  gate (3 to 4 weeks, 50 % credited); anchor plus up to five supplier tenants; the pilot is the
  single-company version. Recurring fees quoted as three lines, three-year term signed with the project.
- Capacity: two tenants before M7, earliest start November 2026, earliest live January 2027, one track.
- Boundary conditions: no "Catena-X onboarding" sold (it runs through a certified Onboarding Service
  Provider); UC2 gap disclosed in writing; no real data extract, no proposal; the three institutional
  claims kept separate; the report is the product. Release target: the patch or the release after
  CX-Neptune, production in spring 2027.

## 3. What the deck says (implemented)

S15 closing line, S16 band and closing line, S17 (kicker "THE CONSORTIUM: EXPORT-MARKET READY", cards,
capacity line, Calendly QR) and S18 (registration QR first) as committed in `6e28b90` and the final
pass of 22 Aug; speaker notes carry the capacity ceiling, one track, no onboarding sold, UC2, "no data
extract, no proposal", the spoken invitations, the member role, "no prices from the stage".

## 4. Website implementation (`Ichnos_Protocol` repo, branch `Consortium`)

### 4.0 Ground truth (verified 23 Aug against Neon, read-only)

- Neon project `Ichnos-Protocol` (`noisy-river-85502096`, ap-southeast-1), default branch. Website
  tables: `users` (7 rows: `firebase_uid` PK, timestamps, `deleted_at`), `user_profiles` (7 rows:
  `user_id` PK; `name`, `surname`, `email` NOT NULL; `phone`, `company`, `linkedin` nullable;
  `created_at`, `updated_at` with trigger), `contact_requests` (2 rows: `user_id`, consent timestamp
  and version, `status`, `admin_notes`; no contact details, no message text), `questions` (6 rows:
  the text, `contact_request_id`, `source IN ('form','chat')`), `question_topics`,
  `schema_migrations` (exactly `000` to `005`; the folder `server/migrations/` holds the same six
  files, so the next number is `006`).
- **The database is shared.** The same project also holds a full battery-passport schema
  (`batteries`, `models`, `plants`, `companies`, `part_types`, `battery_ownership`,
  `battery_passport_lineage`, `din_*` views, a `neon_auth` schema) created by no website migration.
  The passport's own project is `Battery_Passport` (`icy-union-62454163`, eu-central-1). Every
  `ALTER` in this spec touches website tables only, but a mistake has a wider blast radius than the
  website, and both applications name their migration table `schema_migrations`: never run the
  passport migrator against this DSN. Which connection string created those tables is a separate
  question, outside this feature.
- **`upsertProfile`** (`server/src/repositories/userRepository.js:22-41`) runs on every login through
  `authService.syncProfile`. Its `ON CONFLICT DO UPDATE` SET list is fixed (`name`, `surname` with
  COALESCE; `email`, `phone`, `company`, `linkedin` unconditionally). `syncProfile` merges the existing
  row first, so a login keeps phone and company today; any column added to that SET list without being
  in the merge is erased on the next login. **`updateProfile`** (`PUT /api/auth/profile`) spreads the
  whole `getUserById` row into `upsertProfile`, which destructures only the six names.
- **`getUserById`** selects named columns, not `*`, so `/api/auth/me` cannot return consortium
  columns by accident. `mapUserRow` hand-picks seven fields.
- **Live defect H9.** `ContactForm.jsx:44` reads `meData?.data?.profile`; `authService.getUser`
  returns `{ user, isAdmin, profileState }` and no `profile` key. The read-only profile block in the
  contact modal has never rendered in production; `ContactForm.test.jsx:31-44` mocks the wrong key and
  passes. Fixed in Batch A (A4).
- **Two enforcement points for "at least one question"**: `contactSubmitSchema`
  (`server/src/validators/contactSchemas.js:17`, `.min(1)`) and `ContactForm.doSubmit`
  (`ContactForm.jsx:67`, returns early when every textarea is blank). Both relax together.
- **The digest does not escape** (`adminService.js:160-173`). `escapeHtml` exists in
  `server/src/helpers/buildStatusPage.js:5`.
- Guards: `client/src/constants/vocabulary.js` walks every `.js`/`.jsx` under `client/src` plus
  `index.html` and `site.webmanifest` against the forbidden patterns with an empty exception list;
  `theme-scoping.test.jsx` forbids new hex literals; `Navbar.test.jsx`, `MobileNavOverlay` and
  `Footer.test.jsx` hard-code link sets; `LandingPage.test.jsx` asserts six homepage sections.
- Migrations do not run on deploy: `npm run migrate` is manual, neither `vercel.json` invokes it.
  Preview Neon branches are copies of the parent, so a column missing on the parent breaks every
  preview.

### 4.1 What exists and is reused

- **Identity and contacts.** Firebase Auth (e-mail + password only); the server verifies the Bearer
  token (`server/src/middleware/auth.js`) and mirrors the user in `users` + `user_profiles`. A chatbot
  visitor signs up before the first message (`ChatPanel.jsx:75` opens `AuthModal`), so the chatbot
  contacts are exactly these rows. **The consortium registrant is the same row.**
- **The signup form.** `AuthModal` with `AuthSignupForm` and the forced `ProfileCompletionForm`;
  submit logic in `useAuthActions.js`. The park-and-resume pattern is inside `ContactForm.jsx`
  (lines 46-58 and 90-95): park the form in Redux, open the auth modal, resume on `auth.authSuccess`,
  never replay after an enforced logout. It stays where it is (no hook extraction: one form, one
  consumer) and `/consortium` inherits it through the shared form body.
- **Gating.** `client/src/routes/ProtectedRoute.jsx` (any signed-in user, redirects to `/`) and
  `AdminRoute`. Admin = Firebase custom claim `admin`.
- **Admin dashboard.** `/admin` (`AdminPage.jsx`, 150 lines): tabs Requests (Inquiries kanban,
  Chat-only Leads), Analytics, Settings, plus "Export CSV" (`GET /api/admin/export` → `contacts.csv`).
  Daily digest via Resend (`adminService.sendDailyDigest`, from `noreply@ichnos-protocol.com`, to
  `ADMIN_EMAILS`, returns `{ sent, inquiries, chatLeads }`).
- **Conventions.** Pages in `client/src/components/pages/<Name>Page.jsx` with `SeoHead` meta from
  `constants/seoMeta.js` (+ `ALL_META`), structured data key in `constants/structuredData.js`, copy in
  `constants/*Content.js`, nav in `constants/navigation.js` (`NAV_ITEMS`), hand-edited
  `public/sitemap.xml` and `public/robots.txt`; server routes as `server/src/routes/*Routes.js` +
  controller + service + repository + Zod validator (`zod/v4`), mounted in `app.js`; responses in the
  `{ data, error, message }` envelope; migrations `server/migrations/NNN_YYYYMMDD_name.sql`; files
  under 120 lines; styling from `client/src/index.css` tokens only; `csv-stringify` already a server
  dependency. `Form.Select` is unused so far.

### 4.2 The flow, end to end

1. Visitor opens `/consortium` (from the QR with `?src=ibs2026`, or the navbar). The page stores a
   valid `src` in `sessionStorage` (`consortium_src`; no cookie, no tracker; section 4.8).
2. The page carries the offer copy (section 4.9) and, under "Register", the **same form body as the
   contact modal**, rendered inline with `mode="consortium"`: the read-only profile block, the
   consortium tick box pre-ticked, the eight consortium fields (section 4.4), an optional question
   textarea, the consent line, the button "Submit registration".
3. Not signed in: submit parks the form, opens `AuthModal('signup')` (the contact modal opens
   `'login'`), resumes on `authSuccess`, exactly as `ContactForm` does today; the profile completion
   step runs first if name or surname is missing.
4. Signed in and **not yet registered** (`GET /api/consortium/me` → `null`): the form is blank except
   the profile block. Signed in and **already registered**: the form is pre-filled with the stored
   answers and the button reads "Update my registration".
5. Submit → `POST /api/contact/submit` (section 4.4). First registration: the consortium answers are
   written to `user_profiles`, one `contact_requests` row `kind = 'consortium'` is created (only when
   the submission carries no question), `consortium_registered_at`, `consortium_source` and
   `consortium_status = 'registered'` are set. Later edit: the answers are updated, no row is created,
   the registration date and the source keep their first values.
6. On success in consortium mode the client navigates to **`/consortium/tiers`** (gated: signed in and
   registered). The page shows the tier rows permitted for the caller's position, with the figures from
   the authenticated endpoint; the user selects one (or "not sure yet") → `PUT /api/consortium/tier`.
   Confirmation: "Thank you. You are registered for the consortium. We answer within five working days;
   the first group call is in October 2026." The page can be revisited to change the tier.
7. On `/contact`, the modal gains the tick box "I am also interested in joining the consortium"
   (unticked by default; the eight fields and the consortium consent appear when ticked). A ticked
   submission with questions records the registration **and** the inquiry. Unticking on a later
   submission never withdraws a registration (withdrawal is an admin status change).
8. Francesco sees every registrant in **Admin → Consortium** (section 4.6), on the kanban (the person
   appears; a no-question row shows the label "Consortium registration"), in the daily digest section
   "New consortium registrations", and exports the filtered set as Google Contacts CSV or Google Groups
   CSV. "Copy all e-mails" stays as the quick path.

### 4.3 Data model: migration `006`, ALTER only

`server/migrations/006_20260823_add_consortium_columns.sql` (idempotent, `ADD COLUMN IF NOT EXISTS`,
`CREATE INDEX IF NOT EXISTS`). Additive: no column dropped, no type changed, no row rewritten. Every
new `user_profiles` column is nullable or defaulted (seven live rows with NOT NULL on name, surname,
email stay valid). Both existing `contact_requests` rows take the marker's default. The battery-passport
tables in the shared database are not touched.

`user_profiles` gains:

| Column | Type and constraint | Notes |
|---|---|---|
| `consortium_interest` | `BOOLEAN NOT NULL DEFAULT false` | the marker; gate for the tiers endpoint; never set back to false by a form submission |
| `consortium_position` | `VARCHAR(40)`, CHECK IN (`anchor`,`supplier`,`equipment_supplier`,`institute`,`other`) | required by Zod when the box is ticked |
| `consortium_chain_role` | `VARCHAR(40)`, CHECK IN (`mining_refining`,`cathode_material`,`electrode`,`dry_cell`,`cell_activation`,`module_pack`,`recycling`,`equipment`,`institute`,`other`) | required by Zod when ticked |
| `consortium_product_line` | `TEXT` | required by Zod when ticked; free text, scrubbed on erasure |
| `consortium_customer_request` | `TEXT` | optional; free text, scrubbed |
| `consortium_data_extract` | `VARCHAR(20)`, CHECK IN (`yes`,`not_yet`,`no`,`not_applicable`) | required when ticked |
| `consortium_data_needs` | `TEXT` | optional; free text, scrubbed |
| `consortium_preferred_start` | `VARCHAR(20)`, CHECK IN (`nov_2026`,`later`) | required when ticked |
| `consortium_source` | `VARCHAR(40)` | from `?src=`; first write wins (`COALESCE(existing, new)`) |
| `consortium_consent_timestamp` | `TIMESTAMP` | the consortium consent (sharing with participants) |
| `consortium_consent_version` | `VARCHAR(20)` | `consortium-v1` |
| `consortium_registered_at` | `TIMESTAMP` | first write wins; not `updated_at`, which the trigger bumps on every profile edit |
| `consortium_tier` | `VARCHAR(30)`, CHECK IN (`readiness`,`pilot`,`consortium_anchor`,`consortium_supplier`,`member`,`not_sure`) | set by `PUT /api/consortium/tier` |
| `consortium_tier_selected_at` | `TIMESTAMP` | |
| `consortium_status` | `VARCHAR(30)`, CHECK IN (`registered`,`contacted`,`readiness`,`in_consortium`,`declined`) | the service sets `registered` on first registration; the admin changes it |
| `consortium_admin_notes` | `TEXT` | admin-authored, about the person: scrubbed on erasure |

`contact_requests` gains the marker: `kind VARCHAR(20) NOT NULL DEFAULT 'inquiry'
CHECK (kind IN ('inquiry','consortium'))`. Not `source` (already means form/chat on `questions`),
not `type`.

Indexes: `user_profiles (consortium_interest)`, `(consortium_tier)`, `(consortium_source)`,
`(consortium_registered_at)`; `contact_requests (kind)`; and the one-row guard, a partial unique
index that makes "at most one consortium row per person" a database fact no concurrent submit can
race past:

```
CREATE UNIQUE INDEX IF NOT EXISTS uq_contact_requests_one_consortium_per_user
  ON contact_requests (user_id) WHERE kind = 'consortium';
```

Both existing rows are `inquiry`, so the index builds clean.

**Invariants.** `upsertProfile` is never given a consortium column; the consortium columns are written
only by `userRepository.updateConsortiumProfile` (section 4.4). `GET /api/auth/me` and `mapUserRow` are
unchanged; the seven-field `user` shape stands. `contact_requests.status` keeps its four values and the
kanban its four lanes. Required-ness is a Zod concern, not a database one (D3).

### 4.4 The write path: `POST /api/contact/submit`, extended

The only write path for a registration. `auth`, `validateRequest(contactSubmitSchema)`, `formatResponse`.

Body (today's fields unchanged, two added):

```
{
  questions: [{ text }],               // min 1 today; min 0 when consortiumInterest is true
  consentTimestamp, consentVersion,    // the contact consent, as today
  consortiumInterest?: boolean,        // default false
  consortium?: {                        // required when consortiumInterest is true, forbidden otherwise
    position, chainRole, productLine, customerRequest?, dataExtract, dataNeeds?,
    preferredStart, source?, consentTimestamp, consentVersion
  }
}
```

Zod (`contactSchemas.js`, zod/v4): a conditional refinement. Box ticked and `consortium.position`
missing → 400; box unticked and `consortium` absent → as today; box unticked and `questions` empty →
400 as today. Enums as in 4.3; text fields trimmed, max 2000 (`productLine` max 300); `source` max 40,
`^[a-z0-9_-]{1,40}$`; both consent timestamps ISO with offset; consent version max 20.

**The `kind` rule.** `kind = 'consortium'` if and only if the submission carries zero questions
(legal only with the box ticked). A ticked submission with a question is an inquiry: `kind = 'inquiry'`,
the question must reach the lane count and the New Inquiries digest, and the consortium answers are
written to the profile as well. Invariant: a `consortium` row has no question. `addQuestion`
(`POST /api/contact/:id/questions`) refuses a `consortium` row with 409 ("Ask your question as a new
inquiry") and the client hides the button on such rows (section 4.7, M4).

**Service sequence** (`contactService.submitContactRequest`), **inside one transaction**, in this
order. The transaction is load-bearing: the write spans `user_profiles`, `contact_requests` and
`questions`, and a partial write would leave either a registration without a card or a card without a
registration. The order is kept as defence in depth: if anything ever bypasses the transaction, the
leftover state is a registration without a card, which Admin → Consortium still shows.

Mechanics: `server/src/config/database.js` exports `withTransaction(fn)` (`pool.connect()`, `BEGIN`,
`await fn(client)`, `COMMIT`, `ROLLBACK` on throw, `release()` in `finally`). The repository functions
on this path (`createContactRequest`, `createQuestion`, `getConsortiumProfile`,
`updateConsortiumProfile`) take a trailing `db = pool` parameter and call `db.query(...)`; a pool and a
client share the `.query` interface, so existing call sites and tests are untouched (Batch A item A7).
The service calls `withTransaction(async (client) => { ... })` and passes `client` to each repository
call: orchestration in the service, SQL in the repositories, transaction mechanics in one helper. The
Neon pooled connection string serves transactions in transaction-pooling mode, which is what one
client running `BEGIN ... COMMIT` needs.

1. Read the caller's consortium profile (`getConsortiumProfile(userId, client)`). Decide
   `createRow = questions.length > 0 || consortium_registered_at IS NULL` and
   `kind = questions.length > 0 ? 'inquiry' : 'consortium'`.
2. If the box is ticked: `updateConsortiumProfile(userId, data, client)`: writes only the consortium
   columns; `consortium_interest = true`; `consortium_registered_at = COALESCE(existing, NOW())`;
   `consortium_source = COALESCE(existing, $new)`; `consortium_status = COALESCE(existing, 'registered')`;
   all other answer columns overwritten with the submitted values; the consortium consent timestamp and
   version stored.
3. If `createRow`: `createContactRequest(userId, { consentTimestamp, consentVersion, kind }, client)`.
   For `kind = 'consortium'` the insert is idempotent against the partial unique index:
   `INSERT ... ON CONFLICT (user_id) WHERE kind = 'consortium' DO NOTHING RETURNING *`; when no row
   comes back (a concurrent submit won), the service continues as an edit.
4. Questions, if any, attached to the new row (`createQuestion(..., client)`, `source 'form'`, as today).
5. `COMMIT`, then `updateUserActivity` (outside the transaction, as today).

Response: a plain inquiry keeps today's shape `{ ...request, questions }`. A consortium submission adds
`consortium` (the stored answers). When no row is created the response carries `id: null`,
`questions: []` and `consortium`; the client in consortium mode does not read `id`.

**Consent.** Two consents exist because two purposes exist: the contact consent ("I agree to be
contacted regarding my enquiry", `v1`, `contact_requests.contact_consent_*`) and the consortium consent
("Ichnos Protocol may contact me about the consortium and may share my company name and use-case
summary with the other participants.", `consortium-v1`, `user_profiles.consortium_consent_*`). On
`/consortium` one checkbox with the consortium text is shown; the client sends the same timestamp as
both `consentTimestamp` and `consortium.consentTimestamp`, with version `consortium-v1` for both, so the
`contact_requests` row records which text was accepted. On `/contact` with the box ticked, both
checkboxes appear and both are required.

**Re-registration** (U14): the form is pre-filled; first write wins for `consortium_registered_at` and
`consortium_source`; the registration path creates at most one `contact_requests` row per person; an
edit without a question writes no row; an edit with a question is an inquiry and creates an inquiry
row, as today. A separate genuine inquiry from the same person creates a second row, which is correct.
Unticking the box never writes `consortium_interest = false`.

**The optional question on an edit** (stress test, 23 Aug): it follows the `kind` rule, not the page.
A returning registrant who types a question on `/consortium` creates an `inquiry` row with that
question, the profile answers are updated, no second `consortium` row is created; the admin sees a card
with the text, and the question enters the lane count and the New Inquiries digest, which is where a
question must go. Attaching it to the `consortium` row would hide it from both by design; hiding the
field on edits would send the person to `/contact`, where the same edit creates an inquiry row anyway.

### 4.5 The read router: `server/src/routes/consortiumRoutes.js`, mounted at `/api/consortium`

`auth` only (no `admin`); the JSDoc header states the split: registration is submitted through
`POST /api/contact/submit`; this router serves the caller's own answers, the tier ladder and the tier
selection.

- `GET /api/consortium/me` → the caller's consortium answers (camelCase) or `null` when
  `consortium_interest` is false. Drives the pre-filled form and the tiers gate.
- `GET /api/consortium/tiers` → 403 when `consortium_interest` is false; otherwise the permitted tier
  ids **for the caller's stored position**, each with its figures, plus the recurring fee lines, the
  three-year term and the capacity sentence. The figures and the position → tiers mapping are stored
  server-side only, in `server/src/config/consortiumTiers.js` (a constant; never imported by client
  code). Mapping: anchor → readiness, consortium_anchor (pilot listed as the single-company
  alternative); supplier → readiness, consortium_supplier; equipment_supplier and institute → member;
  other → readiness, pilot, consortium_supplier. `not_sure` is always offered.
- `PUT /api/consortium/tier` body `{ tier }` (Zod enum): the server accepts only a tier permitted for
  the caller's position (403 otherwise); sets `consortium_tier` and `consortium_tier_selected_at`
  (`userRepository.setConsortiumTier`).

Tier constant content (the server holds the figures; the client holds descriptions keyed by tier id and
skips an unknown id rather than render a broken row; D1):

| Tier id | What it is | Indicative price (USD, excluding taxes; the proposal states the final scope and price) |
|---|---|---|
| `readiness` | Readiness assessment: 3 to 4 weeks, paper study, 50 % credited to the project | 10,000 to 12,000 |
| `consortium_anchor` | Consortium, anchor company: the project for the chain, includes two supplier tenants, up to six tenants in total | 45,000 (+ 8,000 per additional supplier tenant) |
| `consortium_supplier` | Consortium, supplier tenant: a seat in an anchor's chain | 8,000 |
| `member` | Consortium member without network connection (equipment supplier, institute): use-case input, calls, the report | on request (USD 4,000 proposed, section 6.2, until confirmed) |
| `pilot` | Pilot for a single company: 8 to 10 weeks, one tenant | 30,000 |
| `not_sure` | Not sure yet | |

Recurring fee lines: dataspace licence pass-through; managed operations 6,000 to 7,000 per tenant and
year; passport data maintenance 5,000 to 8,000. Three-year term signed with the project. No Catena-X
label or logo on the tier page (site rule).

### 4.6 Admin: the surfaces that treat a consortium row differently, the tab, the exports

Every item exists because a consortium submission creates a `contact_requests` row that carries no
question. **Deliberately unchanged:** `getUsersWithRequests` INNER JOINs `contact_requests`, so
registering puts the person on the board; that is wanted.

| # | Surface | Change |
|---|---|---|
| A | `adminRepository.getUsersWithRequests` (line 9) | `COUNT(cr.id) FILTER (WHERE cr.kind = 'inquiry') AS "totalRequests"`; also return `p.consortium_interest AS "consortiumInterest"` and show a small "Consortium" badge on the lane header in `KanbanLane`, so "Inquiries: 0" next to a person on the board is explained |
| B | `KanbanLane` card (`getPreviewText`, line 16) | render "Consortium registration" instead of an empty preview; `getRequestsWithQuestionsByUserId` returns `kind` |
| C | daily digest (`getRecentInquiries`, line 174; `buildDigestHtml`) | New Inquiries excludes `kind = 'consortium'`; a new section "New consortium registrations" fed by `adminRepository.getRecentConsortiumRegistrations()` (`user_profiles` where `consortium_registered_at >= NOW() - 24 h`, joined to `users.deleted_at IS NULL`: name, email, company, position, chain role, source); every user value escaped (A3 is a prerequisite) |
| D | `GET /api/admin/export` (`getAllDataForExport`, line ~128) | gains the consortium columns (nulls for a plain inquirer). Secondary: the Google Workspace import rests on the two consortium exports below |
| E | `MyInquiriesList` (line 32, visitor-facing) | same label as B; `getRequestsByUserId` returns `kind`; the "Add question" button is hidden on a `consortium` row (M4) |
| F | `getChatOnlyUsers` (line 69) and `getRecentChatOnlyLeads` (line 196) | both subqueries become `NOT IN (SELECT DISTINCT user_id FROM contact_requests WHERE kind = 'inquiry')`, so "chat-only" keeps today's meaning: chat messages and no genuine inquiry |

Shared helper for B and E: `client/src/utils/inquiryPreview.js`, `getInquiryPreview(request)` → the
question text, or the label "Consortium registration" when `kind === 'consortium'`, never an empty
string.

**Admin → Consortium tab.** `AdminPage.jsx` gains only a `<Tab>`; the body is the organism
`client/src/components/organisms/ConsortiumRegistrations.jsx` (table: name, company, position, chain
role, tier, source, registered at, consortium status; filters by tier, source, status; row drawer with
the full answers and admin notes). Endpoints (`auth` + `admin`, on `adminRoutes.js`):
- `GET /api/admin/consortium` (query `tier`, `source`, `status`) →
  `adminRepository.getConsortiumRegistrants(filters)`: `user_profiles` where `consortium_interest`
  joined to `users` (`deleted_at IS NULL`): name, surname, email, phone, company, linkedin and every
  consortium column.
- `PUT /api/admin/consortium/:userId` body `{ status?, adminNotes? }` (Zod in `adminSchemas.js`) →
  `consortium_status`, `consortium_admin_notes`. The key is the user id: there is no registration table.
- `GET /api/admin/consortium/export?format=google-contacts|google-groups[&group=...]` (filters
  applied; `csv-stringify`):
  - **Google Contacts CSV**: `Name`, `Given Name`, `Family Name`, `E-mail 1 - Type` (`Work`),
    `E-mail 1 - Value`, `Phone 1 - Type` (`Work`), `Phone 1 - Value`, `Organization 1 - Name`
    (company), `Organization 1 - Title` (position, chain role), `Website 1 - Value` (LinkedIn),
    `Notes` (tier, source, registered at), `Group Membership` = `* myContacts ::: Consortium 2026`.
    Google Contacts → Import creates the contacts and the label in one step; the label is usable as a
    Gmail recipient group and as a source for a Google Group.
  - **Google Groups bulk-upload CSV**: `Group Email [Required]`, `Member Email`, `Member Type`
    (`USER`), `Member Role` (`MEMBER`); `Group Email` from the `group` query parameter (for example
    `consortium-2026@ichnos-protocol.com`), so the file needs no editing before Admin console →
    Groups → Members → Bulk upload.
- "Copy all e-mails" (comma-separated, the filtered set) stays in the tab.
- `adminApi.js` gains the endpoints; `store.js` unchanged unless a slice is added.

### 4.7 GDPR

- **Export** (`gdprService.exportUserData`): the profile object is built from named fields, so the
  consortium answers, tier, status, source and timestamps must be added explicitly (data-subject access).
- **Erasure** (`deleteUserAccount` and `runRetentionSweep` through `deleteUserData`):
  `userRepository.scrubConsortiumText(userId)` nulls the **four** free-text columns
  (`consortium_product_line`, `consortium_customer_request`, `consortium_data_needs`,
  `consortium_admin_notes`) and keeps position, chain role, data extract, preferred start, tier,
  source, status and timestamps as anonymous statistics. Called next to `deleteUserData`, not inside
  `upsertProfile`.
- Privacy page: one sentence that the consortium registration stores the campaign source you arrived
  with (no cookie, no analytics).

### 4.8 Tracking the QR: `?src=ibs2026`

`ConsortiumPage` reads `useSearchParams()`; if `src` matches `^[a-z0-9_-]{1,40}$` it is stored in
`sessionStorage` (`consortium_src`). The form body reads it in both modes and sends it as
`consortium.source` when the box is ticked. The server stores it with first-write-wins, so a later visit
from a plain link does not erase the attribution, and a first registration from `/contact` without a
source does not block a later `ibs2026` (COALESCE takes the new value when the stored one is null).

### 4.9 Client structure, page, routing, navigation, SEO

**Form (S1, S2).** `ContactForm.jsx` (184 lines, a `<Modal>`, rendered only by `ContactPage.jsx:97`)
splits into:
- `client/src/components/organisms/ContactRequestForm.jsx`: the fields, state, submit logic and the
  park-and-resume effect; props `{ mode, requestId, onSuccess }`, `mode` is `'inquiry'` or
  `'consortium'`. The mode drives three things: whether the consortium block renders pre-ticked, the
  button labels ("Submit Inquiry" / "Submit registration" / "Update my registration"), and whether the
  auth modal opens as `'login'` or `'signup'`. Reads the profile from `data.user` (A4).
- `client/src/components/molecules/ConsortiumFields.jsx`: the tick box, the eight fields
  (`Form.Select` for position and chain role; radios for data extract and preferred start; text and
  textareas) and the consortium consent line; renders nothing when unticked; values and a change
  handler as props.
- `ContactForm.jsx` becomes the thin modal shell around `ContactRequestForm` for `/contact`. All 11
  cases of `ContactForm.test.jsx` pass against the split component with only the `getMe` mock
  corrected.
- `ContactFormProfile` stays the read-only profile block (name, surname, e-mail, company, phone,
  LinkedIn from `GET /api/auth/me`); those fields are not asked again.
- RTK Query: `client/src/features/consortium/consortiumApi.js` with `getConsortiumMe`, `getTiers`,
  `setTier` (tag `Consortium`, invalidated by `setTier` and by the contact submit mutation).

**Pages.** `client/src/components/pages/ConsortiumPage.jsx` (+ test): `SeoHead`, `PageTransition`,
`AdvisoryPageHero`, the offer sections, the inline `ContactRequestForm mode="consortium"`. 
`client/src/components/pages/ConsortiumTiersPage.jsx` (+ test): route gate
`<ProtectedRoute redirectTo="/consortium">` (A6: optional prop, default `/`, `/privacy` unchanged) and
data gate (the endpoint's 403 renders a link back to `/consortium#register`). Copy in
`client/src/constants/consortiumContent.js` (kicker, headline, lead, three cards, timeline, capacity,
who takes part, FAQ, form labels, tier descriptions keyed by tier id, confirmation copy; no figure).

**Routing and navigation.** `App.jsx`: `/consortium` and `/consortium/tiers` inside the
AdvisoryThemeLayout/PublicLayout block. `NAV_ITEMS`: `{ label: 'Consortium', path: '/consortium' }`;
update `Navbar.test.jsx` (lines 213, 238, 329-333) and the `MobileNavOverlay` test. Footer link and
homepage teaser deferred (section 1.7); `FooterNavColumns.jsx`, `Footer.test.jsx` and
`LandingPage.test.jsx` untouched; the homepage keeps six sections.

**SEO.** `seoMeta.js`: `CONSORTIUM_META` (+ `ALL_META`); `structuredData.js`: `consortium` key with
breadcrumb Home > Consortium; `public/sitemap.xml`: add `/consortium`; `public/robots.txt`: disallow
`/consortium/tiers`.

**Page copy** (the public page carries no prices): kicker INDONESIAN BATTERY VALUE CHAIN · CONSORTIUM;
headline "Join the consortium: Catena-X-aligned battery passport readiness for an anchor company and
its suppliers. Register by 30 September 2026." (check "Catena-X-aligned" against the pivot spec's claim
rules when the copy is written; the vocabulary guard does not catch it); lead (anchor with up to five
suppliers, one project, test environment, twins on real data with bill-of-material links, gap
assessment, use cases written, validated and tabled in the Catena-X Digital Product Passport Expert
Group for the release after CX-Neptune, production in spring 2027; equipment suppliers and institutes
as members without a connection); cards What you get / What you bring / How it runs (readiness
assessment first, credited to the project; "scope and price are set out in the proposal; registered
participants see the tier overview"); timeline (30 Sep, October, November, January 2027 target, 18 Feb
2027, spring 2027); capacity sentence; who takes part (roles, institute invited); FAQ (Catena-X
membership not needed; not Catena-X onboarding; what can be certified today and the UC2 gap; where the
data is stored; certificate management as the bonus use case; after 30 September later entries join the
next round); the Register section; after the deadline the headline switches to "The first round closed
on 30 September 2026; later entries join the next round."

Form fields, in order (labels in `consortiumContent.js`):
1. Your position (`Form.Select`, required): anchor company with an EU customer asking for passport or
   supplier data · supplier to such a company · equipment supplier · research institute · other
2. Role in the value chain (`Form.Select`, required): mining or refining · cathode active material ·
   electrode · dry cell · cell activation · module or pack · recycling · equipment · research institute
   · other
3. The product line or the use case the consortium would cover (text, required)
4. Which customer has asked you for passport or supplier data, and for what (textarea, optional)
5. Can you provide one real data extract (an ERP export or a formation dataset) for the readiness
   assessment? (radio, required): yes · not yet · no · not applicable, member without connection
6. The data you need from your suppliers, and the data you must publish to your customers (textarea,
   optional)
7. Preferred start (radio, required): November 2026 · a later round
8. Optional question (one textarea; "leaving this blank is fine")
9. Consent (checkbox, required; `consortium-v1`): "Ichnos Protocol may contact me about the
   consortium and may share my company name and use-case summary with the other participants."

Validation: HTML5 `required` plus the Zod schema; on 400 show the generic sentence the site uses
("An unexpected error occurred."), per `AGENTS.md`.

### 4.10 Batches, order, migration, rollback

**Batch A (refactors; behaviour-neutral; merged before Batch B; no new test expectations; full suite
green before and after):**

| # | Item | Nature | Verified by |
|---|---|---|---|
| A1 | `escapeHtml` moved to `server/src/helpers/escapeHtml.js`, imported by `buildStatusPage` | pure move | the eight existing assertions relocated; `buildStatusPage` tests unchanged |
| A2 | digest HTML builder moved to `server/src/helpers/buildDigestHtml.js` | pure move out of a 187-line file | a characterization test written first, asserting the current (unescaped) HTML for a payload with `<`, `&` and a quote; it passes untouched after the move |
| A3 | escaping applied in the digest builder | output changes | the characterization assertions flip to entity-encoded in the same commit |
| A4 | `ContactForm` reads `data.user`, not `data.profile` | fixes H9 | the mock and the assertion corrected together; the other ten cases untouched |
| A5 | `ContactForm` split into shell and `ContactRequestForm` body | structural move | all 11 cases pass against the split component |
| A6 | `ProtectedRoute` gains optional `redirectTo` (default `/`) | additive prop | a new case for a custom target; the default case unchanged |
| A7 | `withTransaction(fn)` helper in `server/src/config/database.js`; `createContactRequest`, `createQuestion` (and the two new consortium profile functions when they land) accept a trailing `db = pool` | additive signature, default preserves behaviour | every existing repository and service test passes untouched; a helper test proves COMMIT, ROLLBACK on throw, and release in both cases |

Dropped: the auth-resume hook extraction (one form, one consumer).

**Batch B (feature), in this order:** migration 006 → server write path (4.4) and the `kind` rule →
the two chat-only queries and the other admin queries (4.6 A, C, D, F) → `/api/consortium` router and
tier constant (4.5) → `/consortium` page, route, nav, SEO (4.9) → `/consortium/tiers` → kanban and
My Inquiries labels (B, E) → Admin → Consortium tab and exports → GDPR (4.7) → E2E.

**T1, migration.** `006` is applied by hand (`npm run migrate`) to the parent Neon branch before any
merge, then to production before promotion; Vercel runs no migration. Production migrations need
Francesco's explicit confirmation (repo `CLAUDE.md` section 17).

**Rollback.** Batch A is revertible per item. Batch B is revertible as a unit; the added columns are
inert once the code that writes them is gone.

### 4.11 Tests

- **Safety net:** `ContactForm.test.jsx` (11 cases, including the enforced-logout replay guard) for A4
  and A5.
- **Schema:** the conditional refinement both ways (box ticked with a missing position fails; box
  unticked with no `consortium` passes); a consortium submission with an empty `questions` array
  succeeds; a non-consortium submission with an empty array still fails; empty string, whitespace-only,
  over-length, bad enum, malformed `source`, missing consortium consent when ticked.
- **`kind` rule:** zero questions → `consortium` row; ticked plus a question → `inquiry` row and the
  profile written; `addQuestion` on a `consortium` row → 409.
- **Service sequence and re-registration:** submitting twice updates the answers, creates no second
  `contact_requests` row, leaves `consortium_registered_at` and `consortium_source` at their first
  values; an edit with a question creates an inquiry row; a separate genuine inquiry creates a second
  row; a null stored source takes a later `ibs2026`.
- **One-row guard and atomicity:** two concurrent zero-question submissions for the same user end with
  exactly one `consortium` row and one registration (integration test, gated); a repository failure
  after the profile write rolls back everything (no registration, no row, no question; the mocked
  client sees `ROLLBACK` and `release`); the idempotent insert returns no row on conflict and the
  service returns the edit response.
- **`upsertProfile` guard:** a login-shaped `upsertProfile` call leaves the consortium columns intact.
- **Chat-only regression (highest value):** a user with chat messages plus a `consortium` row still
  appears in `getChatOnlyUsers` **and** `getRecentChatOnlyLeads`; the same user with an `inquiry` row
  appears in neither.
- **Lane count and badge:** `totalRequests` excludes `consortium` rows while the user still appears;
  `consortiumInterest` returned and rendered.
- **Preview helper:** `getInquiryPreview` for three inputs (question present; `consortium` row without
  one; `inquiry` row without one); one assertion each in `KanbanLane` and `MyInquiriesList` that the
  label renders and no empty string does; the "Add question" button absent on a `consortium` row.
- **Digest:** New Inquiries excludes `consortium` rows; the new section lists registrations; a
  registrant with `<script>` in the company name is escaped in both sections; the return shape stays
  `{ sent, inquiries, chatLeads }` (plus a `consortium` count if added, additive).
- **Exports:** `getAllDataForExport` carries the consortium columns for a registrant and nulls for a
  plain inquirer; the Google Contacts and Google Groups formats produce Google's column headers.
- **GDPR:** the export JSON contains the consortium answers; erasure nulls the four text columns and
  keeps position, chain role and tier.
- **Tiers:** a supplier submitting `consortium_anchor` is refused; `GET /tiers` returns 403 for
  `consortium_interest = false`; the client skips an unknown tier id.
- **Repository integration tests** on the new functions, gated on `TEST_DATABASE_URL`, skipped in CI
  (accepted: `006` is proven only by the real run, T1).
- **Components:** `renderWithProviders` plus vitest-axe for both pages and both form modes. Guards:
  `vocabulary.test.js` and `theme-scoping.test.jsx` pick up the new files automatically.
- **Bundle check:** grep the built `client/dist/` for any tier figure; zero hits is the pass condition.
- **E2E (Playwright):** a new `signUpAs(page, credentials)` helper in `e2e/tests/helpers/auth.js`
  (orchestrating the existing `AuthPage` methods; real Firebase user, unique address per run; cleanup
  out of band via `server/scripts/cleanupOrphanUsers.js`, not wired here); journey QR URL → sign up →
  register → tiers → admin tab.

### 4.12 Deploy

No Vercel change (SPA fallback and `/api` proxy cover the routes); `.env.example` unchanged unless a
new variable is added (none planned); `006` by hand per T1; merge to `main` (preview), promote to
`release` (production) on 28 Aug through the existing flow. Repo docs to amend in the same PR:
`docs/ichnos_website_CatenaX_pivot_spec_v5.md` (which forbids any pricing surface) and the website
`CLAUDE.md` (section 6 still describes a non-existent `customer_requests` table; add the
`upsertProfile` invariant to the auth contract notes).

## 5. What must never be printed

- "November publication" as something the Indonesian use cases can be in.
- NBRI, PEC, MANUGY or any party as coordinator or member before a written agreement.
- "Catena-X onboarding" as our service; "testnet"; "certified"; any Catena-X role Ichnos does not hold;
  any Catena-X label on the tier page.
- A price on the deck, on the public consortium page, or anywhere under `client/`. Both tracks as
  parallel offers in one window.
- A single recurring fee as one number.

## 6. Decisions taken on the open items

1. Tier figures behind `GET /api/consortium/tiers`, authenticated, filtered by the caller's stored
   position; nothing in the client bundle. Decided 22 Aug.
2. The member rate for equipment suppliers and institutes: `project-pricing.md` (checked 22 Aug) holds
   no member figure; its nearest line is the supplier tenant seat at USD 8,000 "priced near cost", which
   includes a tenant. Proposed from that logic, for Francesco to confirm: **USD 4,000 per company for
   the project** (half a seat: the participation without the tenant). The coordinating institute is not
   a paying member. Until confirmed, the endpoint returns "on request" for the member tier.
3. Footer link and homepage teaser: later.
4. No mailing list on the site; the admin exports the registrants as a group into Google Workspace
   (Google Contacts label, or Google Groups bulk upload). Decided 22 Aug.
5. Shared record instead of a registration table; submission through the contact path; reads on
   `/api/consortium`; refactors first (Batch A), feature second (Batch B); migration by hand before
   merge. Decided 23 Aug (Traycer analysis and approach, reviewed).

## 7. Review notes on the Traycer documents (23 Aug)

Accepted as written: the ground truth, H1 to H12, U1 to U14, S1 to S4, T1 to T4 (including dropping
the hook extraction), D1 to D4, the invariants and the test strategy. Refinements carried into this
version:

1. The marker column is named `kind` (4.3).
2. The `kind` rule is stated: `consortium` if and only if zero questions; a ticked submission with a
   question is an inquiry and its question reaches the count and the digest; `addQuestion` refuses a
   `consortium` row (4.4).
3. The registration write runs in one transaction through a `withTransaction` helper and repository
   functions that accept a client (A7); the one-row rule is a partial unique index with an idempotent
   insert; the profile answers are written before the row as defence in depth (4.3, 4.4). Stress test
   of 23 Aug: Critical 1 resolved by the index plus the transaction, Critical 2 by the `kind` rule
   (an edit-time question is an inquiry row).
4. Two consents, two columns; the consortium consent line renders inside `ConsortiumFields` on the
   modal path too; on `/consortium` one checkbox covers both with version `consortium-v1` (4.4).
5. GDPR export includes the consortium answers; the scrub covers four text columns, `product_line` and
   `admin_notes` included (4.7).
6. `getUsersWithRequests` returns `consortiumInterest` and the lane header shows a badge (4.6 A).
7. The Google Workspace import rests on the consortium export formats; `contacts.csv` gains the
   columns as a secondary surface (4.6 D).
8. Footer link stays deferred per section 1.7; `FooterNavColumns.jsx` untouched (4.9).
9. Unticking the box never withdraws; `consortium_status` is set to `registered` on first write; the
   admin endpoint key is the user id (4.4, 4.6).
10. The shared database finding is recorded with the passport project id and the `schema_migrations`
    caution (4.0).
