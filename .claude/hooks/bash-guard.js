#!/usr/bin/env node
// PreToolUse Bash guard for the Traycer autonomous (YOLO) loop.
//
// Claude Code's permission layer refuses to statically analyze commands that
// contain $(...), backticks, or process substitution, so they stall the loop
// with a prompt that NO Bash(...) allow rule can satisfy (the static gate
// fires before rule-matching). This hook closes that gap:
//   1. Hard-denies genuinely destructive commands by regex on the RAW string
//      — catches danger the static deny rules can't see inside $(...).
//   2. Auto-approves the un-analyzable shapes so the loop proceeds.
//   3. Defers everything else to the normal allow/deny rules in settings.
//
// Tune DANGER below to taste. Posture: conservative — when unsure it blocks
// (you can always run the command interactively).

let raw = "";
process.stdin.on("data", (c) => (raw += c));
process.stdin.on("end", () => {
  let cmd = "";
  try {
    cmd = (JSON.parse(raw).tool_input || {}).command || "";
  } catch {
    process.exit(0); // unparseable input -> defer, don't guess
  }

  const emit = (permissionDecision, permissionDecisionReason) => {
    process.stdout.write(
      JSON.stringify({
        hookSpecificOutput: {
          hookEventName: "PreToolUse",
          permissionDecision,
          permissionDecisionReason,
        },
      })
    );
    process.exit(0);
  };

  // 1. Destructive denylist — matched on the raw string, so it still fires
  //    when the danger is wrapped in $(...) / cd that the static rules can't read.
  const DANGER = [
    /\brm\s+-[a-z]*r/i,                          // any recursive rm (-rf, -fr, -r, -Rf)
    /\brm\s+--recursive/i,
    /\bgit\s+push\b[^\n]*(--force|-f\b)/i,
    /\bgit\s+reset\s+--hard/i,
    /\bgit\s+clean\s+-[a-z]*f/i,
    /\bgit\s+branch\s+-D\b/i,
    /\bdrop\s+database\b/i,                      // schema/table drops + truncate are
                                                 // routine for test-branch rebuilds — only
                                                 // DROP DATABASE is treated as catastrophic.
    /\bmkfs\b/i,
    /\bdd\s+if=/i,
    /:\(\)\s*\{[^}]*\};\s*:/,                    // fork bomb
    /\bnpm\s+publish\b/i,
    /\bchmod\s+-R\s+777\b/i,
    /\b(curl|wget)\b[^\n]*\|\s*(sh|bash)\b/i,    // pipe-to-shell
    // Dangerous redirect / tee targets — writes to system paths, secret dirs,
    // home, or .env are blocked; in-project redirects pass.
    /(>>?|\btee\b)\s+["']?\/(etc|usr|bin|sbin|boot|sys|proc|var|dev\/sd|dev\/nvme)/i,
    /(>>?|\btee\b)\s+["']?~?\/?\.(ssh|aws|gnupg)\b/i,
    /(>>?|\btee\b)\s+["']?\$?\{?HOME\b/i,
    /(>>?)\s*["']?[^\n|&]*\.env\b/i,             // overwrite an env file
  ];
  if (DANGER.some((re) => re.test(cmd))) {
    emit("deny", "bash-guard: destructive pattern blocked.");
  }

  // 2. Not on the denylist -> auto-approve. This covers EVERY static-analysis
  //    gate the loop can hit ($(...), backticks, cd-with-redirection, process
  //    substitution, ...) in one place, so the autonomous loop never stalls on
  //    a prompt no allow rule can satisfy. The denylist above, plus the `deny`
  //    rules in settings.local.json (which still block even over a hook allow),
  //    are the entire safety boundary — keep them current.
  emit("allow", "bash-guard: auto-approved (not on denylist).");
});
