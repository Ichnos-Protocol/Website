import { describe, it, expect } from "vitest";

import {
  buildErrorResponse,
  GENERIC_ERROR_MESSAGE,
} from "./buildErrorResponse.js";

function makeError({ statusCode, message = "Something broke", code } = {}) {
  const err = new Error(message);
  if (statusCode !== undefined) err.statusCode = statusCode;
  if (code !== undefined) err.code = code;
  return err;
}

const LOCAL_DEV = { NODE_ENV: "development" };
const PREVIEW = { NODE_ENV: "development", VERCEL: "1" };
const PROD = { NODE_ENV: "production", VERCEL: "1" };

describe("buildErrorResponse", () => {
  it.each([
    {
      name: "500 on Vercel development: generic, no stack",
      err: makeError({ statusCode: 500, message: "db exploded" }),
      env: PREVIEW,
      expected: { statusCode: 500, message: GENERIC_ERROR_MESSAGE },
      expectedError: GENERIC_ERROR_MESSAGE,
      hasStack: false,
    },
    {
      name: "400 on Vercel development: message kept, no stack",
      err: makeError({ statusCode: 400, message: "Bad input" }),
      env: PREVIEW,
      expected: { statusCode: 400, message: "Bad input" },
      expectedError: "Bad input",
      hasStack: false,
    },
    {
      name: "400 in local development: message kept, stack present",
      err: makeError({ statusCode: 400, message: "Bad input" }),
      env: LOCAL_DEV,
      expected: { statusCode: 400, message: "Bad input" },
      expectedError: "Bad input",
      hasStack: true,
    },
    {
      name: "500 with empty VERCEL: generic, stack present",
      err: makeError({ statusCode: 500 }),
      env: { NODE_ENV: "development", VERCEL: "" },
      expected: { statusCode: 500, message: GENERIC_ERROR_MESSAGE },
      expectedError: GENERIC_ERROR_MESSAGE,
      hasStack: true,
    },
    {
      name: "500 in production: generic, no stack",
      err: makeError({ statusCode: 500 }),
      env: { NODE_ENV: "production" },
      expected: { statusCode: 500, message: GENERIC_ERROR_MESSAGE },
      expectedError: GENERIC_ERROR_MESSAGE,
      hasStack: false,
    },
    {
      name: "503 with own code: status kept, generic",
      err: makeError({
        statusCode: 503,
        message: "xAI API unavailable",
        code: "XAI_DOWN",
      }),
      env: PROD,
      expected: { statusCode: 503, message: GENERIC_ERROR_MESSAGE },
      expectedError: GENERIC_ERROR_MESSAGE,
      hasStack: false,
    },
    {
      name: "no statusCode: 500, generic",
      err: makeError(),
      env: PROD,
      expected: { statusCode: 500, message: GENERIC_ERROR_MESSAGE },
      expectedError: GENERIC_ERROR_MESSAGE,
      hasStack: false,
    },
  ])("$name", ({ err, env, expected, expectedError, hasStack }) => {
    const { statusCode, body } = buildErrorResponse(err, env);

    expect(statusCode).toBe(expected.statusCode);
    expect(body.data).toBeNull();
    expect(body.message).toBe(expected.message);
    expect(body.error).toBe(expectedError);
    expect(Object.prototype.hasOwnProperty.call(body, "stack")).toBe(hasStack);
  });

  it("does not leak a Postgres code or column name on a 500", () => {
    const err = makeError({
      statusCode: 500,
      message: 'column "consortium_interest" does not exist',
      code: "42703",
    });

    const { body } = buildErrorResponse(err, PROD);
    const serialized = JSON.stringify(body);

    expect(serialized).not.toContain("42703");
    expect(serialized).not.toContain("consortium_interest");
  });

  it("keeps a validation issue array as the error reason on a 400", () => {
    const issues = [
      { path: "email", message: "Invalid email" },
      { path: "name", message: "Required" },
    ];
    const err = makeError({
      statusCode: 400,
      message: "Validation failed",
      code: issues,
    });

    const { body } = buildErrorResponse(err, PROD);

    expect(body.error).toEqual(issues);
    expect(body.message).toBe("Validation failed");
  });
});
