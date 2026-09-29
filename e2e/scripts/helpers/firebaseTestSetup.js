/**
 * Create or update Firebase Auth users for E2E testing.
 *
 * Exports:
 *   - provisionFirebaseUsers(credentialsArray, adminCredentials?) — general-purpose provisioning
 *   - setupFirebaseTestUsers() — backward-compatible wrapper (reads process.env)
 *   - getTestApp(credentials?) — the one admin app, built from explicit
 *     credentials or, without them, from process.env. Refuses any project other
 *     than E2E_FIREBASE_PROJECT_ID before a cached app is returned or a new one
 *     is initialized.
 *   - upsertUser(auth, spec) — create or update one user and set its claims
 *
 * Returns { userUid, adminUid, superAdminUid }.
 */
import admin from "firebase-admin";

import { assertE2EProjectId } from "./e2eFirebaseCredentials.js";

const TEST_APP_NAME = "test-setup";

const USER_SPECS = [
  {
    envEmail: "E2E_USER_EMAIL",
    envPassword: "E2E_USER_PASSWORD",
    displayName: "E2E Test User",
    claims: {},
    uidKey: "userUid",
  },
  {
    envEmail: "E2E_ADMIN_EMAIL",
    envPassword: "E2E_ADMIN_PASSWORD",
    displayName: "E2E Admin",
    claims: { admin: true },
    uidKey: "adminUid",
  },
  {
    envEmail: "E2E_SUPER_ADMIN_EMAIL",
    envPassword: "E2E_SUPER_ADMIN_PASSWORD",
    displayName: "E2E Super Admin",
    claims: { admin: true, superAdmin: true },
    uidKey: "superAdminUid",
  },
  {
    envEmail: "E2E_MANAGE_ADMIN_TARGET_EMAIL",
    envPassword: "E2E_MANAGE_ADMIN_TARGET_PASSWORD",
    displayName: "E2E Manage-Admin Target",
    claims: {},
    uidKey: "manageAdminTargetUid",
  },
];

function credentialsFromEnv() {
  return {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  };
}

export function getTestApp(credentials) {
  const { projectId, clientEmail, privateKey, storageBucket } =
    credentials ?? credentialsFromEnv();
  assertE2EProjectId(projectId);

  const existing = admin.apps.find((a) => a.name === TEST_APP_NAME);
  if (existing) return existing;

  return admin.initializeApp(
    {
      credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
      ...(storageBucket ? { storageBucket } : {}),
    },
    TEST_APP_NAME,
  );
}

export async function upsertUser(auth, spec) {
  const { email, password, displayName, claims } = spec;
  let user;

  try {
    user = await auth.getUserByEmail(email);
    await auth.updateUser(user.uid, { password, displayName });
    console.log(`[firebase] updated: ${email}`);
  } catch (err) {
    if (err.code !== "auth/user-not-found") throw err;
    user = await auth.createUser({ email, password, displayName });
    console.log(`[firebase] created: ${email}`);
  }

  await auth.setCustomUserClaims(user.uid, claims);
  return user.uid;
}

export async function provisionFirebaseUsers(
  credentialsArray,
  adminCredentials,
) {
  const app = getTestApp(adminCredentials);
  const auth = app.auth();
  const result = {};

  for (const spec of credentialsArray) {
    result[spec.uidKey] = await upsertUser(auth, spec);
  }

  console.log("[firebase] all test users ready");
  return result;
}

export async function setupFirebaseTestUsers() {
  const credentialsArray = USER_SPECS.filter(
    (spec) => process.env[spec.envEmail],
  ).map((spec) => ({
    email: process.env[spec.envEmail],
    password: process.env[spec.envPassword],
    displayName: spec.displayName,
    claims: spec.claims,
    uidKey: spec.uidKey,
  }));

  return provisionFirebaseUsers(credentialsArray);
}
