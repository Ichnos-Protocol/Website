/**
 * Structured error logger for the global Express error handler.
 *
 * Logs a single short "ERR_DIAG" tagged line that stays searchable in
 * Vercel's runtime log viewer, which truncates the Message column.
 * Keeps the full stack on a separate line for local development.
 */
export function logError(err) {
  console.error("Error:", err);
  console.error(
    "ERR_DIAG name:",
    err?.name,
    "code:",
    err?.code,
    "msg:",
    String(err?.message || "").slice(0, 500),
  );
  if (err?.cause) {
    console.error(
      "ERR_DIAG cause:",
      String(err.cause?.message || err.cause).slice(0, 500),
    );
  }
}
