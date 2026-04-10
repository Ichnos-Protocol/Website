/**
 * Firebase Admin SDK Singleton
 *
 * Uses a global reference to maintain a single Admin instance across
 * Vercel serverless invocations. On warm starts the existing instance
 * is reused, avoiding repeated initialization overhead.
 */
import admin from "firebase-admin";

function resolveStorageBucket() {
  const explicit = process.env.FIREBASE_STORAGE_BUCKET;
  if (explicit) return explicit;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  if (projectId) return `${projectId}.appspot.com`;

  throw new Error(
    "FIREBASE_STORAGE_BUCKET is not set and FIREBASE_PROJECT_ID is unavailable to derive it.",
  );
}

function normalizePrivateKey(raw) {
  return raw?.replace(/\\n/g, "\n");
}

function describePrivateKey(raw) {
  if (!raw) return { present: false };
  const normalized = normalizePrivateKey(raw);
  return {
    present: true,
    rawLength: raw.length,
    normalizedLength: normalized.length,
    containsLiteralBackslashN: raw.includes("\\n"),
    containsRealNewline: raw.includes("\n"),
    startsWithPemHeader: normalized.startsWith("-----BEGIN PRIVATE KEY-----"),
    endsWithPemFooter: normalized
      .trimEnd()
      .endsWith("-----END PRIVATE KEY-----"),
  };
}

function logFirebaseDiagnostics() {
  console.log("FIREBASE_DIAG project_id:", process.env.FIREBASE_PROJECT_ID);
  console.log("FIREBASE_DIAG client_email:", process.env.FIREBASE_CLIENT_EMAIL);
  console.log(
    "FIREBASE_DIAG storage_bucket:",
    process.env.FIREBASE_STORAGE_BUCKET,
  );
  console.log(
    "FIREBASE_DIAG private_key:",
    JSON.stringify(describePrivateKey(process.env.FIREBASE_PRIVATE_KEY)),
  );
}

if (!globalThis.__firebaseAdmin) {
  logFirebaseDiagnostics();
  const storageBucket = resolveStorageBucket();
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: normalizePrivateKey(process.env.FIREBASE_PRIVATE_KEY),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      }),
      storageBucket,
    });

    globalThis.__firebaseAdmin = admin;
  } catch (error) {
    console.error("FIREBASE_DIAG init_failed:", error.message);
    console.error("Firebase Admin SDK initialization failed:", error.message);
    throw error;
  }
}

if (!globalThis.__firebaseStorage && globalThis.__firebaseAdmin) {
  const storageBucket = resolveStorageBucket();
  try {
    globalThis.__firebaseStorage = globalThis.__firebaseAdmin
      .storage()
      .bucket(storageBucket);
  } catch (error) {
    console.error("Firebase Storage initialization failed:", error.message);
    throw error;
  }
}

const firebaseAdmin = globalThis.__firebaseAdmin;
export const storage = globalThis.__firebaseStorage;

export default firebaseAdmin;
