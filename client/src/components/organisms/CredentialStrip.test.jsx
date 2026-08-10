import { render, screen, within } from '@testing-library/react';

import CredentialStrip from './CredentialStrip';
import { CATENA_X_LABEL_ASSET } from '../../constants/catenaXStatus';
import { CREDENTIALS } from '../../constants/credentials';

const EXPECTED_CREDENTIAL_IDS = [
  'catenax-member',
  'catenax-qualified-advisor',
  'dpp-expert-group',
  'phd-pem-rwth',
];

// Advisor label text is derived from the credentials constant, never
// retyped: the tests locate the card by test id and the label node by
// role, then compare rendered alt/text against this source of truth.
const ADVISOR_CREDENTIAL = CREDENTIALS.find(
  ({ id }) => id === 'catenax-qualified-advisor',
);

describe('CredentialStrip', () => {
  afterEach(() => {
    vi.resetModules();
    vi.doUnmock('../../constants/catenaXStatus');
  });

  describe('with the official label asset available', () => {
    beforeEach(() => {
      render(<CredentialStrip />);
    });

    it('renders the section landmark with its accessible label', () => {
      expect(
        screen.getByRole('region', {
          name: 'Credentials and recognitions',
        }),
      ).toBeInTheDocument();
    });

    it('renders the official Catena-X label image with lazy loading', () => {
      const card = screen.getByTestId('credential-catenax-qualified-advisor');
      const img = within(card).getByRole('img');
      expect(img).toHaveAttribute('alt', ADVISOR_CREDENTIAL.label);
      expect(img).toHaveAttribute('src', CATENA_X_LABEL_ASSET);
      expect(img).toHaveAttribute('loading', 'lazy');
      expect(img).toHaveAttribute('decoding', 'async');
    });

    it('exposes exactly the expected credential ids, in order', () => {
      expect(CREDENTIALS.map(({ id }) => id)).toEqual(EXPECTED_CREDENTIAL_IDS);
    });

    it('renders one card per credential id and no extras', () => {
      EXPECTED_CREDENTIAL_IDS.forEach((id) => {
        expect(screen.getAllByTestId(`credential-${id}`)).toHaveLength(1);
      });
      expect(
        document.querySelectorAll('[data-testid^="credential-"]'),
      ).toHaveLength(EXPECTED_CREDENTIAL_IDS.length);
    });

    it('keeps the attestation note on the Qualified Advisor card', () => {
      const card = screen.getByTestId('credential-catenax-qualified-advisor');
      expect(
        within(card).getByText('Attestation ID 868 · valid to 06 Jul 2027'),
      ).toBeInTheDocument();
    });

    it('renders a single external link, on the Qualified Advisor card only', () => {
      const links = screen.getAllByRole('link');
      expect(links).toHaveLength(1);
      const [link] = links;
      expect(link).toHaveAttribute('href', 'https://catena-x.net');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      expect(
        screen.getByTestId('credential-catenax-qualified-advisor'),
      ).toContainElement(link);

      EXPECTED_CREDENTIAL_IDS.filter(
        (id) => id !== 'catenax-qualified-advisor',
      ).forEach((id) => {
        const card = screen.getByTestId(`credential-${id}`);
        expect(within(card).queryByRole('link')).toBeNull();
      });
    });
  });

  describe('when CATENA_X_LABEL_ASSET is null (lapsed qualification)', () => {
    it('falls back to a text label kept inside the catena-x.net link', async () => {
      vi.resetModules();
      vi.doMock('../../constants/catenaXStatus', async (orig) => ({
        ...(await orig()),
        CATENA_X_LABEL_ASSET: null,
      }));
      const { default: CredentialStripNull } = await import(
        './CredentialStrip'
      );
      render(<CredentialStripNull />);

      const card = screen.getByTestId('credential-catenax-qualified-advisor');
      expect(within(card).queryByRole('img')).toBeNull();
      const link = within(card).getByRole('link');
      expect(link).toHaveTextContent(ADVISOR_CREDENTIAL.label);
      expect(link).toHaveAttribute('href', 'https://catena-x.net');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('keeps every non-CX credential as non-link text', async () => {
      vi.resetModules();
      vi.doMock('../../constants/catenaXStatus', async (orig) => ({
        ...(await orig()),
        CATENA_X_LABEL_ASSET: null,
      }));
      const { default: CredentialStripNull } = await import(
        './CredentialStrip'
      );
      render(<CredentialStripNull />);

      ['catenax-member', 'dpp-expert-group', 'phd-pem-rwth'].forEach((id) => {
        const card = screen.getByTestId(`credential-${id}`);
        expect(within(card).queryByRole('link')).toBeNull();
      });
      expect(screen.getAllByRole('link')).toHaveLength(1);
    });
  });
});
