import { axe } from 'vitest-axe';
import { renderWithProviders, screen, waitFor, cleanup } from '../../test-utils';
import PassportPage from './PassportPage';
import { PASSPORT_META } from '../../constants/seoMeta';
import { PAGE_STRUCTURED_DATA } from '../../constants/structuredData';
import { PASSPORT_HERO } from '../../constants/passportContent';
import { CATENA_X_TITLE_BASE } from '../../constants/catenaXStatus';

vi.mock('../organisms/ContactSection', () => ({
  default: () => <div data-testid="contact-section">ContactSection</div>,
}));

const FOLLOWING = Node.DOCUMENT_POSITION_FOLLOWING;

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

  it('renders the sections in locked order with ContactSection last', () => {
    const status = screen.getByTestId('passport-status');
    const valueCase = screen.getByTestId('passport-case');
    const catenax = screen.getByTestId('passport-catenax');
    const role = screen.getByTestId('passport-role');
    const offer = screen.getByTestId('passport-offer');
    const contact = screen.getByTestId('contact-section');

    expect(status.compareDocumentPosition(valueCase) & FOLLOWING).toBeTruthy();
    expect(valueCase.compareDocumentPosition(catenax) & FOLLOWING).toBeTruthy();
    expect(catenax.compareDocumentPosition(role) & FOLLOWING).toBeTruthy();
    expect(role.compareDocumentPosition(offer) & FOLLOWING).toBeTruthy();
    expect(offer.compareDocumentPosition(contact) & FOLLOWING).toBeTruthy();
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
    expect(document.body).toHaveTextContent(
      'Kits (the Tractus-X Development Kits)',
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
