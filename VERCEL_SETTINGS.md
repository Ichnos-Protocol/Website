# Vercel Project Settings Reference

Complete configuration guide for the Ichnos Protocol Vercel projects (`ichnos-protocol` and `ichnos-protocolserver`). This document assumes the projects may have been previously configured with different settings (e.g., staging aliases, wrong production branch, or stale environment variables) and walks through a clean setup from scratch.

> **This is the authoritative source** for Vercel project settings. [`DEPLOYMENT_GITHUB_ACTIONS.md`](DEPLOYMENT_GITHUB_ACTIONS.md) references this file for quick-reference summaries.

---

## Overview — What Must Be Configured

| Area                             | What                                                                                                                          | Why                                                                                                                                     |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| **Production Branch**            | Set to `release` on both projects                                                                                             | Vercel builds `release` natively and deploys it to production; `main` reaches `release` only through a pull request                     |
| **Git Auto-Deploy**              | Preview and production auto-deploy **enabled** via native Vercel integration                                                  | Vercel deploys a preview for every branch push, and the deployments of `main` feed the E2E pipeline; it deploys `release` to production when a PR merges into it |
| **Server Environment Variables** | Runtime secrets and config for the Express backend                                                                            | The serverless function needs database, Firebase, AI, email, and CORS config                                                            |
| **Client Environment Variables** | Build-time config for the Vite frontend                                                                                       | The Vite build injects Firebase, API, and widget config at build time                                                                   |
| **Old Alias Cleanup**            | Remove any previously configured aliases for removed environments                                                             | Stale aliases (e.g., for `staging`) waste quota and cause confusion                                                                     |
| **Unused Promotion Secrets**     | The 4 `VERCEL_*` token and ID secrets are no longer read by any workflow                                                      | They belonged to the removed promotion workflow; removing them is an owner action                                                       |
| **Local Project Linking**        | One-time `cd server && vercel link` to link the server directory to the correct Vercel project                                | Required by the E2E provisioning script to sync Preview env vars via Vercel CLI                                                         |
| **Staging Branch Env Config**    | Branch-scoped overrides for the `staging` branch on both projects                                                             | Staging previews sign in against production Firebase for manual QA and use their own Neon copy of production                           |

---

## 1. Git Integration

For **both** `ichnos-protocol` and `ichnos-protocolserver` Vercel projects:

### Production Branch

1. Open **Vercel Dashboard → Project → Settings → Git**.
2. Set **Production Branch** to `release`.
3. Repeat for the second project.

> **Why `release`?** Production is Vercel's own build of the `release` branch. No GitHub Actions workflow deploys or promotes to production. The human gate is the required `main → release` pull request, which must pass `Release Policy Check` (head branch must be `main`) before it can merge; see [`GITHUB_SETTINGS.md`](GITHUB_SETTINGS.md) §4. If the production branch were set to `main`, Vercel would deploy every merge to `main` straight to production and skip that pull request.

### Native Preview Integration

The `"git": { "deploymentEnabled": false }` key has been removed from both `client/vercel.json` and `server/vercel.json` as part of the CI/CD refactor. Vercel now automatically deploys preview environments for every pull request.

> **Do not re-add** `"git": { "deploymentEnabled": false }` to either `vercel.json` file. Doing so would disable preview deployments and break the E2E pipeline, which depends on Vercel deploying every push to `main` automatically to the stable E2E domains.

### Repository Dispatch Events

**Repository Dispatch Events** must be enabled on the server project to trigger `e2e.yml` automatically. To enable: Vercel Dashboard → server project → Settings → Git → enable "Repository Dispatch Events". This causes Vercel to emit a `repository_dispatch` event with type `vercel.deployment.success` to GitHub after each successful deployment of every branch, production included. The client project has the setting enabled too, and its events end as skipped jobs. The `e2e.yml` job runs only for the server project's deployments of `main` (`contains(project.name, 'server')` and `git.ref == 'main'`): the server is the slower deployment, so by the time its dispatch fires the client is already ready, and the E2E target URLs follow `main`. Note that the dispatch signals that the server deployment is live, not that E2E seeding is complete; the `e2e.yml` workflow polls `/api/health` for the `seed.mode` readiness signal to confirm seeding status before running tests. Both trigger modes (`repository_dispatch` and `workflow_dispatch`) resolve E2E targets from the GitHub repository variables `E2E_BASE_URL` and `E2E_API_BASE_URL`, with secrets for the Firebase API key and the passwords — there is no manual URL input. A production-host denylist gate (canonical in `e2e.yml` workflow constants) validates all target URLs before tests run. The denylist constants (`PRODUCTION_HOSTS_CLIENT`, `PRODUCTION_HOSTS_API`) are descriptive only in documentation files; the canonical definitions live in `.github/workflows/e2e.yml` and changes require maintainer-reviewed PRs on that workflow file.

---

## 2. Environment Variables

Environment variables are configured in each Vercel project's settings dashboard, scoped to the appropriate environments (Production, Preview, Development). **Never commit secrets to the repository.**

### `ichnos-protocolserver` Environment Variables

Set in **Vercel Dashboard → ichnos-protocolserver → Settings → Environment Variables**:

| Variable                  | Environments        | Description                                                                           |
| ------------------------- | ------------------- | ------------------------------------------------------------------------------------- |
| `DATABASE_URL`            | Production, Preview | PostgreSQL connection string (Neon Tech)                                              |
| `FIREBASE_PROJECT_ID`     | Production, Preview | Firebase project ID                                                                   |
| `FIREBASE_PRIVATE_KEY`    | Production, Preview | Firebase service account private key (with newlines preserved)                        |
| `FIREBASE_CLIENT_EMAIL`   | Production, Preview | Firebase service account client email                                                 |
| `XAI_API_KEY`             | Production, Preview | X.ai Grok API key for RAG chatbot                                                     |
| `XAI_API_ENDPOINT`        | Production, Preview | X.ai API endpoint URL (default: `https://api.x.ai/v1/chat/completions`)               |
| `CORS_ORIGIN`             | Production          | Frontend production URL (e.g., `https://ichnos-protocol.com`)                         |
| `CORS_ORIGIN`             | Preview             | Frontend preview URL (or use `VERCEL_URL` dynamically)                                |
| `CRON_SECRET`             | Production, Preview | Shared secret for Vercel cron job authentication                                      |
| `RESEND_API_KEY`          | Production, Preview | Resend API key for transactional email                                                |
| `ADMIN_EMAILS`            | Production, Preview | Comma-separated admin email addresses for notifications                               |
| `CONTACT_CONSENT_VERSION` | Production, Preview | GDPR consent version string (default: `v1`)                                           |
| `CONTACT_CONSENT_TEXT`    | Production, Preview | GDPR consent text shown to users (optional)                                           |
| `PRIVACY_POLICY_URL`      | Production, Preview | Link to privacy policy page (optional)                                                |
| `E2E_ADMIN_EMAIL`         | Preview             | Admin test account email (required for auto-seed on startup)                          |
| `E2E_ADMIN_UID`           | Preview             | Admin test account Firebase UID (required for auto-seed on startup)                   |
| `E2E_USER_EMAIL`          | Preview             | Regular user test account email (optional auto-seed)                                  |
| `E2E_USER_UID`            | Preview             | Regular user test account Firebase UID (optional auto-seed)                           |
| `E2E_SUPER_ADMIN_EMAIL`   | Preview             | Super-admin test account email (optional auto-seed)                                   |
| `E2E_SUPER_ADMIN_UID`     | Preview             | Super-admin test account Firebase UID (optional auto-seed)                            |
| `SKIP_E2E_SEED`           | Preview             | Set to `true` to suppress E2E seed writes; `/api/health` reports `seed.mode=skipped`  |

> These vars are read by `server/scripts/seedE2EOnPreview.js` at server startup when `VERCEL_ENV === 'preview'`. The seed script reports status via `seed.mode` in the `/api/health` response (enum: `seeded | skipped | in_progress | failed`). The E2E workflow uses `seed.mode` as its canonical readiness signal: `seeded` and `skipped` are accepted as ready states; `failed` triggers immediate workflow failure.

### `ichnos-protocol` Environment Variables

Set in **Vercel Dashboard → ichnos-protocol → Settings → Environment Variables**:

| Variable                            | Environments        | Description                  |
| ----------------------------------- | ------------------- | ---------------------------- |
| `VITE_FIREBASE_API_KEY`             | Production, Preview | Firebase Web API key         |
| `VITE_FIREBASE_AUTH_DOMAIN`         | Production, Preview | Firebase auth domain         |
| `VITE_FIREBASE_PROJECT_ID`          | Production, Preview | Firebase project ID          |
| `VITE_FIREBASE_STORAGE_BUCKET`      | Production, Preview | Firebase Storage bucket      |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Production, Preview | Firebase messaging sender ID |
| `VITE_FIREBASE_APP_ID`              | Production, Preview | Firebase app ID              |

> **Reminder:** All client environment variables must be prefixed with `VITE_` to be exposed to the Vite build process.

---

## 3. Clean Up Old Aliases

If you previously configured alias domains on either project from an earlier deployment model (e.g., aliases for a removed environment), remove them:

1. Open **Vercel Dashboard → Project → Settings → Domains**.
2. Remove any alias domains that do not correspond to the current 2-branch model (production and preview only).
3. Repeat for both projects.

The current 2-branch model does not use additional aliased environments. Preview deployments on `main` PRs serve that purpose.

---

## 4. Unused Promotion Secrets

These four GitHub repository secrets were read only by the removed production promotion workflow. **No workflow reads them now**, and a new setup does not need them.

| Value                      | Former use                                            |
| -------------------------- | ----------------------------------------------------- |
| `VERCEL_TOKEN`             | Vercel CLI authentication for promotion               |
| `VERCEL_ORG_ID`            | Vercel account or team targeted by promotion          |
| `VERCEL_PROJECT_ID_CLIENT` | `ichnos-protocol` project targeted by promotion       |
| `VERCEL_PROJECT_ID_SERVER` | `ichnos-protocolserver` project targeted by promotion |

> The repository owner may delete them from **GitHub → Settings → Secrets and variables → Actions**, and may revoke the token in Vercel → Settings → Tokens. Leaving them in place changes nothing, and this guide requires neither action. See [`GITHUB_SETTINGS.md`](GITHUB_SETTINGS.md) §2.

---

## 5. Local Project Linking (One-Time Prerequisite)

The E2E provisioning script (`node scripts/provision-e2e-firebase-users.js`) syncs environment variables to the Vercel server project via the Vercel CLI. This script is a **local/manual developer/admin tool** — it is not executed by CI or E2E workflows. Those workflows consume the synced Vercel Preview env vars after the script has run. This requires the `server/` directory to be linked to the correct Vercel project.

### Setup

```bash
cd server && vercel link
```

When prompted, select the `ichnos-protocolserver` Vercel project. The linked project must be exactly `ichnos-protocolserver` — the preflight script rejects any other project name. This creates `server/.vercel/project.json` with the project and org IDs.

> **Safety check:** The provisioning script verifies that `server/.vercel/project.json` exists and performs two validations:
>
> 1. **Missing `projectName`** — If the `projectName` field is absent or not a string, the script exits with an error asking you to re-link with `cd server && vercel link` using the latest Vercel CLI (older CLI versions may not write `projectName`).
> 2. **Name is not `ichnos-protocolserver`** — If the `projectName` is not exactly `ichnos-protocolserver`, the script exits to prevent accidentally syncing credentials to the wrong Vercel project. Re-link and select the `ichnos-protocolserver` project.

### What gets synced to Vercel Preview

The provisioning script syncs the following E2E env vars to Vercel Server Preview scope only:

| Variable                | Description                            |
| ----------------------- | -------------------------------------- |
| `E2E_ADMIN_EMAIL`       | Admin test account email               |
| `E2E_ADMIN_UID`         | Admin test account Firebase UID        |
| `E2E_USER_EMAIL`        | Regular user test account email        |
| `E2E_USER_UID`          | Regular user test account Firebase UID |
| `E2E_SUPER_ADMIN_EMAIL` | Super-admin test account email         |
| `E2E_SUPER_ADMIN_UID`   | Super-admin test account Firebase UID  |

> **Important:** Vercel Preview environment variable changes only take effect on **new preview deployments**. After syncing, trigger a new preview deployment or redeploy an existing one for changes to take effect. The provisioning script prints a reminder after each successful sync.
>
> **Environment note:** The provisioning script depends on local CLI installation and PATH, `gh` and `vercel` CLI auth state, the linked `server/.vercel/project.json`, and local `.env.e2e`/`server/.env` files. One terminal or machine may succeed while another fails. For terminal-related errors, first verify: (1) you are in the repo root, (2) `gh auth status`, (3) `vercel whoami`, (4) `cd server && vercel link`.

---

## 6. Staging Branch Environment Configuration

The `staging` branch is a long-lived parallel manual-QA lane outside the `main → release` production path. Deployments to `staging` produce a Vercel Preview build that signs in against **production** Firebase, enabling real-user login, and reads and writes its own Neon copy of production, `preview/staging`. All overrides in this section are **branch-scoped** — they apply only when Vercel builds the literal `staging` branch, leaving `feature/*` and `main` preview deployments completely unaffected.

The `sync-staging.yml` workflow runs only when someone dispatches it by hand (`workflow_dispatch`). It force-pushes `main` to `staging` with `SYNC_PAT`, then calls both staging deploy hooks (`VERCEL_DEPLOY_HOOK_STAGING_CLIENT`, `VERCEL_DEPLOY_HOOK_STAGING_SERVER`) so Vercel builds the new tip. Between runs, `staging` stays at the `main` commit last synced.

### How to Apply Branch-Scoped Overrides

1. Open **Vercel Dashboard → Project → Settings → Environment Variables**.
2. Click **Add New** (or edit an existing variable).
3. Set the **Environment** to **Preview**.
4. Expand the **Git Branch** field and type `staging` (exact match).
5. Enter the variable name and value per the tables below.
6. Save. Repeat for every variable listed.

> Branch-scoped overrides only take effect on new deployments to the `staging` branch. If `staging` was already deployed before adding overrides, trigger a redeployment from the Vercel dashboard.

### ichnos-protocolserver — Branch-Scoped Overrides

| Variable                | Scope                           | Value                             | Why                                                          |
| ----------------------- | ------------------------------- | --------------------------------- | ------------------------------------------------------------ |
| `SKIP_E2E_SEED`         | Preview + Git branch: `staging` | `true`                            | Keeps the E2E seed and migrations away from staging's database |
| `CORS_ORIGIN`           | Preview + Git branch: `staging` | Staging client Vercel preview URL | Server must accept requests from the staging frontend origin |
| `FIREBASE_PROJECT_ID`   | Preview + Git branch: `staging` | Production Firebase project ID    | Real user authentication for manual QA                       |
| `FIREBASE_PRIVATE_KEY`  | Preview + Git branch: `staging` | Production Firebase private key   | Real user authentication for manual QA                       |
| `FIREBASE_CLIENT_EMAIL` | Preview + Git branch: `staging` | Production Firebase client email  | Real user authentication for manual QA                       |

> When a push lands on `staging`, Vercel applies the global Preview variables first, then applies the branch-specific overrides. Only the keys listed above, plus the Neon integration's branch-scoped `DATABASE_URL` described below, replace their Preview equivalents — everything else (rate limiting, E2E account vars, etc.) inherits from the global Preview scope. No variable duplication is required.

> **No `DATABASE_URL` override.** The Neon integration created a branch-scoped `DATABASE_URL` for `staging` at the staging deployment of 2026-09-28. It points at `preview/staging`, a copy of production taken at that moment and not refreshed since. Do not add an override pointing at production: the integration manages that variable. To refresh the copy, reset `preview/staging` from its parent in the Neon console.

### ichnos-protocol — Branch-Scoped Overrides

| Variable                            | Scope                           | Value                                                                             |
| ----------------------------------- | ------------------------------- | --------------------------------------------------------------------------------- |
| `VITE_FIREBASE_API_KEY`             | Preview + Git branch: `staging` | Production Firebase web API key                                                   |
| `VITE_FIREBASE_AUTH_DOMAIN`         | Preview + Git branch: `staging` | Production Firebase auth domain                                                   |
| `VITE_FIREBASE_PROJECT_ID`          | Preview + Git branch: `staging` | Production Firebase project ID                                                    |
| `VITE_FIREBASE_STORAGE_BUCKET`      | Preview + Git branch: `staging` | Production Firebase storage bucket                                                |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Preview + Git branch: `staging` | Production Firebase sender ID                                                     |
| `VITE_FIREBASE_APP_ID`              | Preview + Git branch: `staging` | Production Firebase app ID                                                        |
| `VITE_API_HOST`                     | Preview + Git branch: `staging` | `staging-api.ichnos-protocol.com`                                                 |

> `client/vercel.json` proxies `/api/*` to `https://$VITE_API_HOST/api/*`. `VITE_API_HOST` has a branch-scoped Preview entry for `staging` whose value is `staging-api.ichnos-protocol.com`, so the staging client talks to the staging server, which reads `preview/staging`. Vercel captures the value at build time, so a change takes effect on the next staging deployment. Do not commit a different route on the `staging` branch; `sync-staging.yml` force-pushes `main` into `staging`, which would overwrite any such change on the next sync.

> These overrides ensure the staging client build connects to the production Firebase project. Feature-branch and `main` previews are unaffected — they continue using the global Preview values (test Firebase).

### Prerequisites — Staging Sync GitHub Secrets

`sync-staging.yml` needs three GitHub Actions secrets. The run fails if either deploy-hook secret is empty.

- **`SYNC_PAT`**: Personal Access Token with `contents: write` scope, used to force-push `main` to `staging`.
- **`VERCEL_DEPLOY_HOOK_STAGING_CLIENT`**: Deploy Hook URL from Vercel → `ichnos-protocol` → Settings → Git → Deploy Hooks, branch `staging`.
- **`VERCEL_DEPLOY_HOOK_STAGING_SERVER`**: Deploy Hook URL from Vercel → `ichnos-protocolserver` → Settings → Git → Deploy Hooks, branch `staging`.
- The deploy hooks exist because Vercel does not build PAT-driven force-pushes from CI on its own.
- Create each one in **GitHub → Settings → Secrets and variables → Actions → New repository secret**.
- See [`GITHUB_SETTINGS.md`](GITHUB_SETTINGS.md) §2 for the full secrets list.

### Neon Preview Branches and Their Cleanup

The Neon integration installed on the team is the Neon-managed one: Neon's connectable-account integration, not the Vercel-native one (the Vercel API reports it as `installationType: external`). It creates a Neon branch `preview/<git-branch>` from production when a git branch gets its first preview deployment, `staging` included, and writes that branch's `DATABASE_URL` as a branch-scoped Preview variable. Every preview branch counts against the Neon project's branch limit, and when they accumulated in the past, deployments failed with **"Neon branching: Branch limit exceeded"** (the PR #122 deployment-check failure).

**Required setting:** in the Neon console, open the project's Vercel integration settings and turn on **Automatically delete obsolete Neon branches**. Neon then deletes a `preview/<git-branch>` branch after its git branch is deleted, the next time any preview deployment is created. `preview/main` and `preview/staging` stay, because `main` and `staging` are never deleted.

No workflow and no secret takes part in the cleanup. The E2E workflow's former `Delete Neon preview branch` step, which had failed with 401 since 2026-03-18, was removed; nothing reads its `NEON_API_KEY` and `NEON_PROJECT_ID` secrets any more.

### Staging Verification Checklist

- [ ] **Server overrides** — All 5 variables (`SKIP_E2E_SEED`, `CORS_ORIGIN`, `FIREBASE_PROJECT_ID`, `FIREBASE_PRIVATE_KEY`, `FIREBASE_CLIENT_EMAIL`) set on the server project with scope **Preview + Git branch: `staging`**
- [ ] **Client overrides** — All 6 `VITE_FIREBASE_*` variables and `VITE_API_HOST` set on `ichnos-protocol` with scope **Preview + Git branch: `staging`**
- [ ] **`SKIP_E2E_SEED`** — Confirmed set to `true` (keeps the E2E seed away from staging's database)
- [ ] **`CORS_ORIGIN`** — Value matches the staging client preview URL exactly
- [ ] **`DATABASE_URL`** — No owner override exists for `staging`; the only branch-scoped entry is the Neon integration's, pointing at `preview/staging`
- [ ] **`SYNC_PAT`** — GitHub Actions secret exists with `contents: write` scope
- [ ] **Staging deploy hooks** — `VERCEL_DEPLOY_HOOK_STAGING_CLIENT` and `VERCEL_DEPLOY_HOOK_STAGING_SERVER` GitHub Actions secrets hold the `staging` Deploy Hook URLs
- [ ] **Neon branch cleanup** — "Automatically delete obsolete Neon branches" is on in the Neon console's Vercel integration settings (prevents the branch accumulation that trips "Branch limit exceeded" on unrelated PRs)
- [ ] **Override scoping** — All overrides are scoped to **Preview + Git branch: `staging`**, not global Preview
- [ ] **Feature branch isolation** — Push a `feature/*` branch and confirm its preview uses the default (non-production) env vars
- [ ] **`/api/health`** — Deploy `staging` and confirm response shows `seed.mode: skipped`
- [ ] **API routing** — `VITE_API_HOST` for Preview on branch `staging` is `staging-api.ichnos-protocol.com`; confirm staging API calls reach the staging server
- [ ] **Login test** — Access the staging client preview URL and log in with a real production user account

---

## Verification Checklist

Use this checklist when setting up new Vercel projects or verifying existing ones:

- [ ] **Production branch** — Set to `release` on both `ichnos-protocol` and `ichnos-protocolserver` (§1)
- [ ] **Native preview integration** — Confirm `"deploymentEnabled": false` does **not** exist in either `client/vercel.json` or `server/vercel.json`, and that Vercel creates a preview deployment automatically when a PR is opened (§1)
- [ ] **Server environment variables** — All variables set with correct environment scoping (§2)
- [ ] **Client environment variables** — All variables set with correct environment scoping (§2)
- [ ] **CORS_ORIGIN** — Production value matches the frontend production URL; preview value is configured for preview URLs (§2)
- [ ] **API proxy** — `client/vercel.json` routes `/api/(.*)` to `https://$VITE_API_HOST/api/$1` and rewrites every other path to `/index.html`; `VITE_API_HOST` is set for every scope that builds the client (§6)
- [ ] **Repository Dispatch Events** — Enabled on the server project in Vercel Git settings; the client project's events, when enabled, end as skipped E2E jobs (§1)
- [ ] **E2E auto-seed env vars** — Set on ichnos-protocolserver, Preview scope only: `E2E_ADMIN_EMAIL`, `E2E_ADMIN_UID`, and optionally `E2E_USER_*`, `E2E_SUPER_ADMIN_*` (§2)
- [ ] **SKIP_E2E_SEED** — If needed for non-ephemeral preview DB scenarios, set to `true` on ichnos-protocolserver, Preview scope only (§2)
- [ ] **Old aliases** — Removed if previously configured (§3)
- [ ] **Local project linking** — `server/.vercel/project.json` exists, its `projectName` field is present (re-link with latest Vercel CLI if missing), and the name is exactly `ichnos-protocolserver` (§5)
- [ ] **Staging server overrides** — All 5 server branch-scoped overrides set on the server project for `staging` (§6)
- [ ] **Staging client overrides** — All 6 `VITE_FIREBASE_*` branch-scoped overrides and `VITE_API_HOST` set on `ichnos-protocol` for `staging` (§6)
- [ ] **Staging sync secrets** — `SYNC_PAT` (with `contents: write` scope), `VERCEL_DEPLOY_HOOK_STAGING_CLIENT` and `VERCEL_DEPLOY_HOOK_STAGING_SERVER` exist as GitHub Actions secrets (§6)
- [ ] **Staging `/api/health`** — Returns `seed.mode: skipped` after deploying `staging` (§6)
