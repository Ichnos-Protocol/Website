/**
 * Migration gate for the preview E2E seed. Only the `main` preview migrates
 * its database; staging and feature previews leave the schema alone.
 */
import { runMigrations } from "../runMigrations.js";
import { buildSslOption } from "./previewDbConnection.js";

// Mirrors E2E_GIT_BRANCH in e2e/scripts/helpers/e2eFixedConfig.js: the branch
// whose previews back the E2E domains. The server cannot import from e2e/.
export const MAIN_PREVIEW_BRANCH = "main";

/**
 * Apply every unrecorded migration when this preview was built from
 * MAIN_PREVIEW_BRANCH. Errors propagate so the caller's retry logic owns them.
 */
export async function applyPreviewMigrations(dbUrl) {
  const ref = process.env.VERCEL_GIT_COMMIT_REF;
  if (ref !== MAIN_PREVIEW_BRANCH) {
    console.log(
      `[e2e-seed] migrations are not run for ref ${ref || "(unset)"}`,
    );
    return;
  }
  console.log(`[e2e-seed] ref ${ref}: applying pending migrations...`);
  await runMigrations(dbUrl, { ssl: buildSslOption(dbUrl) });
}
