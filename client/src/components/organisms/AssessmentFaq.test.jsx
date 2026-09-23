import { axe } from 'vitest-axe';
import { renderWithProviders, screen, cleanup } from '../../test-utils';
import AssessmentFaq from './AssessmentFaq';
import {
  ASSESSMENT_FAQ,
  PRICING,
  formatPrice,
  getCurrentPrice,
  interpolate,
} from '../../constants/readinessAssessmentContent';

/*
 * Section 4.8 in its rendered form, and section 8 item 5: every answer is in
 * the initial DOM without a click.
 *
 * Nothing in this file restates a copy string, a figure or a currency code.
 * Every expected value is produced by the constants module itself.
 */

// Same token grammar as the constants module (see AudiencePanels.test.jsx).
const PRICE_TOKEN = /\{([a-z]+)\.([A-Z]{3})\}/g;

function tokensIn(text) {
  return [...text.matchAll(PRICE_TOKEN)].map(([, tierId, currency]) => ({
    tierId,
    currency,
  }));
}

// Resolves every price token against one named ladder, independently of
// interpolate(), so the closed branch is checked against its own expectation.
function withLadder(text, ladder) {
  return text.replace(PRICE_TOKEN, (token, tierId, currency) =>
    formatPrice(PRICING[tierId][ladder][currency]),
  );
}

const PRICED_ENTRIES =ASSESSMENT_FAQ.entries.filter(
  (entry) => tokensIn(entry.answer).length > 0,
);

// Every tier flipped closed, built locally so the exported PRICING is never
// mutated.
const CLOSED_PRICING = Object.fromEntries(
  Object.entries(PRICING).map(([id, tier]) => [
    id,
    { ...tier, foundingOpen: false },
  ]),
);

describe('AssessmentFaq', () => {
  it('renders every entry in the source order of the constant', () => {
    renderWithProviders(<AssessmentFaq />);
    const rendered = screen
      .getAllByTestId(/^assessment-faq-(?!question-|answer-|heading$)/)
      .map((entry) => entry.getAttribute('data-testid'));

    expect(rendered).toHaveLength(5);
    expect(rendered).toEqual(
      ASSESSMENT_FAQ.entries.map((entry) => 'assessment-faq-' + entry.id),
    );
  });

  it('renders every question from the constant', () => {
    renderWithProviders(<AssessmentFaq />);
    ASSESSMENT_FAQ.entries.forEach((entry) => {
      expect(
        screen.getByTestId(`assessment-faq-question-${entry.id}`),
      ).toHaveTextContent(entry.question);
    });
  });

  it('puts every answer in the initial DOM while every entry is closed', () => {
    renderWithProviders(<AssessmentFaq />);
    ASSESSMENT_FAQ.entries.forEach((entry) => {
      expect(screen.getByTestId(`assessment-faq-${entry.id}`).open).toBe(
        false,
      );
      expect(
        screen.getByTestId(`assessment-faq-answer-${entry.id}`).textContent,
      ).toBe(interpolate(entry.answer));
    });
  });

  it('uses native disclosure elements and no accordion', () => {
    const { container } = renderWithProviders(<AssessmentFaq />);
    const details = container.querySelectorAll('details');

    expect(details).toHaveLength(ASSESSMENT_FAQ.entries.length);
    details.forEach((element) => {
      expect(element.querySelectorAll('summary')).toHaveLength(1);
    });
    expect(container.querySelector('.accordion, [data-bs-toggle]')).toBeNull();
  });

  it('prices the cost answer from the current-price selector', () => {
    renderWithProviders(<AssessmentFaq />);
    expect(PRICED_ENTRIES.length).toBeGreaterThan(0);

    PRICED_ENTRIES.forEach((entry) => {
      const answer = screen.getByTestId(`assessment-faq-answer-${entry.id}`);
      tokensIn(entry.answer).forEach(({ tierId, currency }) => {
        expect(answer).toHaveTextContent(
          formatPrice(getCurrentPrice(tierId, currency)),
        );
      });
      expect(answer.textContent).not.toContain('{');
    });
  });

  // The cost answer carries all three tiers, and the ladders overlap across
  // tiers (one tier's founding figure is another tier's standard figure), so
  // a per-figure "not contained" check cannot tell the branches apart. The
  // whole answer is compared instead, against each ladder resolved token by
  // token.
  it('renders the standard figures once the founding window is closed', () => {
    renderWithProviders(<AssessmentFaq pricing={CLOSED_PRICING} />);
    PRICED_ENTRIES.forEach((entry) => {
      const { textContent } = screen.getByTestId(
        `assessment-faq-answer-${entry.id}`,
      );

      expect(textContent).toBe(withLadder(entry.answer, 'standard'));
      expect(textContent).not.toBe(withLadder(entry.answer, 'founding'));
    });
    Object.values(PRICING).forEach((tier) => {
      expect(tier.foundingOpen).toBe(true);
    });
  });

  it('renders no currency symbol', () => {
    const { container } = renderWithProviders(<AssessmentFaq />);
    expect(container.textContent).not.toMatch(/[€$£¥]/);
  });

  it('has no accessibility violations', async () => {
    cleanup();
    const { container } = renderWithProviders(<AssessmentFaq />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
