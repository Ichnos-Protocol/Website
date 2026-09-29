/**
 * The E2E project's public Firebase web config, read from the Firebase
 * Management REST API (v1beta1). firebase-admin 13.7.0's project-management
 * module covers Android and iOS apps only, so the request is authenticated by
 * an access token minted from the locked admin app's own credential; its
 * scopes include cloud-platform. The project lock is checked before any call.
 * No thrown message carries an app id or a config value.
 */
import { assertE2EProjectId } from "./e2eFirebaseCredentials.js";

const MANAGEMENT_API = "https://firebase.googleapis.com/v1beta1";
const WEB_CONFIG_FIELDS = {
  FIREBASE_API_KEY: "apiKey",
  FIREBASE_AUTH_DOMAIN: "authDomain",
  FIREBASE_STORAGE_BUCKET: "storageBucket",
};

async function getJson(fetchImpl, url, token, label) {
  const response = await fetchImpl(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    throw new Error(
      `Firebase Management API ${label} failed (${response.status}).`,
    );
  }
  return response.json();
}

async function listWebApps(fetchImpl, projectId, token) {
  const apps = [];
  let pageToken;
  do {
    const query = pageToken
      ? `?pageToken=${encodeURIComponent(pageToken)}`
      : "";
    const url = `${MANAGEMENT_API}/projects/${projectId}/webApps${query}`;
    const page = await getJson(fetchImpl, url, token, "web app list");
    apps.push(...(page.apps ?? []));
    pageToken = page.nextPageToken;
  } while (pageToken);
  return apps;
}

function selectActiveApp(apps, projectId) {
  const active = apps.filter((app) => app?.state !== "DELETED");
  if (active.length === 1) return active[0];
  throw new Error(
    `Expected exactly one active Firebase web app in ${projectId}, found ${active.length}.\n` +
      "Remediation: keep exactly one web app in the Firebase console (Project settings → Your apps), then re-run.",
  );
}

function pickWebConfig(config, projectId) {
  if (config?.projectId !== projectId) {
    throw new Error(
      `The Firebase web config names another project, not ${projectId}. Nothing was written.`,
    );
  }
  const values = Object.fromEntries(
    Object.entries(WEB_CONFIG_FIELDS).map(([name, field]) => [
      name,
      config[field],
    ]),
  );
  const missing = Object.keys(values).filter((name) => !values[name]);
  if (missing.length > 0) {
    throw new Error(`The Firebase web config lacks ${missing.join(", ")}.`);
  }
  return values;
}

/** { FIREBASE_API_KEY, FIREBASE_AUTH_DOMAIN, FIREBASE_STORAGE_BUCKET }. */
export async function fetchWebConfig({ app, projectId, fetchImpl = fetch }) {
  assertE2EProjectId(projectId);
  const { access_token: token } = await app.options.credential.getAccessToken();
  const apps = await listWebApps(fetchImpl, projectId, token);
  const { appId } = selectActiveApp(apps, projectId);
  const url = `${MANAGEMENT_API}/projects/${projectId}/webApps/${encodeURIComponent(appId)}/config`;
  const config = await getJson(fetchImpl, url, token, "web config");
  return pickWebConfig(config, projectId);
}
