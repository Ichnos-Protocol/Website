import { axe } from 'vitest-axe';
import { renderWithProviders, screen, cleanup } from '../../test-utils';
import Hero from './Hero';
import { HERO_CONTENT } from '../../constants/landingContent';

function precedes(first, second) {
  return Boolean(
    first.compareDocumentPosition(second) & Node.DOCUMENT_POSITION_FOLLOWING,
  );
}

describe('Hero', () => {
  it('renders the eyebrow with the section-eyebrow class', () => {
    const { container } = renderWithProviders(<Hero />);
    const eyebrow = container.querySelector('.section-eyebrow');
    expect(eyebrow).toHaveTextContent(HERO_CONTENT.eyebrow);
  });

  it('renders the eyebrow with the hero modifier on the testid node', () => {
    renderWithProviders(<Hero />);
    const eyebrow = screen.getByTestId('hero-eyebrow');
    expect(eyebrow).toHaveClass('section-eyebrow');
    expect(eyebrow).toHaveClass('section-eyebrow--hero');
  });

  it('renders the headline without the gradient-text class', () => {
    renderWithProviders(<Hero />);
    const headline = screen.getByRole('heading', {
      level: 1,
      name: HERO_CONTENT.headline,
    });
    expect(headline).not.toHaveClass('gradient-text');
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

  it('renders headline, subhead, eyebrow, then CTA in document order', () => {
    renderWithProviders(<Hero />);
    const headline = screen.getByTestId('hero-headline');
    const subhead = screen.getByTestId('hero-subhead');
    const eyebrow = screen.getByTestId('hero-eyebrow');
    const cta = screen.getByRole('link', { name: HERO_CONTENT.ctaText });

    expect(precedes(headline, subhead)).toBe(true);
    expect(precedes(subhead, eyebrow)).toBe(true);
    expect(precedes(eyebrow, cta)).toBe(true);
  });

  it('renders exactly one h1', () => {
    const { container } = renderWithProviders(<Hero />);
    expect(container.querySelectorAll('h1')).toHaveLength(1);
  });

  it('has no accessibility violations', async () => {
    cleanup();
    const { container } = renderWithProviders(<Hero />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
