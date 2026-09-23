import { axe } from 'vitest-axe';
import { renderWithProviders, screen, waitFor, cleanup } from '../../test-utils';
import TeamPage from './TeamPage';
import { TEAM_META } from '../../constants/seoMeta';
import { PAGE_STRUCTURED_DATA } from '../../constants/structuredData';
import {
  TEAM_CTA,
  TEAM_MEMBERS,
  TEAM_PAGE_HEADER,
} from '../../constants/teamContent';
import { BOOKING_URL } from '../../constants/companyInfo';

vi.mock('../../hooks/useReducedMotion', () => ({
  useReducedMotion: vi.fn(() => true),
}));

vi.mock('../organisms/CareerTimeline', () => ({
  default: () => <div data-testid="career-timeline">CareerTimeline</div>,
}));

vi.mock('../organisms/VisionStatement', () => ({
  default: () => <div data-testid="vision-statement">VisionStatement</div>,
}));

describe('TeamPage', () => {
  beforeEach(() => {
    renderWithProviders(<TeamPage />);
  });

  it('sets document title', async () => {
    await waitFor(() => {
      expect(document.title).toBe(TEAM_META.title);
    });
  });

  it('sets meta description', async () => {
    await waitFor(() => {
      const meta = document.querySelector(
        'meta[name="description"][data-rh="true"]',
      );
      expect(meta).toHaveAttribute('content', TEAM_META.description);
    });
  });

  it('sets meta keywords', async () => {
    await waitFor(() => {
      const meta = document.querySelector(
        'meta[name="keywords"][data-rh="true"]',
      );
      expect(meta).toHaveAttribute('content', TEAM_META.keywords);
    });
  });

  it('sets canonical link', async () => {
    await waitFor(() => {
      expect(
        document.querySelector('link[rel="canonical"][data-rh="true"]'),
      ).toHaveAttribute('href', TEAM_META.canonical);
    });
  });

  it('sets all og meta tags', async () => {
    await waitFor(() => {
      expect(
        document.querySelector('meta[property="og:title"][data-rh="true"]'),
      ).toHaveAttribute('content', TEAM_META.og.title);
      expect(
        document.querySelector(
          'meta[property="og:description"][data-rh="true"]',
        ),
      ).toHaveAttribute('content', TEAM_META.og.description);
      expect(
        document.querySelector('meta[property="og:type"][data-rh="true"]'),
      ).toHaveAttribute('content', TEAM_META.og.type);
      expect(
        document.querySelector('meta[property="og:url"][data-rh="true"]'),
      ).toHaveAttribute('content', TEAM_META.og.url);
      expect(
        document.querySelector(
          'meta[property="og:site_name"][data-rh="true"]',
        ),
      ).toHaveAttribute('content', TEAM_META.og.siteName);
      expect(
        document.querySelector('meta[property="og:locale"][data-rh="true"]'),
      ).toHaveAttribute('content', TEAM_META.og.locale);
      expect(
        document.querySelector('meta[property="og:image"][data-rh="true"]'),
      ).toHaveAttribute('content', TEAM_META.og.image);
      expect(
        document.querySelector(
          'meta[property="og:image:alt"][data-rh="true"]',
        ),
      ).toHaveAttribute('content', TEAM_META.og.imageAlt);
    });
  });

  it('sets all twitter meta tags', async () => {
    await waitFor(() => {
      expect(
        document.querySelector('meta[name="twitter:card"][data-rh="true"]'),
      ).toHaveAttribute('content', TEAM_META.twitter.card);
      expect(
        document.querySelector('meta[name="twitter:title"][data-rh="true"]'),
      ).toHaveAttribute('content', TEAM_META.twitter.title);
      expect(
        document.querySelector(
          'meta[name="twitter:description"][data-rh="true"]',
        ),
      ).toHaveAttribute('content', TEAM_META.twitter.description);
      expect(
        document.querySelector('meta[name="twitter:image"][data-rh="true"]'),
      ).toHaveAttribute('content', TEAM_META.twitter.image);
      expect(
        document.querySelector(
          'meta[name="twitter:image:alt"][data-rh="true"]',
        ),
      ).toHaveAttribute('content', TEAM_META.twitter.imageAlt);
    });
  });

  it('emits JSON-LD schemas from PAGE_STRUCTURED_DATA.team', async () => {
    await waitFor(() => {
      const scripts = document.querySelectorAll(
        'script[type="application/ld+json"][data-rh="true"]',
      );
      expect(scripts.length).toBe(PAGE_STRUCTURED_DATA.team.length);
      expect(JSON.parse(scripts[0].textContent)).toEqual(
        PAGE_STRUCTURED_DATA.team[0],
      );
    });
    // Literal count: the guard against the bundle drifting silently.
    expect(PAGE_STRUCTURED_DATA.team).toHaveLength(3);
    expect(
      PAGE_STRUCTURED_DATA.team.filter((s) => s['@type'] === 'Person'),
    ).toHaveLength(1);
  });

  it('renders page title', () => {
    expect(screen.getByText(TEAM_PAGE_HEADER.title)).toBeInTheDocument();
  });

  it('renders page subtitle', () => {
    expect(screen.getByText(TEAM_PAGE_HEADER.subtitle)).toBeInTheDocument();
  });

  it('renders one FounderProfile per team member with correct names', () => {
    expect(TEAM_MEMBERS).toHaveLength(1);
    TEAM_MEMBERS.forEach((member) => {
      expect(
        screen.getByRole('heading', { level: 2, name: member.name }),
      ).toBeInTheDocument();
    });
  });

  it("renders Francesco's Catena-X credential skill chip", () => {
    expect(
      screen.getByText(TEAM_MEMBERS[0].skillsChips[2]),
    ).toBeInTheDocument();
  });

  it('renders the recognition block for Francesco', () => {
    const blocks = screen.getAllByTestId('recognition-block');
    expect(blocks).toHaveLength(1);
    expect(blocks[0]).toHaveTextContent('Recognition');
  });

  it('renders the team booking band with the TEAM_CTA label', () => {
    expect(screen.getByTestId('team-cta')).toBeInTheDocument();
    expect(screen.getByTestId('team-cta-booking')).toHaveTextContent(
      TEAM_CTA.label,
    );
  });

  it('points the team booking band at BOOKING_URL unchanged', () => {
    const href = screen.getByTestId('team-cta-booking').getAttribute('href');
    expect(href).toBe(BOOKING_URL);
    expect(href).not.toContain('?');
  });

  it('renders the booking band after the last profile and before VisionStatement', () => {
    const lastProfile = screen.getByRole('heading', {
      level: 2,
      name: TEAM_MEMBERS[TEAM_MEMBERS.length - 1].name,
    });
    const band = screen.getByTestId('team-cta');
    const vision = screen.getByTestId('vision-statement');
    expect(
      lastProfile.compareDocumentPosition(band) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      band.compareDocumentPosition(vision) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it('renders exactly one link to BOOKING_URL', () => {
    const links = [...document.querySelectorAll('a[href]')].filter(
      (a) => a.getAttribute('href') === BOOKING_URL,
    );
    expect(links).toHaveLength(1);
  });

  it('renders VisionStatement component', () => {
    expect(screen.getByTestId('vision-statement')).toBeInTheDocument();
  });

  it('has proper heading hierarchy with h1', () => {
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent(TEAM_PAGE_HEADER.title);
  });

  it('has no accessibility violations', async () => {
    cleanup();
    const { container } = renderWithProviders(<TeamPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
