import { axe } from 'vitest-axe';
import { renderWithProviders, screen, cleanup } from '../../test-utils';
import ReadinessAssessmentHero from './ReadinessAssessmentHero';
import {
  ASSESSMENT_CTA_BAND,
  ASSESSMENT_HERO,
  PRICING,
  formatPrice,
} from '../../constants/readinessAssessmentContent';
import { ROUTE_CONTACT } from '../../constants/routes';

/*
 * Section 8 item 12: no price reaches the hero. The candidate figures are
 * derived from PRICING itself, both ladders and both currencies, so adding a
 * tier or moving a figure extends the sweep automatically and no number is
 * typed into this file.
 */
const ALL_FIGURES = Object.values(PRICING).flatMap((tier) =>
  [tier.founding, tier.standard].flatMap((ladder) =>
    Object.values(ladder).map((amount) => formatPrice(amount)),
  ),
);

const ALL_CURRENCIES = [
  ...new Set(Object.values(PRICING).flatMap((tier) => Object.keys(tier.founding))),
];

describe('ReadinessAssessmentHero', () => {
  it('renders the headline as the page h1 from the constants', () => {
    renderWithProviders(<ReadinessAssessmentHero />);
    expect(
      screen.getByRole('heading', { level: 1, name: ASSESSMENT_HERO.headline }),
    ).toBeInTheDocument();
  });

  it('renders the subhead and the meta line from the constants', () => {
    renderWithProviders(<ReadinessAssessmentHero />);
    expect(screen.getByTestId('readiness-hero-subhead')).toHaveTextContent(
      ASSESSMENT_HERO.subhead,
    );
    expect(screen.getByTestId('readiness-hero-meta')).toHaveTextContent(
      ASSESSMENT_HERO.meta,
    );
  });

  // The booking href is BookingButton's contract and is asserted in
  // BookingButton.test.jsx; this file only checks that the hero mounts it and
  // labels it from the constant.
  it('mounts the booking CTA as a link labelled from the constants', () => {
    renderWithProviders(<ReadinessAssessmentHero />);
    expect(screen.getByTestId('readiness-hero-booking')).toBe(
      screen.getByRole('link', { name: ASSESSMENT_HERO.ctaLabel }),
    );
  });

  // Sections 6.3 and 4.9: the hero offers the same quieter written fallback as
  // the closing CtaBand. Every expectation derives from ASSESSMENT_CTA_BAND and
  // ROUTE_CONTACT, so no copy string and no path literal is typed here.
  it('renders the written fallback as a plain link beneath the booking CTA', () => {
    renderWithProviders(<ReadinessAssessmentHero />);
    const booking = screen.getByTestId('readiness-hero-booking');
    const fallback = screen.getByTestId('readiness-hero-fallback');

    expect(fallback).toBe(
      screen.getByRole('link', { name: ASSESSMENT_CTA_BAND.fallbackLabel }),
    );
    expect(fallback).toHaveAttribute('href', ROUTE_CONTACT);
    expect(fallback.tagName).toBe('A');
    expect(fallback.className).not.toMatch(/\bbtn\b/);
    expect(fallback).not.toBe(booking);
    expect(
      booking.compareDocumentPosition(fallback) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it('carries no price figure and no currency code', () => {
    renderWithProviders(<ReadinessAssessmentHero />);
    const { textContent } = screen.getByTestId('readiness-hero');

    ALL_FIGURES.forEach((figure) => {
      expect(textContent).not.toContain(figure);
    });
    ALL_CURRENCIES.forEach((code) => {
      expect(textContent).not.toContain(code);
    });
  });

  it('has no accessibility violations', async () => {
    cleanup();
    const { container } = renderWithProviders(<ReadinessAssessmentHero />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
