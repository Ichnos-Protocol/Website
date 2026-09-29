import { existsSync, readFileSync, writeFileSync } from "fs";
import { parse } from "dotenv";

import { envFileNames } from "./e2eCredentials.js";

const PASSWORD_KEY_PATTERN = /^E2E_\w+_PASSWORD$/;
// Not derivable from code: carried over from an earlier file (P2c supplies them).
const PRESERVED_WEB_CONFIG_NAMES = [
  "FIREBASE_API_KEY",
  "FIREBASE_AUTH_DOMAIN",
  "FIREBASE_STORAGE_BUCKET",
];

export function readEnvFile(filePath) {
  const content = readFileSync(filePath, "utf8");
  return parse(content);
}

/**
 * Snapshot the non-empty E2E_*_PASSWORD values exported in the shell.
 * Taken once at startup so later process.env writes cannot become overrides.
 */
export function captureExportedPasswords(source = process.env) {
  const snapshot = {};
  for (const key of Object.keys(source)) {
    if (PASSWORD_KEY_PATTERN.test(key) && source[key]) {
      snapshot[key] = source[key];
    }
  }
  return snapshot;
}

/**
 * Merge an explicit startup snapshot of exported E2E_*_PASSWORD values into a
 * file-parsed env object. Snapshot values take precedence over file values.
 */
export function mergeEnvPasswords(fileEnv, exportedPasswords = {}) {
  const merged = { ...fileEnv };
  for (const [key, value] of Object.entries(exportedPasswords)) {
    if (PASSWORD_KEY_PATTERN.test(key) && value) merged[key] = value;
  }
  return merged;
}

/** The public web-config values an earlier file supplied; {} without a file. */
export function readPreservedWebConfig(filePath) {
  if (!existsSync(filePath)) return {};
  const env = readEnvFile(filePath);
  return Object.fromEntries(
    PRESERVED_WEB_CONFIG_NAMES.filter((name) => env[name]).map((name) => [
      name,
      env[name],
    ]),
  );
}

/** YYYY-MM-DD of the given instant, in UTC. */
export function utcDate(now) {
  return now.toISOString().slice(0, 10);
}

/**
 * The whole generated e2e/.env.e2e: a header naming the UTC date and the exact
 * command, then one NAME=value line per envFileNames() entry, in that order.
 */
export function buildEnvFileContent(values, { command, now }) {
  const header = [
    `# Generated on ${utcDate(now)} (UTC) by: ${command}`,
    "# Generated file: do not edit by hand. Re-run the command above to change it.",
  ];
  const lines = envFileNames().map((name) => `${name}=${values[name] ?? ""}`);
  return `${[...header, ...lines].join("\n")}\n`;
}

export function writeEnvFile(filePath, values, { command, now }) {
  writeFileSync(
    filePath,
    buildEnvFileContent(values, { command, now }),
    "utf8",
  );
}

export function maskValue(value) {
  if (!value || value.length < 4) return "****";
  return "****" + value.slice(-4);
}
