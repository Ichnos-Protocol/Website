# E2E Tests (Playwright)

## Running locally

Start the client and server dev servers, then run:

```bash
cd e2e && npx playwright test
```

Run a single spec:

```bash
cd e2e && npx playwright test tests/admin-kanban.spec.js
```

Run in headed mode (visible browser):

```bash
cd e2e && npx playwright test --headed
```

## Environment variables

| Variable | Source | Description |
|---|---|---|
| `BASE_URL` | Local env | Defaults to `http://localhost:5173`. Set in CI from the `E2E_BASE_URL` GitHub repository variable. |
| `E2E_BASE_URL` | GitHub repository variable | Stable E2E client URL. |
| `E2E_API_BASE_URL` | GitHub repository variable | Stable E2E API URL. |
| `FIREBASE_API_KEY` | GitHub Secret | Firebase Web API key of the E2E project |
| `E2E_SIGNUP_PASSWORD` | GitHub Secret | Default password for accounts created by `signUpAs`. Required: `signUpAs` throws without it. |
| `E2E_ADMIN_PASSWORD` | GitHub Secret | Admin test account password |
| `E2E_USER_PASSWORD` | GitHub Secret | Regular user test account password |
| `E2E_SUPER_ADMIN_PASSWORD` | GitHub Secret | Super-admin test account password |
| `E2E_MANAGE_ADMIN_TARGET_PASSWORD` | GitHub Secret | Manage-admin target password |
| `E2E_INCOMPLETE_USER_PASSWORD` | GitHub Secret | Incomplete-profile test account password |
| `VERCEL_AUTOMATION_BYPASS_SECRET` | GitHub Secret | Vercel Deployment Protection bypass — **the same value must be set on both** the `ichnos-client` and `ichnos-protocolserver` Vercel projects (Settings → Deployment Protection → Protection Bypass for Automation) |

> **Other non-secret values** (`FIREBASE_PROJECT_ID`, `FIREBASE_AUTH_DOMAIN`, `FIREBASE_STORAGE_BUCKET`, and the `E2E_*_EMAIL` / `E2E_*_UID` names for each role) are GitHub repository variables in CI. See [`GITHUB_SETTINGS.md`](../GITHUB_SETTINGS.md) §2 for the full list.
>
> **Local runs** read the gitignored `e2e/.env.e2e` (copy it from `e2e/.env.e2e.example`). `playwright.config.js` loads it with `dotenv` only when the file exists, and never overrides variables already set in the shell.

> **Bypass secret invariant:** The workflow uses a single GitHub Actions secret to probe both Vercel projects' readiness URLs. If client and server hold different bypass values on Vercel, exactly one of the readiness checks will fail with HTTP 401. When rotating, update **both** Vercel projects and the GitHub secret in the same change window.

If `E2E_ADMIN_EMAIL` or `E2E_ADMIN_PASSWORD` are not set, all tests in `admin-kanban.spec.js` are automatically skipped — the pipeline will not fail.

## CI

> **Note:** The workflow file `.github/workflows/e2e.yml` is the canonical source of truth for E2E trigger behavior, URL targeting, denylist values, and seed readiness semantics. This README provides a human-readable summary; if any discrepancy exists, the workflow file takes precedence.

Tests run automatically on Vercel preview deployments via `.github/workflows/e2e.yml`. Non-secret E2E config (emails, UIDs, Firebase project names, target URLs) comes from GitHub repository **variables**. Credentials come from repository **secrets**: `FIREBASE_API_KEY`, `E2E_SIGNUP_PASSWORD`, `E2E_ADMIN_PASSWORD`, `E2E_USER_PASSWORD`, `E2E_SUPER_ADMIN_PASSWORD`, `E2E_MANAGE_ADMIN_TARGET_PASSWORD`, `E2E_INCOMPLETE_USER_PASSWORD`, `VERCEL_AUTOMATION_BYPASS_SECRET`, all required. The workflow's `Validate E2E configuration` step fails the run, naming any empty entry, before the denylist gate runs.

> **Note:** UIDs are GitHub repository variables and are also synced to Vercel Server Preview environment variables by the provisioning script (`node e2e/scripts/provision-e2e-firebase-users.js`).

### URL targeting

Both `repository_dispatch` (automated) and `workflow_dispatch` (manual) modes resolve E2E targets from the repository variables `E2E_BASE_URL` (client) and `E2E_API_BASE_URL` (API). There is no manual `base_url` input — both modes are deterministic and policy-consistent.

### Seed readiness

The workflow polls `/api/health` and gates on `seed.mode`:

- `seeded` or `skipped` — ready, proceed to tests
- `failed` — terminal error, workflow fails immediately
- `in_progress` — keep polling until timeout

The `seed.mode` field is the canonical readiness signal. `seed.seeded` (boolean) is preserved for backward compatibility but is not used for workflow control flow.

### Production-host denylist

Before tests run, a safety gate validates that target URLs do not match production hostnames. The gate is fail-closed: missing denylist constants or unparseable URLs abort the workflow. Hostname comparison uses exact match after lowercase normalization and port removal. The canonical denylist values are defined as workflow constants in `.github/workflows/e2e.yml` — this README is descriptive only.

### Provisioning

The provisioning script (`node e2e/scripts/provision-e2e-firebase-users.js`) is a **local/manual developer/admin tool** run from your own machine. The root wrapper `node scripts/provision-e2e-firebase-users.js` also works (it delegates to `e2e/scripts/provision-e2e-firebase-users.js`). The script is **not** executed by `ci.yml` or `e2e.yml`. CI and E2E workflows consume the synced GitHub secrets and Vercel Preview env vars after the script has already run.

> **Troubleshooting:** If the provisioning script fails with terminal or CLI errors, the cause is almost always a local environment/setup issue. The script depends on local CLI installation/PATH, `gh` and `vercel` CLI auth state, `server/.vercel/project.json` linkage, and `server/.env` files. Verify: (1) the local, gitignored `e2e/.env.e2e` exists (copied from `e2e/.env.e2e.example`) with emails, UIDs, and passwords for provisioning, (2) `server/.env` exists with Firebase admin credentials (needed unless running `--sync-only`), (3) you are running from the repo root, (4) `gh auth status`, (5) `vercel whoami`, (6) `cd server && vercel link`. Environment differences (CLI installation, auth state, linked project, shell session) can make one terminal work while another fails.
