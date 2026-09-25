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

Every name below except `BASE_URL` is generated and synced by the provisioning command (see [Provisioning](#provisioning)): it writes the GitHub secret or variable, and the Vercel Preview variables that go with it. The tables list what exists; nothing in them is set by hand.

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
| `VERCEL_AUTOMATION_BYPASS_SECRET` | GitHub Secret | Vercel Deployment Protection bypass. The provisioning command sets one identical value on the `ichnos-client` and `ichnos-protocol_server` Vercel projects and on GitHub in a single run. |

> **Other non-secret values** (`FIREBASE_PROJECT_ID`, `FIREBASE_AUTH_DOMAIN`, `FIREBASE_STORAGE_BUCKET`, and the `E2E_*_EMAIL` / `E2E_*_UID` names for each role) are GitHub repository variables in CI, also generated and synced by the provisioning command. See [`GITHUB_SETTINGS.md`](../GITHUB_SETTINGS.md) §2 for the full list.
>
> **Local runs** read the gitignored `e2e/.env.e2e`, which the provisioning command generates whole. `playwright.config.js` loads it with `dotenv` only when the file exists, and never overrides variables already set in the shell. `e2e/.env.e2e.example` is a reference for the names the generated file contains, nothing more.

> **Symptom:** if exactly one of the two readiness checks fails with HTTP 401, the bypass values on Vercel and GitHub disagree. Re-run the provisioning command; it sets all three in one run.

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

This section is the single authority for E2E configuration. One command, run from the repository root, does all of it:

```bash
node e2e/scripts/provision-e2e-firebase-users.js
```

It is a **local developer/admin tool** run from your own machine. It is **not** executed by `ci.yml` or `e2e.yml`; those workflows consume the synced GitHub secrets, variables and Vercel Preview env vars after the command has run.

**Firebase admin credentials**, in this order of precedence:

1. `--firebase-env <path>`
2. `server/.env.e2e`
3. exactly one `secrets/*ichnos-protocol-test*.json` service-account file

`server/.env` is never read and is refused if named. The project is locked to `ichnos-protocol-test`.

**What one run produces:**

- creates or updates the five role accounts in `ichnos-protocol-test`, with the pattern passwords, and reads the test project's web config
- generates `e2e/.env.e2e` whole, with a header giving the date and the exact command; do not edit it by hand
- writes the gitignored `secrets/test-accounts.md`: each account's email, role, password, UID and project, and the infrastructure secrets by name, tier, where applied and when last set, never their values and never production values
- syncs 15 GitHub repository variables and 8 GitHub repository secrets
- sets one identical `VERCEL_AUTOMATION_BYPASS_SECRET` on `ichnos-client`, `ichnos-protocol_server` and GitHub; if any of the three is not confirmed, the run stops before writing any Vercel env var or redeploying
- writes the all-branches Preview variables (client `VITE_FIREBASE_API_KEY`; server `E2E_*_EMAIL` and `E2E_*_UID`) and redeploys only the previews whose variables changed

**Other modes:**

- `--sync-only` pushes the generated `e2e/.env.e2e` as it stands to GitHub and the Vercel Preview env. It does not touch Firebase, read the web config or rotate the bypass secret.
- `--reset-passwords` is an alias for the provisioning run that resets the account passwords. The values are deterministic, so a reset produces the same passwords.

**Manual prerequisites** (the only ones):

- `gh auth login`
- `vercel login`
- the Firebase test service account in one of the credential sources above
- `VERCEL_TOKEN`, only when the installed Vercel CLI lacks `vercel api`

> **Troubleshooting:** the script checks its prerequisites first and stops naming the missing command or token. If it fails, check: (1) you are authenticated: `gh auth login`, `vercel login`; (2) the Firebase admin credentials come from `--firebase-env`, `server/.env.e2e` or the single `secrets/*ichnos-protocol-test*.json`, never `server/.env`; (3) you are running from the repository root; (4) both Vercel projects are linked to the exact names `ichnos-client` and `ichnos-protocol_server` (`cd server && vercel link`, `cd client && vercel link`); (5) the script's own message names the missing command or token.
