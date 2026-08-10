import { render, screen } from '@testing-library/react';

import CredentialStrip from './CredentialStrip';
import { CATENA_X_LABEL_ASSET } from '../../constants/catenaXStatus';

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
      const img = screen.getByAltText('Catena-X Qualified Advisor');
      expect(img).toHaveAttribute('src', CATENA_X_LABEL_ASSET);
      expect(img).toHaveAttribute('loading', 'lazy');
      expect(img).toHaveAttribute('decoding', 'async');
    });

    it('wraps the label image in an external link to catena-x.net only', () => {
      const img = screen.getByAltText('Catena-X Qualified Advisor');
      const link = img.closest('a');
      expect(link).toHaveAttribute('href', 'https://catena-x.net');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('renders the other credentials as plain text labels and notes', () => {
      expect(screen.getByText('PhD, PEM — RWTH Aachen')).toBeInTheDocument();
      expect(
        screen.getByText('Expert committee — Battery Passport'),
      ).toBeInTheDocument();
      expect(
        screen.getByText('EU battery passport from 18 Feb 2027'),
      ).toBeInTheDocument();
      expect(screen.getByText('Regulation (EU) 2023/1542')).toBeInTheDocument();
      expect(
        screen.getByText('Attestation ID 868 · valid to 06 Jul 2027'),
      ).toBeInTheDocument();
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

      expect(
        screen.queryByAltText('Catena-X Qualified Advisor'),
      ).toBeNull();
      const textLabel = screen.getByText('Catena-X Qualified Advisor');
      const link = textLabel.closest('a');
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

      expect(
        screen.getByText('Expert committee — Battery Passport').closest('a'),
      ).toBeNull();
      expect(
        screen
          .getByText('EU battery passport from 18 Feb 2027')
          .closest('a'),
      ).toBeNull();
      expect(
        screen.getByText('PhD, PEM — RWTH Aachen').closest('a'),
      ).toBeNull();
    });
  });
});
