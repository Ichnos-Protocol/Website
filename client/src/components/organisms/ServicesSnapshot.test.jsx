import { axe } from 'vitest-axe';
import { renderWithProviders, screen, cleanup } from '../../test-utils';
import ServicesSnapshot from './ServicesSnapshot';
import { SERVICES_LIST } from '../../constants/services';

describe('ServicesSnapshot', () => {
  it('renders one card for each of the 10 services', () => {
    const { container } = renderWithProviders(<ServicesSnapshot />);
    const cardTitles = container.querySelectorAll('.service-card-title');
    expect(cardTitles).toHaveLength(SERVICES_LIST.length);
    expect(cardTitles).toHaveLength(10);
  });

  it('renders the pillar labels as headings, with the Catena-X kicker and heading override', () => {
    renderWithProviders(<ServicesSnapshot />);
    ['Engineering', 'Compliance', 'Circularity'].forEach((label) => {
      expect(
        screen.getByRole('heading', { name: label }),
      ).toBeInTheDocument();
    });
    expect(screen.getByText('Catena-X services')).toHaveClass(
      'services-group-kicker',
    );
    expect(
      screen.getByRole('heading', {
        name: 'Connect once. Answer every customer data request.',
      }),
    ).toBeInTheDocument();
  });

  it('renders a single services section with no nested services-group sections', () => {
    const { container } = renderWithProviders(<ServicesSnapshot />);
    const sections = container.querySelectorAll('section');
    expect(sections).toHaveLength(1);
    expect(sections[0]).toHaveAttribute('id', 'services');
    expect(container.querySelectorAll('section.services-group')).toHaveLength(0);
  });

  it('links "See full services →" to /services', () => {
    renderWithProviders(<ServicesSnapshot />);
    expect(
      screen.getByRole('link', { name: /see full services/i }),
    ).toHaveAttribute('href', '/services');
  });

  it('has no accessibility violations', async () => {
    cleanup();
    const { container } = renderWithProviders(<ServicesSnapshot />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
