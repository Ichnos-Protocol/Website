import { axe } from 'vitest-axe';
import { renderWithProviders, screen, waitFor } from '../../test-utils';
import LandingPage from './LandingPage';
import { LANDING_META } from '../../constants/seoMeta';
import { PAGE_STRUCTURED_DATA } from '../../constants/structuredData';

vi.mock('../../hooks/useReducedMotion', () => ({
  useReducedMotion: vi.fn(() => true),
}));

vi.mock('../../hooks/useScrollToSection', () => ({
  useScrollToSection: vi.fn(),
}));

// Sibling organisms are mocked as bare <section> wrappers so the homepage
// section count reflects exactly one landmark per organism. ServicesSnapshot
// is rendered for real so the test catches any regression that nests pillar
// <section> elements inside it.
vi.mock('../organisms/Hero', () => ({
  default: () => <section data-testid="hero">Hero</section>,
}));

vi.mock('../organisms/WhyIchnosSection', () => ({
  default: () => <section data-testid="why-ichnos">WhyIchnosSection</section>,
}));

vi.mock('../organisms/PassportTeaser', () => ({
  default: () => <section data-testid="passport-teaser">PassportTeaser</section>,
}));

vi.mock('../organisms/ContactSection', () => ({
  default: () => <section data-testid="contact-section">ContactSection</section>,
}));

import { useScrollToSection } from '../../hooks/useScrollToSection';

describe('LandingPage', () => {
  beforeEach(() => {
    renderWithProviders(<LandingPage />);
  });

  it('sets document title', async () => {
    await waitFor(() => {
      expect(document.title).toBe(LANDING_META.title);
    });
  });

  it('sets meta description', async () => {
    await waitFor(() => {
      const meta = document.querySelector(
        'meta[name="description"][data-rh="true"]',
      );
      expect(meta).toHaveAttribute('content', LANDING_META.description);
    });
  });

  it('sets meta keywords', async () => {
    await waitFor(() => {
      const meta = document.querySelector(
        'meta[name="keywords"][data-rh="true"]',
      );
      expect(meta).toHaveAttribute('content', LANDING_META.keywords);
    });
  });

  it('sets canonical link', async () => {
    await waitFor(() => {
      const link = document.querySelector(
        'link[rel="canonical"][data-rh="true"]',
      );
      expect(link).toHaveAttribute('href', LANDING_META.canonical);
    });
  });

  it('sets all og meta tags', async () => {
    await waitFor(() => {
      expect(
        document.querySelector('meta[property="og:title"][data-rh="true"]'),
      ).toHaveAttribute('content', LANDING_META.og.title);
      expect(
        document.querySelector(
          'meta[property="og:description"][data-rh="true"]',
        ),
      ).toHaveAttribute('content', LANDING_META.og.description);
      expect(
        document.querySelector('meta[property="og:type"][data-rh="true"]'),
      ).toHaveAttribute('content', LANDING_META.og.type);
      expect(
        document.querySelector('meta[property="og:url"][data-rh="true"]'),
      ).toHaveAttribute('content', LANDING_META.og.url);
      expect(
        document.querySelector(
          'meta[property="og:site_name"][data-rh="true"]',
        ),
      ).toHaveAttribute('content', LANDING_META.og.siteName);
      expect(
        document.querySelector('meta[property="og:locale"][data-rh="true"]'),
      ).toHaveAttribute('content', LANDING_META.og.locale);
      expect(
        document.querySelector('meta[property="og:image"][data-rh="true"]'),
      ).toHaveAttribute('content', LANDING_META.og.image);
      expect(
        document.querySelector(
          'meta[property="og:image:alt"][data-rh="true"]',
        ),
      ).toHaveAttribute('content', LANDING_META.og.imageAlt);
    });
  });

  it('sets all twitter meta tags', async () => {
    await waitFor(() => {
      expect(
        document.querySelector('meta[name="twitter:card"][data-rh="true"]'),
      ).toHaveAttribute('content', LANDING_META.twitter.card);
      expect(
        document.querySelector('meta[name="twitter:title"][data-rh="true"]'),
      ).toHaveAttribute('content', LANDING_META.twitter.title);
      expect(
        document.querySelector(
          'meta[name="twitter:description"][data-rh="true"]',
        ),
      ).toHaveAttribute('content', LANDING_META.twitter.description);
      expect(
        document.querySelector('meta[name="twitter:image"][data-rh="true"]'),
      ).toHaveAttribute('content', LANDING_META.twitter.image);
      expect(
        document.querySelector(
          'meta[name="twitter:image:alt"][data-rh="true"]',
        ),
      ).toHaveAttribute('content', LANDING_META.twitter.imageAlt);
    });
  });

  it('emits JSON-LD schemas from PAGE_STRUCTURED_DATA.landing', async () => {
    await waitFor(() => {
      const scripts = document.querySelectorAll(
        'script[type="application/ld+json"][data-rh="true"]',
      );
      expect(scripts.length).toBe(PAGE_STRUCTURED_DATA.landing.length);
      expect(JSON.parse(scripts[0].textContent)).toEqual(
        PAGE_STRUCTURED_DATA.landing[0],
      );
    });
  });

  it('renders Hero component', () => {
    expect(screen.getByTestId('hero')).toBeInTheDocument();
  });

  it('renders WhyIchnosSection component', () => {
    expect(screen.getByTestId('why-ichnos')).toBeInTheDocument();
  });

  it('renders the real ServicesSnapshot services section', () => {
    expect(document.querySelector('section#services')).toBeInTheDocument();
  });

  it('renders exactly five homepage sections with no nested services-group sections', () => {
    const { container } = renderWithProviders(<LandingPage />);
    expect(container.querySelectorAll('section')).toHaveLength(5);
    expect(container.querySelectorAll('section.services-group')).toHaveLength(0);
  });

  it('renders PassportTeaser component', () => {
    expect(screen.getByTestId('passport-teaser')).toBeInTheDocument();
  });

  it('renders ContactSection component', () => {
    expect(screen.getByTestId('contact-section')).toBeInTheDocument();
  });

  it('renders sections in order: Hero, WhyIchnosSection, ServicesSnapshot, PassportTeaser, ContactSection', () => {
    const hero = screen.getByTestId('hero');
    const company = screen.getByTestId('why-ichnos');
    const services = document.querySelector('section#services');
    const passport = screen.getByTestId('passport-teaser');
    const contact = screen.getByTestId('contact-section');

    expect(
      hero.compareDocumentPosition(company) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      company.compareDocumentPosition(services) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      services.compareDocumentPosition(passport) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      passport.compareDocumentPosition(contact) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it('calls useScrollToSection hook', () => {
    expect(useScrollToSection).toHaveBeenCalled();
  });

  it('has no accessibility violations', async () => {
    const { container } = renderWithProviders(<LandingPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
