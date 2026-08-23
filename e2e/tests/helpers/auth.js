import { expect } from '@playwright/test';
import { waitForAppReady, TIMEOUTS } from './app.js';
import { ADMIN, USER, SUPER_ADMIN } from './credentials.js';
import { AuthPage } from '../pages/AuthPage.js';
import { setupFirebaseProxy } from './firebase-proxy.js';
import { setupAutoModalDismiss, dismissProfileModalIfVisible } from './profile-modal.js';

export async function loginAs(page, email, password) {
  // Set up Firebase API proxy on the context to bypass CORS issues in CI.
  // Uses a context-level flag to avoid duplicate route registration.
  const context = page.context();
  if (!context.__firebaseProxyReady) {
    await setupFirebaseProxy(context);
    context.__firebaseProxyReady = true;
  }

  // Register the auto-dismiss handler BEFORE any navigation so it covers
  // the profile modal appearing both during login and on subsequent page
  // loads (e.g. when tests navigate to /contact after loginAsUser).
  await setupAutoModalDismiss(page);

  const auth = new AuthPage(page);
  await waitForAppReady(page, '/');
  await auth.openLoginModal();
  await expect(auth.welcomeBackText).toBeVisible();
  await auth.fillLoginForm(email, password);

  // Capture console errors and API responses (with bodies) for diagnostics
  const consoleErrors = [];
  const apiResponses = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });
  page.on('response', async (res) => {
    const url = res.url();
    if (url.includes('/api/')) {
      const body = await res.text().catch(() => '<unreadable>');
      apiResponses.push({ url, status: res.status(), body });
      // Log sync-profile and me responses immediately for diagnostics
      if (url.includes('sync-profile') || url.includes('/me')) {
        console.log(`[loginAs] ${res.status()} ${url} → ${body.slice(0, 500)}`);
      }
    }
  });

  await auth.submitForm();

  // After submitting, the user menu becomes visible (auth succeeded),
  // but the profile-completion modal may open moments later when the
  // onAuthStateChanged → getMe response returns isProfileComplete=false.
  // The modal overlay blocks clicks but not visibility checks. So:
  // wait for user menu first, THEN check for and dismiss the modal.
  try {
    await expect(auth.userMenuToggle).toBeVisible({
      timeout: TIMEOUTS.authVerify,
    });
    await dismissProfileModalIfVisible(page);
  } catch (err) {
    const alertText = await auth.alert.textContent().catch(() => 'no alert visible');

    console.error(
      `[loginAs] Auth failed for ${email}.\n` +
        `  Error: ${err.message?.split('\n')[0]}\n` +
        `  Alert text: "${alertText}"\n` +
        `  Console errors: ${JSON.stringify(consoleErrors)}\n` +
        `  API/Firebase responses: ${JSON.stringify(apiResponses, null, 2)}`,
    );
    const screenshot = await page.screenshot().catch(() => null);
    if (screenshot) {
      const fs = await import('fs');
      const path = await import('path');
      const dir = path.join(process.cwd(), 'test-results');
      fs.mkdirSync(dir, { recursive: true });
      const file = path.join(dir, `loginAs-fail-${email.replace(/[^a-z0-9]/gi, '_')}.png`);
      fs.writeFileSync(file, screenshot);
      console.error(`[loginAs] Screenshot saved: ${file}`);
    }
    throw err;
  }
}

export async function loginAsAdmin(page) {
  await loginAs(page, ADMIN.email, ADMIN.password);
}

export async function loginAsUser(page) {
  await loginAs(page, USER.email, USER.password);
}

export async function loginAsSuperAdmin(page) {
  await loginAs(page, SUPER_ADMIN.email, SUPER_ADMIN.password);
}

/**
 * Create a brand-new account through the signup tab and leave the page
 * authenticated as that account.
 *
 * This writes a REAL Firebase user plus its Postgres profile row — nothing
 * here is stubbed. The address is therefore minted per invocation (never at
 * module scope) so a CI retry, or a second run against the same project,
 * cannot collide on Firebase's existing-email error.
 *
 * Cleanup is deliberately out of band: this helper never deletes the account
 * it creates. `server/scripts/cleanupOrphanUsers.js` is the natural home for
 * sweeping `e2e-consortium-*@example.com` users and is intentionally not
 * wired up here — a teardown hook that ran on every spec would race with
 * retries still using the account.
 *
 * @param {import('@playwright/test').Page} page
 * @param {{email?: string, password?: string, name?: string, surname?: string, company?: string}} overrides
 * @returns {Promise<{email: string, password: string, name: string, surname: string, company: string}>}
 */
export async function signUpAs(page, overrides = {}) {
  const token = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const creds = {
    email: `e2e-consortium-${token}@example.com`,
    password: 'TestPass123!',
    name: 'E2E',
    surname: 'Consortium',
    company: `E2E Consortium ${token}`,
    ...overrides,
  };

  // Same context-level guard as loginAs: the Firebase API proxy must be
  // registered once per context, not once per call.
  const context = page.context();
  if (!context.__firebaseProxyReady) {
    await setupFirebaseProxy(context);
    context.__firebaseProxyReady = true;
  }

  // Registered BEFORE any navigation so it covers the profile modal that can
  // open right after the account is created.
  await setupAutoModalDismiss(page);

  await waitForAppReady(page, '/');

  const auth = new AuthPage(page);
  await auth.openLoginModal();
  await auth.openSignupTab();
  await expect(auth.createAccountText).toBeVisible();

  await auth.fillSignupForm({
    name: creds.name,
    surname: creds.surname,
    email: creds.email,
    password: creds.password,
    company: creds.company,
  });
  await auth.submitForm();

  try {
    await expect(auth.userMenuToggle).toBeVisible({
      timeout: TIMEOUTS.authVerify,
    });
  } catch (err) {
    const alertText = await auth.alert.textContent().catch(() => 'no alert visible');
    console.error(
      `[signUpAs] Signup failed for ${creds.email}.\n` +
        `  Error: ${err.message?.split('\n')[0]}\n` +
        `  Alert text: "${alertText}"`,
    );
    throw err;
  }

  await dismissProfileModalIfVisible(page);

  return creds;
}
