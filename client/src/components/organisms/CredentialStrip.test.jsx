import { render, screen, within } from '@testing-library/react';

import CredentialStrip from './CredentialStrip';
import { CX_LABEL_ASSETS } from '../../constants/catenaXStatus';
import { CREDENTIALS } from '../../constants/credentials';

const EXPECTED_CREDENTIAL_IDS = [
  'catenax-member',
  'catenax-qualified-advisor',
  'dpp-expert-group',
  'phd-pem-rwth',
];

// Label text is derived from the credentials constant and asset paths
// from the label-asset map, never retyped: the tests locate each card by
// test id and its label node by role, then compare the rendered
// alt/src/text against those sources of truth.
const ADVISOR_CREDENTIAL = CREDENTIALS.find(
  ({ id }) => id === 'catenax-qualified-advisor',
);
const MEMBER_CREDENTIAL = CREDENTIALS.find(({ id }) => id === 'catenax-member');

describe('CredentialStrip', () => {
  afterEach(() => {
    vi.resetModules();
    vi.doUnmock('../../constants/catenaXStatus');
  });

  describe('with the official label assets available', () => {
    beforeEach(() => {
      render(<CredentialStrip />);
    });

    it('renders the section landmark with its accessible label', () => {
      expect(
        screen.getByRole('region', { name: 'Credentials' }),
      ).toBeInTheDocument();
    });

    it('renders the official Qualified Advisor label image with lazy loading', () => {
      const card = screen.getByTestId('credential-catenax-qualified-advisor');
      const img = within(card).getByRole('img');
      expect(img).toHaveAttribute('alt', ADVISOR_CREDENTIAL.label);
      expect(img).toHaveAttribute('src', CX_LABEL_ASSETS.advisor.pos);
      expect(img).toHaveAttribute('loading', 'lazy');
      expect(img).toHaveAttribute('decoding', 'async');
    });

    it('renders the official Association member label image, unlinked', () => {
      const card = screen.getByTestId('credential-catenax-member');
      const img = within(card).getByRole('img');
      expect(img).toHaveAttribute('alt', MEMBER_CREDENTIAL.label);
      expect(img).toHaveAttribute('src', CX_LABEL_ASSETS.member.pos);
      expect(img).toHaveAttribute('loading', 'lazy');
      expect(img).toHaveAttribute('decoding', 'async');
      expect(img).toHaveClass('credential-strip__label-img--member');
      expect(card.querySelector('a')).toBeNull();
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

    it('renders a single external link, wrapping the Qualified Advisor label', () => {
      const links = screen.getAllByRole('link');
      expect(links).toHaveLength(1);
      const [link] = links;
      expect(link).toHaveAttribute('href', 'https://catena-x.net');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      const card = screen.getByTestId('credential-catenax-qualified-advisor');
      expect(card).toContainElement(link);
      expect(link).toContainElement(within(card).getByRole('img'));
    });

    it('renders no anchor at all on any credential without an href', () => {
      // A raw querySelector, not queryByRole('link'): an <a> with no href
      // carries no link role and would slip past a role query — which is
      // exactly the regression this guards.
      CREDENTIALS.filter(({ href }) => !href).forEach(({ id }) => {
        const card = screen.getByTestId(`credential-${id}`);
        expect(card.querySelector('a')).toBeNull();
      });
    });
  });

  describe('when the advisor entry in CX_LABEL_ASSETS has no positive asset', () => {
    it('falls back to a text label kept inside the catena-x.net link', async () => {
      vi.resetModules();
      vi.doMock('../../constants/catenaXStatus', async (orig) => {
        const actual = await orig();
        return {
          ...actual,
          CATENA_X_LABEL_ASSET: null,
          CX_LABEL_ASSETS: {
            ...actual.CX_LABEL_ASSETS,
            advisor: { ...actual.CX_LABEL_ASSETS.advisor, pos: null },
          },
        };
      });
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

    it('keeps every credential without an href free of anchors', async () => {
      vi.resetModules();
      vi.doMock('../../constants/catenaXStatus', async (orig) => {
        const actual = await orig();
        return {
          ...actual,
          CATENA_X_LABEL_ASSET: null,
          CX_LABEL_ASSETS: {
            ...actual.CX_LABEL_ASSETS,
            advisor: { ...actual.CX_LABEL_ASSETS.advisor, pos: null },
          },
        };
      });
      const { default: CredentialStripNull } = await import(
        './CredentialStrip'
      );
      render(<CredentialStripNull />);

      CREDENTIALS.filter(({ href }) => !href).forEach(({ id }) => {
        const card = screen.getByTestId(`credential-${id}`);
        expect(card.querySelector('a')).toBeNull();
      });
      expect(screen.getAllByRole('link')).toHaveLength(1);
    });
  });
});
