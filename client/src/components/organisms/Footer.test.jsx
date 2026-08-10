import { axe } from 'vitest-axe';
import { within } from '@testing-library/react';
import { Routes, Route, useLocation } from 'react-router-dom';
import {
  renderWithProviders,
  screen,
  cleanup,
  fireEvent,
} from '../../test-utils';
import Footer from './Footer';
import { COMPANY_INFO, CONTACT_INFO } from '../../constants/companyInfo';
import { CREDENTIALS } from '../../constants/credentials';
import {
  CATENA_X_TITLE_BASE,
  CATENA_X_LABEL_ASSET,
  CATENA_X_LABEL_ASSET_NEG,
  TRADEMARK_NOTICE,
} from '../../constants/catenaXStatus';

function LocationProbe() {
  const location = useLocation();
  return (
    <div data-testid="location-probe">
      <span data-testid="probe-pathname">{location.pathname}</span>
      <span data-testid="probe-scroll-to">
        {location.state?.scrollTo ?? ''}
      </span>
    </div>
  );
}

function FooterWithRouteProbe() {
  return (
    <>
      <Footer />
      <Routes>
        <Route path="*" element={<LocationProbe />} />
      </Routes>
    </>
  );
}

const ATTRIBUTION_TEXT =
  '© 2026 Ichnos Protocol Pte. Ltd. — All rights reserved.';

const ADVISOR_CREDENTIAL = CREDENTIALS.find(
  ({ id }) => id === 'catenax-qualified-advisor',
);

const ADVISOR_TESTID = `footer-recognition-${ADVISOR_CREDENTIAL.id}`;

// Fixture only — a stand-in path for the negative/dark label variant that
// has not been supplied yet. Not a restatement of any real constant.
const FAKE_NEG_ASSET = '/brand/__test__/cx-qualified-advisor-neg.png';

// Renders a freshly-imported Footer with `catenaXStatus` partially mocked.
// The `...(await orig())` spread is mandatory: `credentials.js` imports
// from this module, so a factory-style mock would blank every note.
async function renderFooterWithAssets(overrides) {
  vi.resetModules();
  vi.doMock('../../constants/catenaXStatus', async (orig) => ({
    ...(await orig()),
    ...overrides,
  }));
  const { default: MockedFooter } = await import('./Footer');
  return renderWithProviders(<MockedFooter />);
}

// Pure: returns the images inside the recognitions block that are neither
// the negative variant nor wrapped in the white plaque. Returns data only
// — every expect() stays inside its own `it`.
function findUnplaquedImages(recognitions, negAsset) {
  return Array.from(recognitions.querySelectorAll('img')).filter(
    (img) =>
      img.getAttribute('src') !== negAsset &&
      img.closest('.footer-label-plaque') === null,
  );
}

describe('Footer', () => {
  afterEach(() => {
    vi.resetModules();
    vi.doUnmock('../../constants/catenaXStatus');
  });

  describe('default state', () => {
    beforeEach(() => {
      renderWithProviders(<Footer />);
    });

    it('displays COMPANY_INFO.legalName in attribution row', () => {
      const attribution = screen.getByTestId('footer-attribution');
      expect(attribution).toHaveTextContent(COMPANY_INFO.legalName);
    });

    it('displays UEN number in contact column', () => {
      const contactCol = screen.getByTestId('footer-col-contact');
      expect(
        within(contactCol).getByText(`UEN: ${COMPANY_INFO.uen}`),
      ).toBeInTheDocument();
      const brandCol = screen.getByTestId('footer-col-brand');
      expect(within(brandCol).queryByText(/UEN/i)).toBeNull();
    });

    it('brand column shows the v4 positioning line and the Catena-X credential', () => {
      const brandCol = screen.getByTestId('footer-col-brand');
      expect(
        within(brandCol).getByText(
          'Battery advisory and EU battery-passport integration for ASEAN.',
        ),
      ).toBeInTheDocument();
      // The credential string is derived from catenaXStatus.js, never hard-coded.
      expect(brandCol).toHaveTextContent(CATENA_X_TITLE_BASE);
    });

    it('displays registered address in contact column', () => {
      const contactCol = screen.getByTestId('footer-col-contact');
      expect(
        within(contactCol).getByText(COMPANY_INFO.registeredAddress),
      ).toBeInTheDocument();
    });

    it('displays email link with mailto: href', () => {
      const emailLink = screen.getByRole('link', { name: CONTACT_INFO.email });
      expect(emailLink).toHaveAttribute('href', `mailto:${CONTACT_INFO.email}`);
    });

    it('renders SocialLinks with LinkedIn and Calendly icons by aria-label', () => {
      expect(screen.getByLabelText('LinkedIn Company')).toBeInTheDocument();
      expect(screen.getByLabelText('LinkedIn Founder')).toBeInTheDocument();
      expect(screen.getByLabelText('Book a Meeting')).toBeInTheDocument();
    });

    it('all social icon links have target="_blank" and rel="noopener noreferrer"', () => {
      ['LinkedIn Company', 'LinkedIn Founder', 'Book a Meeting'].forEach(
        (label) => {
          const link = screen.getByLabelText(label);
          expect(link).toHaveAttribute('target', '_blank');
          expect(link).toHaveAttribute('rel', 'noopener noreferrer');
        },
      );
    });

    it('social icon hrefs match CONTACT_INFO values', () => {
      expect(screen.getByLabelText('LinkedIn Company')).toHaveAttribute(
        'href',
        CONTACT_INFO.linkedInCompany,
      );
      expect(screen.getByLabelText('LinkedIn Founder')).toHaveAttribute(
        'href',
        CONTACT_INFO.linkedInFounder,
      );
      expect(screen.getByLabelText('Book a Meeting')).toHaveAttribute(
        'href',
        CONTACT_INFO.calendly,
      );
    });

    it('Company column contains Why Ichnos → / and Team → /team and excludes Services/About', () => {
      const companyCol = screen.getByTestId('footer-col-company');
      expect(
        within(companyCol).getByRole('link', { name: 'Why Ichnos' }),
      ).toHaveAttribute('href', '/');
      expect(
        within(companyCol).getByRole('link', { name: 'Team' }),
      ).toHaveAttribute('href', '/team');
      expect(
        within(companyCol).queryByRole('link', { name: 'Why Ichnos Protocol' }),
      ).toBeNull();
      expect(
        within(companyCol).queryByRole('link', { name: 'Services' }),
      ).toBeNull();
      expect(
        within(companyCol).queryByRole('link', { name: 'About' }),
      ).toBeNull();
    });

    it('Services column has exactly four locked section links to /services', () => {
      const servicesCol = screen.getByTestId('footer-col-services');
      const labels = [
        'Engineering',
        'Catena-X services',
        'Compliance',
        'Circularity',
      ];
      labels.forEach((label) => {
        expect(
          within(servicesCol).getByRole('link', { name: label }),
        ).toHaveAttribute('href', '/services');
      });
      expect(within(servicesCol).getAllByRole('link')).toHaveLength(4);
      // Delivery Models is intentionally not surfaced in the footer — there is
      // only one delivery-method service (Technical Lead with agile PM merged),
      // and pillars are the canonical footer navigation primitives.
      expect(
        within(servicesCol).queryByRole('link', { name: 'Delivery Models' }),
      ).toBeNull();
    });

    it('Services column links navigate to /services with the locked scrollTo state', () => {
      const cases = [
        { label: 'Engineering', scrollTo: 'engineering' },
        { label: 'Catena-X services', scrollTo: 'catena-x' },
        { label: 'Compliance', scrollTo: 'compliance' },
        { label: 'Circularity', scrollTo: 'circularity' },
      ];
      cases.forEach(({ label, scrollTo }) => {
        cleanup();
        renderWithProviders(<FooterWithRouteProbe />);
        const servicesCol = screen.getByTestId('footer-col-services');
        const link = within(servicesCol).getByRole('link', { name: label });
        fireEvent.click(link);
        expect(screen.getByTestId('probe-pathname')).toHaveTextContent(
          '/services',
        );
        expect(screen.getByTestId('probe-scroll-to')).toHaveTextContent(
          scrollTo,
        );
      });
    });

    it('Products column has a single Battery Passport link → /passport', () => {
      const productsCol = screen.getByTestId('footer-col-products');
      expect(
        within(productsCol).getByRole('link', { name: 'Battery Passport' }),
      ).toHaveAttribute('href', '/passport');
      // Old separate Data + Catena-X links are consolidated; the standalone
      // Catena-X entry should NOT exist in the footer either.
      expect(
        within(productsCol).queryByRole('link', { name: 'Catena-X' }),
      ).toBeNull();
      expect(
        within(productsCol).queryByRole('link', { name: 'Data' }),
      ).toBeNull();
    });

    it('contact column has Submit an Inquiry link to /contact', () => {
      const contactCol = screen.getByTestId('footer-col-contact');
      expect(
        within(contactCol).getByRole('link', { name: 'Submit an Inquiry' }),
      ).toHaveAttribute('href', '/contact');
    });

    it('contact column does not render a text link labeled "LinkedIn Company"', () => {
      const contactCol = screen.getByTestId('footer-col-contact');
      expect(within(contactCol).queryByText('LinkedIn Company')).toBeNull();
    });

    it('attribution row contains exact text, year 2026, and legal name', () => {
      const attribution = screen.getByTestId('footer-attribution');
      expect(attribution).toHaveTextContent(ATTRIBUTION_TEXT);
      expect(attribution).toHaveTextContent('2026');
      expect(attribution).toHaveTextContent(COMPANY_INFO.legalName);
    });

    it('attribution row does not include any photo credit text', () => {
      const attribution = screen.getByTestId('footer-attribution');
      expect(attribution).not.toHaveTextContent('Photo:');
      expect(attribution).not.toHaveTextContent('Photography:');
      expect(attribution).not.toHaveTextContent('Unsplash');
    });

    it('renders one recognitions item per credential id and no extras', () => {
      const recognitions = screen.getByTestId('footer-recognitions');
      expect(recognitions).toHaveTextContent('Recognitions');
      CREDENTIALS.forEach(({ id }) => {
        expect(
          screen.getAllByTestId(`footer-recognition-${id}`),
        ).toHaveLength(1);
      });
      // `footer-recognitions` (the container) does not match this prefix.
      expect(
        document.querySelectorAll('[data-testid^="footer-recognition-"]'),
      ).toHaveLength(CREDENTIALS.length);
    });

    it('every recognitions image is either the negative variant or plaque-wrapped', () => {
      // The footer is dark. The positive label may only appear on the white
      // plaque that supplies its original light ground; the negative variant,
      // once supplied, may render bare. Nothing else is permitted.
      const recognitions = screen.getByTestId('footer-recognitions');
      expect(
        findUnplaquedImages(recognitions, CATENA_X_LABEL_ASSET_NEG),
      ).toEqual([]);
    });

    it('renders the Catena-X label as the plaque-wrapped positive asset', () => {
      const item = screen.getByTestId(ADVISOR_TESTID);
      const img = within(item).getByRole('img');
      expect(img).toHaveAttribute('src', CATENA_X_LABEL_ASSET);
      expect(img).toHaveAttribute('alt', ADVISOR_CREDENTIAL.label);
      expect(img).toHaveAttribute('loading', 'lazy');
      expect(img).toHaveAttribute('decoding', 'async');
      expect(img).toHaveClass('footer-label-img');
      expect(img.closest('.footer-label-plaque')).not.toBeNull();
    });

    it('recognitions carry no link; the one permitted linked instance is elsewhere', () => {
      // At most one linked instance of the label per page. The footer renders
      // on every route, so the single catena-x.net link lives in
      // CredentialStrip (asserted in CredentialStrip.test.jsx), not here.
      const linked = CREDENTIALS.filter(({ href }) => href);
      expect(linked).toHaveLength(1);
      expect(linked[0].href).toBe('https://catena-x.net');
      const recognitions = screen.getByTestId('footer-recognitions');
      expect(within(recognitions).queryAllByRole('link')).toHaveLength(0);
    });

    it('renders the site-wide Catena-X trademark notice once, verbatim', () => {
      const notices = screen.getAllByTestId('footer-trademark');
      expect(notices).toHaveLength(1);
      expect(notices[0].textContent).toBe(TRADEMARK_NOTICE);
    });

    it('has semantic <footer> element', () => {
      const footer = document.querySelector('footer');
      expect(footer).toBeInTheDocument();
    });

    it('email link is keyboard focusable', () => {
      const emailLink = screen.getByRole('link', { name: CONTACT_INFO.email });
      emailLink.focus();
      expect(emailLink).toHaveFocus();
    });

    it('has no accessibility violations', async () => {
      cleanup();
      const { container } = renderWithProviders(<Footer />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('when the negative label variant is available', () => {
    it('renders it bare, with no plaque', async () => {
      await renderFooterWithAssets({
        CATENA_X_LABEL_ASSET_NEG: FAKE_NEG_ASSET,
      });
      const recognitions = screen.getByTestId('footer-recognitions');
      const img = within(recognitions).getByRole('img');
      expect(img).toHaveAttribute('src', FAKE_NEG_ASSET);
      expect(img).toHaveClass('footer-label-img');
      expect(document.querySelector('.footer-label-plaque')).toBeNull();
      expect(findUnplaquedImages(recognitions, FAKE_NEG_ASSET)).toEqual([]);
    });
  });

  describe('when only the positive label variant is available', () => {
    it('renders exactly one image, plaque-wrapped', async () => {
      await renderFooterWithAssets({ CATENA_X_LABEL_ASSET_NEG: null });
      const recognitions = screen.getByTestId('footer-recognitions');
      const images = recognitions.querySelectorAll('img');
      expect(images).toHaveLength(1);
      expect(images[0]).toHaveAttribute('src', CATENA_X_LABEL_ASSET);
      expect(images[0].closest('.footer-label-plaque')).not.toBeNull();
      expect(document.querySelector('.footer-label-plaque')).not.toBeNull();
    });
  });

  describe('when no label variant is available', () => {
    it('falls back to the plain credential label text', async () => {
      await renderFooterWithAssets({
        CATENA_X_LABEL_ASSET: null,
        CATENA_X_LABEL_ASSET_NEG: null,
      });
      const recognitions = screen.getByTestId('footer-recognitions');
      expect(recognitions.querySelectorAll('img')).toHaveLength(0);
      expect(document.querySelector('.footer-label-plaque')).toBeNull();
      expect(screen.getByTestId(ADVISOR_TESTID)).toHaveTextContent(
        ADVISOR_CREDENTIAL.label,
      );
    });
  });
});
