import { axe } from 'vitest-axe';
import { renderWithProviders, screen, waitFor, cleanup } from '../../test-utils';
import DataPage from './DataPage';
import { DATA_META } from '../../constants/seoMeta';
import { PAGE_STRUCTURED_DATA } from '../../constants/structuredData';
import {
  DATA_HERO,
  DATA_STATUS_BADGE,
  DATA_SCHEMA_MAPPING,
  DATA_FOUNDER,
} from '../../constants/dataContent';

describe('DataPage', () => {
  beforeEach(() => {
    renderWithProviders(<DataPage />);
  });

  it('sets document title', async () => {
    await waitFor(() => {
      expect(document.title).toBe(DATA_META.title);
    });
  });

  it('sets meta description', async () => {
    await waitFor(() => {
      const meta = document.querySelector(
        'meta[name="description"][data-rh="true"]',
      );
      expect(meta).toHaveAttribute('content', DATA_META.description);
    });
  });

  it('sets meta keywords', async () => {
    await waitFor(() => {
      const meta = document.querySelector(
        'meta[name="keywords"][data-rh="true"]',
      );
      expect(meta).toHaveAttribute('content', DATA_META.keywords);
    });
  });

  it('sets canonical link', async () => {
    await waitFor(() => {
      const link = document.querySelector(
        'link[rel="canonical"][data-rh="true"]',
      );
      expect(link).toHaveAttribute('href', DATA_META.canonical);
    });
  });

  it('sets og meta tags', async () => {
    await waitFor(() => {
      expect(
        document.querySelector('meta[property="og:title"][data-rh="true"]'),
      ).toHaveAttribute('content', DATA_META.og.title);
      expect(
        document.querySelector(
          'meta[property="og:description"][data-rh="true"]',
        ),
      ).toHaveAttribute('content', DATA_META.og.description);
      expect(
        document.querySelector('meta[property="og:type"][data-rh="true"]'),
      ).toHaveAttribute('content', DATA_META.og.type);
      expect(
        document.querySelector('meta[property="og:url"][data-rh="true"]'),
      ).toHaveAttribute('content', DATA_META.og.url);
      expect(
        document.querySelector(
          'meta[property="og:site_name"][data-rh="true"]',
        ),
      ).toHaveAttribute('content', DATA_META.og.siteName);
      expect(
        document.querySelector('meta[property="og:locale"][data-rh="true"]'),
      ).toHaveAttribute('content', DATA_META.og.locale);
      expect(
        document.querySelector('meta[property="og:image"][data-rh="true"]'),
      ).toHaveAttribute('content', DATA_META.og.image);
      expect(
        document.querySelector(
          'meta[property="og:image:alt"][data-rh="true"]',
        ),
      ).toHaveAttribute('content', DATA_META.og.imageAlt);
    });
  });

  it('sets twitter meta tags', async () => {
    await waitFor(() => {
      expect(
        document.querySelector('meta[name="twitter:card"][data-rh="true"]'),
      ).toHaveAttribute('content', DATA_META.twitter.card);
      expect(
        document.querySelector('meta[name="twitter:title"][data-rh="true"]'),
      ).toHaveAttribute('content', DATA_META.twitter.title);
      expect(
        document.querySelector(
          'meta[name="twitter:description"][data-rh="true"]',
        ),
      ).toHaveAttribute('content', DATA_META.twitter.description);
      expect(
        document.querySelector('meta[name="twitter:image"][data-rh="true"]'),
      ).toHaveAttribute('content', DATA_META.twitter.image);
      expect(
        document.querySelector(
          'meta[name="twitter:image:alt"][data-rh="true"]',
        ),
      ).toHaveAttribute('content', DATA_META.twitter.imageAlt);
    });
  });

  it('emits JSON-LD schemas from PAGE_STRUCTURED_DATA.data', async () => {
    await waitFor(() => {
      const scripts = document.querySelectorAll(
        'script[type="application/ld+json"][data-rh="true"]',
      );
      expect(scripts.length).toBe(PAGE_STRUCTURED_DATA.data.length);
      expect(JSON.parse(scripts[0].textContent)).toEqual(
        PAGE_STRUCTURED_DATA.data[0],
      );
    });
  });

  it('renders the hero headline as the h1', () => {
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent(DATA_HERO.headline);
  });

  it('renders all page sections', () => {
    expect(screen.getByTestId('data-hero')).toBeInTheDocument();
    expect(screen.getByTestId('data-problem')).toBeInTheDocument();
    expect(screen.getByTestId('data-solution')).toBeInTheDocument();
    expect(screen.getByTestId('data-schema-mapping')).toBeInTheDocument();
    expect(screen.getByTestId('data-founder')).toBeInTheDocument();
    expect(screen.getByTestId('data-closing-cta')).toBeInTheDocument();
  });

  it('renders a schema-mapping row for every mapping entry', () => {
    const table = screen.getByTestId('data-schema-mapping');
    DATA_SCHEMA_MAPPING.rows.forEach((row) => {
      expect(table).toHaveTextContent(row.source);
      expect(table).toHaveTextContent(row.target);
    });
  });

  it('renders all four founder pillars', () => {
    DATA_FOUNDER.pillars.forEach((pillar) => {
      expect(
        screen.getByTestId(`data-pillar-${pillar.id}`),
      ).toBeInTheDocument();
    });
  });

  it('includes the mandatory Catena-X messaging phrases', () => {
    expect(document.body).toHaveTextContent(
      'We feed your passport; we do not replace it',
    );
    expect(document.body).toHaveTextContent(
      'Catena-X consultant qualification: application in progress',
    );
    expect(document.body).toHaveTextContent(
      'Committed to onboarding ASEAN into Catena-X',
    );
    expect(DATA_STATUS_BADGE).toContain(
      'Catena-X consultant qualification: application in progress',
    );
  });

  it('uses the approved Catena-X status wording in the closing CTA and credibility row', () => {
    const closingCta = screen.getByTestId('data-closing-cta');
    expect(closingCta).toHaveTextContent(
      'Catena-X consultant qualification: application in progress',
    );
    expect(closingCta).not.toHaveTextContent(
      'Catena-X consultant qualification in progress',
    );
    expect(document.body).not.toHaveTextContent(
      'Catena-X consultant qualification in progress',
    );
    expect(DATA_FOUNDER.credibilityRow).toContain(
      'Catena-X consultant qualification: application in progress',
    );
  });

  it('describes the full upstream chain including precursors and electrodes', () => {
    expect(document.body).toHaveTextContent('precursors');
    expect(document.body).toHaveTextContent('electrodes');
  });

  it('states the full problem chain without the materials-to-modules shorthand', () => {
    const problem = screen.getByTestId('data-problem');
    expect(problem).toHaveTextContent(
      'materials · precursors · electrodes · cells · modules',
    );
    expect(problem).not.toHaveTextContent('materials-to-modules');
  });

  it('contains no Solana or blockchain messaging', () => {
    expect(document.body.textContent).not.toMatch(
      /solana|blockchain|crypto|token/i,
    );
  });

  it('has no accessibility violations', async () => {
    cleanup();
    const { container } = renderWithProviders(<DataPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
