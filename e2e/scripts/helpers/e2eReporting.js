export function printFailedDetails(platform, results) {
  const failed = results.filter((r) => r.status === "failed");
  if (failed.length === 0) return;
  console.error(
    `\n[error] ${platform} sync failed for ${failed.length} variable(s):`,
  );
  for (const r of failed) {
    const detail = r.error
      ? r.error.trim().split("\n")[0].slice(0, 200)
      : "unknown error";
    console.error(`  - ${r.name}: ${detail}`);
  }
  console.error("Fix the issue(s) above and re-run.");
}

function printSection(label, results) {
  console.log(`\n  ${label}:`);
  for (const r of results) {
    console.log(
      `    ${r.name.padEnd(30)} ${r.status.padEnd(10)} ${r.masked ?? r.value}`,
    );
    if (r.status === "failed" && r.error) {
      const sanitized = r.error.trim().split("\n")[0].slice(0, 200);
      console.log(`      error: ${sanitized}`);
    }
  }
}

export function printSummary(ghResults, vcResults, varResults = []) {
  console.log("\n--- E2E Credential Sync Summary ---");
  if (varResults.length > 0)
    printSection("GitHub Actions Variables", varResults);
  printSection("GitHub Actions Secrets", ghResults);
  printSection("Vercel Preview Env Vars", vcResults);
  console.log("");
}

/** Project, matched host and outcome of each redeploy; no value is printed. */
export function printRedeploys(redeploys = []) {
  console.log("\n  Redeployments:");
  if (redeploys.length === 0) {
    console.log("    none: no project's Preview env changed");
    return;
  }
  for (const r of redeploys) {
    const detail = r.status === "failed" ? `  ${r.reason}` : "";
    console.log(
      `    ${r.project.padEnd(30)} ${r.host.padEnd(40)} ${r.status}${detail}`,
    );
  }
}

/** The bypass outcome; the value prints as **** with no tail. */
export function printBypass(bypass) {
  console.log("\n  Vercel Automation Bypass:");
  if (!bypass?.rotated) {
    console.log("    not rotated by this run");
    return;
  }
  for (const r of bypass.results) {
    const state = r.confirmed
      ? `confirmed, ${r.revoked} revoked, ${r.preserved} other kept`
      : `failed: ${r.reason}`;
    console.log(`    ${r.project.padEnd(30)} **** ${state}`);
  }
  const github = bypass.githubConfirmed ? "set" : "not set";
  console.log(`    ${"GitHub secret".padEnd(30)} **** ${github}`);
}
