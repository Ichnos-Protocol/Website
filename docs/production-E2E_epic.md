# production-E2E_epic.md: E2E evidence that matches what ships

**Version 0.1, 2026-09-29. Status: draft. The rulings in section 2 are proposals; the owner's approval of this version makes them rulings.**

The September release (`release` at `47bd197`, merged 2026-09-29T02:57:45Z) was the first to follow working automatic E2E runs. E2E-N3 had fixed the payload fields on `main` minutes earlier. Watching the runs around the last two merges and the release showed four problems:

- a production deployment starts a full E2E run, which tests `main`'s previews and then posts success on the release commit;
- one cancel-in-progress queue per Vercel project lets any later server event cancel a running `main` run;
- feature-branch runs test `main`'s previews with the branch's tests;
- two analytics tests retry whenever the client's global health banner appears.

The documentation also describes staging's database and `main`'s required checks wrongly. Reviewing the workflow for this specification showed one more gap: its production-host denylist misses the production API's own domain. This specification turns those findings into six phases, and lists the owner checks still open from the September epic.

**Inheritance.** `september_fixes_spec.md` v1.2 (section 3 rules), `AGENTS.md` "Test runs" and "Passwords and secrets", and the conventions in `CLAUDE.md` (200-line application-module cap with tests exempt, Conventional Commits, documentation updated in the same commit as the behaviour it describes, `CLAUDE.md` and `AGENTS.md` kept aligned). Where those documents conflict with this one, they win, except where a phase below records an explicit amendment.

**Branch.** `feature/production-e2e`, created from `origin/main` at `a117c34`, whose tree equals the released `47bd197`. Phases run in order.

---

## 1. Facts the phases rest on

Verified on 2026-09-29 against the repository at `a117c34`, the GitHub API (workflow runs, commit statuses, deployments, branch protection) and the Vercel API.

1. **Deployment topology.** Production is Vercel's own build of `release`: the merge of PR #183 produced exactly one production deployment per project, `ichnos-protocol` at 02:58:05Z and `ichnos-protocol_server` at 02:58:23Z, both for `47bd197`. The stable E2E domains `e2e-client.ichnos-protocol.com` and `e2e-api.ichnos-protocol.com` follow git branch `main`; `staging-client` and `staging-api` follow `staging`. Both projects live in the Vercel team `ichnos-protocol`.
2. **Dispatched runs use `main`'s workflow file and always test `main`'s previews.** Both Vercel projects send `vercel.deployment.success`. `e2e.yml:97-103` runs the job for server-project events whose `client_payload.git.ref` is not `staging`; client-project events end skipped (runs 36514510181 and 36515031766, each two seconds after a client deployment). The checkout uses the payload SHA (`e2e.yml:184-190`), so the tests come from the triggering commit, but every run targets the stable domains from the repository variables `E2E_BASE_URL` and `E2E_API_BASE_URL`. A `repository_dispatch` workflow runs from the default branch: runs 36513958384 and 36514188822, for September-fixes commits that already contained E2E-N3, failed with `Invalid commit SHA in repository_dispatch payload` because `main` did not have it yet.
3. **A production deployment starts a full E2E run and posts success on the release commit.** Run 36515054211 (created 02:58:25Z, `Branch: release`) followed the server's production deployment. It ran the suite against `main`'s previews of `a117c34`, then posted `E2E Tests (Playwright): success, Playwright tests passed` on `47bd197` at 03:02:29Z through the final-status step (`e2e.yml:524-545`). No test touched a production deployment, which `e2e.yml:65-67` is meant to forbid. Its host denylist names `ichnos-protocol.com`, `www.ichnos-protocol.com`, the server's `ichnos-protocolserver.vercel.app` and both staging domains. It does not name `api.ichnos-protocol.com`, the production API's own domain, so a misconfigured `E2E_API_BASE_URL` pointing there would pass the gate. The run's Neon cleanup targeted `preview/release` and failed with 401.
4. **One cancel-in-progress queue per Vercel project.** `e2e.yml:76-78` declares, at workflow level, `group: e2e-${{ github.event.client_payload.project.name || 'manual' }}` with `cancel-in-progress: true`. A workflow-level group admits a run before its job filter is evaluated, so a later event cancels the running job even when the later run's own job is skipped. Run 36514535666 (`main`, `a117c34`, created 02:51:30Z) passed 51 tests with 2 flaky, posted success at 02:55:11Z, and was cancelled at 02:55:21Z. Two further dispatches had arrived: 36514736451 at 02:54:08Z, cancelled before it started, and 36514775297 at 02:54:39Z, which ended skipped. Neither matches a GitHub deployment, and a skipped or pending run keeps no payload, so their source cannot be read from GitHub. The success status survived only because the `if: always()` status step ran before the cancellation took effect. Manual runs use the group `e2e-manual`, so a manual run and an automatic run can overlap on the same domains, database and test accounts.
5. **Feature-branch runs test `main`.** Since E2E-N3 reached `main`, a server preview of any branch except `staging` starts a run. The run checks out that branch's commit, runs the branch's tests against `main`'s previews, and posts `E2E Tests (Playwright)` on the branch commit.
6. **`main` has two required checks, not five.** Live protection on `main` requires `Client — Lint & Test` and `Server — Lint & Test`; `release` requires `Release Policy Check`. `DEPLOYMENT_GITHUB_ACTIONS.md:183-189` lists five checks for `main`, including `E2E Tests (Playwright)` and two Vercel checks, and lines 28-30 and 209-210 describe E2E as a merge gate. `GITHUB_SETTINGS.md:17` and `:39-42` say five. `e2e.yml:89-91` calls the E2E check "required on pull requests into main". `DEPLOYMENT_GITHUB_ACTIONS.md:80` says only the server project emits `repository_dispatch`; the client project emits it too (fact 2).
7. **Two analytics tests retry on the health banner.** `AdminPage.alert` (`e2e/tests/pages/AdminPage.js:134-136`) is `page.getByRole("alert")`, and `admin-analytics.spec.js:85` and `:133-134` assert on it. The client's sanity check aborts `/api/health` after `API_SANITY_TIMEOUT_MS = 5000` (`client/src/constants/api.js:3`, `client/src/helpers/apiHealthCheck.js:5`) and renders a second `role="alert"` banner on every route (`client/src/App.jsx:37-41`). In run 2 (36411670118, `diagnosis-2.md`) the first attempts of the tests at `admin-analytics.spec.js:64` and `:117` failed in strict mode on the two alerts and passed on retry. Run 36514535666 also reported 2 flaky.
8. **Why `/api/health` is slow on previews.** `server/src/app.js:90-93` awaits `ensureSeeded()` inside `/api/health`. The seed promise belongs to each server instance (`server/scripts/seedE2EOnPreview.js:48`), so the first health request on every new preview instance waits for the database connection, E2E-N2's migration gate and the seed queries. Production returns before any database work, and staging stops at `SKIP_E2E_SEED=true`. `@vercel/functions` is a dependency, and `server/src/controllers/chatController.js` already uses its `waitUntil`.
9. **Staging has its own database.** At the staging deployment of 2026-09-28 (sync run 36413468839, staging at `55a1335`), the Vercel–Neon integration added a `DATABASE_URL` for git branch `staging` in `ichnos-protocol_server`. Staging therefore reads its own copy of production, which the integration's naming makes `preview/staging`. Staging keeps branch-scoped overrides for `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`, `CORS_ORIGIN` and `SKIP_E2E_SEED`, so it still signs in against production Firebase. `AGENTS.md:266` says staging uses the production Neon database and that manual QA on staging writes to it.
10. **Neon cleanup has never run with the current key.** `NEON_API_KEY` was last set on 2026-03-18. Every cleanup since then has failed with 401, including runs 36411670118, 36514535666 and 36515054211. The cleanup deletes `preview/<git.ref>` after an E2E run and never `preview/main` (E2E-N1). It exists so that preview branches do not accumulate past Neon's branch limit and block deployments with "Branch limit exceeded" (`e2e/scripts/cleanupNeonBranch.js:8-11`).
11. **Preview databases hold production data.** `preview/main`, `preview/staging` and every feature preview branch are copies of `production`, created by the integration. On previews the server trusts the test Firebase project, whose admin accounts use the public password pattern (`AGENTS.md` "Passwords and secrets"). The run 2 admin tests read the preview copy's user list this way. Vercel's deployment protection is the barrier in front of that data.

---

## 2. Owner decisions (proposed, 2026-09-29)

| # | Decision | Proposed ruling |
|---|---|---|
| D1 | Which deployments start an automatic E2E run | Only server-project deployments of `main`. The stable domains follow `main` (fact 1), so no other deployment changes what the tests hit. Feature branches, `staging` and production start no run. A release candidate is confirmed by a manual `workflow_dispatch` on `main`, as E2E-R5 did. |
| D2 | Run queue | One concurrency group for every run that targets the stable domains, automatic and manual, with `cancel-in-progress: false`. Runs wait instead of cancelling each other. A run ticket dispatches only when that group is idle and records that check, because GitHub lets a newer pending run replace an older pending one. |
| D3 | What a production deployment gets instead of E2E | A read-only production smoke check, posted as its own commit status `Production smoke` on the release commit. It confirms that the API serves the release commit, reports `environment production`, that the public pages answer 200, and that the four legacy addresses return 301 with the right `Location`. It never signs in, never writes, and uses no test account. |
| D4 | Required checks on `main` | The documentation follows the live protection: two checks. `E2E Tests (Playwright)` cannot be required on pull requests into `main` once D1 runs E2E only after the merge. |
| D5 | The health banner on previews | `/api/health` answers without waiting for the seed. The seed continues in the background under `waitUntil`, and the E2E readiness step keeps polling until `seed.mode` is `seeded`, as it does today. The analytics alert locator is scoped as well, so the tests do not depend on the banner either way. |
| D6 | Neon cleanup | Delete a branch's Neon copy when its git branch is deleted, not after an E2E run, because after D1 feature branches have no run. `preview/main` and `preview/staging` are never deleted. The owner repairs `NEON_API_KEY` once; it is a provider-issued token, the one manual step `AGENTS.md` allows. If the Vercel–Neon integration can delete preview branches when a git branch is deleted, that setting replaces the workflow. |
| D7 | Staging's database | Record reality: staging reads its own copy of production, made when its Neon branch is created, and signs in against production Firebase. Manual QA on staging no longer writes to production data. The alternative, a staging-scoped `DATABASE_URL` pinned to production, is rejected: the integration manages that variable and may overwrite it. |
| D8 | Production data in preview copies (fact 11) | Open. Out of scope for this epic; recorded in section 6 with the owner. |

---

## 3. Rules that apply to every phase

- Tests follow `AGENTS.md` "Test runs". No phase dispatches a full E2E run. Automatic runs caused by a phase's own merge are operational checks, never a phase run.
- Event and input values reach the shell only through `env`. The SHA and ref validation that VF-S1 added stays in every workflow that reads a dispatch payload.
- No test account, test password or E2E write reaches production (`AGENTS.md` "Passwords and secrets"). The production smoke check reads public URLs only.
- Each phase ends with `npm run lint && npm run format:check && npm test` green in every touched package, `npm run format:check` and `npm run test:unit` green in `e2e/` when it was touched, and the documentation that describes the changed behaviour updated in the same commit.
- Commit messages carry the phase number, for example `ci(e2e): run automatic E2E only for main deployments (PE1)`.
- **Owner confirmation.** `CLAUDE.md` §17 requires explicit confirmation for CI and root edits. The owner's approval of this spec version is that confirmation for every workflow and root document named in a phase below. Changing a Vercel or GitHub setting stays a separate confirmation at the moment it happens.

---

## 4. Phases

### PE1. Automatic runs only for `main` deployments

**Why.** Facts 2, 3 and 5, decision D1. Every automatic run tests `main`'s previews, so a run started by any other deployment reports on code it never exercised.

**Changes.**

- `e2e.yml:97-103`: the `repository_dispatch` branch of the job filter becomes a server-project event whose `client_payload.git.ref` equals `main`. The `staging` exclusion is subsumed and removed. `workflow_dispatch` is unchanged.
- The comment at `e2e.yml:89-96` is rewritten: automatic runs follow `main` deployments only; the E2E status is not a required check.
- The Resolve step keeps reading `git.sha` and `git.ref`, with the same validation.
- `e2e.yml:67`: `PRODUCTION_HOSTS_API` gains `api.ichnos-protocol.com`, the production API domain it lacks today (fact 3).

**Docs.** `AGENTS.md:261-262` and `DEPLOYMENT_GITHUB_ACTIONS.md:28-30`, `:56` and `:80` describe the new trigger.

**Acceptance.**

- A push to a feature branch produces only skipped E2E runs.
- A `main` deployment runs the suite.
- A production deployment produces a skipped run and posts no E2E status on the release commit.
- A staging sync produces a skipped run. This also closes the staging-exclusion proof left open by the September epic.
- `e2e.yml:67` names `api.ichnos-protocol.com`.

### PE2. One queue for the stable domains

**Why.** Fact 4, decision D2. All runs share one set of domains, one database and one set of test accounts. Overlapping runs corrupt each other's data, and cancelled runs lose evidence.

**Changes.** `e2e.yml:76-78` becomes one fixed group for automatic and manual runs, for example `group: e2e-stable-domains`, with `cancel-in-progress: false`.

**Docs.** `AGENTS.md` "Test runs": a run ticket dispatches only when the group has no running or pending run, and records the check in `meta.md`.

**Acceptance.** Two `main` deployments in quick succession produce two runs that complete one after the other, with neither cancelled. A manual run dispatched while an automatic run is in progress waits and then runs.

### PE3. The analytics alert and the health banner

**Why.** Facts 7 and 8, decision D5. The tests fail on a banner they do not test, and the banner appears because a health request waits for the seed.

**PE3a, test.** `AdminPage.alert` is scoped to the analytics result alert, not to any `role="alert"`, by role and visible text or by the analytics panel (`CLAUDE.md` §14.4). Both uses in `admin-analytics.spec.js` keep their assertions.

**PE3b, server.** `/api/health` (`server/src/app.js:90-93`) starts `ensureSeeded()` without awaiting it, keeps the function alive with `waitUntil` from `@vercel/functions` as `chatController.js` does, and answers at once with the current `seedStatus`. The seed's guards, E2E-N2's migration gate and the idempotent seed queries are unchanged. The E2E readiness step (`e2e.yml:411-470`) keeps polling until `seed.mode` is `seeded`, `skipped` or `failed`.

**Tests.** A server test proves the handler answers while the seed promise is still pending, and that a seed failure still reaches `seedStatus`.

**Acceptance.** In the next automatic `main` run, the readiness step reports `seeded` before the tests start, and both analytics tests pass on their first attempt.

### PE4. Production smoke check

**Why.** Fact 3, decision D3. After PE1, a production deployment gets no automatic evidence at all, and the owner's post-release check was manual.

**Changes.**

- `/api/health` adds `commit: process.env.VERCEL_GIT_COMMIT_SHA ?? null`. The repository is public, so the SHA discloses nothing new.
- A new workflow, `.github/workflows/production-smoke.yml`, triggers on `repository_dispatch` `vercel.deployment.success` for a server-project event whose `git.ref` is `release`. It validates the SHA and ref as `e2e.yml` does. Its production hosts come from a constant allowlist in the workflow: `ichnos-protocol.com` and `api.ichnos-protocol.com`.
- The workflow polls `https://api.ichnos-protocol.com/api/health` for up to ten minutes until `commit` equals the payload SHA, `status` is `ok` and `environment` is `production`.
- It then checks that `/`, `/services`, `/team`, `/contact`, `/passport`, `/passport/readiness-assessment` and `/consortium` answer 200 on `https://ichnos-protocol.com`. It checks that `/data` and `/catena-x` return 301 to `/passport`, and that `/data/readiness-assessment` and `/catena-x/readiness-assessment` return 301 to `/passport/readiness-assessment`.
- It posts `Production smoke` with `success` or `failure` on the payload SHA. It uses no secret beyond `GITHUB_TOKEN` with `statuses: write`, and sends no sign-in, no body and no request other than `GET` and `HEAD`.
- Known gap, recorded rather than solved: the client exposes no commit, so the check proves the pages answer, not that they are the new build. The client project deploys before the server, as `e2e.yml` already relies on.

**Tests.** A server test for the `commit` field. If the path, redirect and host lists live in a helper script, that script gets a unit test.

**Acceptance.** The next production deployment posts `Production smoke: success` on its release commit, and posts no `E2E Tests (Playwright)` status.

### PE5. Neon cleanup on branch deletion

**Why.** Fact 10, decision D6. After PE1 no run exists for a feature branch, so the post-run cleanup could no longer free its Neon copy, and the current key has never worked.

**Owner, first.** Check the Vercel–Neon integration settings for automatic deletion of preview branches when their git branch is deleted.

- If the setting exists, enable it. This phase then removes the cleanup step from `e2e.yml:516-523` and documents the setting.
- If it does not, add `.github/workflows/neon-branch-cleanup.yml` on the GitHub `delete` event for branches. It passes the validated ref as `GIT_BRANCH` to `node e2e/scripts/cleanupNeonBranch.js`, which already loads before `npm ci`, and removes the step from `e2e.yml:516-523`.
- Either way, `preview/staging` joins `preview/main` in the names the cleanup never deletes.

**Owner, then.** Repair `NEON_API_KEY` with a new key issued in the Neon console, stored as the repository secret.

**Acceptance.** Deleting a throwaway branch whose preview created `preview/<branch>` removes that Neon branch. `production`, `preview/main`, `preview/staging` and every branch outside the `preview/` prefix remain.

### PE6. Documentation follows reality

**Why.** Facts 6 and 9, decisions D4 and D7.

**Changes.**

- `AGENTS.md:266`: staging reads its own copy of production, made when its Neon branch is created, and signs in against production Firebase. `SKIP_E2E_SEED=true` keeps the seed and the migrations away, and QA writes land in the copy.
- `AGENTS.md:261-262` and the "Test runs" section reflect PE1, PE2 and PE4. `CLAUDE.md` stays aligned wherever it names E2E triggers.
- `DEPLOYMENT_GITHUB_ACTIONS.md:183-189` and `:209-210`, and `GITHUB_SETTINGS.md:17` and `:39-42`: `main` requires `Client — Lint & Test` and `Server — Lint & Test`, and `release` requires `Release Policy Check`.
- `DEPLOYMENT_GITHUB_ACTIONS.md:144` stops telling anyone to set `VERCEL_AUTOMATION_BYPASS_SECRET` by hand in both projects' settings. The provisioning command sets it.

**Acceptance.** `grep -n "production Neon DB\|5 required checks\|required status check for merge" AGENTS.md DEPLOYMENT_GITHUB_ACTIONS.md GITHUB_SETTINGS.md` returns nothing.

---

## 5. Owner gates and checks, no code

- **G1, security, now.** In the production Firebase project `ichnos-protocol`, open Authentication, then Users, search for `ichnos-test.com`, and delete any account found. The provisioning pipeline read production credentials before E2E-P1 locked it to `ichnos-protocol-test`, so such accounts may exist, two of them with admin claims.
- **G2, before PE5's acceptance.** Repair `NEON_API_KEY` (D6).
- **G3, after the next `main` deployment.** In the Vercel function logs of `main`'s server preview, the first `/api/health` shows `[e2e-seed] ref main: applying pending migrations...`, `[migration] skipping` for 000 to 011, then the seed queries. The Vercel API did not return these logs on 2026-09-29.
- **G4, for the September release.** A manual pass on staging or production: consortium registration with an EU region shows EUR and with an ASEAN region shows SGD; the admin Consortium tab lists the registrant; the chatbot answers.

---

## 6. Out of scope, recorded with an owner

- **Production data in preview copies** (fact 11, D8). Owner. Options for its own spec: schema-only preview branches seeded with test data alone, or anonymised copies. Until then, Vercel deployment protection and the bypass secret are the only barrier in front of copies of real profiles.
- **True per-branch E2E**, meaning tests against a feature branch's own deployments and Neon copy. Owner, own spec. It needs per-deployment targets and a seed and migration path for every preview branch.
- **Unused configuration.** Owner. Fifteen GitHub secrets that no workflow reads, and six test-account entries in the server's Production environment variables (`E2E_ADMIN_EMAIL`, `E2E_ADMIN_UID`, `E2E_SUPER_ADMIN_EMAIL`, `E2E_SUPER_ADMIN_UID`, `E2E_USER_EMAIL`, `E2E_USER_UID`), which the seed never reads in production. Deleting them is cleanup, not rotation.
- **`server/scripts/setupTestEnvironment.js` prints test passwords** to the console. Test tier and public pattern, so low risk; owner.

---

## 7. Questions Traycer is likely to ask

- **Why not keep feature-branch runs?** They test `main`'s previews with the branch's tests (fact 5), so their status describes code the branch did not deploy.
- **Why not run E2E against production?** The E2E suite signs in with test accounts and writes data. `AGENTS.md` keeps test accounts out of production, and `e2e.yml:65-67` refuses production hosts, completely once PE1 adds the API domain. PE4's smoke check is read-only.
- **Why `cancel-in-progress: false` and not per-branch groups?** After PE1 only `main` runs automatically, and every run, manual or automatic, uses the same domains, database and accounts. Serialising is the only safe order, and cancelling loses evidence (fact 4).
- **Does PE3b change what E2E-N2 guarantees?** No. The migration gate and the seed run in the same order inside the same promise. Only the health request stops waiting for them, and the readiness step still waits for `seeded`.
- **What if PE4's health poll never sees the new commit?** The check fails after ten minutes and posts `failure`. The owner then decides whether to use Vercel's instant rollback, which needs no database change for this release.
