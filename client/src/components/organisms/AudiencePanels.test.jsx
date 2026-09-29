import { axe } from "vitest-axe";
import { renderWithProviders, screen, within, cleanup } from "../../test-utils";
import AudiencePanels from "./AudiencePanels";
import {
  ASSESSMENT_PANELS,
  PRICING,
  formatPrice,
  getCurrentPrice,
  getPassportDateLabel,
  interpolate,
} from "../../constants/readinessAssessmentContent";

/*
 * Section 8 items 8, 9 and 12 in their rendered form.
 *
 * Nothing in this file restates a copy string, a figure, a currency code or a
 * date. Every expected value is produced by the constants module itself, so
 * an edit to the fenced copy or to PRICING moves the expectation with the
 * source instead of leaving a stale literal here.
 */

// Same token grammar as the constants module, so the tests can find out which
// tier and currency each price line asks for without being told.
const PRICE_TOKEN = /\{([a-z]+)\.([A-Z]{3})\}/g;

function tokensIn(line) {
  return [...line.matchAll(PRICE_TOKEN)].map(([, tierId, currency]) => ({
    tierId,
    currency,
  }));
}

function currenciesOf(panel) {
  return [
    ...new Set(
      panel.priceLines.flatMap((line) =>
        tokensIn(line).map((token) => token.currency),
      ),
    ),
  ];
}

const ALL_CURRENCIES = [...new Set(ASSESSMENT_PANELS.flatMap(currenciesOf))];

// Every tier flipped closed, built locally so the exported PRICING is never
// mutated (the readinessAssessmentContent.test.js pattern).
const CLOSED_PRICING = Object.fromEntries(
  Object.entries(PRICING).map(([id, tier]) => [
    id,
    { ...tier, foundingOpen: false },
  ]),
);

describe("AudiencePanels", () => {
  it("renders the panels in the source order of the constant", () => {
    renderWithProviders(<AudiencePanels />);
    const rendered = screen
      .getAllByTestId(/^audience-panel-/)
      .map((panel) => panel.getAttribute("data-testid"));
    expect(rendered).toEqual(
      ASSESSMENT_PANELS.map((panel) => `audience-panel-${panel.id}`),
    );
  });

  ASSESSMENT_PANELS.forEach((panel) => {
    it(`renders the ${panel.id} panel copy from the constants`, () => {
      renderWithProviders(<AudiencePanels />);
      expect(
        screen.getByRole("heading", { level: 2, name: panel.title }),
      ).toBeInTheDocument();

      const card = screen.getByTestId(`audience-panel-${panel.id}`);
      expect(card).toHaveTextContent(interpolate(panel.body));
      panel.priceLines.forEach((line, index) => {
        expect(
          within(card).getByTestId(`readiness-price-${panel.id}-${index}`),
        ).toHaveTextContent(interpolate(line));
      });
    });

    it(`shows one currency only in the ${panel.id} panel`, () => {
      renderWithProviders(<AudiencePanels />);
      const own = currenciesOf(panel);
      const text = screen.getByTestId(`audience-panel-${panel.id}`).textContent;

      expect(own).toHaveLength(1);
      expect(text).toContain(own[0]);
      ALL_CURRENCIES.filter((code) => code !== own[0]).forEach((other) => {
        expect(text).not.toContain(other);
      });
    });

    it(`prices the ${panel.id} panel from the current-price selector`, () => {
      renderWithProviders(<AudiencePanels />);
      panel.priceLines.forEach((line, index) => {
        const priceLine = screen.getByTestId(
          `readiness-price-${panel.id}-${index}`,
        );
        tokensIn(line).forEach(({ tierId, currency }) => {
          expect(priceLine).toHaveTextContent(
            formatPrice(getCurrentPrice(tierId, currency)),
          );
        });
        expect(priceLine.textContent).not.toContain("{");
      });
    });
  });

  it("resolves the passport date from the regulatory-dates source", () => {
    renderWithProviders(<AudiencePanels />);
    const dated = ASSESSMENT_PANELS.find((panel) =>
      panel.body.includes("{passportDate}"),
    );
    const card = screen.getByTestId(`audience-panel-${dated.id}`);

    expect(card).toHaveTextContent(getPassportDateLabel());
    expect(card.textContent).not.toContain("{passportDate}");
  });

  it("renders no currency symbol", () => {
    const { container } = renderWithProviders(<AudiencePanels />);
    expect(container.textContent).not.toMatch(/[\u20AC$\u00A3\u00A5]/);
  });

  it("gives the price lines no badge treatment", () => {
    const { container } = renderWithProviders(<AudiencePanels />);
    expect(
      container.querySelector(".badge, .pillar-badge, .card-header"),
    ).toBeNull();

    ASSESSMENT_PANELS.forEach((panel) => {
      panel.priceLines.forEach((line, index) => {
        expect(
          screen.getByTestId(`readiness-price-${panel.id}-${index}`),
        ).toHaveClass("readiness-price-line");
      });
    });
  });

  it("renders the standard figures once the founding window is closed", () => {
    renderWithProviders(<AudiencePanels pricing={CLOSED_PRICING} />);
    ASSESSMENT_PANELS.forEach((panel) => {
      panel.priceLines.forEach((line, index) => {
        const priceLine = screen.getByTestId(
          `readiness-price-${panel.id}-${index}`,
        );
        tokensIn(line).forEach(({ tierId, currency }) => {
          expect(priceLine).toHaveTextContent(
            formatPrice(PRICING[tierId].standard[currency]),
          );
          expect(priceLine.textContent).not.toContain(
            formatPrice(PRICING[tierId].founding[currency]),
          );
        });
      });
    });
  });

  it("leaves the exported PRICING unmutated by the closed fixture", () => {
    renderWithProviders(<AudiencePanels pricing={CLOSED_PRICING} />);
    Object.values(PRICING).forEach((tier) => {
      expect(tier.foundingOpen).toBe(true);
    });
  });

  it("has no accessibility violations", async () => {
    cleanup();
    const { container } = renderWithProviders(<AudiencePanels />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
