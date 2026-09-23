import { axe } from 'vitest-axe';
import { renderWithProviders, screen, cleanup, fireEvent } from '../../test-utils';
import FounderProfile from './FounderProfile';
import {
  CATENA_X_TITLE_BASE,
  CATENA_X_QUALIFIER_CLASS,
  CX_LABEL_ASSETS,
} from '../../constants/catenaXStatus';

const CATENA_X_LINK_SELECTOR = 'a[href="https://catena-x.net"]';

vi.mock('./CareerTimeline', () => ({
  default: ({ timeline }) => (
    <div data-testid="career-timeline" data-count={timeline?.length ?? 0} />
  ),
}));

describe('FounderProfile', () => {
  const MEMBER = {
    id: 'test-member',
    name: 'Test Person',
    title: 'Test Title',
    photo: '/test.png',
    bio: ['Para one.', 'Para two.'],
    showTimeline: true,
    timeline: [
      {
        id: 't1',
        year: 2020,
        title: 't',
        organization: 'o',
        description: 'd',
      },
    ],
  };

  it("renders the given member's name, title, and each bio paragraph", () => {
    renderWithProviders(<FounderProfile member={MEMBER} />);
    expect(screen.getByText(MEMBER.name)).toBeInTheDocument();
    expect(screen.getByText(MEMBER.title)).toBeInTheDocument();
    expect(screen.getByText('Para one.')).toBeInTheDocument();
    expect(screen.getByText('Para two.')).toBeInTheDocument();
  });

  it('renders the Catena-X credential in a bio paragraph without the pending qualifier span', () => {
    const credentialed = {
      ...MEMBER,
      bio: [`He is an ${CATENA_X_TITLE_BASE}, leading the data space.`],
    };
    const { container } = renderWithProviders(
      <FounderProfile member={credentialed} />,
    );
    expect(container.textContent).toContain(CATENA_X_TITLE_BASE);
    expect(
      container.querySelector(`.${CATENA_X_QUALIFIER_CLASS}`),
    ).not.toBeInTheDocument();
  });

  it('renders the photo with src and alt from the member prop', () => {
    renderWithProviders(<FounderProfile member={MEMBER} />);
    const img = screen.getByAltText(MEMBER.name);
    expect(img).toHaveAttribute('src', MEMBER.photo);
  });

  it('renders CareerTimeline when showTimeline is true', () => {
    renderWithProviders(<FounderProfile member={MEMBER} />);
    expect(screen.getByTestId('career-timeline')).toBeInTheDocument();
  });

  it('does not render CareerTimeline when showTimeline is false', () => {
    const hidden = { ...MEMBER, showTimeline: false };
    renderWithProviders(<FounderProfile member={hidden} />);
    expect(screen.queryByTestId('career-timeline')).not.toBeInTheDocument();
  });

  it('shows the fallback when the photo image errors out', () => {
    renderWithProviders(<FounderProfile member={MEMBER} />);
    const img = screen.getByAltText(MEMBER.name);
    fireEvent.error(img);
    expect(document.querySelector('.founder-photo-fallback')).toBeInTheDocument();
    expect(screen.queryByAltText(MEMBER.name)).not.toBeInTheDocument();
  });

  describe('Qualified Advisor label (september-fixes P7)', () => {
    afterEach(() => {
      vi.resetModules();
      vi.doUnmock('../../constants/catenaXStatus');
    });

    it('renders the linked advisor label under the photo when cxLabel is set', () => {
      renderWithProviders(
        <FounderProfile member={{ ...MEMBER, cxLabel: 'advisor' }} />,
      );
      const img = screen.getByAltText(CATENA_X_TITLE_BASE);
      expect(img).toHaveAttribute('src', CX_LABEL_ASSETS.advisor.pos);
      // P7: the unmodified official 16:9 file, clear space uncropped.
      expect(img).toHaveAttribute(
        'src',
        '/brand/CX_Logo_Qualified-Advisor_CLR_RGB_pos_16x9.svg',
      );
      expect(img).toHaveClass('founder-credential-label');
      const link = img.closest('a');
      expect(link).toHaveAttribute('href', 'https://catena-x.net');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      const photoCol = screen.getByAltText(MEMBER.name).parentElement;
      expect(photoCol).toContainElement(link);
    });

    it('renders no label and no catena-x.net anchor without cxLabel', () => {
      renderWithProviders(<FounderProfile member={MEMBER} />);
      expect(
        document.querySelector('.founder-credential-label'),
      ).not.toBeInTheDocument();
      expect(screen.queryByAltText(CATENA_X_TITLE_BASE)).not.toBeInTheDocument();
      expect(document.querySelector(CATENA_X_LINK_SELECTOR)).toBeNull();
    });

    it('keeps the text fallback inside the link when the positive asset is null', async () => {
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
      const { default: FounderProfileNull } = await import('./FounderProfile');
      renderWithProviders(
        <FounderProfileNull member={{ ...MEMBER, cxLabel: 'advisor' }} />,
      );
      expect(screen.queryByAltText(CATENA_X_TITLE_BASE)).not.toBeInTheDocument();
      const link = document.querySelector(CATENA_X_LINK_SELECTOR);
      expect(link).toHaveTextContent(CATENA_X_TITLE_BASE);
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  it('has no accessibility violations', async () => {
    cleanup();
    const { container } = renderWithProviders(<FounderProfile member={MEMBER} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
