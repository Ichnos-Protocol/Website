import { axe } from 'vitest-axe';
import { renderWithProviders, screen, cleanup } from '../../test-utils';
import PassportTeaser from './PassportTeaser';
import { PASSPORT_TEASER } from '../../constants/landingContent';

describe('PassportTeaser', () => {
  it('renders a section with id="passport"', () => {
    const { container } = renderWithProviders(<PassportTeaser />);
    expect(container.querySelector('section#passport')).toBeInTheDocument();
  });

  it('renders the heading and body', () => {
    const { container } = renderWithProviders(<PassportTeaser />);
    expect(
      screen.getByRole('heading', { level: 2, name: PASSPORT_TEASER.heading }),
    ).toBeInTheDocument();
    expect(container.textContent).toContain(PASSPORT_TEASER.body);
  });

  it('renders a single CTA linking to /passport', () => {
    renderWithProviders(<PassportTeaser />);
    const cta = screen.getByRole('link', { name: PASSPORT_TEASER.ctaLabel });
    expect(cta).toHaveAttribute('href', '/passport');
  });

  it('has no accessibility violations', async () => {
    cleanup();
    const { container } = renderWithProviders(<PassportTeaser />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
