# Deployment Migration Validation Checklist

> Triage runbook for validating the website after any major deployment or
> infrastructure migration (Vercel account/team move, Firebase project change,
> Neon DB swap, env-var refresh, etc.). Ordered by failure cascade — check
> each tier only if the previous one passes.

## When to use this

- After moving Vercel projects between accounts/teams (Hobby → Pro)
- After rotating env vars or API keys
- After changing the production domain
- After any PR that touches infrastructure config
- As the verification section for any new design or feature deploy

## Tier 0 — Integrations audit (one-time, post-migration)

**This tier runs once after migrating Vercel accounts/teams — not on every PR.** Skip it if you're just validating a regular deploy.

Vercel integrations are **scoped per team/account**. They do not follow projects when you transfer them between teams. The new team starts with **zero integrations installed**. Until you reinstall the ones you need, downstream tiers will surface bizarre symptoms: stale `DATABASE_URL` causing 401 auth failures, missing deploy notifications, broken analytics.

### Step 1 — Inventory the old account's integrations

Before disconnecting anything on the old account, screenshot **old account → Settings → Integrations**. Cross-reference against the new team's **Settings → Integrations**. Anything in the old list but not in the new = must be reinstalled.

### Step 2 — For each missing integration, do this in order

1. **Delete the stale env vars the old integration left behind on the project.** Env vars transfer with the project during a team move, so the new team's project has the old integration's variables sitting there with dead credentials. The new integration **cannot overwrite existing variables** — it errors with "Failed to set env vars" or "Request failed". For Neon specifically, delete from every environment (Production / Preview / Development):
   - `DATABASE_URL`, `PGHOST`, `PGUSER`, `PGDATABASE`, `PGPASSWORD`
   - And also if present: `POSTGRES_URL`, `POSTGRES_PRISMA_URL`, `POSTGRES_URL_NON_POOLING`, `POSTGRES_USER`, `POSTGRES_HOST`, `POSTGRES_PASSWORD`, `POSTGRES_DATABASE`

2. **Install the integration from the new team's marketplace**, not from the integration vendor's side. This matters because the OAuth flow needs to be initiated team-side, so the resulting grant is scoped to the team. Path: Vercel → team → **Settings → Integrations → Browse Marketplace** → search → **Add Integration**.

3. **Sign in to the vendor (Neon/etc.) during OAuth as a user who is also a Team Owner on Vercel**, so permissions match end-to-end.

4. **Connect to the existing vendor-side project**, do not create a new one. The wizard will ask which Neon project / Firebase project / etc. to attach. Pick the existing one.

5. **Verify env vars repopulated**: open the Vercel project → Settings → Environment Variables → confirm the integration's variables are present with recent timestamps.

6. **Redeploy the server preview** so it picks up fresh env vars. Existing preview deployments retain the env-var snapshot from when they were built. Use Vercel bot comment → three-dot menu → Redeploy.

### Step 3 — Common integrations checklist

| Integration | Reinstall after team move? | Notes |
|---|---|---|
| **Neon** (Postgres) | Yes, if used | Repopulates `DATABASE_URL` + `PG*` vars. Single most likely cause of post-migration 401s and `password authentication failed for user 'neondb_owner'` errors. |
| **GitHub** | Usually auto-done during team creation; verify | Push a commit → confirm Vercel triggers a preview build. If it doesn't, reinstall the Vercel GitHub app and grant repo access. |
| **Vercel Speed Insights / Web Analytics** | Per-project enable | Each project's Settings has its own toggle — these are not team-level. |
| **Slack / Discord / Linear deploy notifications** | Yes, if used | Reconfigure channels/recipients after reinstall. |
| **Sentry / Datadog / New Relic** | Yes, if used | API keys may also need rotating depending on vendor. |
| **Cloudflare** (DNS proxy) | Yes, if used as a Vercel integration | DNS records themselves don't change. |

### Step 4 — What does NOT need a Vercel integration reinstall

These are env-var-only or browser-side and survive any Vercel-team move untouched:

- Firebase Auth (uses env vars + JWKS endpoint)
- Firebase Admin SDK / Firestore (service-account env vars on server)
- X.ai / Grok / OpenAI / any LLM API (single API-key env var)
- Calendly, LinkedIn, YouTube embeds (third-party browser widgets)
- Resend / SendGrid / any transactional email (API-key env var)

### Step 5 — When the install wizard errors

Two distinct error messages with different root causes. Read carefully.

**"Failed to set env vars ... env_vars: [DATABASE_URL PGHOST ...]"** → cause is stale env vars still on the project from the old integration. The new integration cannot overwrite existing variables and refuses to clobber them. Fix: complete Step 1 (delete all the listed variables from every environment), then retry.

**"Request failed: unknown error"** → integration state is corrupted on one side, usually OAuth identity drift from a prior failed attempt. Full reset, **in this exact order**:

1. **Vendor side first** (e.g., Neon dashboard → Integrations) → find every Vercel integration entry → **Uninstall** each. After two failed attempts there are often two dangling entries; remove all of them.
2. Wait 30 seconds for the vendor-to-Vercel webhook to propagate.
3. **Vercel side** → team → Settings → Integrations → if the vendor still appears, click → **Remove**. Also check the affected project's own Integrations tab.
4. **Sign out of both Vercel and the vendor.** This is the step most people skip and the one that actually unblocks the retry — OAuth session cookies hold stale identity from the failed attempts and a refresh alone does not clear them. Empirically: without the sign-out, the retry keeps producing "Request failed: unknown error". With it, the install succeeds on the next try.
5. Sign back in to Vercel as a **Team Owner** (not just a Member).
6. Reinstall from the Vercel team's Integrations marketplace (Step 2 of "For each missing integration").
7. During OAuth, sign in to the vendor as the same identity that's a Team Owner on Vercel.

### Step 6 — One install completes both sides

The integration is bidirectional from a single OAuth grant. Installing it once from Vercel's marketplace creates the entry on **both** Vercel and the vendor automatically. **Do not also install from the vendor side** — that creates a duplicate configuration and reintroduces the state corruption you just cleaned up.

After a successful install, you should still **verify** both sides see the same connection:

- Vercel → team → Settings → Integrations → vendor entry present
- Vendor dashboard (e.g., Neon → project → Integrations) → exactly one Vercel entry present, pointing at the right Vercel project

If you see two Vercel entries on the vendor side, one is a leftover from a prior failed attempt — delete the older one (compare timestamps).

### Step 7 — Post-audit verification

After all integrations are reinstalled:

- [ ] **Redeploy the server preview**. Existing preview deployments retain the env-var snapshot from when they were built — they will not see the newly-populated `DATABASE_URL` (or any other integration variable) until a fresh build runs. On the PR, click the Vercel bot comment's three-dot menu → Redeploy. Or push a trivial commit.
- [ ] Hit the server preview's `/api/health` endpoint with the Vercel bypass header. Expect `seed.mode = seeded` (or `skipped` if seeding is configured off for the env). Anything else, especially `seed.error: password authentication failed`, means either the redeploy hasn't completed or the env var isn't actually present.
- [ ] Vercel → server project → Environment Variables → all expected integration variables present with recent timestamps.
- [ ] Vercel → team → Integrations — list matches the old account's inventory you took in Step 1.

### Step 8 — What does NOT need to be added to GitHub Actions

Integration-managed env vars (`DATABASE_URL`, `PGHOST`, `PGUSER`, `PGDATABASE`, `PGPASSWORD`, `POSTGRES_*`, etc.) are **runtime values** consumed by the deployed server on Vercel. They are **not** referenced by any GitHub Actions workflow — the workflows only test against the already-deployed preview. Do not duplicate these into GitHub Secrets.

The only Neon-related GitHub Actions secrets that exist are:

| GitHub Secret | Purpose | Affected by Vercel team migration? |
|---|---|---|
| `NEON_API_KEY` | Calling the Neon API from `e2e.yml`'s cleanup step to delete the ephemeral preview branch | **No** — keys are scoped to the Neon project, not to Vercel |
| `NEON_PROJECT_ID` | Identifies which Neon project to clean up in | **No** — Neon project itself didn't move |

Sanity-check both (don't blindly rotate):

```bash
curl -H "Authorization: Bearer $NEON_API_KEY" \
  https://console.neon.tech/api/v2/projects/$NEON_PROJECT_ID
```

200 = both fine. 401 = key revoked, regenerate. 404 = project ID wrong.

Then proceed to Tier 1.

---

## Tier 1 — CI on GitHub Actions (≈5 min after push)

**Where**: PR → Checks tab → workflow runs

| Check | If green | If red |
|---|---|---|
| `ci.yml` (lint + tests) | → Tier 2 | Read the failing step. Lint failures = run `npm run lint --workspace client` locally on Linux/WSL (skips `.vercel/` noise). Test failures = run the specific failing test file with `npx vitest run path/to/file` and fix. |
| `release-policy-check.yml` | → Tier 2 | Usually a missing required label/title. Adjust PR metadata. |

No GitHub Actions workflow deploys production. Production is Vercel's own build of the `release` branch, validated in Tier 8 after the pull request into `release` merges. `sync-staging.yml` runs only when someone dispatches it by hand; it never runs on a PR or a merge.

---

## Tier 2 — Vercel preview build (3-5 min after push)

**Where**: PR conversation → Vercel bot comments (one per project, client + server)

| Status | Action |
|---|---|
| Both ✅ "Visit Preview" | → Tier 3 |
| Client ❌ build failed | Click "Inspect" → check build log. Most likely: missing `VITE_FIREBASE_*` env var. Open Vercel → `ichnos-protocol/ichnos-client` → Settings → Environment Variables → Preview environment. Compare against `client/.env.example`. |
| Server ❌ build failed | Less likely (build is just bundling). If it does fail, check for missing top-level deps in `server/package.json`. |

**Quick env-var sanity check** (run from repo root once):
```
npx vercel link --cwd client && npx vercel env ls preview --cwd client
npx vercel link --cwd server && npx vercel env ls preview --cwd server
```
Cross-reference against the two `.env.example` files. Anything missing → add via Vercel UI.

---

## Tier 3 — Client preview URL loads

**Where**: Click "Visit Preview" on the Vercel client bot comment.

| Symptom | Likely cause | Fix |
|---|---|---|
| White page, console: `Failed to fetch dynamically imported module` | Stale CDN / build artifact | Hard refresh (Ctrl+Shift+R). If persists, redeploy. |
| Logo or static asset 404s | Asset path wrong | Verify the file is in `client/public/` (Vite serves it from root). Inspect Network tab. |
| Console: `auth/unauthorized-domain` from Firebase | **Most common post-migration issue** — preview URL hostname changed | Firebase Console → Authentication → Settings → **Authorized domains** → add the preview hostname pattern. After a team rename, the URL pattern shifts from `*-<oldusername>.vercel.app` to `*-<newteamslug>.vercel.app`. Add the new pattern, or paste the specific preview URL. |
| Page loads, theme/styles look wrong | CSS not applied | Check `client/src/index.css` was transformed in the build. View source. |

---

## Tier 4 — Routing & themes (manual walk-through)

Once the page loads, navigate every public route:

- [ ] `/` — gradient headline on dark charcoal background, single CTA
- [ ] `/services` — advisory hero, services list, **no** product (passport) sections
- [ ] `/team` — team member profiles render correctly
- [ ] `/contact` — advisory theme
- [ ] `/passport` — **distinctly different look**: Solana navy + green→purple gradient
- [ ] Footer renders across all pages with 4-column layout, battery photo background
- [ ] Navbar logo is the correct (current) brand mark
- [ ] Browser tab favicon is the correct (current) icon
- [ ] Mobile (<768px): footer stacks, navbar shows hamburger, hero headline wraps cleanly

---

## Tier 5 — Server preview API

**Where**: Vercel server bot comment → "Visit Preview" → URL will be `https://ichnos-protocolserver-<hash>.vercel.app`

| Test | Expected | If fails |
|---|---|---|
| `GET /api/health` (or whatever the sanity endpoint is) | 200 OK | Open Vercel → server preview → Function Logs. Most likely: Firebase Admin SDK init failure (missing `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` env vars). Add them to Vercel Preview env. |
| Server preview cold-start time | < 3s | If > 10s, check for heavy top-level imports in `server/api/index.js` (per CLAUDE.md §16, this file must stay thin). |

---

## Tier 6 — Cross-origin (client → server)

From the client preview, open DevTools Network tab and watch a single API call (e.g., open the chatbot widget → send a message).

| Symptom | Cause | Fix |
|---|---|---|
| Request blocked by CORS | `CORS_ORIGIN` on server doesn't include the new client preview hostname | Server → Vercel → Settings → Env Vars → Preview → set `CORS_ORIGIN` to a regex/wildcard that covers the new team's preview pattern. If your CORS middleware only takes a literal string, set it to `*` *temporarily for triage only*. |
| 401 Unauthorized | Firebase token verification failing server-side | Confirm the same `FIREBASE_PROJECT_ID` on client (`VITE_FIREBASE_PROJECT_ID`) and server. Mismatch = token never verifies. |
| API base URL wrong (e.g., calling localhost) | `VITE_API_BASE_URL` not set on client preview | Vercel → client → Settings → Env Vars → Preview → add the server preview URL pattern. |

---

## Tier 7 — Integration smoke tests

Only when Tiers 1-6 are green:

- [ ] **Chatbot**: send "What does Ichnos do?" → expect Grok-generated reply within ~5s. Failure = `XAI_API_KEY` missing or rate-limited.
- [ ] **Contact form**: submit name + email + dummy message + small PDF attachment.
  - [ ] PDF lands in Firestore → Firebase Console → Firestore → `uploads/`
  - [ ] Row appears in Neon → use Neon MCP `execute_sql` → `SELECT * FROM customer_requests ORDER BY created_at DESC LIMIT 1`
  - [ ] `document_url` column has the Firestore public URL
- [ ] **Admin login**: navigate `/admin` → login as admin → `/admin/requests` shows the row just created.
- [ ] **LinkedIn feed** on landing page: widget renders (graceful fallback acceptable — not a blocker).
- [ ] **Calendly modal**: opens, embeds correctly.

---

## Tier 8 — Production deploy of `release` (live site)

**Where**: After the pull request from `main` into `release` merges, Vercel builds `release` for both projects and deploys each build to production. Wait for both Production deployments to show Ready in the Vercel Deployments tab, then open https://ichnos-protocol.com in a browser.

Staging passing does **not** validate production. Vercel env vars have **independent scopes** (Production / Preview / Development). Staging and PR previews build with Preview scope (staging through a `staging` branch override); the `release` build reads **Production** scope. A variable set only on Preview sails through Tiers 1-7 and breaks on Tier 8. The failure modes we've hit:

### 8a. Production client → `502 DNS_HOSTNAME_NOT_FOUND` on `/api/*`

**Symptom**: Site loads, but `<ApiSanityWarning>` banner fires with "API health check returned an error". `curl https://ichnos-protocol.com/api/health` returns HTTP 502 with body `DNS_HOSTNAME_NOT_FOUND`.

**Cause**:

`client/vercel.json` rewrites `/api/(.*)` to `https://$VITE_API_HOST/api/$1`. The value substituted at request time is **whatever was captured when the deployment was built**: Vercel snapshots env vars into the deployment at build time and doesn't read them live from project settings afterwards.

The production deployment is Vercel's build of the `release` branch, and `release` is the production branch of both projects, so that build reads **Production** scope. If `VITE_API_HOST` is empty on Production scope, the build captures `""`, the rewrite resolves to `https:///api/health`, DNS fails, 502.

| Vercel action | Env-var scope read at build time |
|---|---|
| PR / push to a non-production branch (`main`, feature branches) | **Preview** scope (default) |
| Push to `staging` (or its deploy hook) | **Preview** scope, `staging` branch override |
| Merge into `release` (production branch) | **Production** scope |
| Manual "Redeploy" on a Production deployment | **Production** scope |

**Fix**:

Vercel → ichnos-client → Settings → Environment Variables → ensure `VITE_API_HOST=api.ichnos-protocol.com` is set on **Production**. PR previews need a value too, so the simplest setup is a single entry with **Environments: Production and Preview** and no custom branch override. The existing `staging`-branch override stays (branch-scoped overrides outrank the default).

| Scope | Resolved value |
|---|---|
| Production (`release`) | `api.ichnos-protocol.com` |
| Preview (default — `main`, feature branches) | `api.ichnos-protocol.com` |
| Preview / branch=`staging` | `staging-api.ichnos-protocol.com` (override) |

Env-var changes do not reach an existing deployment. After fixing the value, **Redeploy** the current Production deployment (Vercel → ichnos-client → Deployments → current Production → ⋯ → Redeploy, "Use existing Build Cache" **off**) or merge the next PR into `release`. Either path rebuilds against Production scope.

**Caveat — PR previews hit the production API**: with Preview default pointing at `api.ichnos-protocol.com`, feature-branch PR previews route `/api/*` to production. This is consistent with staging (which already runs against the production DB) but worth knowing. If you ever stand up a dedicated preview-server environment, give it a Preview/`main` branch override.

### 8b. `Sync main → staging` fails first run: `fatal: could not read Username for 'https://github.com': terminal prompts disabled`

**Symptom**: The first time you run the manual `Sync main → staging` workflow on the new repo (after merging the first PR to `main`), the `Checkout main (full clone with SYNC_PAT)` step fails immediately. Log shows three `fatal: could not read Username for 'https://github.com'` errors and exit code 128. The workflow never even reaches the `git push` step.

**Cause**: `sync-staging.yml` deliberately uses a Personal Access Token (`secrets.SYNC_PAT`) instead of the default `GITHUB_TOKEN` — pushes made by `GITHUB_TOKEN` do **not** trigger Vercel's git-integration redeploy, so the staging branch wouldn't actually rebuild. After a repo migration, `SYNC_PAT` is **empty** on the new repo. `actions/checkout@v4` receives an empty token, attempts to clone with no credentials, and `git` prompts for a username — which the GitHub Actions runner has no interactive terminal for. Result: the cryptic "terminal prompts disabled" error.

The same root cause can also produce the error if `SYNC_PAT` is set but its token was scoped to the *old* repo's owner (e.g. a fine-grained PAT that listed `Khorolev/Ichnos_Protocol` as the only allowed repository) — `git` gets credentials but the push is rejected and falls back to prompting.

**Fix**:

1. Create a Personal Access Token scoped to the new repo:
   - Fine-grained PAT preferred: GitHub → Settings → Developer settings → Personal access tokens → Fine-grained
   - Resource owner: the **new** org/user (`Ichnos-Protocol`)
   - Repository access: Only select repositories → the new repo (`Website`)
   - Permissions: **Contents: Read and write** + **Workflows: Read and write**
2. Save the value as the `SYNC_PAT` secret on the new repo (Settings → Secrets and variables → Actions → New repository secret).
3. Re-run the workflow: `gh workflow run "Sync main → staging" --ref main`. It should complete in ~10s.

⚠️ If the push succeeds but the deploy-hook steps fail, or Vercel shows no new staging build, see Tier 8c. The two issues are independent: fix `SYNC_PAT` so the push completes, then check the deploy hooks.

### 8c. `Sync main → staging` pushes but no Vercel build appears

**Symptom**: The sync workflow shows ✓ green in GitHub Actions. GitHub records the force-push to `staging` (`git log origin/staging` shows the new commit). The Vercel Deployments tab shows **no new builds** on any project. The `staging-client.ichnos-protocol.com` custom domain keeps serving the pre-migration build for hours after the sync.

**Cause**: Vercel's webhook event filter quietly tightened during/after the team migration. The historical workaround documented in `sync-staging.yml` ("use `SYNC_PAT` instead of `GITHUB_TOKEN` because `GITHUB_TOKEN` pushes don't trigger Vercel") was *one* level of filtering. After the migration there's a second level: even `SYNC_PAT`-attributed force-pushes are dropped. The exact filter logic isn't documented by Vercel, but empirically: a `git push` from a developer terminal triggers a build; the same push via a CI runner using a PAT does not.

This is the most expensive trap on the post-migration list because every diagnostic surface looks healthy:

| Surface | What it shows | Reality |
|---|---|---|
| `gh run list --workflow=sync-staging.yml` | ✓ Success, exit 0 | Push completed |
| `git log origin/staging` | New commit at the right SHA | Branch was updated |
| Vercel Settings → Git | "Connected to Ichnos-Protocol/Website" | Project knows the repo |
| GitHub Apps → Vercel | Installed on the org, full repo access | Webhooks should be sent |
| Vercel Deployments | Latest build is hours/days old | Filter dropped the event |

Disconnect/reconnect of the Git integration from the Vercel UI does NOT fix it — that resets project↔repo metadata but the filter applies after webhook receipt, downstream of the subscription.

**Fix** — route around the filter with Deploy Hooks. `sync-staging.yml` already ends with two curl steps that POST to a deploy hook per project after the force-push, and fails the run if either hook is empty or answers anything other than 200/201. What has to exist for those steps to work:

1. **A Deploy Hook on each Vercel project** for the `staging` branch:
   - Vercel → ichnos-protocol → Settings → Git → Deploy Hooks
   - Name: `sync-staging-trigger`, Branch: `staging` → Create Hook → copy URL
   - Same on ichnos-protocol_server
2. **Both URLs saved as repo secrets**:
   - `VERCEL_DEPLOY_HOOK_STAGING_CLIENT`
   - `VERCEL_DEPLOY_HOOK_STAGING_SERVER`
3. **A fresh manual dispatch**: `gh workflow run "Sync main → staging" --ref main`, then confirm a new `staging` build appears on both projects.

Only `staging` needs deploy hooks. `main` previews and the `release` production build come from ordinary pushes and PR merges made under a user identity, which Vercel's git integration builds natively.

**Diagnostic shortcut for future recognition** — the cheapest way to confirm this is the failure mode:

```bash
# This should build (your terminal push, recognised as user identity):
git checkout -b test/vercel-webhook
git commit --allow-empty -m "test"
git push -u origin HEAD

# The PAT-driven force-push from this run should NOT build on its own if you're in this trap:
gh workflow run "Sync main → staging" --ref main
```

If only the first triggers a git-push build, you've reproduced 8c. With the deploy hooks configured, the sync run still produces a `staging` build; its source in the Vercel deployment details is the deploy hook, not the git push.

**Deploy Hook URLs are write credentials**: anyone who has the URL can POST and trigger a build of that branch. Don't paste them in chat, screenshots, or commit them. Vercel can't regenerate them — only revoke + recreate, then update the secret.

---

## Triage priorities by likelihood (post-Vercel-migration specifically)

If you only have time to verify these things first, do them in order:

1. **Firebase Auth authorized domains** — add the new Vercel team's preview-URL pattern. This is the #1 thing that breaks after a Vercel team migration. **5-minute fix in Firebase Console.**
2. **Server env vars on the new Vercel team** — `FIREBASE_*`, `DATABASE_URL`, `XAI_API_KEY`, `CORS_ORIGIN`. If they were copied during project transfer, you're already good — but verify with `vercel env ls preview --cwd server`.
3. **Vercel production branch** — both projects must have `release` as the production branch (Vercel → project → Settings → Git). Production is Vercel's native build of `release`; no GitHub Actions secret takes part in it.
4. **GitHub Actions secrets that don't migrate** — `SYNC_PAT`, `VERCEL_DEPLOY_HOOK_STAGING_CLIENT` and `VERCEL_DEPLOY_HOOK_STAGING_SERVER` for the manually dispatched staging sync, plus the E2E secrets (`VERCEL_AUTOMATION_BYPASS_SECRET`, `NEON_API_KEY`, `NEON_PROJECT_ID`, the `E2E_*` credentials). Repo migrations preserve workflows and code but `Settings → Secrets and variables → Actions` starts empty on the new repo. Audit every secret referenced in `.github/workflows/*.yml` and replace any that were owner-scoped (PATs especially) — see Tier 8b.
5. **Vercel webhook filter dropping CI-driven pushes** — the most expensive trap. The sync push lands on GitHub, but Vercel never builds it from the git event. Disconnect/reconnect of the Git integration does **not** fix this; the deploy hooks at the end of `sync-staging.yml` do. If staging-client keeps serving an old build after a successful manual sync, check the deploy-hook secrets. See Tier 8c.
6. **Client `VITE_API_HOST` on Production scope** — the `release` build reads Production scope, so that is what serves production traffic. Set `VITE_API_HOST=api.ichnos-protocol.com` on a combined **Production and Preview** entry with no custom branch override, so PR previews resolve too. The existing `staging`-branch override stays. Tier 8a explains the build-time-snapshot reasoning.
7. **Dead env vars from the old team** — e.g. `VITE_BASE_URL` from a prior deployment pattern. Audit `client/.env.example` and `server/.env.example` against the live Vercel env vars; delete anything in Vercel that isn't in the example files.

---

## When something breaks: where to find the answer fast

- **Vercel build logs**: PR → Vercel bot comment → "Inspect" link, OR Vercel MCP `get_deployment_build_logs`.
- **Vercel runtime logs**: Vercel dashboard → project → Functions → Logs, OR Vercel MCP `get_runtime_logs`.
- **Firebase Auth errors**: Browser console always reports the exact code (`auth/unauthorized-domain`, `auth/invalid-api-key`, etc.) — google the code.
- **Neon connection failures**: usually a stale `DATABASE_URL` pointing at a deleted branch. Use Neon MCP to list current branches.
- **CORS errors**: never lie — the browser tells you exactly which origin was rejected. Mirror that string into `CORS_ORIGIN`.

---

## Known failure patterns and their resolutions

| Failure | Tier | Root cause | One-line fix |
|---|---|---|---|
| Preview build: `Missing VITE_FIREBASE_API_KEY` | 2 | Env var didn't transfer to new team | Re-add in Vercel UI under Preview environment |
| Preview loads but login fails with `auth/unauthorized-domain` | 3 | Firebase Auth allowed domains | Add new preview URL pattern to Firebase Console |
| Chat returns 500 | 5 | `XAI_API_KEY` missing | Add to server env vars |
| Contact form upload returns 500 | 5/7 | Firebase Admin SDK init failure | Verify `FIREBASE_PRIVATE_KEY` has `\n` escaped correctly |
| API calls blocked by CORS in browser | 6 | `CORS_ORIGIN` literal string mismatch | Use a regex pattern or add the specific preview hostname |
| Merge into `release` produces no production deployment | post-merge | Vercel production branch is not `release`, or the Git integration lost the repo after a move | Vercel → project → Settings → Git → set production branch to `release` and confirm the repo connection, on both projects |
| Production deploy works but DB writes fail | post-merge | Stale `DATABASE_URL` | Re-pull from Neon (new branch slug perhaps) |
| E2E client readiness step retries 36× with HTTP 401, then times out | 1 (E2E job) | `VERCEL_AUTOMATION_BYPASS_SECRET` stale, or the two Vercel projects hold *different* bypass values | The bypass secret is a single GitHub secret used to probe both `ichnos-client` and `ichnos-protocolserver`. Both Vercel projects must hold the **same** bypass value. Reveal both project bypass values in Vercel (Settings → Deployment Protection → Protection Bypass for Automation), ensure they match, then update the GitHub secret to that shared value. |
| `/api/health` returns `seed.error: password authentication failed for user 'neondb_owner'` | 5 / 7 | Neon Vercel integration not (re)installed on the new team after migration; `DATABASE_URL` env var holds dead credentials | Tier 0, Step 2 — reinstall Neon integration on the team. First delete stale `DATABASE_URL`/`PG*` env vars (the integration cannot overwrite them), then install from the team's Integrations marketplace, then redeploy the server preview. |
| Neon (or other) integration wizard fails with "Request failed: unknown error" after the env-var cleanup succeeded | 0 | OAuth session cookies hold stale identity from the failed first attempt; refresh alone doesn't clear them | Tier 0, Step 5 — full reset, **including signing out of both Vercel and the vendor**. The sign-out is the unblocker; without it the retry keeps producing the same error. |
| `DATABASE_URL` appears stale even after the Neon integration reinstall succeeded | 0 / 5 | Preview deployment was not redeployed after env vars were updated; the running preview still holds the build-time snapshot | Tier 0, Step 7 — redeploy the server preview on the PR. Existing builds do not pick up env-var changes. |
| Production loads but `<ApiSanityWarning>` banner shows; `curl https://<prod-domain>/api/health` returns `502 DNS_HOSTNAME_NOT_FOUND` | 8 | The `release` build captured an empty `VITE_API_HOST` because the variable is missing from **Production** scope. Env vars are snapshotted at build time. | Tier 8a — set `VITE_API_HOST=api.ichnos-protocol.com` on a combined **Production and Preview** entry, then Redeploy the current Production deployment with build cache off (or merge the next PR into `release`). |
| `Sync main → staging` workflow fails at `Checkout main` step with `fatal: could not read Username for 'https://github.com': terminal prompts disabled` | 8 | `SYNC_PAT` secret is empty (or scoped to the old repo's owner) on the new repo. `actions/checkout` gets no credentials and falls back to interactive prompt that the runner can't satisfy. | Tier 8b — create a fine-grained PAT scoped to the new repo with Contents + Workflows write, save as `SYNC_PAT`, re-dispatch the workflow. |
| `Sync main → staging` pushes to `staging` but Vercel shows no new build; staging custom domain keeps serving an old build | 8 | Vercel's webhook filter drops CI-driven force-pushes attributed to `SYNC_PAT`, so only the deploy hooks produce the build. The hook secrets are empty, revoked, or point at the wrong branch. | Tier 8c — recreate the `staging` Deploy Hook on each Vercel project, save the URLs as `VERCEL_DEPLOY_HOOK_STAGING_CLIENT` / `..._SERVER`, re-dispatch the workflow. |

---

## Bypass secret — one secret, two projects

The E2E workflow (`.github/workflows/e2e.yml`) uses a single GitHub Actions secret
`VERCEL_AUTOMATION_BYPASS_SECRET` to authorize readiness probes against **both**
the client and the server Vercel projects.

For this to work, the two Vercel projects (`ichnos-client` and
`ichnos-protocolserver`) must each have the same string configured under
**Settings → Deployment Protection → "Protection Bypass for Automation"**.

When rotating:

1. Generate (or copy an existing) bypass value on the client project.
2. Set the **identical** value on the server project.
3. Update the `VERCEL_AUTOMATION_BYPASS_SECRET` GitHub Actions secret.

After a Vercel team transfer, Vercel may regenerate the bypass secret on one or
both projects without warning. The cheapest diagnostic when E2E suddenly starts
returning 401 is: open both Vercel projects' bypass values, confirm they match
each other and the GitHub secret, fix any drift.

---

## Appendix — Historical: the removed `promote-to-production.yml` workflow

> **Historical record, not a procedure.** The workflow described here was
> deleted in P9. Production is now Vercel's native build of `release` (Tier 8).
> Do not recreate the workflow or its secrets (`VERCEL_TOKEN`, `VERCEL_ORG_ID`,
> `VERCEL_PROJECT_ID_CLIENT`, `VERCEL_PROJECT_ID_SERVER`) from this section.

Before P9, a GitHub Actions workflow found the latest READY preview on `main`
and ran `vercel promote <deployment-id>` to re-alias it as production. Two
incidents came from that design:

- **Preview-scope env vars served production.** `vercel promote` does not
  rebuild, so production ran whatever the `main` preview had captured from
  Preview-default scope. Setting `VITE_API_HOST` on Production scope alone
  fixed one manual Redeploy and regressed on the next promotion with
  `502 DNS_HOSTNAME_NOT_FOUND`. The native `release` build reads Production
  scope, which removes this trap.
- **`403 Trying to access resource under scope "<old-account>"`.** After the
  Vercel team move, `vercel promote <id>` ignored `VERCEL_ORG_ID` and used the
  token's default scope, still the personal account. The fix at the time was
  `--scope="$VERCEL_ORG_ID"` plus a token created with the team as default
  scope.

The same workflow model is why earlier revisions of Tier 8c asked for deploy
hooks on `main`: promotion needed a fresh READY `main` preview. Native builds
of `release` do not depend on `main` previews, so those hooks are not needed.
