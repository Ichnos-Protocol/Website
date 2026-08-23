# IBS 2026 call to action: the consortium, the deck and the website

Status: spec v5, 22 Aug 2026 (night; v4 plus the evening decisions on prices, company type, Google Workspace export). Sections 1 to 3 are decided and the deck side is implemented
(`build/build_ibs_deck_v2.js`, S15 to S18). Section 4 is the website implementation, written against
the `Ichnos_Protocol` repository as it is today (branch Catena-X_Pivot; every file and line cited was
read on 22 Aug). Pricing source: `project-pricing.md` (same folder). House rules apply (repo
`CLAUDE.md`): no dashes, name the actor and the verb, no metaphors, exact Catena-X vocabulary.

## 1. Decisions taken (22 Aug)

1. **Words.** "Consortium" is the group offer; "pilot" is the offer for a single company. No other
   words. "Chain" stays only as a description of the value chain.
2. **URL.** `https://ichnos-protocol.com/consortium` (the deck's QR carries `?src=ibs2026`), printed
   on S16 and S18. The page is built on 23 Aug and must resolve from the first scan on 28 Aug.
3. **Prices.** None on the deck, none on the public page (Option B). Prices appear only on the gated
   tier page after registration, served by an authenticated endpoint, never in the client bundle
   (section 4.6); the type of company given in the form decides which tiers and prices are shown.
4. **Certificate management** is a bonus use case after the passport data is addressed and the use
   cases are proposed to the expert group.
5. **Equipment suppliers and institutes** join the consortium as members: use-case input and
   activated-cell data, no connection to the Catena-X network, a lower member rate. Nothing is funded
   or signed; the deck names roles, the invitations are spoken.
6. **Registration uses the existing contact database** (Firebase account + `user_profiles`), the
   existing signup form, plus one consortium step with the added fields. After registration the tier
   page appears; the logged-in user selects the tier of interest; Francesco sees the registrants as a
   list in the admin dashboard and exports them as a group into Google Workspace to organize the
   first consortium call. No mailing list is built on the site.
7. **Deferred:** footer link and homepage teaser (later).

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
capacity line, Calendly QR) and S18 (registration QR first) as committed in `6e28b90`; speaker notes
carry the capacity ceiling, one track, no onboarding sold, UC2, "no data extract, no proposal", the
spoken invitations, the member role, "no prices from the stage".

## 4. Website implementation (`Ichnos_Protocol` repo)

### 4.1 What exists and is reused (read 22 Aug)

- **Identity and contacts.** Firebase Auth (e-mail + password only) on the client; the server verifies
  the Bearer token (`server/src/middleware/auth.js`) and mirrors the user in Neon Postgres: `users`
  (firebase_uid PK) and `user_profiles` (user_id PK, name, surname, email, phone, company, linkedin;
  migrations 001, 002). A chatbot visitor must sign up before the first message (`ChatPanel.jsx:75`
  opens `AuthModal`), so the chatbot contacts are exactly these rows. **The consortium registrant is
  the same row**: no second contact table, no duplicate identity.
- **The signup form.** `AuthModal` with `AuthSignupForm` (name, surname, email, password, company,
  phone, linkedin; `client/src/components/molecules/AuthSignupForm.jsx`) and the forced
  `ProfileCompletionForm`; submit logic in `useAuthActions.js` (Firebase `createUserWithEmailAndPassword`,
  then `POST /api/auth/sync-profile`). The pending-action pattern already exists: `ContactForm.jsx:90-95`
  parks the form in Redux, opens the auth modal, and resumes on `auth.authSuccess`. The consortium form
  uses the same pattern.
- **Gating.** `ProtectedRoute` (`client/src/routes/ProtectedRoute.jsx`, any signed-in user) and
  `AdminRoute`. Admin = Firebase custom claim `admin`.
- **Admin dashboard.** `/admin` (`AdminPage.jsx`): tabs Requests (Inquiries kanban, Chat-only Leads),
  Analytics, Settings, plus "Export CSV" (`GET /api/admin/export` → `contacts.csv`). Daily digest
  e-mail via Resend (`adminService.js:145-187`, from `noreply@ichnos-protocol.com`, to `ADMIN_EMAILS`).
- **Conventions.** Pages in `client/src/components/pages/<Name>Page.jsx` with `SeoHead` meta from
  `constants/seoMeta.js` (+ `ALL_META`), structured data key in `constants/structuredData.js`, copy in
  `constants/*Content.js`, nav in `constants/navigation.js` (`NAV_ITEMS`), footer columns in
  `FooterNavColumns.jsx`, hand-edited `public/sitemap.xml` and `public/robots.txt`; server routes as
  `server/src/routes/*Routes.js` + controller + service + repository + Zod validator, mounted in
  `app.js`; migrations as `server/migrations/NNN_YYYYMMDD_name.sql` run by `npm run migrate`
  (idempotent, `schema_migrations` table). Styling from `client/src/index.css` tokens only. Guard
  tests: `vocabulary.test.js` (forbidden phrases), `theme-scoping.test.jsx`, co-located page tests
  with `renderWithProviders` and vitest-axe; `Navbar.test.jsx` and `Footer.test.jsx` hard-code the
  current link sets; `LandingPage.test.jsx` asserts six sections on the homepage.
- **Not there today** (to be built): any consortium page, route, content, meta, nav entry; a source or
  tag column on contacts; a tier or mailing-list concept; an admin list for consortium registrants;
  `?src=` capture (no analytics anywhere; `PrivacyPage` states no tracking cookies); a general mailer
  beyond the digest; `Form.Select` is unused anywhere so far.

### 4.2 The flow, end to end

1. Visitor lands on `/consortium` (from the QR with `?src=ibs2026`, or the homepage call to action).
   The page stores the `src` value in `sessionStorage` (no cookie, no tracker).
2. Visitor clicks **Register**. If not signed in, the existing `AuthModal` opens (sign up or log in;
   the profile completion step follows if name or surname is missing). The registration intent is
   parked in Redux and resumed on `auth.authSuccess`, as `ContactForm` does today.
3. Signed in, the visitor sees the **consortium registration form** (section 4.5), pre-filled from the
   profile (name, surname, e-mail, company, phone, LinkedIn shown read-only via `ContactFormProfile`
   or editable through `PUT /api/auth/profile`). Submit → `POST /api/consortium/register` writes one
   `consortium_registrations` row (section 4.3) with the `src` value and the consent timestamp.
4. On success the client navigates to **`/consortium/tiers`** (gated: signed in and registered).
   The page shows the tier ladder with prices; the user selects the tier of interest (single choice)
   and optionally "not sure yet"; submit → `PUT /api/consortium/tier`. Confirmation text: "Thank you.
   You are registered for the consortium. We answer within five working days; the first group call is
   in October 2026."
5. Francesco sees every registrant in **Admin → Consortium** (section 4.7): name, company, position,
   role in the chain, tier, source, date; filters; "Copy all e-mails"; CSV export. That list is the
   mailing list for the first call. The daily digest gains a "New consortium registrations" section.
6. A registrant can return to `/consortium/tiers` at any time (logged in) to change the tier; the
   page shows the current selection.

### 4.3 Data model: one new table, one migration

`server/migrations/006_20260823_create_consortium_registrations.sql` (idempotent, `IF NOT EXISTS`):

```
CREATE TABLE IF NOT EXISTS consortium_registrations (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(128) NOT NULL UNIQUE REFERENCES users(firebase_uid) ON DELETE RESTRICT,
  position VARCHAR(40) NOT NULL
    CHECK (position IN ('anchor','supplier','equipment_supplier','institute','other')),
  chain_role VARCHAR(40) NOT NULL
    CHECK (chain_role IN ('mining_refining','cathode_material','electrode','dry_cell','cell_activation',
                          'module_pack','recycling','equipment','institute','other')),
  product_line TEXT NOT NULL,
  customer_request TEXT,
  data_extract VARCHAR(20) NOT NULL
    CHECK (data_extract IN ('yes','not_yet','no','not_applicable')),
  data_needs TEXT,
  preferred_start VARCHAR(20) NOT NULL DEFAULT 'nov_2026'
    CHECK (preferred_start IN ('nov_2026','later')),
  tier VARCHAR(30)
    CHECK (tier IN ('readiness','pilot','consortium_anchor','consortium_supplier','member','not_sure')),
  tier_selected_at TIMESTAMP,
  source VARCHAR(40),                       -- e.g. 'ibs2026' from ?src=
  consent_timestamp TIMESTAMP NOT NULL,
  consent_version VARCHAR(20) NOT NULL DEFAULT 'consortium-v1',
  status VARCHAR(30) NOT NULL DEFAULT 'registered'
    CHECK (status IN ('registered','contacted','readiness','in_consortium','declined')),
  admin_notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_consortium_registrations_tier ON consortium_registrations(tier);
CREATE INDEX IF NOT EXISTS idx_consortium_registrations_source ON consortium_registrations(source);
CREATE INDEX IF NOT EXISTS idx_consortium_registrations_created_at ON consortium_registrations(created_at);
CREATE TRIGGER trigger_update_consortium_registrations_updated_at BEFORE UPDATE ...  (reuse update_updated_at())
```

One row per user (UNIQUE user_id): re-registration updates the row. Company, contact name and e-mail
stay in `user_profiles`, so the contact database is not duplicated. GDPR: add the table to
`gdprService.exportUserData` and `deleteUserAccount` (delete the row before anonymizing), and to the
retention sweep's scope.

### 4.4 API: `server/src/routes/consortiumRoutes.js`, mounted at `/api/consortium` in `app.js`

All behind the existing `auth` middleware (Firebase Bearer token), Zod validation via
`validateRequest`, responses through `formatResponse`:

- `POST /api/consortium/register` body `{ position, chainRole, productLine, customerRequest?,
  dataExtract, dataNeeds?, preferredStart, source?, consentTimestamp, consentVersion }`; upsert on
  user_id; returns the registration.
- `GET /api/consortium/me` → the caller's registration or `null` (drives the `/consortium/tiers` gate
  and the pre-filled form).
- `GET /api/consortium/tiers` (auth, and a registration must exist) → the tier ladder **for the
  caller's position**, with the figures. The figures live server-side only, in
  `server/src/config/consortiumTiers.js` (a constant, no client copy): readiness 10,000 to 12,000;
  pilot 30,000; consortium anchor 45,000 plus 8,000 per additional supplier tenant; consortium supplier
  tenant 8,000; member "on request"; recurring fee lines as in `project-pricing.md`. Mapping by
  position: anchor → readiness, consortium anchor (pilot listed as the single-company alternative);
  supplier → readiness, consortium supplier tenant; equipment supplier and institute → member; other →
  readiness, pilot, consortium supplier tenant. "Not sure yet" is always offered.
- `PUT /api/consortium/tier` body `{ tier }`; the server accepts only a tier allowed for the caller's
  position; sets `tier` and `tier_selected_at`.
- Admin (`auth` + `admin`): `GET /api/admin/consortium` (list joined with `user_profiles`: name,
  surname, email, phone, company, linkedin, all registration fields; query filters `tier`, `source`,
  `status`); `PUT /api/admin/consortium/:id` (`status`, `adminNotes`); `GET /api/admin/consortium/export`
  (CSV, same columns) or extend `GET /api/admin/export` with the consortium columns.
- Digest: `adminRepository.getRecentConsortiumRegistrations` (last 24 h) added to `buildDigestHtml`
  (escape user text; the existing digest does not).
- Validators in `server/src/validators/consortiumSchemas.js` (zod/v4): enums as above, text fields
  trimmed, max 2000; `consentTimestamp` ISO with offset; `source` max 40, `[a-z0-9_-]`.
- Repository `consortiumRepository.js` with parameterized SQL through the shared `pg` pool; service
  `consortiumService.js`; controller `consortiumController.js`. Rate limiting: the global limiter is
  enough because every route requires a login.

### 4.5 The registration form (client)

Component `client/src/components/organisms/ConsortiumForm.jsx` (react-bootstrap `Form`, first use of
`Form.Select`; copy in `client/src/constants/consortiumContent.js`; RTK Query slice
`client/src/features/consortium/consortiumApi.js` with `register`, `getMe`, `setTier`). The profile
block is the existing `ContactFormProfile` (name, surname, e-mail, company, phone, LinkedIn from
`GET /api/auth/me`); those fields are **not** asked again. Fields, in order:

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
8. Consent (checkbox, required; version `consortium-v1`): "Ichnos Protocol may contact me about the
   consortium and may share my company name and use-case summary with the other participants."

Validation: HTML5 `required` plus the Zod schema; on 400 show the generic sentence the site already
uses ("An unexpected error occurred."), per `AGENTS.md`. Success navigates to `/consortium/tiers`.
Unauthenticated submit parks `{ formData, pending: true }` in a new `consortium` Redux slice and opens
`AuthModal('signup')`; on `authSuccess` the form resubmits.

### 4.6 The tier page `/consortium/tiers` (gated)

Route `<Route path="/consortium/tiers" element={<ProtectedRoute><ConsortiumTiersPage/></ProtectedRoute>}/>`
and, inside the page, a second gate: if `GET /api/consortium/me` is `null`, redirect to
`/consortium#register`. Not in `sitemap.xml`; added to `robots.txt` `Disallow`. Content from
`consortiumContent.js` (`CONSORTIUM_TIERS`), figures from `project-pricing.md`, labelled "indicative,
USD, excluding taxes; the proposal states the final scope and price":

| Tier (radio value) | What it is | Indicative price |
|---|---|---|
| `readiness` | Readiness assessment: 3 to 4 weeks, paper study, 50 % credited to the project | USD 10,000 to 12,000 |
| `consortium_anchor` | Consortium, anchor company: the project for the chain, includes two supplier tenants, up to six tenants in total | USD 45,000 (+ USD 8,000 per additional supplier tenant) |
| `consortium_supplier` | Consortium, supplier tenant: a seat in an anchor's chain | USD 8,000 |
| `member` | Consortium member without network connection (equipment supplier, institute): use-case input, calls, the report | on request (lower member rate) |
| `pilot` | Pilot for a single company: 8 to 10 weeks, one tenant | USD 30,000 |
| `not_sure` | Not sure yet | |

The page renders only what `GET /api/consortium/tiers` returns for the caller's position (decided
22 Aug: figures behind the authenticated endpoint, nothing in the client bundle, the type of company
from the form decides which rows appear). Below the rows, the recurring fee as three lines (dataspace
licence pass-through; managed operations USD 6,000 to 7,000 per tenant and year; passport data
maintenance USD 5,000 to 8,000), the three-year term, and the capacity sentence, all from the same
response. No Catena-X label or logo anywhere on this page (site rule). The table above is the
server constant's content, for reference; the client holds no figure.

### 4.7 Admin → Consortium, and the export into Google Workspace

New tab in `AdminPage.jsx` ("Consortium"), component `ConsortiumRegistrations.jsx`: table with name,
company, position, chain role, tier, source, registered at, status; filters by tier, source, status;
row drawer with the full registration and admin notes (status change via `PUT /api/admin/consortium/:id`).
`adminApi.js` gains the endpoints. The daily digest lists new registrations.

No mailing list on the site (decided 22 Aug). Instead, two exports that Google Workspace imports
directly, both built server-side with the existing `csv-stringify` (`GET /api/admin/consortium/export?format=...`,
filters applied):
- **Google Contacts CSV** (`format=google-contacts`), columns in Google's import schema: `Name`,
  `Given Name`, `Family Name`, `E-mail 1 - Type` (`Work`), `E-mail 1 - Value`, `Phone 1 - Type`
  (`Work`), `Phone 1 - Value`, `Organization 1 - Name` (company), `Organization 1 - Title` (position ·
  chain role), `Website 1 - Value` (LinkedIn), `Notes` (tier · source · registered at), and
  `Group Membership` = `* myContacts ::: Consortium 2026`. Importing it in Google Contacts (Import →
  CSV) creates the contacts and the label "Consortium 2026" in one step; the label is then usable as a
  recipient group in Gmail and as a source for a Google Group.
- **Google Groups bulk-upload CSV** (`format=google-groups`), columns `Group Email [Required]`,
  `Member Email`, `Member Type` (`USER`), `Member Role` (`MEMBER`), for Admin console → Groups →
  Members → Bulk upload members; `Group Email` is a query parameter (for example
  `consortium-2026@ichnos-protocol.com`) so the file needs no editing.
Both exports cover the filtered set, so a tier-specific or source-specific group can be made. The
button "Copy all e-mails" (comma-separated) stays as the quick path for a single invitation.

### 4.8 Tracking the QR: `?src=ibs2026`

`ConsortiumPage` reads `useSearchParams()`; if `src` matches `^[a-z0-9_-]{1,40}$` it is stored in
`sessionStorage` (`consortium_src`) and sent in the registration payload; the server stores it in
`consortium_registrations.source`. No cookie, no analytics library, so the Privacy page statement
("no tracking cookies") stays true; add one sentence to the Privacy page that the registration stores
the campaign source you arrived with.

### 4.9 Page, routing, navigation, SEO

- `client/src/components/pages/ConsortiumPage.jsx` + `ConsortiumPage.test.jsx`; copy in
  `constants/consortiumContent.js` (kicker, headline, lead, three cards, timeline, capacity, who takes
  part, FAQ, form labels, confirmation copy; all in the site's voice, no dashes, vocabulary-guard safe).
- `App.jsx`: `/consortium` and `/consortium/tiers` inside the AdvisoryThemeLayout/PublicLayout block.
- `NAV_ITEMS`: `{ label: 'Consortium', path: '/consortium' }`; update `Navbar.test.jsx` (lines 213,
  238, 329-333) and, if a footer link is added under Products, `Footer.test.jsx` (205, 236-249).
- Homepage: primary call to action "Join the consortium" → `/consortium` (`HERO_CONTENT.ctaText/ctaHref`
  in `landingContent.js`); "Book a call" stays secondary. If a teaser section is added, update
  `LandingPage.test.jsx` (six-section assertion).
- `seoMeta.js`: `CONSORTIUM_META` (+ `ALL_META`); `structuredData.js`: `consortium` key with
  breadcrumb Home > Consortium; `public/sitemap.xml`: add `/consortium`; `public/robots.txt`: disallow
  `/consortium/tiers`.
- Page copy (the public page carries no prices): kicker INDONESIAN BATTERY VALUE CHAIN · CONSORTIUM;
  headline "Join the consortium: Catena-X-aligned battery passport readiness for an anchor company and
  its suppliers. Register by 30 September 2026."; lead (anchor with up to five suppliers, one project,
  test environment, twins on real data with bill-of-material links, gap assessment, use cases written,
  validated and tabled in the Catena-X Digital Product Passport Expert Group for the release after
  CX-Neptune, production in spring 2027; equipment suppliers and institutes as members without a
  connection); cards What you get / What you bring / How it runs (readiness assessment first, credited
  to the project; "scope and price are set out in the proposal; registered participants see the tier
  overview"); timeline (30 Sep, October, November, January 2027 target, 18 Feb 2027, spring 2027);
  capacity sentence; who takes part (roles, institute invited); FAQ (Catena-X membership not needed;
  not Catena-X onboarding; what can be certified today and the UC2 gap; where the data goes; certificate
  management as the bonus use case; after 30 September later entries join the next round); the
  Register button; after the deadline the headline switches to "The first round closed on 30 September
  2026; later entries join the next round."

### 4.10 Tests, guards, deploy

- Unit: `ConsortiumPage.test.jsx`, `ConsortiumForm.test.jsx`, `ConsortiumTiersPage.test.jsx`
  (renderWithProviders, vitest-axe); server: validator tests, repository integration test on
  `TEST_DATABASE_URL` (pattern `contactRepository.integration.test.js`).
- Guards: `vocabulary.test.js` scans all new copy (no "Catena-X certified", "partner", "compliant",
  "powered by"; no blockchain words); `theme-scoping.test.jsx` (no new hexes; tokens only).
- E2E (Playwright, `e2e/tests/`): register from the QR URL as a new user, land on tiers, select a
  tier, see it in admin.
- Deploy: no Vercel change (SPA fallback and `/api` proxy already cover the routes); run
  `npm run migrate` against the Neon database before the client goes live; `.env.example` unchanged
  unless a new env var is added (none planned); the page can be merged to `main` (preview) on 23 Aug
  and promoted to `release` (production) on the 28th, which is the existing promote-to-production flow.
- Repo docs to amend in the same PR: `docs/ichnos_website_CatenaX_pivot_spec_v5.md` (which currently
  forbids any pricing surface) and the website `CLAUDE.md` (whose section 6 still describes a
  non-existent `customer_requests` table).

## 5. What must never be printed

- "November publication" as something the Indonesian use cases can be in.
- NBRI, PEC, MANUGY or any party as coordinator or member before a written agreement.
- "Catena-X onboarding" as our service; "testnet"; "certified"; any Catena-X role Ichnos does not hold;
  any Catena-X label on the tier page.
- A price on the deck or on the public consortium page. Both tracks as parallel offers in one window.
- A single recurring fee as one number.

## 6. Decisions taken on the open items (22 Aug, evening)

1. Tier figures behind `GET /api/consortium/tiers`, authenticated, filtered by the caller's company
   type; nothing in the client bundle. Decided.
2. The member rate for equipment suppliers and institutes: `project-pricing.md` (checked 22 Aug) holds
   no member figure; its nearest line is the supplier tenant seat at USD 8,000 "priced near cost", which
   includes a tenant. Proposed from that logic, for Francesco to confirm: **USD 4,000 per company for
   the project** (half a seat: the participation without the tenant; below the record's own commodity
   floor for a connected supplier). The coordinating institute is not a paying member (host fee share
   or non-cash consideration, per the record). Until confirmed, the endpoint returns "on request" for
   the member tier.
3. Footer link and homepage teaser: later.
4. No mailing list on the site; the admin exports the registrants as a group into Google Workspace
   (Google Contacts label, or Google Groups bulk upload). Decided.
