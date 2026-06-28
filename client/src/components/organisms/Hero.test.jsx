import { axe } from 'vitest-axe';
import { renderWithProviders, screen, cleanup } from '../../test-utils';
import Hero from './Hero';
import { HERO_CONTENT } from '../../constants/landingContent';

describe('Hero', () => {
  it('renders the eyebrow with the section-eyebrow class', () => {
    const { container } = renderWithProviders(<Hero />);
    const eyebrow = container.querySelector('.section-eyebrow');
    expect(eyebrow).toHaveTextContent(HERO_CONTENT.eyebrow);
  });

  it('renders the headline with the gradient-text class', () => {
    renderWithProviders(<Hero />);
    const headline = screen.getByRole('heading', {
      level: 1,
      name: HERO_CONTENT.headline,
    });
    expect(headline).toHaveClass('gradient-text');
  });

  it('renders the subhead with the section-subtext class', () => {
    const { container } = renderWithProviders(<Hero />);
    const subhead = container.querySelector('.section-subtext');
    expect(subhead).toHaveTextContent(HERO_CONTENT.subhead);
  });

  it('renders the CTA linking to /services with the hero-cta-btn class', () => {
    renderWithProviders(<Hero />);
    const cta = screen.getByRole('link', { name: HERO_CONTENT.ctaText });
    expect(cta).toHaveAttribute('href', '/services');
    expect(cta).toHaveClass('hero-cta-btn');
  });

  it('has no accessibility violations', async () => {
    cleanup();
    const { container } = renderWithProviders(<Hero />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
