import { describe, it, expect, vi } from "vitest";

import { fetchWebConfig } from "./e2eFirebaseWebConfig.js";

const PROJECT = "ichnos-protocol-test";
const API_KEY = "AIzaWebApiKeyValue0123456789";
const CONFIG = {
  projectId: PROJECT,
  apiKey: API_KEY,
  authDomain: `${PROJECT}.firebaseapp.com`,
  storageBucket: `${PROJECT}.firebasestorage.app`,
};

function lockedApp() {
  const getAccessToken = vi.fn(async () => ({ access_token: "ya29.token" }));
  return { options: { credential: { getAccessToken } } };
}

function json(body, ok = true, status = 200) {
  return { ok, status, json: async () => body };
}

// Routes the list pages and the config request; records every URL.
function fakeFetch({ pages, config = CONFIG }) {
  return vi.fn(async (url) => {
    if (url.endsWith("/config")) return json(config);
    const token = new URL(url).searchParams.get("pageToken") ?? "first";
    return json(pages[token]);
  });
}

describe("fetchWebConfig", () => {
  it("returns the three values for the one active web app, across pages", async () => {
    const fetchImpl = fakeFetch({
      pages: {
        first: {
          apps: [{ appId: "1:1:web:old", state: "DELETED" }],
          nextPageToken: "p2",
        },
        p2: { apps: [{ appId: "1:1:web:live", state: "ACTIVE" }] },
      },
    });

    const values = await fetchWebConfig({
      app: lockedApp(),
      projectId: PROJECT,
      fetchImpl,
    });

    expect(values).toEqual({
      FIREBASE_API_KEY: API_KEY,
      FIREBASE_AUTH_DOMAIN: CONFIG.authDomain,
      FIREBASE_STORAGE_BUCKET: CONFIG.storageBucket,
    });
    for (const [url, init] of fetchImpl.mock.calls) {
      expect(url).toContain(
        `https://firebase.googleapis.com/v1beta1/projects/${PROJECT}/webApps`,
      );
      expect(init.headers.Authorization).toBe("Bearer ya29.token");
    }
    expect(fetchImpl.mock.calls.at(-1)[0]).toContain(
      "/webApps/1%3A1%3Aweb%3Alive/config",
    );
  });

  it("refuses any project but the locked one before a request", async () => {
    const fetchImpl = vi.fn();
    const app = lockedApp();

    await expect(
      fetchWebConfig({ app, projectId: "ichnos-protocol", fetchImpl }),
    ).rejects.toThrowError(/locked to "ichnos-protocol-test"/);
    expect(fetchImpl).not.toHaveBeenCalled();
    expect(app.options.credential.getAccessToken).not.toHaveBeenCalled();
  });

  it.each([
    ["zero", []],
    [
      "two",
      [
        { appId: "1:1:web:a", state: "ACTIVE" },
        { appId: "1:1:web:b", state: "ACTIVE" },
      ],
    ],
  ])(
    "refuses %s active web apps, naming the count only",
    async (count, apps) => {
      const fetchImpl = fakeFetch({ pages: { first: { apps } } });

      const error = await fetchWebConfig({
        app: lockedApp(),
        projectId: PROJECT,
        fetchImpl,
      }).catch((err) => err);

      expect(error.message).toMatch(
        new RegExp(`exactly one active Firebase web app.*found ${apps.length}`),
      );
      expect(error.message).not.toContain("1:1:web");
      expect(
        fetchImpl.mock.calls.some(([url]) => url.endsWith("/config")),
      ).toBe(false);
    },
  );

  it("refuses a config naming another project without echoing the key", async () => {
    const fetchImpl = fakeFetch({
      pages: { first: { apps: [{ appId: "1:1:web:a", state: "ACTIVE" }] } },
      config: { ...CONFIG, projectId: "ichnos-protocol" },
    });

    const error = await fetchWebConfig({
      app: lockedApp(),
      projectId: PROJECT,
      fetchImpl,
    }).catch((err) => err);

    expect(error.message).toMatch(/names another project/);
    expect(error.message).not.toContain(API_KEY);
  });

  it("refuses a config missing a value", async () => {
    const fetchImpl = fakeFetch({
      pages: { first: { apps: [{ appId: "1:1:web:a", state: "ACTIVE" }] } },
      config: { ...CONFIG, storageBucket: "" },
    });

    await expect(
      fetchWebConfig({ app: lockedApp(), projectId: PROJECT, fetchImpl }),
    ).rejects.toThrowError(/lacks FIREBASE_STORAGE_BUCKET/);
  });

  it("names the failed request without the app id", async () => {
    const fetchImpl = vi.fn(async () => json({}, false, 403));

    await expect(
      fetchWebConfig({ app: lockedApp(), projectId: PROJECT, fetchImpl }),
    ).rejects.toThrowError(/web app list failed \(403\)/);
  });
});
