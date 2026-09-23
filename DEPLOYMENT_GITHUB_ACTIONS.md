# GitHub Actions Deployment Pipeline

This repository uses a **3-branch lifecycle**: `feature/* → main → release` for the **automated promotion chain**, plus a `staging` branch as a parallel manual-QA lane synced from `main` on manual dispatch. No code reaches Vercel production without passing CI, E2E tests, and the required `main → release` pull request. Production is Vercel's own build of the `release` branch; the `staging` branch is not in this promotion chain. Preview deployments are handled by **Vercel's native Git integration** — every push to a branch or PR automatically creates a preview deployment without any GitHub Actions workflow involvement. E2E tests are triggered by the server's `repository_dispatch` event after each preview deployment, and merge to `main` is blocked until all required checks pass.

## 1. Pipeline Overview

```mermaid
sequenceDiagram
    participant Dev as Developer
    participant GH as GitHub Actions
    participant CI as CI Jobs (Lint + Test)
    participant Vercel as Vercel Git Integration
    participant DS as repository_dispatch (vercel.deployment.success)
    participant E2E as e2e.yml
    participant Sync as sync-staging.yml
    participant Staging as staging (manual QA)
    participant PW as Playwright
    participant RPC as Release Policy Check
    participant Prod as Vercel Production

    Dev->>GH: Open PR from feature/* to main
    GH->>CI: Trigger Client — Lint & Test and Server — Lint & Test (parallel)
    Dev->>Vercel: Push to branch / open PR
    Vercel->>Vercel: Build and deploy preview (client + server, automatic)
    Vercel->>GH: Emit Vercel check status (build success/failure)
    Vercel->>DS: Emit repository_dispatch (vercel.deployment.success) from server project

    DS->>E2E: Trigger E2E Tests (Playwright) job
    E2E->>PW: Run Playwright tests against stable staging URL
    PW-->>GH: ✅ E2E passes — required status check for merge

    CI-->>GH: ✅ CI passes
    Dev->>GH: Merge PR into main (all 5 checks pass)

    opt Manual workflow_dispatch (independent of E2E)
        Dev->>Sync: Run sync-staging.yml
        Sync->>GH: Force-push main → staging (via SYNC_PAT)
        Sync->>Vercel: Call client + server staging deploy hooks
        Vercel->>Staging: Deploy staging preview (prod Firebase + prod Neon)
    end

    Note over Staging: Manual QA lane — production DB writes accepted. Not in promotion chain.

    Dev->>GH: Open PR from main to release
    GH->>RPC: Release Policy Check — fails if head branch is not main
    RPC-->>GH: ✅ Policy check passes
    Dev->>GH: Merge PR into release (human gate)
    Vercel->>Prod: Build release and deploy to production (client + server)
```

## 2. Workflows

| Workflow file                   | Name                                 | Trigger                      | Purpose                                                                                                                                 |
| ------------------------------- | ------------------------------------ | ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `ci.yml`                        | CI                                   | `pull_request` to `main`     | Lint + unit tests + client build verification                                                                                           |
| `e2e.yml`                       | E2E Tests (Playwright)               | `repository_dispatch (vercel.deployment.success)` + `workflow_dispatch` (manual) | Run E2E when the server project emits a deployment dispatch (the slower deployment, includes Neon DB seed). Tests target stable E2E URLs from the repository variables `E2E_BASE_URL` / `E2E_API_BASE_URL`, with secrets for the Firebase API key and the passwords. Manual `workflow_dispatch` runs use the same variables and secrets — no manual `base_url` input |
| `release-policy-check.yml`      | Release Policy Check                 | `pull_request` to `release`  | Fails if PR head branch is not `main`                                                                                                   |
| `sync-staging.yml`              | Sync main → staging                  | `workflow_dispatch` (manual) | Force-push `main` to `staging` with `SYNC_PAT`, then call the client and server staging deploy hooks so Vercel builds the new tip. Staging previews use production Firebase + Neon for manual QA. |

> **Note:** Preview deployments are **not** managed by any GitHub Actions workflow. They are created automatically by Vercel's native Git integration whenever code is pushed to a branch or a PR is opened.

> **Note:** Production deployments are not managed by any workflow either. Vercel's native Git integration builds the `release` branch and deploys it to production for both projects when a PR is merged into `release`.

## 3. E2E Trigger and Target Detection

E2E tests are triggered by **`repository_dispatch (vercel.deployment.success)`** events via `e2e.yml`. When Vercel's native Git integration completes a Preview deployment, a `repository_dispatch` event is emitted. The workflow uses **project-name filtering** (not hostname pattern matching) to decide whether to run tests.

### How it works

1. **Trigger**: Only the **server** Vercel project has Repository Dispatch Events enabled (see [`VERCEL_SETTINGS.md`](VERCEL_SETTINGS.md) §1). The client project does not emit dispatch events.
2. **Filter**: The `e2e.yml` job has an `if` condition: `contains(github.event.client_payload.project.name || '', 'server')`. This is a safety guard — since only the server project emits dispatches, it effectively always passes for `repository_dispatch` events.
3. **Target URL**: Tests run against the stable E2E client URL from `E2E_BASE_URL` (a repository variable), not the per-deployment hash URL from the dispatch payload. This avoids stale/cancelled deployment URLs.
4. **API URL**: The API base URL is read from `E2E_API_BASE_URL` (also a repository variable).
5. **Client readiness**: After the server dispatch fires, the workflow polls the `E2E_BASE_URL` repository variable with `curl` to verify the client is also ready before starting Playwright. It then polls `/api/health` for **API + seed readiness** using the `seed.mode` field: `seeded` and `skipped` are terminal-ready states that allow tests to proceed; `failed` causes an immediate workflow failure; `in_progress` keeps polling until the timeout is reached.
6. **`workflow_dispatch`**: Manual/ad-hoc runs resolve targets from the same repository variables and secrets — there is no `base_url` input. The only configurable inputs are `browser_profile` and `test_suite`.
7. **URL safety gate (production-host denylist)**: `e2e.yml` defines canonical denylist constants (`PRODUCTION_HOSTS_CLIENT`, `PRODUCTION_HOSTS_API`) as workflow-level `env` values. Before any test runs, a validation step hard-fails if: (a) a target hostname exactly matches a denylist entry, (b) a URL cannot be parsed, or (c) a denylist constant is empty/missing. Hostname comparison is exact match after lowercase normalization and port removal.

### Key details

- Only the server project emits `repository_dispatch` events, so the `E2E Tests (Playwright)` check is produced once per deployment cycle. The client project does not emit dispatches — no client-event skip path exists.
- Detection uses the `project.name` field from the dispatch payload as a safety guard, **not** hostname pattern matching or a Vercel project ID secret. A separate denylist validation step performs exact-hostname matching against production hosts as an additional safety gate.
- Non-secret config (emails, UIDs, Firebase project names, URLs) comes from repository **Variables** (`vars.*`), mapped in the job-level `env:` block. Credentials (`FIREBASE_API_KEY`, `E2E_SIGNUP_PASSWORD`, the role passwords, the bypass secret) use **Secrets** (`secrets.*`). A `Validate E2E configuration` step fails the run before the denylist gate, naming any empty variable or secret without printing values.
- Workflow constants (`PRODUCTION_HOSTS_CLIENT`, `PRODUCTION_HOSTS_API` in `e2e.yml`) are the **canonical** source for the denylist. This document and other docs are **descriptive only**. Changes to the denylist require maintainer-reviewed PRs on `.github/workflows/e2e.yml`.
- Hostname matching semantics: URLs are parsed (via Python `urlparse`), ports are stripped, hostnames are lowercased, and comparison is exact string equality — no substring, glob, or regex matching.

## 4. E2E Troubleshooting

When investigating E2E check results, use this table to interpret the status:

| Check Status                                     | Meaning                                                                                                     | Action                                                                                                                          |
| ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| **Passed**                                       | Playwright tests executed against stable staging URL and passed                                              | No action needed                                                                                                                |
| **Failed** — Playwright test failure             | Tests executed against the staging URL and failed                                                            | Check the Playwright HTML report artifact uploaded to the workflow run                                                          |
| **Failed** — readiness check timeout             | Client or API did not respond within the polling window, or `seed.mode` remained `in_progress` beyond the polling window | Check the readiness-check step logs for HTTP status codes, `seed.mode` values, and error details                                |
| **Failed** — denylist blocked                    | Target URL hostname matched a production denylist entry                                                      | Verify the `E2E_BASE_URL` and `E2E_API_BASE_URL` repository variables point to staging/preview URLs, not production                           |
| **Failed** — seed mode `failed`                  | API is healthy but `seed.mode` is `failed` (permanent config error)                                          | Check server logs and Vercel Preview env vars for missing seed variables (`E2E_ADMIN_UID`, `E2E_ADMIN_EMAIL`)                   |
| **Cancelled**                                    | Workflow run was cancelled mid-execution                                                                     | Re-run the workflow or push a new commit to trigger a fresh deployment                                                          |

**First debugging step:** Open the workflow run for `e2e.yml` and review the step logs. Key diagnostic artifacts: the **Vercel payload dump** (shows project name, deployment URL, commit SHA), the **resolved staging URL**, the **seed.mode value** from the API readiness check, the **client readiness-check** and **API readiness-check** logs, and the uploaded **Playwright report** and **test results** artifacts.

## 5. Staging Branch — Manual QA Lane

### Purpose

`staging` is a long-lived parallel branch for manual QA with production credentials. It is **not** in the `main → release` promotion chain — production is built from `release`, which only receives `main` through a pull request. The `staging` branch exists so that team members can perform real-user QA (with production Firebase auth and production Neon data) without affecting the automated pipeline.

### Manual sync mechanism

`sync-staging.yml` runs only when someone dispatches it by hand (`workflow_dispatch`). It has no connection to `e2e.yml`: E2E results do not start it and do not gate it, and once dispatched it runs unconditionally. It force-pushes `main` to `staging` with `SYNC_PAT`, so `staging` becomes an exact copy of `main`, then calls the client and server staging deploy hooks (`VERCEL_DEPLOY_HOOK_STAGING_CLIENT`, `VERCEL_DEPLOY_HOOK_STAGING_SERVER`) because Vercel does not build PAT-driven force-pushes on its own. Between runs, `staging` stays at whatever `main` commit was last synced.

### Environment

`staging` Vercel previews use **production Firebase credentials** (real user login) and the **production Neon connection string** (`DATABASE_URL` = production) via branch-scoped environment variable overrides in both Vercel projects. `SKIP_E2E_SEED=true` prevents automated E2E seed injection on the staging deployment. See [`VERCEL_SETTINGS.md`](VERCEL_SETTINGS.md) §6 for the full branch-scoped override configuration.

### E2E isolation

E2E targets (the `E2E_BASE_URL` and `E2E_API_BASE_URL` repository variables) remain pointed at ephemeral preview URLs — **never** at the `staging` URL. The staging and E2E environments are completely separate: different URLs, different database connections (staging uses production Neon; E2E uses ephemeral Neon branches), and different Firebase credentials.

### Accepted risk

Manual QA actions on `staging` write to the **production Neon database**. This is explicitly accepted — the staging environment is designed for real-user validation with real data. Test records created during QA can be cleaned up manually via the admin dashboard or database console.

---

## 6. One-Time Setup — GitHub

Full GitHub repository settings — secrets, environments, branch protections, auto-merge, and fork policy — are documented in [`GITHUB_SETTINGS.md`](GITHUB_SETTINGS.md). Follow that guide from top to bottom for initial setup or to verify an existing configuration.

### Required secrets summary

Kept here for quick reference. [`GITHUB_SETTINGS.md`](GITHUB_SETTINGS.md) is the authoritative source.

#### CI and E2E secrets (8)

| Secret                              | Purpose                                                |
| ----------------------------------- | ------------------------------------------------------ |
| `FIREBASE_API_KEY`                  | Firebase Web API key of the E2E project                |
| `E2E_SIGNUP_PASSWORD`               | Default password for accounts created by `signUpAs`    |
| `E2E_ADMIN_PASSWORD`                | Admin test account password                            |
| `E2E_USER_PASSWORD`                 | Regular user test account password                     |
| `E2E_SUPER_ADMIN_PASSWORD`          | Super-admin test account password                      |
| `E2E_MANAGE_ADMIN_TARGET_PASSWORD`  | Manage-admin target account password                   |
| `E2E_INCOMPLETE_USER_PASSWORD`      | Incomplete-profile test account password               |
| `VERCEL_AUTOMATION_BYPASS_SECRET`   | Vercel Deployment Protection bypass for E2E automation — **same value must be set on both** the `ichnos-client` and `ichnos-protocolserver` Vercel projects (Settings → Deployment Protection → Protection Bypass for Automation) |

> Non-secret E2E config comes from 15 GitHub repository **variables**: `FIREBASE_PROJECT_ID`, `FIREBASE_AUTH_DOMAIN`, `FIREBASE_STORAGE_BUCKET`, `E2E_BASE_URL`, `E2E_API_BASE_URL`, and `E2E_{ADMIN,USER,INCOMPLETE_USER,SUPER_ADMIN,MANAGE_ADMIN_TARGET}_{EMAIL,UID}`. See [`GITHUB_SETTINGS.md`](GITHUB_SETTINGS.md) §2 for the full list.

> **Bypass secret invariant:** The E2E workflow uses a single GitHub Actions secret to authorize requests against both Vercel projects. If the two projects hold different bypass values, the client readiness probe or the API readiness probe will fail with 401. When rotating, update both Vercel projects and the GitHub secret atomically.

E2E test data is seeded automatically by the preview server on startup — no seeding secrets needed in GitHub Actions.

These secrets are sufficient for CI, E2E, and preview deployments. Preview deployments are handled entirely by Vercel's native Git integration — no Vercel API tokens or project IDs are needed.

> **Managing E2E secrets:** The provisioning script is a **local/manual admin tool** run from a developer's machine. Neither `ci.yml` nor `e2e.yml` execute it — they consume the synced outputs. CI reads non-secret values (emails, UIDs, Firebase project names, URLs) from repository variables and credentials from secrets: `FIREBASE_API_KEY`, `E2E_SIGNUP_PASSWORD`, the role passwords and the bypass secret (8 total). The local `e2e/.env.e2e` is gitignored and copied from `e2e/.env.e2e.example`. Run `node e2e/scripts/provision-e2e-firebase-users.js` (or `node scripts/provision-e2e-firebase-users.js` from repo root via wrapper). The script reads the local `e2e/.env.e2e`, provisions Firebase users, syncs the variables and secrets to GitHub, and syncs emails/UIDs to Vercel Preview env vars. For sync-only (skip Firebase provisioning): `node e2e/scripts/provision-e2e-firebase-users.js --sync-only`.
>
> **Important:** Vercel Preview environment variable changes only take effect on **new preview deployments**. After syncing, trigger a new preview deployment or redeploy an existing one for the changes to be picked up.
>
> **Environment note:** The provisioning script depends on local CLI installation/PATH, `gh` and `vercel` CLI auth state, `server/.vercel/project.json` linkage, and local `server/.env` files. Different terminals, shell sessions, or machines may produce different results. If you encounter terminal-related errors, check: (1) the local, gitignored `e2e/.env.e2e` exists with emails, UIDs, and passwords for provisioning, (2) `server/.env` exists with Firebase admin credentials (needed unless running `--sync-only`), (3) you are in the repo root, (4) `gh auth status`, (5) `vercel whoami`, (6) `cd server && vercel link`.

#### Former production promotion secrets

The four `VERCEL_*` API token and ID secrets that the removed promotion workflow consumed are no longer read by any workflow. Production deploys through Vercel's build of `release`. Deleting them from the repository is an owner action; see [`GITHUB_SETTINGS.md`](GITHUB_SETTINGS.md) §2.

#### Staging sync secrets (3)

All three are required by `sync-staging.yml`. The run exits nonzero if either deploy-hook secret is empty.

| Secret                              | Purpose                                                                                    |
| ----------------------------------- | ------------------------------------------------------------------------------------------ |
| `SYNC_PAT`                          | Personal Access Token with `contents: write` scope, used to force-push `main` to `staging` |
| `VERCEL_DEPLOY_HOOK_STAGING_CLIENT` | Client project Deploy Hook URL for branch `staging`; the workflow calls it after the push  |
| `VERCEL_DEPLOY_HOOK_STAGING_SERVER` | Server project Deploy Hook URL for branch `staging`; the workflow calls it after the push  |

#### Neon preview-branch cleanup secrets (2, optional)

| Secret            | Purpose                                                                                                   |
| ----------------- | --------------------------------------------------------------------------------------------------------- |
| `NEON_API_KEY`    | Read by the `Delete Neon preview branch` step in `e2e.yml`. Best-effort: if absent, the step skips and the run still passes |
| `NEON_PROJECT_ID` | Neon project the cleanup step targets. Same best-effort behaviour as `NEON_API_KEY`                       |

### Required checks per branch

| Target branch | Required status checks                                                                                                               |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `main`        | `Client — Lint & Test`, `Server — Lint & Test`, `<your-client-vercel-check>`, `<your-server-vercel-check>`, `E2E Tests (Playwright)` |
| `release`     | `Release Policy Check` + require a pull request before merging                                                                       |
| `staging`     | **None** — intentionally unprotected. Managed by manual runs of `sync-staging.yml` (force-push from `main`). Not a merge target for PRs.       |

> **Note:** The `E2E Tests (Playwright)` check name is produced by `e2e.yml` (job name: `E2E Tests (Playwright)`). The Vercel checks are produced by Vercel's native Git integration — **their exact names depend on your Vercel project names** (e.g., `Vercel – ichnos-protocol`, `Vercel – ichnos-protocol-server`). To find the correct names: open a recent PR, scroll to the status checks section, and copy the exact Vercel check context strings. A mismatch between the configured required check name and the actual check context will block all merges. GitHub Actions check names are frozen in workflow file headers — do not rename jobs without updating branch protection rules. See [`GITHUB_SETTINGS.md`](GITHUB_SETTINGS.md) §4 for step-by-step configuration.

## 7. One-Time Setup — Vercel

Full Vercel project settings — production branch, environment variables, old alias cleanup, and token/ID lookup — are documented in [`VERCEL_SETTINGS.md`](VERCEL_SETTINGS.md). Follow that guide for both `ichnos-client` and `ichnos-protocolserver`.

Two critical invariants to maintain:

- **Vercel production branch must be `release`** on both projects (not `main`).
- **Vercel Git integration must remain enabled** — preview deployments are created automatically on branch pushes and PRs. This is the default Vercel behavior; do not add `"git": { "deploymentEnabled": false }` to `vercel.json` files.

## 8. Daily Developer Workflow

### Feature → main (PR-gated)

| Step | Action                                                                                               | Status                                |
| ---- | ---------------------------------------------------------------------------------------------------- | ------------------------------------- |
| 1    | Create `feature/<name>` from `main`; open PR targeting `main`                                        | 🔴 Manual                             |
| 2    | CI runs: lint + test + build (client and server)                                                     | ✅ Automated                          |
| 3    | Vercel automatically creates preview deployments for both client and server                          | ✅ Automated (native Git integration) |
| 4    | Server project emits `repository_dispatch (vercel.deployment.success)`; `e2e.yml` runs `E2E Tests (Playwright)` | ✅ Automated                          |
| 5    | All 5 required checks pass — PR is mergeable                                                         | ✅ Automated gate                     |
| 6    | Merge PR into `main`                                                                                 | 🔴 Manual                             |

### main → release (production promotion)

| Step | Action                                                                                 | Status                                    |
| ---- | -------------------------------------------------------------------------------------- | ----------------------------------------- |
| 7    | Open PR from `main` to `release`                                                       | 🔴 Manual                                 |
| 8    | `Release Policy Check` runs — fails if head branch is not `main`                       | ✅ Automated gate                         |
| 9    | Merge PR into `release` (the human gate)                                               | 🔴 Manual                                 |
| 10   | Vercel builds `release` and deploys it to production for both projects                 | ✅ Automated (native Git integration)     |

## 9. Vercel Quota Protection

Preview deployments are managed by Vercel's native Git integration, which builds on every push. E2E tests run against the stable E2E URLs from the `E2E_BASE_URL` / `E2E_API_BASE_URL` repository variables (not per-deployment hash URLs), so no extra Vercel build is triggered for testing.

Fork PRs do not receive preview deployments with secrets because Vercel's Git integration does not expose environment variables to builds from forks by default.

## 10. Rollback

### Option A — Revert through the pipeline

Revert the bad commit on `main` through a normal PR, then open a new `main → release` PR. Merging it makes Vercel build the reverted `release` and deploy it to production. No workflow is involved.

### Option B — Via Vercel dashboard

1. Open **Vercel Dashboard → Project → Deployments**.
2. Find the previous production deployment.
3. Choose **Promote** (or **Instant Rollback**) from that deployment's menu in the UI.

Repeat for both `ichnos-client` and `ichnos-protocolserver`. No GitHub Actions run is required.
