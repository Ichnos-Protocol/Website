/**
 * Test support only: a fake `run` for the Vercel CLI that reproduces how
 * Vercel CLI 50.35.0 scopes a request, so tests see the CLI's behaviour and
 * not just its argv.
 *
 * - `vercel api` with no --scope appends the CLI's currentTeam as teamId.
 * - `--scope <team id or slug>` replaces currentTeam with that team.
 * - `--scope <user id, username or email>` clears currentTeam for a legacy
 *   account; a Northstar account refuses it and exits 1.
 * - `vercel whoami` and `vercel teams ls` read with no team applied.
 * - `vercel api` prints an HTTP error as a JSON body and exits 0.
 *
 * `projects` maps an owner id (a team id, or the user id for the personal
 * account) to { name: project body }.
 */
const NORTHSTAR_REFUSAL =
  "Error: You cannot set your Personal Account as the scope.\n";
const UNKNOWN_SCOPE = "Error: The specified scope does not exist\n";

function ok(body) {
  return { status: 0, stdout: `${JSON.stringify(body)}\n`, stderr: "" };
}

function flagValue(args, flag) {
  const at = args.indexOf(flag);
  return at >= 0 ? args[at + 1] : undefined;
}

export function createFakeVercelCli({
  user,
  teams = [],
  currentTeam = null,
  projects = {},
}) {
  const calls = [];
  const requests = [];
  const northstar = user.version === "northstar";

  function resolveTeam(scope) {
    if (scope === undefined) return { teamId: currentTeam };
    if ([user.id, user.username, user.email].includes(scope)) {
      return northstar ? { refusal: NORTHSTAR_REFUSAL } : { teamId: null };
    }
    const team = teams.find((t) => t.id === scope || t.slug === scope);
    return team ? { teamId: team.id } : { refusal: UNKNOWN_SCOPE };
  }

  function listTeams() {
    const listed = teams.map(({ id, slug, name }) => ({ id, slug, name }));
    if (!northstar) listed.unshift({ id: user.id, slug: user.username });
    return ok({ teams: listed, pagination: { count: listed.length } });
  }

  function respond(path, teamId) {
    if (path === "/v2/user") return { user };
    if (path.startsWith("/v2/teams")) {
      return { teams, pagination: { count: teams.length, next: null } };
    }
    const name = decodeURIComponent(path.replace("/v9/projects/", ""));
    return (
      projects[teamId ?? user.id]?.[name] ?? {
        error: { code: "not_found", message: "Project not found" },
      }
    );
  }

  function run(args) {
    calls.push(args);
    const resolved = resolveTeam(flagValue(args, "--scope"));
    if (resolved.refusal) {
      return { status: 1, stdout: "", stderr: resolved.refusal };
    }
    if (args[0] === "whoami") {
      return ok({ username: user.username, email: user.email, name: null });
    }
    if (args[0] === "teams") return listTeams();
    const [, path] = args;
    const method = flagValue(args, "-X");
    requests.push({ path, method, teamId: resolved.teamId, args });
    return ok(respond(path, resolved.teamId));
  }

  return { run, calls, requests };
}
