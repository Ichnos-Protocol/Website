import { test, expect } from '@playwright/test';
import { waitForAppReady, waitForAuthedAppReady, TIMEOUTS } from '../helpers/app.js';
import { signUpAs, loginAsAdmin } from '../helpers/auth.js';
import { ADMIN, isConfigured } from '../helpers/credentials.js';
import { AuthPage } from '../pages/AuthPage.js';
import { AdminPage } from '../pages/AdminPage.js';
import { ConsortiumPage } from '../pages/ConsortiumPage.js';

// One test spans a signup, a real contact write, a tier selection and a second
// login, so the 30s local / 60s CI per-test default is far too tight.
const JOURNEY_TIMEOUT = process.env.CI ? 180_000 : 120_000;

test.describe('Consortium Journey', { tag: ['@consortium'] }, () => {
  test('registers from a QR link, picks a tier, and shows up for admin', async ({
    page,
  }) => {
    // The admin leg carries the closing assertion, so the whole journey is
    // gated on admin credentials being present.
    test.skip(!isConfigured(ADMIN), 'Admin E2E credentials not configured');
    test.setTimeout(JOURNEY_TIMEOUT);

    const consortium = new ConsortiumPage(page);
    const auth = new AuthPage(page);
    const admin = new AdminPage(page);

    // No page.route anywhere in this spec: the point of the journey is the
    // real write path through /api/contact/submit and /api/consortium/tier.

    // ─── 1. Arrive from the QR URL, anonymous ───
    await waitForAppReady(page, '/consortium?src=ibs2026');

    // Assert the registration section rather than the hero: the hero copy is
    // deadline-dependent, while the route and the form are not.
    await expect(consortium.registerSection).toBeVisible();
    await expect(consortium.registerHeading).toBeVisible();

    // The marker is written in a useEffect, so poll rather than read once.
    await expect
      .poll(
        () => page.evaluate(() => window.sessionStorage.getItem('consortium_src')),
        { timeout: TIMEOUTS.action },
      )
      .toBe('ibs2026');

    // ─── 2. Sign up ───
    const unique = `E2E Consortium ${Date.now()}`;
    await signUpAs(page, { company: unique });
    // signUpAs navigates to '/' in this same tab, so sessionStorage (same
    // origin, same tab) still carries consortium_src into the registration.

    // ─── 3. Register ───
    await waitForAuthedAppReady(page, '/consortium');
    await expect(consortium.interestCheckbox).toBeChecked();

    await consortium.fillRegistration({
      position: 'anchor',
      chainRole: 'module_pack',
      productLine: 'E2E battery module line',
      dataExtract: 'Not yet, but we could prepare one',
      preferredStart: 'November 2026',
    });
    // Question 1 stays empty on purpose — a zero-question submission is what
    // produces the consortium-kind row.
    await consortium.acceptConsents();
    await consortium.submitRegistration();

    // ─── 4. Land on the tiers page ───
    await expect(page).toHaveURL(/\/consortium\/tiers/, {
      timeout: TIMEOUTS.navigation,
    });

    // ─── 5. Select a tier permitted for the anchor position ───
    await consortium.chooseTier('Readiness assessment');
    await expect(consortium.registrationConfirmation).toBeVisible({
      timeout: TIMEOUTS.action,
    });

    // ─── 6. Admin verification, same page after a clean logout ───
    await auth.openUserMenu();
    await auth.clickLogout();
    await expect(
      page.getByTestId('navbar').getByRole('button', { name: 'Login' }),
    ).toBeVisible();

    // The Firebase-proxy and auto-dismiss guards are idempotent, so re-entering
    // loginAs on this same page is safe.
    await loginAsAdmin(page);
    await waitForAuthedAppReady(page, '/admin');
    await admin.waitForDashboardReady();
    await admin.navigateToConsortium();

    const row = page.getByRole('row').filter({ hasText: unique });
    await expect(row).toBeVisible({ timeout: TIMEOUTS.action });
    await expect(row).toContainText('ibs2026');
    await expect(row).toContainText('anchor');
  });
});
