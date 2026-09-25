const GITHUB_VARIABLE_EXTRAS = [
  "FIREBASE_PROJECT_ID",
  "FIREBASE_AUTH_DOMAIN",
  "FIREBASE_STORAGE_BUCKET",
  "E2E_BASE_URL",
  "E2E_API_BASE_URL",
];

const GITHUB_SECRET_EXTRAS = ["FIREBASE_API_KEY", "E2E_SIGNUP_PASSWORD"];

// Firebase Auth rejects passwords shorter than this, so a shorter role word is
// written twice to form its pattern password.
export const FIREBASE_MIN_PASSWORD_LENGTH = 6;

// Every role email's local part begins with this prefix; the rest is the role word.
const ROLE_EMAIL_PREFIX = "e2e-";

const SIGNUP_PASSWORD_NAME = "E2E_SIGNUP_PASSWORD";
const SIGNUP_PASSWORD_VALUE = "signup";

export const ROLES = [
  { key: "ADMIN", name: "E2E Admin", claims: { admin: true } },
  { key: "USER", name: "E2E Test User", claims: {} },
  { key: "INCOMPLETE_USER", name: "E2E Incomplete User", claims: {} },
  {
    key: "SUPER_ADMIN",
    name: "E2E Super Admin",
    claims: { admin: true, superAdmin: true },
  },
  { key: "MANAGE_ADMIN_TARGET", name: "E2E Manage-Admin Target", claims: {} },
];

function githubVariableNames() {
  const roleNames = ROLES.flatMap((r) => [
    `E2E_${r.key}_EMAIL`,
    `E2E_${r.key}_UID`,
  ]);
  return [...GITHUB_VARIABLE_EXTRAS, ...roleNames];
}

function githubSecretNames() {
  return [
    ...ROLES.map((r) => `E2E_${r.key}_PASSWORD`),
    ...GITHUB_SECRET_EXTRAS,
  ];
}

/** The five role passwords, then E2E_SIGNUP_PASSWORD. */
export function passwordNames() {
  return githubSecretNames().filter((name) => name.endsWith("_PASSWORD"));
}

function buildGitHubVariables(env) {
  return Object.fromEntries(
    githubVariableNames().map((name) => [name, env[name]]),
  );
}

export function buildCredentialMaps(env) {
  const github = {};
  const vercel = {};
  const firebaseCreds = [];

  for (const role of ROLES) {
    const email = env[`E2E_${role.key}_EMAIL`];
    if (!email) continue;
    const password = env[`E2E_${role.key}_PASSWORD`];
    const uid = env[`E2E_${role.key}_UID`];

    github[`E2E_${role.key}_PASSWORD`] = password;
    vercel[`E2E_${role.key}_EMAIL`] = email;
    vercel[`E2E_${role.key}_UID`] = uid;

    firebaseCreds.push({
      email,
      password,
      displayName: role.name,
      claims: role.claims,
      uidKey: `E2E_${role.key}_UID`,
    });
  }

  for (const name of GITHUB_SECRET_EXTRAS) {
    if (env[name]) github[name] = env[name];
  }

  return {
    github,
    githubVariables: buildGitHubVariables(env),
    vercel,
    firebaseCreds,
  };
}

export function findMissingGitHubNames(values) {
  return [...githubVariableNames(), ...githubSecretNames()].filter(
    (name) => !values[name],
  );
}

function emailNameFor(passwordName) {
  return passwordName.replace(/_PASSWORD$/, "_EMAIL");
}

// The role word after the e2e- prefix, taken verbatim, or null when the local
// part does not begin exactly with the lowercase prefix or names no role after
// it. No trimming or case folding: " e2e-x" and "E2E-x" are refused.
function roleWordOf(email) {
  const localPart = email.split("@")[0];
  if (!localPart.startsWith(ROLE_EMAIL_PREFIX)) return null;
  const word = localPart.slice(ROLE_EMAIL_PREFIX.length);
  return word || null;
}

/**
 * The pattern password for one password variable: the role word from its
 * account email (after the e2e- prefix), written twice when shorter than
 * Firebase accepts. E2E_SIGNUP_PASSWORD has a fixed value. Returns undefined
 * when the email is missing; throws, naming variables only, when the email
 * does not follow the e2e-<role> form.
 */
export function expectedPasswordFor(passwordName, values) {
  if (passwordName === SIGNUP_PASSWORD_NAME) return SIGNUP_PASSWORD_VALUE;
  const emailName = emailNameFor(passwordName);
  const email = values[emailName];
  if (!email) return undefined;
  const word = roleWordOf(email);
  if (!word) {
    throw new Error(
      `${emailName} must begin with "${ROLE_EMAIL_PREFIX}" and name a role after it ` +
        `(needed to derive ${passwordName}). Nothing was changed.`,
    );
  }
  return word.length < FIREBASE_MIN_PASSWORD_LENGTH ? word + word : word;
}

/** Email variable names whose non-empty value is not of the e2e-<role> form. */
export function findInvalidRoleEmailNames(values) {
  return ROLES.map((r) => `E2E_${r.key}_EMAIL`).filter(
    (name) => Boolean(values[name]) && roleWordOf(values[name]) === null,
  );
}

/** Every derivable pattern password, keyed in passwordNames() order. */
export function patternPasswords(values) {
  const passwords = {};
  for (const name of passwordNames()) {
    const expected = expectedPasswordFor(name, values);
    if (expected !== undefined) passwords[name] = expected;
  }
  return passwords;
}

/**
 * Names of the password variables whose non-empty value differs from its
 * pattern password. Missing values, and names whose email is missing or
 * invalid, are skipped. Returns names only, never a value.
 */
export function findPasswordMismatchNames(values) {
  const invalidEmails = findInvalidRoleEmailNames(values);
  return passwordNames().filter((name) => {
    const value = values[name];
    if (!value || invalidEmails.includes(emailNameFor(name))) return false;
    const expected = expectedPasswordFor(name, values);
    return expected !== undefined && value !== expected;
  });
}
