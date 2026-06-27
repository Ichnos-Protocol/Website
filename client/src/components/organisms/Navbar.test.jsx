import { axe } from 'vitest-axe';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, screen, fireEvent } from '../../test-utils';
import Navbar from './Navbar';
import { NAV_ITEMS } from '../../constants/navigation';

// All NAV_ITEMS are now flat <a> links in the navbar (no dropdowns).
const FLAT_NAV_ITEMS = NAV_ITEMS.filter((item) => !item.children);

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('../../hooks/useReducedMotion', () => ({
  useReducedMotion: vi.fn(() => true),
}));

const mockUseActiveSection = vi.fn(() => null);
vi.mock('../../hooks/useActiveSection', () => ({
  useActiveSection: (...args) => mockUseActiveSection(...args),
}));

vi.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(() => Promise.resolve()),
  getAuth: vi.fn(() => ({})),
  onAuthStateChanged: vi.fn(),
}));

vi.mock('../../config/firebase', () => ({
  auth: {},
}));

vi.mock('../../features/auth/authApi', () => ({
  useSyncProfileMutation: vi.fn(() => [
    vi.fn(() => ({ unwrap: () => Promise.resolve({ data: { user: {}, isAdmin: false } }) })),
    { isLoading: false },
  ]),
}));

const loggedOutState = {
  auth: {
    user: null,
    isAuthenticated: false,
    isAdmin: false,
    loading: false,
    error: null,
    modalMode: null,
    profileState: null,
  },
};

const loggedInState = {
  auth: {
    user: { name: 'Jane', email: 'jane@test.com' },
    isAuthenticated: true,
    isAdmin: false,
    loading: false,
    error: null,
    modalMode: null,
    profileState: null,
  },
};

describe('Navbar', () => {
  beforeEach(() => {
    mockUseActiveSection.mockReset();
    mockUseActiveSection.mockReturnValue(null);
  });

  it('renders Logo component', () => {
    renderWithProviders(<Navbar onMenuToggle={vi.fn()} />, {
      preloadedState: loggedOutState,
    });
    const logoLink = screen.getByRole('link', { name: /ichnos/i });
    expect(logoLink).toBeInTheDocument();
  });

  it('renders all flat NAV_ITEMS as links and exposes no Company dropdown', () => {
    renderWithProviders(<Navbar onMenuToggle={vi.fn()} />, {
      preloadedState: loggedOutState,
    });

    FLAT_NAV_ITEMS.forEach((item) => {
      const link = screen.getByRole('link', { name: item.label });
      expect(link).toHaveAttribute('href', item.path);
    });

    // The former Company dropdown is gone — no toggle button remains.
    expect(screen.queryByRole('button', { name: 'Company' })).toBeNull();
  });

  it('clicking the Team flat link navigates to /team', async () => {
    const user = userEvent.setup();
    mockNavigate.mockClear();
    renderWithProviders(<Navbar onMenuToggle={vi.fn()} />, {
      preloadedState: loggedOutState,
    });

    await user.click(screen.getByRole('link', { name: 'Team' }));

    expect(mockNavigate).toHaveBeenCalledWith('/team');
  });

  it('renders Contact navigation item', () => {
    renderWithProviders(<Navbar onMenuToggle={vi.fn()} />, {
      preloadedState: loggedOutState,
    });

    expect(screen.getByRole('link', { name: 'Contact' })).toBeInTheDocument();
  });

  it('shows Login button when not authenticated', () => {
    renderWithProviders(<Navbar onMenuToggle={vi.fn()} />, {
      preloadedState: loggedOutState,
    });

    expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
  });

  it('dispatches openAuthModal when Login button is clicked', async () => {
    const user = userEvent.setup();
    const { store } = renderWithProviders(<Navbar onMenuToggle={vi.fn()} />, {
      preloadedState: loggedOutState,
    });

    await user.click(screen.getByRole('button', { name: 'Login' }));

    expect(store.getState().auth.modalMode).toBe('login');
  });

  it('shows UserMenu when authenticated', () => {
    renderWithProviders(<Navbar onMenuToggle={vi.fn()} />, {
      preloadedState: loggedInState,
    });

    expect(screen.getByText('J')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Login' })).not.toBeInTheDocument();
  });

  it('renders mobile hamburger button with d-md-none class', () => {
    renderWithProviders(<Navbar onMenuToggle={vi.fn()} />, {
      preloadedState: loggedOutState,
    });

    const hamburger = screen.getByRole('button', { name: /open menu/i });
    expect(hamburger).toHaveClass('d-md-none');
  });

  it('calls onMenuToggle when hamburger is clicked', () => {
    const onMenuToggle = vi.fn();
    renderWithProviders(<Navbar onMenuToggle={onMenuToggle} />, {
      preloadedState: loggedOutState,
    });

    fireEvent.click(screen.getByRole('button', { name: /open menu/i }));
    expect(onMenuToggle).toHaveBeenCalledOnce();
  });

  it('hamburger button has aria-label "Open menu"', () => {
    renderWithProviders(<Navbar onMenuToggle={vi.fn()} />, {
      preloadedState: loggedOutState,
    });

    const hamburger = screen.getByLabelText('Open menu');
    expect(hamburger).toBeInTheDocument();
  });

  it('desktop nav has d-none d-md-flex classes', () => {
    renderWithProviders(<Navbar onMenuToggle={vi.fn()} />, {
      preloadedState: loggedOutState,
    });

    const desktopNav = screen.getByRole('link', { name: 'Services' }).closest('.d-md-flex');
    expect(desktopNav).toHaveClass('d-none');
    expect(desktopNav).toHaveClass('d-md-flex');
  });

  it('hamburger button is keyboard accessible', () => {
    const onMenuToggle = vi.fn();
    renderWithProviders(<Navbar onMenuToggle={onMenuToggle} />, {
      preloadedState: loggedOutState,
    });

    const hamburger = screen.getByRole('button', { name: /open menu/i });
    hamburger.focus();
    expect(hamburger).toHaveFocus();
  });

  it('all navigation entries are keyboard accessible (flat links)', () => {
    renderWithProviders(<Navbar onMenuToggle={vi.fn()} />, {
      preloadedState: loggedOutState,
    });

    FLAT_NAV_ITEMS.forEach(({ label }) => {
      const link = screen.getByRole('link', { name: label });
      link.focus();
      expect(link).toHaveFocus();
    });
  });

  it('marks the active nav entry with the active class when route matches (flat items)', () => {
    renderWithProviders(<Navbar onMenuToggle={vi.fn()} />, {
      route: '/services',
      preloadedState: loggedOutState,
    });

    const servicesLink = screen.getByRole('link', { name: 'Services' });
    expect(servicesLink).toHaveClass('active');

    ['Home', 'Data', 'Catena-X', 'Team', 'Contact'].forEach((label) => {
      expect(screen.getByRole('link', { name: label })).not.toHaveClass('active');
    });
  });

  it('marks the Team flat link active on /team', () => {
    renderWithProviders(<Navbar onMenuToggle={vi.fn()} />, {
      route: '/team',
      preloadedState: loggedOutState,
    });
    expect(screen.getByRole('link', { name: 'Team' })).toHaveClass('active');
  });

  it('on / homepage, applies the active class only to the entry whose section is currently visible', () => {
    mockUseActiveSection.mockReturnValue('services');

    renderWithProviders(<Navbar onMenuToggle={vi.fn()} />, {
      route: '/',
      preloadedState: loggedOutState,
    });

    const servicesLink = screen.getByRole('link', { name: 'Services' });
    expect(servicesLink).toHaveClass('active');
    expect(servicesLink).toHaveClass('nav-link-active');

    ['Home', 'Data', 'Catena-X', 'Team', 'Contact'].forEach((label) => {
      const link = screen.getByRole('link', { name: label });
      expect(link).not.toHaveClass('active');
      expect(link).not.toHaveClass('nav-link-active');
      expect(link).toHaveClass('nav-link-default');
    });
  });

  it('on / homepage with no visible section (null), no nav entry is active', () => {
    mockUseActiveSection.mockReturnValue(null);

    renderWithProviders(<Navbar onMenuToggle={vi.fn()} />, {
      route: '/',
      preloadedState: loggedOutState,
    });

    FLAT_NAV_ITEMS.forEach(({ label }) => {
      const link = screen.getByRole('link', { name: label });
      expect(link).not.toHaveClass('active');
      expect(link).not.toHaveClass('nav-link-active');
      expect(link).toHaveClass('nav-link-default');
    });
  });

  it('on / homepage, Data is NEVER scrollspy-active (route-only)', () => {
    mockUseActiveSection.mockReturnValue('data');

    renderWithProviders(<Navbar onMenuToggle={vi.fn()} />, {
      route: '/',
      preloadedState: loggedOutState,
    });

    FLAT_NAV_ITEMS.forEach(({ label }) => {
      const link = screen.getByRole('link', { name: label });
      expect(link).not.toHaveClass('active');
      expect(link).not.toHaveClass('nav-link-active');
      expect(link).toHaveClass('nav-link-default');
    });
  });

  it('on /data, the brand Logo renders the dark-on-light mark (/logo-dark.png)', () => {
    renderWithProviders(<Navbar onMenuToggle={vi.fn()} />, {
      route: '/data',
      preloadedState: loggedOutState,
    });
    const brandLink = screen.getByRole('link', { name: /ichnos/i });
    const img = brandLink.querySelector('img');
    expect(img).toHaveAttribute('src', '/Ichnos-protocol_logo_transparent.png');
  });

  it('on /, the brand Logo renders the dark-on-light mark (/logo-dark.png)', () => {
    renderWithProviders(<Navbar onMenuToggle={vi.fn()} />, {
      route: '/',
      preloadedState: loggedOutState,
    });
    const brandLink = screen.getByRole('link', { name: /ichnos/i });
    const img = brandLink.querySelector('img');
    expect(img).toHaveAttribute('src', '/Ichnos-protocol_logo_transparent.png');
  });

  it('on / homepage, clicking Services/Contact navigates with scrollTo state to the matching section', () => {
    NAV_ITEMS.filter((item) => item.sectionId).forEach((item) => {
      mockNavigate.mockClear();
      const { unmount } = renderWithProviders(<Navbar onMenuToggle={vi.fn()} />, {
        route: '/',
        preloadedState: loggedOutState,
      });

      fireEvent.click(screen.getByRole('link', { name: item.label }));
      expect(mockNavigate).toHaveBeenCalledWith('/', {
        state: { scrollTo: item.sectionId },
      });
      unmount();
    });
  });

  it('on / homepage, clicking Data navigates to /data', () => {
    mockNavigate.mockClear();
    renderWithProviders(<Navbar onMenuToggle={vi.fn()} />, {
      route: '/',
      preloadedState: loggedOutState,
    });

    fireEvent.click(screen.getByRole('link', { name: 'Data' }));
    expect(mockNavigate).toHaveBeenCalledWith('/data');
  });

  it('on /services route, clicking each flat nav link navigates to its path', () => {
    const expected = {
      Home: '/',
      Services: '/services',
      Data: '/data',
      'Catena-X': '/catena-x',
      Team: '/team',
      Contact: '/contact',
    };

    Object.entries(expected).forEach(([label, path]) => {
      mockNavigate.mockClear();
      const { unmount } = renderWithProviders(<Navbar onMenuToggle={vi.fn()} />, {
        route: '/services',
        preloadedState: loggedOutState,
      });

      fireEvent.click(screen.getByRole('link', { name: label }));
      expect(mockNavigate).toHaveBeenCalledWith(path);
      unmount();
    });
  });

  it('has no accessibility violations', async () => {
    const { container } = renderWithProviders(<Navbar onMenuToggle={vi.fn()} />, {
      preloadedState: loggedOutState,
    });
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
