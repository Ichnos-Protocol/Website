const GITHUB_VARIABLE_EXTRAS = [
  "FIREBASE_PROJECT_ID",
  "FIREBASE_AUTH_DOMAIN",
  "FIREBASE_STORAGE_BUCKET",
  "E2E_BASE_URL",
  "E2E_API_BASE_URL",
];

const GITHUB_SECRET_EXTRAS = ["FIREBASE_API_KEY", "E2E_SIGNUP_PASSWORD"];

// Firebase Auth rejects passwords shorter than this.
export const FIREBASE_MIN_PASSWORD_LENGTH = 6;

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

function roleWordsFor(passwordName) {
  const role = passwordName.slice("E2E_".length, -"_PASSWORD".length);
  return role.toLowerCase().split("_");
}

function emailTokens(email) {
  if (!email) return [];
  return email
    .toLowerCase()
    .split(/[^a-z0-9]+/i)
    .filter(Boolean);
}

function isOwnWordPlaceholder(value, words) {
  return words.includes(value.trim().toLowerCase());
}

/**
 * Names of the password variables whose value is a placeholder: shorter than
 * Firebase accepts, or equal to a word from the variable's own role name or
 * its own account email. Missing values are left to findMissingGitHubNames.
 * Returns names only, never a value or the matched word.
 */
export function findPlaceholderPasswordNames(values) {
  return passwordNames().filter((name) => {
    const value = values[name];
    if (!value) return false;
    if (value.length < FIREBASE_MIN_PASSWORD_LENGTH) return true;
    const emailName = name.replace(/_PASSWORD$/, "_EMAIL");
    const words = [...roleWordsFor(name), ...emailTokens(values[emailName])];
    return isOwnWordPlaceholder(value, words);
  });
}
