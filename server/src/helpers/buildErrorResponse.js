import { formatResponse } from "./formatResponse.js";

export const GENERIC_ERROR_MESSAGE = "Internal Server Error";

function shouldIncludeStack(env) {
  return env.NODE_ENV === "development" && !env.VERCEL;
}

/**
 * Builds the status code and { data, error, message } body the global error
 * handler sends for a thrown error.
 *
 * Three rules:
 * - The status is unchanged: `err.statusCode`, or 500 when it is absent.
 * - A status of 500 or more returns only GENERIC_ERROR_MESSAGE as both
 *   `message` and `error`, because `err.message` and `err.code` can carry
 *   database and vendor detail (a Postgres column name, an SQLSTATE code).
 *   Below 500, the error's own message and code (or validator issue array)
 *   pass through as before.
 * - The stack is added only in local development. `VERCEL` is checked as well
 *   as `NODE_ENV`, because Preview deployments still run
 *   `NODE_ENV=development`.
 *
 * `env` is injected so the helper never reads `process.env` and stays pure.
 *
 * @param {Error & { statusCode?: number, code?: unknown }} err - thrown error
 * @param {{ NODE_ENV?: string, VERCEL?: string }} env - runtime environment
 * @returns {{ statusCode: number, body: object }} response status and body
 */
export function buildErrorResponse(err, env) {
  const statusCode = err.statusCode || 500;
  const isServerError = statusCode >= 500;
  const message = isServerError
    ? GENERIC_ERROR_MESSAGE
    : err.message || GENERIC_ERROR_MESSAGE;
  const error = isServerError
    ? GENERIC_ERROR_MESSAGE
    : err.code || err.message || GENERIC_ERROR_MESSAGE;

  const body = {
    ...formatResponse(null, message, error),
    ...(shouldIncludeStack(env) && { stack: err.stack }),
  };
  return { statusCode, body };
}
