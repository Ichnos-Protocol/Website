import { axe } from 'vitest-axe';
import { renderWithProviders, screen, waitFor, cleanup } from '../../test-utils';
import ServicesPage from './ServicesPage';
import { SERVICES_META } from '../../constants/seoMeta';
import { PAGE_STRUCTURED_DATA } from '../../constants/structuredData';
import { SERVICES_PAGE_CONTENT } from '../../constants/services';

const SECTION_IDS = ['engineering', 'compliance', 'circularity'];

vi.mock('../../hooks/useReducedMotion', () => ({
  useReducedMotion: vi.fn(() => true),
}));

vi.mock('../../hooks/useScrollToSection', () => ({
  useScrollToSection: vi.fn(),
}));

vi.mock('../organisms/ContactSection', () => ({
  default: () => <div data-testid="contact-section">ContactSection</div>,
}));

import { useScrollToSection } from '../../hooks/useScrollToSection';

describe('ServicesPage', () => {
  beforeEach(() => {
    renderWithProviders(<ServicesPage />);
  });

  it('sets document title', async () => {
    await waitFor(() => {
      expect(document.title).toBe(SERVICES_META.title);
    });
  });

  it('sets meta description', async () => {
    await waitFor(() => {
      const meta = document.querySelector(
        'meta[name="description"][data-rh="true"]',
      );
      expect(meta).toHaveAttribute('content', SERVICES_META.description);
    });
  });

  it('sets meta keywords', async () => {
    await waitFor(() => {
      const meta = document.querySelector(
        'meta[name="keywords"][data-rh="true"]',
      );
      expect(meta).toHaveAttribute('content', SERVICES_META.keywords);
    });
  });

  it('sets canonical link', async () => {
    await waitFor(() => {
      expect(
        document.querySelector('link[rel="canonical"][data-rh="true"]'),
      ).toHaveAttribute('href', SERVICES_META.canonical);
    });
  });

  it('sets all og meta tags', async () => {
    await waitFor(() => {
      expect(
        document.querySelector('meta[property="og:title"][data-rh="true"]'),
      ).toHaveAttribute('content', SERVICES_META.og.title);
      expect(
        document.querySelector(
          'meta[property="og:description"][data-rh="true"]',
        ),
      ).toHaveAttribute('content', SERVICES_META.og.description);
      expect(
        document.querySelector('meta[property="og:type"][data-rh="true"]'),
      ).toHaveAttribute('content', SERVICES_META.og.type);
      expect(
        document.querySelector('meta[property="og:url"][data-rh="true"]'),
      ).toHaveAttribute('content', SERVICES_META.og.url);
      expect(
        document.querySelector(
          'meta[property="og:site_name"][data-rh="true"]',
        ),
      ).toHaveAttribute('content', SERVICES_META.og.siteName);
      expect(
        document.querySelector('meta[property="og:locale"][data-rh="true"]'),
      ).toHaveAttribute('content', SERVICES_META.og.locale);
      expect(
        document.querySelector('meta[property="og:image"][data-rh="true"]'),
      ).toHaveAttribute('content', SERVICES_META.og.image);
      expect(
        document.querySelector(
          'meta[property="og:image:alt"][data-rh="true"]',
        ),
      ).toHaveAttribute('content', SERVICES_META.og.imageAlt);
    });
  });

  it('sets all twitter meta tags', async () => {
    await waitFor(() => {
      expect(
        document.querySelector('meta[name="twitter:card"][data-rh="true"]'),
      ).toHaveAttribute('content', SERVICES_META.twitter.card);
      expect(
        document.querySelector('meta[name="twitter:title"][data-rh="true"]'),
      ).toHaveAttribute('content', SERVICES_META.twitter.title);
      expect(
        document.querySelector(
          'meta[name="twitter:description"][data-rh="true"]',
        ),
      ).toHaveAttribute('content', SERVICES_META.twitter.description);
      expect(
        document.querySelector('meta[name="twitter:image"][data-rh="true"]'),
      ).toHaveAttribute('content', SERVICES_META.twitter.image);
      expect(
        document.querySelector(
          'meta[name="twitter:image:alt"][data-rh="true"]',
        ),
      ).toHaveAttribute('content', SERVICES_META.twitter.imageAlt);
    });
  });

  it('emits JSON-LD schemas from PAGE_STRUCTURED_DATA.services', async () => {
    await waitFor(() => {
      const scripts = document.querySelectorAll(
        'script[type="application/ld+json"][data-rh="true"]',
      );
      expect(scripts.length).toBe(PAGE_STRUCTURED_DATA.services.length);
      expect(JSON.parse(scripts[0].textContent)).toEqual(
        PAGE_STRUCTURED_DATA.services[0],
      );
    });
  });

  it('renders page title', () => {
    expect(screen.getByText(SERVICES_PAGE_CONTENT.title)).toBeInTheDocument();
  });

  it('renders page subtitle', () => {
    expect(screen.getByText(SERVICES_PAGE_CONTENT.subtitle)).toBeInTheDocument();
  });

  it('renders ContactSection component', () => {
    expect(screen.getByTestId('contact-section')).toBeInTheDocument();
  });

  it('has proper heading hierarchy with h1', () => {
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent(SERVICES_PAGE_CONTENT.title);
  });

  it('calls useScrollToSection hook', () => {
    expect(useScrollToSection).toHaveBeenCalled();
  });

  it('renders all three pillar section ids: engineering, compliance, circularity', () => {
    SECTION_IDS.forEach((sectionId) => {
      expect(document.getElementById(sectionId)).not.toBeNull();
    });
  });

  it('does not render a delivery-models section', () => {
    expect(document.getElementById('delivery-models')).toBeNull();
  });

  it('renders exactly three services-group sections', () => {
    const sections = document.querySelectorAll('section.services-group');
    expect(sections.length).toBe(3);
  });

  it('renders the three pillar sections in locked order', () => {
    const [engineering, compliance, circularity] = SECTION_IDS.map((id) =>
      document.getElementById(id),
    );

    expect(
      engineering.compareDocumentPosition(compliance) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      compliance.compareDocumentPosition(circularity) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it('renders the Compliance pillar as 3 cards in order, lead card first', () => {
    const compliance = document.getElementById('compliance');
    const cards = compliance.querySelectorAll('.service-card');
    expect(cards.length).toBe(3);

    const titles = [...compliance.querySelectorAll('.service-card-title')].map(
      (el) => el.textContent,
    );
    expect(titles).toEqual([
      'Strategic Catena-X consulting — battery passport',
      'Battery Passport Integration',
      'EU–ASEAN Compliance Bridge',
    ]);

    const leadCards = compliance.querySelectorAll('.service-card--lead');
    expect(leadCards.length).toBe(1);
    expect(cards[0].classList.contains('service-card--lead')).toBe(true);
  });

  it('renders ContactSection after the three pillar groups', () => {
    const circularity = document.getElementById('circularity');
    const contact = screen.getByTestId('contact-section');
    expect(
      circularity.compareDocumentPosition(contact) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it('does not link to the legacy /data or /catena-x routes', () => {
    const hrefs = [...document.querySelectorAll('a[href]')].map((a) =>
      a.getAttribute('href'),
    );
    expect(hrefs).not.toContain('/data');
    expect(hrefs).not.toContain('/catena-x');
  });

  it('has no accessibility violations', async () => {
    cleanup();
    const { container } = renderWithProviders(<ServicesPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
