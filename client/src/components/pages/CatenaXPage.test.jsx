import { axe } from 'vitest-axe';
import { renderWithProviders, screen, waitFor, cleanup } from '../../test-utils';
import CatenaXPage from './CatenaXPage';
import { CATENAX_META } from '../../constants/seoMeta';
import { PAGE_STRUCTURED_DATA } from '../../constants/structuredData';
import {
  CATENAX_PAGE_HEADER,
  CATENAX_FOCUS_HEADING,
  CATENAX_FOCUS_AREAS,
  CATENAX_COMMITMENT,
  CATENAX_CTA,
} from '../../constants/catenaXContent';

vi.mock('../../hooks/useReducedMotion', () => ({
  useReducedMotion: vi.fn(() => true),
}));

describe('CatenaXPage', () => {
  beforeEach(() => {
    renderWithProviders(<CatenaXPage />);
  });

  it('sets document title', async () => {
    await waitFor(() => {
      expect(document.title).toBe(CATENAX_META.title);
    });
  });

  it('sets meta description', async () => {
    await waitFor(() => {
      const meta = document.querySelector(
        'meta[name="description"][data-rh="true"]',
      );
      expect(meta).toHaveAttribute('content', CATENAX_META.description);
    });
  });

  it('sets meta keywords', async () => {
    await waitFor(() => {
      const meta = document.querySelector(
        'meta[name="keywords"][data-rh="true"]',
      );
      expect(meta).toHaveAttribute('content', CATENAX_META.keywords);
    });
  });

  it('sets canonical link', async () => {
    await waitFor(() => {
      expect(
        document.querySelector('link[rel="canonical"][data-rh="true"]'),
      ).toHaveAttribute('href', CATENAX_META.canonical);
    });
  });

  it('sets all og meta tags', async () => {
    await waitFor(() => {
      expect(
        document.querySelector('meta[property="og:title"][data-rh="true"]'),
      ).toHaveAttribute('content', CATENAX_META.og.title);
      expect(
        document.querySelector(
          'meta[property="og:description"][data-rh="true"]',
        ),
      ).toHaveAttribute('content', CATENAX_META.og.description);
      expect(
        document.querySelector('meta[property="og:type"][data-rh="true"]'),
      ).toHaveAttribute('content', CATENAX_META.og.type);
      expect(
        document.querySelector('meta[property="og:url"][data-rh="true"]'),
      ).toHaveAttribute('content', CATENAX_META.og.url);
      expect(
        document.querySelector('meta[property="og:site_name"][data-rh="true"]'),
      ).toHaveAttribute('content', CATENAX_META.og.siteName);
      expect(
        document.querySelector('meta[property="og:locale"][data-rh="true"]'),
      ).toHaveAttribute('content', CATENAX_META.og.locale);
      expect(
        document.querySelector('meta[property="og:image"][data-rh="true"]'),
      ).toHaveAttribute('content', CATENAX_META.og.image);
      expect(
        document.querySelector('meta[property="og:image:alt"][data-rh="true"]'),
      ).toHaveAttribute('content', CATENAX_META.og.imageAlt);
    });
  });

  it('sets all twitter meta tags', async () => {
    await waitFor(() => {
      expect(
        document.querySelector('meta[name="twitter:card"][data-rh="true"]'),
      ).toHaveAttribute('content', CATENAX_META.twitter.card);
      expect(
        document.querySelector('meta[name="twitter:title"][data-rh="true"]'),
      ).toHaveAttribute('content', CATENAX_META.twitter.title);
      expect(
        document.querySelector(
          'meta[name="twitter:description"][data-rh="true"]',
        ),
      ).toHaveAttribute('content', CATENAX_META.twitter.description);
      expect(
        document.querySelector('meta[name="twitter:image"][data-rh="true"]'),
      ).toHaveAttribute('content', CATENAX_META.twitter.image);
      expect(
        document.querySelector('meta[name="twitter:image:alt"][data-rh="true"]'),
      ).toHaveAttribute('content', CATENAX_META.twitter.imageAlt);
    });
  });

  it('emits JSON-LD schemas from PAGE_STRUCTURED_DATA.catenaX', async () => {
    await waitFor(() => {
      const scripts = document.querySelectorAll(
        'script[type="application/ld+json"][data-rh="true"]',
      );
      expect(scripts.length).toBe(PAGE_STRUCTURED_DATA.catenaX.length);
      expect(JSON.parse(scripts[0].textContent)).toEqual(
        PAGE_STRUCTURED_DATA.catenaX[0],
      );
    });
  });

  it('renders the headline as the h1', () => {
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent(CATENAX_PAGE_HEADER.title);
  });

  it('renders the compliance-locked status phrase', () => {
    expect(
      screen.getByText(/application in progress/i),
    ).toBeInTheDocument();
  });

  it('does not make qualified/member/certified/partner claims', () => {
    const body = document.body.textContent;
    expect(body).not.toMatch(/\b(qualified|member|certified|partner)\b/i);
  });

  it('renders the focus section heading', () => {
    expect(screen.getByText(CATENAX_FOCUS_HEADING)).toBeInTheDocument();
  });

  it('defines exactly eight focus areas', () => {
    expect(CATENAX_FOCUS_AREAS.length).toBe(8);
  });

  it.each(CATENAX_FOCUS_AREAS)(
    'renders the $id focus card with its title and description',
    (area) => {
      const card = screen.getByTestId(`catenax-focus-${area.id}`);
      expect(card).toHaveTextContent(area.title);
      expect(card).toHaveTextContent(area.description);
    },
  );

  it('preserves the §5.6 reviewer cues in the focus descriptions', () => {
    const onboarding = screen.getByTestId('catenax-focus-onboarding-steps');
    expect(onboarding).toHaveTextContent(
      'registration, identity, connector, and clearance steps',
    );

    const businessCases = screen.getByTestId('catenax-focus-business-cases');
    expect(businessCases).toHaveTextContent(
      'turns EU-compliance cost into market-access advantage for ASEAN exporters and EU importers',
    );

    const useCases = screen.getByTestId(
      'catenax-focus-use-case-implementation',
    );
    expect(useCases).toHaveTextContent(
      'battery-passport, PCF, and due-diligence use cases',
    );

    const bilateral = screen.getByTestId(
      'catenax-focus-bilateral-relationships',
    );
    expect(bilateral).toHaveTextContent(
      'sovereign, contract-governed data exchange between an EU importer and an ASEAN supplier',
    );

    const regulatory = screen.getByTestId(
      'catenax-focus-regulatory-requirements',
    );
    expect(regulatory).toHaveTextContent('MS 2818');
    expect(regulatory).toHaveTextContent('how Catena-X data satisfies');
  });

  it('renders the commitment heading and key phrases', () => {
    expect(screen.getByText(CATENAX_COMMITMENT.heading)).toBeInTheDocument();
    expect(
      screen.getByText(/onboard ASEAN into Catena-X/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/on site whenever needed/i),
    ).toBeInTheDocument();
  });

  it('renders the CTA link to /contact', () => {
    const cta = screen.getByRole('button', { name: CATENAX_CTA.label });
    expect(cta).toHaveAttribute('href', '/contact');
  });

  it('has no accessibility violations', async () => {
    cleanup();
    const { container } = renderWithProviders(<CatenaXPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
