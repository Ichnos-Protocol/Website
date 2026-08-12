import { axe } from 'vitest-axe';
import { renderWithProviders, screen, waitFor, cleanup } from '../../test-utils';
import PassportPage from './PassportPage';
import { PASSPORT_META } from '../../constants/seoMeta';
import { PAGE_STRUCTURED_DATA } from '../../constants/structuredData';
import {
  PASSPORT_HERO,
  PASSPORT_CUSTOMERS,
  PASSPORT_BUILD_STACK,
} from '../../constants/passportContent';
import { CATENA_X_TITLE_BASE } from '../../constants/catenaXStatus';

vi.mock('../organisms/ContactSection', () => ({
  default: () => <div data-testid="contact-section">ContactSection</div>,
}));

const FOLLOWING = Node.DOCUMENT_POSITION_FOLLOWING;

// v4 replaced the old status/milestone section with the regulatory timeline:
// the previous list published two obligation dates that were factually wrong,
// so the section that carried them is gone and every regulatory date now comes
// from regulatoryDates.js. Section order is data here, asserted in one loop,
// rather than an inline array inside the test body.
const ORDERED_SECTION_TESTIDS = [
  'passport-regulatory-timeline',
  'passport-case',
  'passport-catenax',
  'passport-build-stack',
  'passport-role',
  'passport-customers',
  'passport-offer',
  'passport-roadmap',
  'contact-section',
];

describe('PassportPage', () => {
  beforeEach(() => {
    renderWithProviders(<PassportPage />);
  });

  it('sets document title', async () => {
    await waitFor(() => {
      expect(document.title).toBe(PASSPORT_META.title);
    });
  });

  it('sets meta description', async () => {
    await waitFor(() => {
      const meta = document.querySelector(
        'meta[name="description"][data-rh="true"]',
      );
      expect(meta).toHaveAttribute('content', PASSPORT_META.description);
    });
  });

  it('sets canonical link', async () => {
    await waitFor(() => {
      expect(
        document.querySelector('link[rel="canonical"][data-rh="true"]'),
      ).toHaveAttribute('href', PASSPORT_META.canonical);
    });
  });

  it('sets the og:title and og:url meta tags', async () => {
    await waitFor(() => {
      expect(
        document.querySelector('meta[property="og:title"][data-rh="true"]'),
      ).toHaveAttribute('content', PASSPORT_META.og.title);
      expect(
        document.querySelector('meta[property="og:url"][data-rh="true"]'),
      ).toHaveAttribute('content', PASSPORT_META.og.url);
    });
  });

  it('emits JSON-LD schemas from PAGE_STRUCTURED_DATA.passport', async () => {
    await waitFor(() => {
      const scripts = document.querySelectorAll(
        'script[type="application/ld+json"][data-rh="true"]',
      );
      expect(scripts.length).toBe(PAGE_STRUCTURED_DATA.passport.length);
      expect(JSON.parse(scripts[0].textContent)).toEqual(
        PAGE_STRUCTURED_DATA.passport[0],
      );
    });
  });

  it('renders the hero title as the single h1', () => {
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent(PASSPORT_HERO.title);
  });

  it('renders the ten sections in locked order with ContactSection last', () => {
    const ordered = [
      screen.getByRole('heading', { level: 1 }),
      ...ORDERED_SECTION_TESTIDS.map((testId) => screen.getByTestId(testId)),
    ];

    for (let i = 0; i < ordered.length - 1; i += 1) {
      expect(
        ordered[i].compareDocumentPosition(ordered[i + 1]) & FOLLOWING,
      ).toBeTruthy();
    }
  });

  it('renders the three v5 sections with representative copy', () => {
    expect(screen.getByTestId('passport-build-stack')).toBeInTheDocument();
    expect(screen.getByTestId('passport-customers')).toBeInTheDocument();
    expect(screen.getByTestId('passport-roadmap')).toBeInTheDocument();
    const partnerGroup = PASSPORT_CUSTOMERS.groups.find(
      (group) => group.id === 'passport-app-partners',
    );
    expect(document.body).toHaveTextContent(partnerGroup.body);
    expect(document.body).toHaveTextContent('CX-0143');
  });

  it('renders the Catena-X outbound pointer with safe target/rel', () => {
    const link = screen.getByRole('link', {
      name: /Read the Catena-X introduction/i,
    });
    expect(link).toHaveAttribute('href', 'https://catena-x.net/en/about-us');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link.getAttribute('rel')).toContain('noopener');
  });

  it('renders the offer eyebrow with the Catena-X credential', () => {
    const eyebrow = screen.getByTestId('passport-offer-eyebrow');
    expect(eyebrow).toHaveTextContent(CATENA_X_TITLE_BASE);
  });

  it('renders the locked key copy', () => {
    // The Kits gloss moved out of the offer section into the build stack, so
    // this asserts against the imported constant on the build-stack section
    // rather than restating the copy as a literal (§12.4-Q1 / D12).
    expect(screen.getByTestId('passport-build-stack')).toHaveTextContent(
      PASSPORT_BUILD_STACK.body,
    );
    expect(document.body).toHaveTextContent('Ichnos role in the value chain');
  });

  it('has no accessibility violations', async () => {
    cleanup();
    const { container } = renderWithProviders(<PassportPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
