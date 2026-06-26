import { axe } from 'vitest-axe';
import { renderWithProviders, screen, cleanup } from '../../test-utils';
import ServicesSnapshot from './ServicesSnapshot';
import { HOMEPAGE_OFFER_CARDS } from '../../constants/landingContent';

describe('ServicesSnapshot', () => {
  it('renders one card for each entry in HOMEPAGE_OFFER_CARDS', () => {
    renderWithProviders(<ServicesSnapshot />);
    const cardHeadings = screen.getAllByRole('heading', { level: 3 });
    expect(cardHeadings).toHaveLength(HOMEPAGE_OFFER_CARDS.length);
  });

  it('renders the three offer-card titles', () => {
    renderWithProviders(<ServicesSnapshot />);
    HOMEPAGE_OFFER_CARDS.forEach((card) => {
      expect(
        screen.getByRole('heading', { level: 3, name: card.title }),
      ).toBeInTheDocument();
    });
  });

  it('links each card to /data, /catena-x, and /services', () => {
    renderWithProviders(<ServicesSnapshot />);
    expect(
      screen.getByRole('link', { name: /explore data services/i }),
    ).toHaveAttribute('href', '/data');
    expect(
      screen.getByRole('link', { name: /catena-x consulting/i }),
    ).toHaveAttribute('href', '/catena-x');
    expect(
      screen.getByRole('link', { name: /explore advisory/i }),
    ).toHaveAttribute('href', '/services');
  });

  it('describes the full upstream chain in the data card copy', () => {
    const { container } = renderWithProviders(<ServicesSnapshot />);
    expect(container.textContent).toContain('precursors');
    expect(container.textContent).toContain('electrodes');
    expect(container.textContent).toContain('pCAM/CAM');
  });

  it('has no accessibility violations', async () => {
    cleanup();
    const { container } = renderWithProviders(<ServicesSnapshot />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
