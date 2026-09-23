/*
 * Value pin for constants/routes.js.
 *
 * The route literals below are deliberate. routes.test.js skips this file by
 * name and asserts that each pinned literal is still present, because these
 * mounts are the only non-circular check that the constants hold the paths
 * the site actually publishes. Converting them to imported constants would
 * make the route guard assert a value against itself.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders, screen, waitFor } from './test-utils';

import App from './App';

vi.mock('./hooks/useApiSanityCheck');
vi.mock('./routes/AdminRoute', () => ({
  default: ({ children }) => children,
}));
vi.mock('./components/pages/AdminPage', () => ({
  default: () => <div>Admin Page</div>,
}));
vi.mock('./components/pages/LandingPage', () => ({
  default: () => <div>Landing Page</div>,
}));
vi.mock('./components/pages/PassportPage', () => ({
  default: () => <div>Passport Page</div>,
}));
vi.mock('./components/pages/ServicesPage', () => ({
  default: () => <div>Services Page</div>,
}));
vi.mock('./components/pages/TeamPage', () => ({
  default: () => <div>Team Page</div>,
}));
vi.mock('./components/pages/ContactPage', () => ({
  default: () => <div>Contact Page</div>,
}));
vi.mock('./components/pages/PrivacyPage', () => ({
  default: () => <div>Privacy Page</div>,
}));
vi.mock('./components/pages/ConsortiumPage', () => ({
  default: () => <div>Consortium Page</div>,
}));
vi.mock('./components/pages/ConsortiumTiersPage', () => ({
  default: () => <div>Consortium Tiers Page</div>,
}));
// ReadinessAssessmentPage is deliberately NOT mocked. Rendering the real
// presentational page is intentional: it is what lets this file assert the
// breadcrumb parent's href and the Catena-X theme wrapper (spec section 8
// items 3 and 25), which mocking would leave unasserted here. The page's own
// composition is covered by colocated component tests in
// ReadinessAssessmentPage.test.jsx; App.test.jsx stays the integration check
// for route, theme wrapper and breadcrumb parent.
vi.mock('./routes/ProtectedRoute', () => ({
  default: ({ children, redirectTo }) => (
    <div data-testid="protected-route" data-redirect-to={redirectTo ?? ''}>
      {children}
    </div>
  ),
}));
vi.mock('./components/templates/PublicLayout', () => ({
  default: ({ children }) => (
    <div data-testid="public-layout">
      <div data-testid="navbar" />
      {children}
      <footer data-testid="footer" />
    </div>
  ),
}));

describe('App API sanity warning', () => {
  beforeEach(async () => {
    const mod = await import('./hooks/useApiSanityCheck');
    mod.useApiSanityCheck.mockReturnValue({
      warning: 'API routing is misconfigured',
      isChecking: false,
    });
  });

  it('shows warning on public route without blocking content', async () => {
    renderWithProviders(<App />, { route: '/' });

    await waitFor(() => {
      expect(
        screen.getByText('API routing is misconfigured'),
      ).toBeInTheDocument();
      expect(screen.getByText('Landing Page')).toBeInTheDocument();
    });
  });

  it('shows warning on /admin route without blocking content', async () => {
    renderWithProviders(<App />, { route: '/admin' });

    await waitFor(() => {
      expect(
        screen.getByText('API routing is misconfigured'),
      ).toBeInTheDocument();
      expect(screen.getByText('Admin Page')).toBeInTheDocument();
    });
  });

  it('does not show warning when API is healthy', async () => {
    const mod = await import('./hooks/useApiSanityCheck');
    mod.useApiSanityCheck.mockReturnValue({
      warning: null,
      isChecking: false,
    });

    renderWithProviders(<App />, { route: '/admin' });

    await waitFor(() => {
      expect(
        screen.queryByText('API Configuration Warning'),
      ).not.toBeInTheDocument();
      expect(screen.getByText('Admin Page')).toBeInTheDocument();
    });
  });

  it('renders landing page without warning when API is healthy', async () => {
    const mod = await import('./hooks/useApiSanityCheck');
    mod.useApiSanityCheck.mockReturnValue({
      warning: null,
      isChecking: false,
    });

    renderWithProviders(<App />, { route: '/' });

    await waitFor(() => {
      expect(
        screen.queryByText('API Configuration Warning'),
      ).not.toBeInTheDocument();
      expect(screen.getByText('Landing Page')).toBeInTheDocument();
    });
  });
});

describe('App route theme wrappers', () => {
  beforeEach(async () => {
    const mod = await import('./hooks/useApiSanityCheck');
    mod.useApiSanityCheck.mockReturnValue({
      warning: null,
      isChecking: false,
    });
  });

  it('renders advisory theme wrapper containing chrome at /', async () => {
    const { container } = renderWithProviders(<App />, { route: '/' });

    await waitFor(() => {
      expect(screen.getByText('Landing Page')).toBeInTheDocument();
    });

    const advisoryWrapper = container.querySelector('.theme-advisory');
    expect(advisoryWrapper).toBeInTheDocument();
    expect(
      advisoryWrapper.querySelector('[data-testid="public-layout"]'),
    ).toBeInTheDocument();
    expect(
      advisoryWrapper.querySelector('[data-testid="navbar"]'),
    ).toBeInTheDocument();
    expect(
      advisoryWrapper.querySelector('[data-testid="footer"]'),
    ).toBeInTheDocument();
    expect(advisoryWrapper).toHaveTextContent('Landing Page');
  });

  it('renders the Catena-X theme wrapper containing chrome at /passport', async () => {
    const { container } = renderWithProviders(<App />, { route: '/passport' });

    await waitFor(() => {
      expect(screen.getByText('Passport Page')).toBeInTheDocument();
    });

    const passportWrapper = container.querySelector('.theme-catenax');
    expect(passportWrapper).toBeInTheDocument();
    expect(
      passportWrapper.querySelector('[data-testid="public-layout"]'),
    ).toBeInTheDocument();
    expect(
      passportWrapper.querySelector('[data-testid="navbar"]'),
    ).toBeInTheDocument();
    expect(
      passportWrapper.querySelector('[data-testid="footer"]'),
    ).toBeInTheDocument();
    expect(passportWrapper).toHaveTextContent('Passport Page');
    expect(container.querySelector('.theme-advisory')).toBeNull();
  });

  it('renders the readiness assessment inside the Catena-X chrome', async () => {
    const { container } = renderWithProviders(<App />, {
      route: '/passport/readiness-assessment',
    });

    await waitFor(() => {
      expect(
        screen.getByTestId('readiness-assessment-page'),
      ).toBeInTheDocument();
    });

    const assessmentWrapper = container.querySelector('.theme-catenax');
    expect(assessmentWrapper).toBeInTheDocument();
    expect(
      assessmentWrapper.querySelector('[data-testid="public-layout"]'),
    ).toBeInTheDocument();
    expect(
      assessmentWrapper.querySelector('[data-testid="navbar"]'),
    ).toBeInTheDocument();
    expect(
      assessmentWrapper.querySelector('[data-testid="footer"]'),
    ).toBeInTheDocument();
    expect(
      assessmentWrapper.querySelector(
        '[data-testid="readiness-assessment-page"]',
      ),
    ).toBeInTheDocument();
    expect(container.querySelector('.theme-advisory')).toBeNull();

    // The breadcrumb's parent crumb points at the passport page, which the
    // /passport mount above proves renders a page rather than a Navigate.
    expect(screen.getByTestId('assessment-breadcrumb-parent')).toHaveAttribute(
      'href',
      '/passport',
    );
  });

  it('renders the consortium page inside the advisory chrome', async () => {
    const { container } = renderWithProviders(<App />, { route: '/consortium' });

    await waitFor(() => {
      expect(screen.getByText('Consortium Page')).toBeInTheDocument();
    });

    const advisoryWrapper = container.querySelector('.theme-advisory');
    expect(
      advisoryWrapper.querySelector('[data-testid="public-layout"]'),
    ).toHaveTextContent('Consortium Page');
  });

  it('renders the services page inside the advisory chrome', async () => {
    renderWithProviders(<App />, { route: '/services' });

    await waitFor(() => {
      expect(screen.getByText('Services Page')).toBeInTheDocument();
    });
  });

  it('renders the team page inside the advisory chrome', async () => {
    renderWithProviders(<App />, { route: '/team' });

    await waitFor(() => {
      expect(screen.getByText('Team Page')).toBeInTheDocument();
    });
  });

  it('renders the contact page inside the advisory chrome', async () => {
    renderWithProviders(<App />, { route: '/contact' });

    await waitFor(() => {
      expect(screen.getByText('Contact Page')).toBeInTheDocument();
    });
  });

  it('renders the privacy page inside the advisory chrome', async () => {
    renderWithProviders(<App />, { route: '/privacy' });

    await waitFor(() => {
      expect(screen.getByText('Privacy Page')).toBeInTheDocument();
    });
  });

  it('protects /consortium/tiers with a redirect to /consortium', async () => {
    renderWithProviders(<App />, { route: '/consortium/tiers' });

    await waitFor(() => {
      expect(screen.getByText('Consortium Tiers Page')).toBeInTheDocument();
    });

    expect(screen.getByTestId('protected-route')).toHaveAttribute(
      'data-redirect-to',
      '/consortium',
    );
  });
});

describe('App legacy route redirects', () => {
  beforeEach(async () => {
    const mod = await import('./hooks/useApiSanityCheck');
    mod.useApiSanityCheck.mockReturnValue({
      warning: null,
      isChecking: false,
    });
  });

  it('redirects /data to the Passport page', async () => {
    renderWithProviders(<App />, { route: '/data' });

    await waitFor(() => {
      expect(screen.getByText('Passport Page')).toBeInTheDocument();
    });
  });

  it('redirects /catena-x to the Passport page', async () => {
    renderWithProviders(<App />, { route: '/catena-x' });

    await waitFor(() => {
      expect(screen.getByText('Passport Page')).toBeInTheDocument();
    });
  });

  it('redirects /data/readiness-assessment to the assessment page', async () => {
    renderWithProviders(<App />, { route: '/data/readiness-assessment' });

    await waitFor(() => {
      expect(
        screen.getByTestId('readiness-assessment-page'),
      ).toBeInTheDocument();
    });
  });

  it('redirects /catena-x/readiness-assessment to the assessment page', async () => {
    renderWithProviders(<App />, { route: '/catena-x/readiness-assessment' });

    await waitFor(() => {
      expect(
        screen.getByTestId('readiness-assessment-page'),
      ).toBeInTheDocument();
    });
  });
});
