import { readFileSync, writeFileSync } from "fs";
import { parse } from "dotenv";

const UID_KEY_PATTERN =
  /^(E2E_(?:ADMIN|USER|INCOMPLETE_USER|SUPER_ADMIN|MANAGE_ADMIN_TARGET)_UID)=[^#]*?(#.*)?$/;
const PASSWORD_KEY_PATTERN = /^E2E_\w+_PASSWORD$/;
// Group 2 keeps an inline comment with its exact separator, which may be empty
// ("old#note", '"old"#note'). A quoted value may hold "#"; an unquoted one ends at it.
const PASSWORD_LINE_PATTERN =
  /^(E2E_\w+_PASSWORD)=(?:"[^"]*"|'[^']*'|[^#]*?)(\s*#.*)?$/;

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

export function writeUidsToEnvFile(filePath, uidMap) {
  const content = readFileSync(filePath, "utf8");
  const lines = content.split("\n");

  const updated = lines.map((line) => {
    const match = line.match(UID_KEY_PATTERN);
    if (match && uidMap[match[1]] !== undefined) {
      const comment = match[2] ? ` ${match[2]}` : "";
      return `${match[1]}=${uidMap[match[1]]}${comment}`;
    }
    return line;
  });

  writeFileSync(filePath, updated.join("\n"), "utf8");
}

function replacePasswordLines(lines, passwordMap, written) {
  return lines.map((line) => {
    const match = line.match(PASSWORD_LINE_PATTERN);
    if (!match || passwordMap[match[1]] === undefined) return line;
    written.add(match[1]);
    return `${match[1]}=${passwordMap[match[1]]}${match[2] ?? ""}`;
  });
}

/** Replace or append E2E_*_PASSWORD lines; every other line is kept verbatim. */
export function writePasswordsToEnvFile(filePath, passwordMap) {
  const content = readFileSync(filePath, "utf8");
  const written = new Set();
  const lines = content.split("\n");
  const updated = replacePasswordLines(lines, passwordMap, written);
  while (updated.length > 0 && updated[updated.length - 1] === "") {
    updated.pop();
  }
  for (const [key, value] of Object.entries(passwordMap)) {
    if (!written.has(key)) updated.push(`${key}=${value}`);
  }
  writeFileSync(filePath, `${updated.join("\n")}\n`, "utf8");
}

export function maskValue(value) {
  if (!value || value.length < 4) return "****";
  return "****" + value.slice(-4);
}
