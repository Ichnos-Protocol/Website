# production-E2E_epic.md: E2E evidence that matches what ships

**Version 0.3, 2026-09-29. Status: executed in part, as one pull request without Traycer tickets.**

**Execution, 2026-09-29.** The owner cut the epic to the parts that matter and had them done as one pull request on `feature/production-e2e`.

- Done: PE1; PE2; PE3a; from PE3b, only the move of `/api/health` ahead of the global limiter (D5); PE5's workflow step, provisioning record and docs; PE6, with the same corrections in `DEPLOYMENT.md`, `README.md`, `docs/deploymentMigrationValidation.md` and `CLAUDE.md` §11.
- PE5's three cleanup files (`e2e/scripts/cleanupNeonBranch.js`, its helper and its test) stay until this pull request is merged. Until then every dispatched E2E run uses `main`'s copy of `e2e.yml`, which still calls the script, so deleting it here would fail each run of this branch at that step. They are deleted in the first change after the merge, together with the header note in `e2e/scripts/helpers/e2eFixedConfig.js` that names them.
- PE5's owner setting (G2) is still open. Until the owner turns it on, nothing deletes preview branches, which is no change: the removed workflow step had failed with 401 since 2026-03-18.
- Deferred: the rest of PE3b (answering `/api/health` without waiting for the seed) and PE4 (the production smoke check). Until PE4 exists, the release check stays manual.
- PE2's acceptance is limited to what one merge can prove: a staging sync dispatched during the merge's automatic `main` run leaves that run running to completion, and the sync's skipped E2E runs end at once instead of waiting for it. The other two queue cases rest on GitHub's documented behaviour.
- The E2E job keeps no `timeout-minutes`, per the pinned "No run-level time limit" rule in `AGENTS.md`. With `cancel-in-progress: false`, a hung run now holds the queue until the owner stops it.
- The decisions behind the executed parts (D1, D2, D4, D5, D6 and D7) are rulings. D3 waits with PE4.

The rest of this document is the plan as it stood at v0.2.

**Changes from v0.1.** Traycer's review found four errors, and all four hold:

- PE3a would have broken four tests;
- the rate limiter also delays `/api/health`;
- the proposed queue still let a skipped event cancel a waiting run;
- fact 9 checked staging's server but not its client.

They are corrected here, and the staging client's API host has since been read (G5, done). Its fifth point, that the Neon integration cannot delete a preview branch when the git branch is deleted, does not hold. The installed integration is the Neon-managed one (fact 10), and that integration can. Fact 4 now names the two dispatches it could not identify. The branch now starts from `September-fixes`, so the spec travels with the work.

The September release (`release` at `47bd197`, merged 2026-09-29T02:57:45Z) was the first to follow working automatic E2E runs. E2E-N3 had fixed the payload fields on `main` minutes earlier. Watching the runs around the last two merges and the release showed four problems:

- a production deployment starts a full E2E run, which tests `main`'s previews and then posts success on the release commit;
- one workflow-level cancel-in-progress queue per Vercel project lets any later server event, a skipped staging deployment included, cancel a running `main` run;
- feature-branch runs test `main`'s previews with the branch's tests;
- two analytics tests retry whenever the client's global health banner appears.

The documentation also describes staging's database, the Neon integration and `main`'s required checks wrongly. Reviewing the workflow found one more gap: its production-host denylist misses the production API's own domain. This specification turns those findings into six phases, and lists the owner checks still open.

**Inheritance.** This spec inherits:

- `september_fixes_spec.md` v1.2, section 3 rules;
- `AGENTS.md` "Test runs" and "Passwords and secrets";
- the conventions in `CLAUDE.md`: the 200-line application-module cap with tests exempt, Conventional Commits, documentation updated in the same commit as the behaviour it describes, and `CLAUDE.md` and `AGENTS.md` kept aligned.

Where those documents conflict with this one, they win, except where this spec records an explicit amendment. D5 records the only one, which the owner confirmed on 2026-09-29: `/api/health` leaves the global rate limiter, which the owner kept in front of it in the September epic.

**Branch.** `feature/production-e2e`, created from `September-fixes` at the commit that carries this version. `September-fixes` is `origin/main` (`a117c34`, whose tree equals the released `47bd197`) plus the spec commits. Phases run in order, and the branch reaches `main` through one pull request at the end.

---

## 1. Facts the phases rest on

Verified on 2026-09-29 against these sources:

- the repository at `a538408`, where line numbers are `grep -n` output on that commit;
- the GitHub API: workflow runs, commit statuses, deployments and branch protection;
- the Vercel API: deployments, environment-variable metadata without values, and the integration configuration;
- the GitHub and Neon documentation.

1. **Deployment topology.** Production is Vercel's own build of `release`. The merge of PR #183 produced exactly one production deployment per project, both for `47bd197`: `ichnos-protocol` at 02:58:05Z and `ichnos-protocol_server` at 02:58:23Z. The stable E2E domains `e2e-client.ichnos-protocol.com` and `e2e-api.ichnos-protocol.com` follow git branch `main`; `staging-client` and `staging-api` follow `staging`. Both projects live in the Vercel team `ichnos-protocol`.
2. **Dispatched runs use `main`'s workflow file and always test `main`'s previews.**
   - Both Vercel projects send `vercel.deployment.success`. `e2e.yml:97-103` runs the job for server-project events whose `client_payload.git.ref` is not `staging`. Client-project events end skipped, for example runs 36514510181 and 36515031766, each two seconds after a client deployment.
   - The checkout uses the payload SHA (`e2e.yml:184-190`), so the tests come from the triggering commit. Every run targets the stable domains from the repository variables `E2E_BASE_URL` and `E2E_API_BASE_URL`.
   - A `repository_dispatch` workflow runs from the default branch. Runs 36513958384 and 36514188822, for September-fixes commits that already contained E2E-N3, failed with `Invalid commit SHA in repository_dispatch payload` because `main` did not have it yet.
3. **A production deployment starts a full E2E run and posts success on the release commit.**
   - Run 36515054211 (created 02:58:25Z, `Branch: release`) followed the server's production deployment. It ran the suite against `main`'s previews of `a117c34`. It then posted `E2E Tests (Playwright): success, Playwright tests passed` on `47bd197` at 03:02:29Z, through the final-status step (`e2e.yml:524-545`).
   - No test touched a production deployment, which `e2e.yml:65-67` is meant to forbid. Its host denylist names `ichnos-protocol.com`, `www.ichnos-protocol.com`, the server's `ichnos-protocolserver.vercel.app` and both staging domains. It does not name `api.ichnos-protocol.com`, the production API's own domain, so a misconfigured `E2E_API_BASE_URL` pointing there would pass the gate.
   - The run's Neon cleanup targeted `preview/release` and failed with 401.
4. **One workflow-level queue per Vercel project, and what GitHub's queue does.**
   - `e2e.yml:73-78` declares, at workflow level, `group: e2e-${{ github.event.client_payload.project.name || 'manual' }}` with `cancel-in-progress: true`. A workflow-level group admits a run before its job filter is evaluated.
   - Run 36514535666 (`main`, `a117c34`, created 02:51:30Z) passed 51 tests with 2 flaky and posted success at 02:55:11Z. It was cancelled at 02:55:21Z by the staging sync run 36514680040, dispatched at 02:53:24Z. That sync produced two staging server deployments of `a117c34`:
     - `dpl_9h9tVoQc3xzmTb1NnBwRgcah4yZb`, from the git push, ready at 02:54:06Z. Its dispatch became run 36514736451 at 02:54:08Z, which was cancelled before it started.
     - `dpl_5jsPLH6zHB6mLGGxHJaV91KdQabi`, from the deploy hook, ready at 02:54:36Z. Its dispatch became run 36514775297 at 02:54:39Z, which ended skipped.
   - The job filter skips `staging`, but the group had already admitted both runs, so a staging deployment cancelled the `main` run. The success status survived only because the `if: always()` status step ran before the cancellation took effect. The header of `sync-staging.yml` records the same cascade under an earlier trigger design.
   - Manual runs use the group `e2e-manual`, so a manual run and an automatic run can overlap on the same domains, database and test accounts.
   - GitHub's documentation sets out how a concurrency group queues:
     - by default a group keeps at most one pending run or job (`queue: single`), and a newer one cancels it and takes its place;
     - `queue: max` keeps up to 100, and combining it with `cancel-in-progress: true` fails validation;
     - a job accepts the same keys.
   - The documentation does not say whether a job skipped by its `if` joins a job-level group.
5. **Feature-branch runs test `main`.** Since E2E-N3 reached `main`, a server preview of any branch except `staging` starts a run. The run checks out that branch's commit and runs the branch's tests against `main`'s previews. It then posts `E2E Tests (Playwright)` on the branch commit.
6. **`main` has two required checks, not five.** Live protection on `main` requires `Client — Lint & Test` and `Server — Lint & Test`; `release` requires `Release Policy Check`. The documentation says otherwise in several places:
   - `DEPLOYMENT_GITHUB_ACTIONS.md:183-189` lists five checks for `main`, including `E2E Tests (Playwright)` and two Vercel checks;
   - lines 3, 28-30 and 209-210 of the same file describe E2E as a merge gate;
   - `GITHUB_SETTINGS.md:17`, `:39-42`, `:174` and `:181-182` say five;
   - `e2e.yml:89-91` calls the E2E check "required on pull requests into main";
   - `DEPLOYMENT_GITHUB_ACTIONS.md:71` and `:80` say only the server project emits `repository_dispatch`, but the client project emits it too (fact 2).
7. **Six tests share an unscoped alert locator.**
   - `AdminPage.alert` (`e2e/tests/pages/AdminPage.js:134-136`) is `page.getByRole("alert")`. Six tests in `admin-analytics.spec.js` assert on it:
     - analytics success (`:85-87`) and analytics failure (`:133-134`);
     - CSV export failure (`:204-205`);
     - admin added (`:281-283`), admin removed (`:319-321`) and admin update failure (`:344-345`).
   - Every one of those alerts renders inside `AdminLayout`'s `<main>` (`client/src/components/templates/AdminLayout.jsx:25`). They come from `TopicAnalytics.jsx:48-56` and from `AdminPage.jsx:87-95` and `:136-144`.
   - The client's sanity check aborts `/api/health` after `API_SANITY_TIMEOUT_MS = 5000` (`client/src/constants/api.js:3`, `client/src/helpers/apiHealthCheck.js:5`). It then renders `ApiSanityWarning`, a second `role="alert"`, before `<Routes>` (`client/src/App.jsx:37-41`). That is outside every `<main>`.
   - In run 2 (36411670118, `diagnosis-2.md`), the first attempts of the two analytics tests failed in strict mode on the two alerts and passed on retry. Run 36514535666 also reported 2 flaky. The other four tests are exposed the same way.
8. **Two causes make `/api/health` slow.**
   - The global limiter is mounted at `server/src/app.js:61`, before the health route at `:90`. Every health request, in every environment, waits for `PgRateLimitStore.increment`, an `INSERT … ON CONFLICT` into `rate_limit_hits`.
     - The store fails open on an error, not on slowness. The pool waits up to 10 seconds for a connection (`server/src/config/database.js:17`), so a cold Neon compute can hold the answer past the client's 5 seconds.
     - The limiter runs inside the function, so it saves no invocation. For `/api/health` its only effect is that database write, which is also the only database work the endpoint does in production.
   - On previews, the handler also awaits `ensureSeeded()` (`app.js:90-93`). The seed promise belongs to each server instance (`server/scripts/seedE2EOnPreview.js:48`). So the first health request on every new preview instance waits for the database connection, E2E-N2's migration gate and the seed queries. Production and staging leave the seed at once, as `skipped`.
   - Related code and tests:
     - `@vercel/functions` is a dependency, and `server/src/controllers/chatController.js:97` already uses its `waitUntil`;
     - the four tests under `GET /api/health — seed contract` (`server/scripts/seedE2EOnPreview.test.js:361`) assume the response carries the seed's final state;
     - the limiter's header test (`server/src/routes/authRateLimit.test.js:53-58`) uses an auth route, not `/api/health`.
9. **Staging reads and writes its own database copy.**
   - `ichnos-protocol_server` has exactly one `DATABASE_URL` for git branch `staging`. The Neon integration (configuration `icfg_k4sgueZpLu6totuxJV2xI7Sb`) created it at 2026-09-28T11:05:01Z, during the staging sync, and no owner-created override exists.
     - Staging's server therefore reads its own copy of production, which the integration's naming makes `preview/staging`. The copy was taken at that moment and has not been refreshed since.
     - Staging keeps branch-scoped overrides for `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`, `CORS_ORIGIN` and `SKIP_E2E_SEED`, so it still signs in against production Firebase.
   - The staging client proxies `/api/*` to `https://$VITE_API_HOST` (`client/vercel.json:6-12`).
     - The `VITE_API_HOST` entry in `ichnos-protocol` for Preview on branch `staging` is `staging-api.ichnos-protocol.com`, read on 2026-09-29 (G5).
     - The entry was last changed on 2026-04-07, before every current staging build. Staging's browser traffic therefore reaches staging's own server, and staging's QA writes land in `preview/staging`, not in production.
     - `docs/deploymentMigrationValidation.md:253` and `devOpsLessonsLearned.md:740` record this value correctly.
   - The documentation still describes the old design, in which staging used the production database and the production server:
     - `AGENTS.md:266`, `:300` and `:312`;
     - `VERCEL_SETTINGS.md:20`, and §6 at lines 164, 183, 203, 235, 239, 246, 260 and 266;
     - `VERCEL_SETTINGS.md:220-229`, which also describes the Neon integration (PE5).

     In particular, the staging `DATABASE_URL` override these lines describe, pointing at production, does not exist.
10. **The Neon integration is the Neon-managed one, and its cleanup has never run with the current key.**
    - The Vercel API reports the configuration behind every `DATABASE_URL` entry as slug `neon`, `installationType: external`, installed 2026-05-12. Vercel defines `external` as installed through the existing integrations flow and `marketplace` as natively installed.
      - So this is Neon's connectable-account integration, not the Vercel-managed one. `AGENTS.md:304` calls it "Vercel's native Neon integration".
    - Neon documents a setting for this integration, "Automatically delete obsolete Neon branches". It deletes a preview branch after its git branch is deleted, the next time any preview deployment is created. The Vercel-managed integration instead deletes a branch together with its Vercel deployments.
    - `NEON_API_KEY` was last set on 2026-03-18. Every cleanup since then has failed with 401, including runs 36411670118, 36514535666 and 36515054211.
    - The cleanup deletes `preview/<git.ref>` after an E2E run and never touches `preview/main` (E2E-N1). It exists so that preview branches do not accumulate past Neon's branch limit and block deployments with "Branch limit exceeded" (`e2e/scripts/cleanupNeonBranch.js:8-11`).
11. **Preview databases hold production data.**
    - `preview/main`, `preview/staging` and every feature preview branch are copies of `production`, created by the integration.
    - On previews the server trusts the test Firebase project, whose admin accounts use the public password pattern (`AGENTS.md` "Passwords and secrets"). The run 2 admin tests read the preview copy's user list this way.
    - Vercel's deployment protection is the barrier in front of that data.
12. **Every client path returns the same document.**
    - `client/vercel.json:19-21` rewrites every path to `/index.html`, so a 200 on `/team` proves only that the client project is serving.
    - The four legacy paths are real 301s from its `redirects` block (`:13-18`).

---

## 2. Owner decisions (proposed, 2026-09-29)

| # | Decision | Proposed ruling |
|---|---|---|
| D1 | Which deployments start an automatic E2E run | Only server-project deployments of `main`. The stable domains follow `main` (fact 1), so no other deployment changes what the tests hit. Feature branches, `staging` and production start no run. `workflow_dispatch` stays open to any ref, and the run ticket names it. A run from a ref other than `main` tests `main`'s deployments with that ref's tests, so it proves only test changes. A release candidate is confirmed by a manual run on `main`, as E2E-R5 did. |
| D2 | Run queue | Concurrency moves from the workflow to the E2E job: one fixed group for automatic and manual runs, `cancel-in-progress: false`, and `queue` at its default, `single`. A job skipped by its `if` then never waits in the group, and a running job is never cancelled. A newer `main` run replaces an older pending one. That is correct, because the domains serve only the newest `main` deployment: an older pending run could only test the newer deployment under the older commit's name. `queue: max` is rejected for that reason. A run ticket dispatches only when the group has no running or pending job, and records that check. |
| D3 | What a production deployment gets instead of E2E | A read-only production smoke check, posted as its own commit status `Production smoke` on the release commit. It confirms four things: the API serves the release commit with `environment production`; GitHub records a successful production deployment of `ichnos-protocol` for that commit, which Vercel posts; `/` answers 200 with HTML; and every redirect in `client/vercel.json` at that commit returns 301 to its destination. It checks one page because every path returns the same document (fact 12). It never signs in, never writes, and uses no test account. |
| D4 | Required checks on `main` | The documentation follows the live protection: two checks. `E2E Tests (Playwright)` cannot be required on pull requests into `main` once D1 runs E2E only after the merge. |
| D5 | `/api/health` and the health banner | Confirmed by the owner on 2026-09-29. `/api/health` is registered before the global limiter. It answers without waiting for the seed, which continues under `waitUntil`, and the E2E readiness step keeps polling until `seed.mode` is `seeded`. This amends the September choice to keep `/api/health` behind the shared limiter, because the limiter prevents no invocation and adds the only database write the endpoint makes in production (fact 8). With both delays gone, the client's banner appears only when the API cannot be reached, which is what it exists to report. `AdminPage.alert` is scoped to the `main` landmark, so the six tests stop depending on the banner either way. |
| D6 | Neon cleanup | The Neon-managed integration deletes a preview branch after its git branch is deleted (fact 10). The owner turns that setting on. The workflow step, its script and the use of `NEON_API_KEY` go, and no key is repaired. `preview/main` and `preview/staging` stay, because their git branches are never deleted. If the setting is missing from the Neon console, PE5 stops. v0.1's `delete`-event workflow then becomes the fallback, and it needs a working key. |
| D7 | Staging's database | Record what staging does today (fact 9). Staging's client calls `staging-api`, whose only `DATABASE_URL` is the integration's copy. Staging therefore reads and writes its own copy of production, branched at the 2026-09-28 sync and not refreshed since, and it signs in against production Firebase. Manual QA on staging no longer writes to production data. The owner can reset the copy from its parent in the Neon console when fresher data is wanted. A staging-scoped `DATABASE_URL` pinned to production stays rejected, because the integration manages that variable and may overwrite it. |
| D8 | Production data in preview copies (fact 11) | Open. Out of scope for this epic; recorded in section 6 with the owner. |

---

## 3. Rules that apply to every phase

- Tests follow `AGENTS.md` "Test runs".
  - No phase dispatches a full E2E run.
  - Automatic runs caused by the epic's merge are operational checks, never a phase run.
- A workflow triggered by `repository_dispatch` runs from `main`'s copy (fact 2). Every acceptance that watches an automatic run, a staging sync or a production deployment is therefore observed after the branch reaches `main`.
- Event and input values reach the shell only through `env`. The SHA and ref validation that VF-S1 added stays in every workflow that reads a dispatch payload.
- No test account, test password or E2E write reaches production (`AGENTS.md` "Passwords and secrets"). The production smoke check reads public URLs and GitHub metadata only.
- Each phase ends with these checks green:
  - `npm run lint && npm run format:check && npm test` in every touched package;
  - `npm run format:check` and `npm run test:unit` in `e2e/`, when it was touched.

  The documentation that describes the changed behaviour is updated in the same commit.
- Commit messages carry the phase number, for example `ci(e2e): run automatic E2E only for main deployments (PE1)`.
- **Owner confirmation.** `CLAUDE.md` §17 requires explicit confirmation for CI and root edits and for file deletions.
  - The owner's approval of this spec version is that confirmation for two things: every workflow and root document named in a phase below, and the deletions PE5 names.
  - Changing a Vercel, Neon or GitHub setting stays a separate confirmation at the moment it happens.

---

## 4. Phases

### PE1. Automatic runs only for `main` deployments

**Why.** Facts 2, 3 and 5, decision D1. Every automatic run tests `main`'s previews, so a run started by any other deployment reports on code it never exercised.

**Changes.**

- `e2e.yml:97-103`: the `repository_dispatch` branch of the job filter becomes a server-project event whose `client_payload.git.ref` equals `main`. The `staging` exclusion is subsumed and removed. `workflow_dispatch` is unchanged.
- The comment at `e2e.yml:89-96` is rewritten: automatic runs follow `main` deployments only, and the E2E status is not a required check.
- The Resolve step keeps reading `git.sha` and `git.ref`, with the same validation.
- `e2e.yml:67`: `PRODUCTION_HOSTS_API` gains `api.ichnos-protocol.com`, the production API domain it lacks today (fact 3).

**Docs.** These lines describe the new trigger: `AGENTS.md:261-262`, and `DEPLOYMENT_GITHUB_ACTIONS.md:3`, `:28-30`, `:56`, `:71` and `:80`.

**Acceptance.**

- A push to a feature branch produces only skipped E2E runs.
- A `main` deployment runs the suite.
- A production deployment produces a skipped run and posts no E2E status on the release commit.
- A staging sync produces two skipped runs, one per server deployment (fact 4). This also closes the staging-exclusion proof left open by the September epic.
- `e2e.yml:67` names `api.ichnos-protocol.com`.

### PE2. One queue for the stable domains

**Why.** Fact 4, decision D2. All runs share one set of domains, one database and one set of test accounts. Overlapping runs corrupt each other's data, and cancelled runs lose evidence.

**Changes.**

- The workflow-level `concurrency` block and its comment (`e2e.yml:73-78`) are removed.
- The `e2e` job declares `concurrency` with `group: e2e-stable-domains` and `cancel-in-progress: false`, and no `queue` key. The comment above it states why the default queue is the right one (D2).

**Docs.** `AGENTS.md` "Test runs": a run ticket dispatches only when the group has no running or pending job, and records the check in `meta.md`.

**Acceptance.**

- A staging sync dispatched while a `main` run is in progress leaves that run running to completion. GitHub's documentation does not settle this case (fact 4). If it fails, the group takes `queue: max`, under which a skipped job waits its turn and ends skipped.
- Two `main` deployments in quick succession: the first run completes, then the second runs.
- A manual run dispatched while an automatic run is in progress waits, then runs.

### PE3. The alert locator and `/api/health`

**Why.** Facts 7 and 8, decision D5. The tests fail on a banner they do not test, and the banner appears because a health request waits for a rate-limit write and, on previews, for the seed.

**PE3a, test.** `AdminPage.alert` becomes the alert inside the `main` landmark: `page.getByRole("main").getByRole("alert")`. All six tests of fact 7 keep their assertions.

**PE3b, server.**

- `/api/health` is registered before `app.use("/api/", limiter)` (`server/src/app.js:61`), so no health request touches `rate_limit_hits`. `/api/auth` keeps both limiters, and every other `/api/` route keeps the global one.
- The handler starts `ensureSeeded()` without awaiting it. It keeps the function alive with `waitUntil`, as `chatController.js` does, and answers at once with the current `seedStatus`. The seed's guards, E2E-N2's migration gate and the idempotent seed queries are unchanged.
- The E2E readiness step (`e2e.yml:411-470`) needs no logic change. It already polls through `in_progress` until `seeded`, `skipped` or `failed`, 24 times, 5 seconds apart. Its comment now says that the first response from a new instance is normally `in_progress`.

**Tests.** The four seed-contract tests (`seedE2EOnPreview.test.js:361`) are rewritten for the new contract. New tests prove three things:

- the handler answers while the seed promise is still pending;
- a seed failure still reaches `seedStatus`;
- `/api/health` never calls the rate-limit repository, while another `/api/` route still does.

**Acceptance.**

- In the next automatic `main` run, the readiness step reports `seeded` before the tests start, and all six `AdminPage.alert` tests pass on their first attempt.
- A production `/api/health` response carries no `RateLimit` header. The limiter adds that header to every response it counts.

### PE4. Production smoke check

**Why.** Fact 3, decision D3. After PE1, a production deployment gets no automatic evidence at all, and the owner's post-release check was manual.

**Changes.**

- `/api/health` adds `commit: process.env.VERCEL_GIT_COMMIT_SHA ?? null`. The repository is public, so the SHA discloses nothing new.
- A new workflow, `.github/workflows/production-smoke.yml`, triggers on `repository_dispatch` `vercel.deployment.success`.
  - Its job runs for a server-project event whose `git.ref` is `release`, and validates the SHA and ref as `e2e.yml` does.
  - Its hosts come from a constant allowlist in the workflow: `ichnos-protocol.com` and `api.ichnos-protocol.com`.
  - Its permissions are `contents: read`, `deployments: read` and `statuses: write`.
- The workflow polls for up to ten minutes until two conditions hold:
  - `https://api.ichnos-protocol.com/api/health` reports the payload SHA as `commit`, `status` as `ok` and `environment` as `production`;
  - GitHub's deployments for the SHA include the client's production deployment (`Production – ichnos-protocol`), whose latest status is `success`.
- It then makes two further checks:
  - `/` on `https://ichnos-protocol.com` answers 200 with `text/html`;
  - each entry of the `redirects` block of `client/vercel.json`, read at the payload SHA through the contents API, answers 301 with its `destination` as `Location`.
- It posts `Production smoke` with `success` or `failure` on the payload SHA.
  - It uses no secret beyond `GITHUB_TOKEN`.
  - It sends no sign-in, no body and no request other than `GET` and `HEAD`.
- It takes effect only once it is on `main` (fact 2), so the epic must reach `main` before the release it is meant to check.

**Tests.** A server test for the `commit` field. If the redirect parsing lives in a helper script, that script gets a unit test.

**Acceptance.** The next production deployment posts `Production smoke: success` on its release commit, and posts no `E2E Tests (Playwright)` status.

### PE5. Neon cleanup through the integration

**Why.** Fact 10, decision D6. After PE1 no run exists for a feature branch, so the post-run cleanup could no longer free its Neon copy. The current key has also never worked.

**Owner, first (G2).** In the Neon console, open the project's Vercel integration settings and turn on "Automatically delete obsolete Neon branches" if it is off. If the setting is missing, PE5 stops here (D6).

**Changes.**

- The `Delete Neon preview branch` step and its comment block (`e2e.yml:507-522`) are removed.
- `e2e/scripts/cleanupNeonBranch.js`, `e2e/scripts/helpers/cleanupNeonBranch.js` and `e2e/scripts/helpers/cleanupNeonBranch.test.js` are deleted.
- `e2e/scripts/helpers/e2eFixedConfig.js` stays, because the provisioning modules import it. Its header comment (lines 6-8) stops naming the cleanup.
- `e2e/scripts/helpers/e2eTestAccountsRecord.js:33-34` and its test stop listing `NEON_API_KEY` and `NEON_PROJECT_ID`.

**Docs.** Each of these states that the Neon-managed integration deletes a preview branch after its git branch is deleted, and that no workflow deletes Neon branches:

- `AGENTS.md:302-307`;
- `DEPLOYMENT_GITHUB_ACTIONS.md:178-179`;
- `GITHUB_SETTINGS.md:140-151`, `:262` and `:314`;
- `VERCEL_SETTINGS.md:218-231` and `:242`.

**Acceptance.**

- Deleting a throwaway branch whose preview created `preview/<branch>` removes that Neon branch at the next preview deployment.
- `production`, `preview/main`, `preview/staging` and every branch outside the `preview/` prefix remain.

### PE6. Documentation follows reality

**Why.** Facts 6 and 9, decisions D4 and D7.

**Changes.**

- These lines are rewritten so that `main` requires `Client — Lint & Test` and `Server — Lint & Test`, and `release` requires `Release Policy Check`:
  - `DEPLOYMENT_GITHUB_ACTIONS.md:3`, `:28-30`, `:183-189` and `:209-210`;
  - `GITHUB_SETTINGS.md:17`, `:39-42`, `:174` and `:181-182`.
- `DEPLOYMENT_GITHUB_ACTIONS.md:144` stops telling anyone to set `VERCEL_AUTOMATION_BYPASS_SECRET` by hand in both projects' settings. The provisioning command sets it.
- `AGENTS.md:261-262` and the "Test runs" section reflect PE1, PE2 and PE4. `CLAUDE.md` stays aligned wherever it names E2E triggers.
- The staging lines of fact 9 state staging's data path (D7): `AGENTS.md:266`, `:300` and `:312`, and `VERCEL_SETTINGS.md:20` with §6 at lines 164, 183, 203, 235, 239, 246, 260 and 266. They say:
  - staging's client sends `/api` to `staging-api.ichnos-protocol.com`;
  - staging's server reads and writes its own copy of production, branched at the 2026-09-28 sync;
  - staging signs in against production Firebase;
  - `SKIP_E2E_SEED=true` keeps the seed and the migrations away;
  - QA writes land in the copy, not in production.

  The staging server's overrides number five, without `DATABASE_URL`.

**Acceptance.**

- `grep -ni "5 required checks\|required status check for merge\|only the server project emits" AGENTS.md DEPLOYMENT_GITHUB_ACTIONS.md GITHUB_SETTINGS.md` returns nothing.
- No staging line in `AGENTS.md` or `VERCEL_SETTINGS.md` says that staging uses the production database or the production server.

---

## 5. Owner gates and checks, no code

- **G1, security, now.** In the production Firebase project `ichnos-protocol`, open Authentication, then Users. Search for `ichnos-test.com` and delete any account found. The provisioning pipeline read production credentials before E2E-P1 locked it to `ichnos-protocol-test`, so such accounts may exist, two of them with admin claims.
- **G2, before PE5.** In the Neon console, open the project's Vercel integration settings and turn on "Automatically delete obsolete Neon branches". This is a setting, not a key (D6).
- **G3, after the next `main` deployment.** Check the Vercel function logs of `main`'s server preview. The first `/api/health` should show `[e2e-seed] ref main: applying pending migrations...`, then `[migration] skipping` for 000 to 011, then the seed queries. The Vercel API did not return these logs on 2026-09-29.
- **G4, for the September release.** A manual pass on staging or production:
  - consortium registration with an EU region shows EUR, and with an ASEAN region shows SGD;
  - the admin Consortium tab lists the registrant;
  - the chatbot answers.
- **G5, done on 2026-09-29.** The `VITE_API_HOST` entry in `ichnos-protocol` for Preview on branch `staging` is `staging-api.ichnos-protocol.com`, so staging's QA writes land in its own copy (fact 9, D7).

---

## 6. Out of scope, recorded with an owner

- **Production data in preview copies** (fact 11, D8). Owner. The options belong in their own spec: schema-only preview branches seeded with test data alone, or anonymised copies. Until then, Vercel deployment protection and the bypass secret are the only barrier in front of copies of real profiles.
- **True per-branch E2E**, meaning tests against a feature branch's own deployments and Neon copy. Owner, own spec. It needs per-deployment targets and a seed and migration path for every preview branch.
- **Unused configuration.** Owner. Deleting these is cleanup, not rotation:
  - fifteen GitHub secrets that no workflow reads;
  - `NEON_API_KEY` and `NEON_PROJECT_ID`, once PE5 lands;
  - six test-account entries in the server's Production environment variables (`E2E_ADMIN_EMAIL`, `E2E_ADMIN_UID`, `E2E_SUPER_ADMIN_EMAIL`, `E2E_SUPER_ADMIN_UID`, `E2E_USER_EMAIL`, `E2E_USER_UID`), which the seed never reads in production.
- **Each staging sync deploys each project twice.** Owner.
  - `sync-staging.yml` force-pushes with `SYNC_PAT`, then calls both deploy hooks, because its header says Vercel ignores pushes made with that token.
  - On 2026-09-29 the push was built as well (fact 4), so every sync sends two server events.
  - Dropping the hook calls would halve staging's builds and make `VERCEL_DEPLOY_HOOK_STAGING_CLIENT` and `VERCEL_DEPLOY_HOOK_STAGING_SERVER` unused.
- **`server/scripts/setupTestEnvironment.js` prints test passwords** to the console. Test tier and public pattern, so low risk; owner.

---

## 7. Questions Traycer is likely to ask

- **Why not keep feature-branch runs?** They test `main`'s previews with the branch's tests (fact 5), so their status describes code the branch did not deploy.
- **Why not run E2E against production?** The E2E suite signs in with test accounts and writes data. `AGENTS.md` keeps test accounts out of production, and `e2e.yml:65-67` refuses production hosts, completely once PE1 adds the API domain. PE4's smoke check is read-only.
- **Why job-level concurrency with the default queue?** A workflow-level group admits every dispatch, including events whose job is skipped. That is how a staging deployment cancelled a `main` run (fact 4). On the job, a skipped event never waits in the group, and `cancel-in-progress: false` protects the running job. The default queue lets only the newest pending run survive, and the newest `main` deployment is the only one the domains serve.
- **Does PE3b change what E2E-N2 guarantees?** No. The migration gate and the seed run in the same order inside the same promise. Only the health request stops waiting for them, and the readiness step still waits for `seeded`.
- **Is `/api/health` safe outside the limiter?** After PE3b it does no database work in production, takes no input and returns no secret. The limiter ran inside the same invocation, so it stopped no request from costing a function call. Leaving it removes a database write per request and protects nothing.
- **How does PE4 get its paths and redirects?** Redirects come from `client/vercel.json` at the payload commit, the file that defines them. The only page is `/`, because every path returns the same document (fact 12).
- **Are manual runs limited to `main`?** No (D1). A run from another ref proves only test changes, and the run ticket says which ref it used.
- **What if PE4's health poll never sees the new commit?** The check fails after ten minutes and posts `failure`. The owner then decides whether to use Vercel's instant rollback, which needs no database change for this release.
