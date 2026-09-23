import { axe } from 'vitest-axe';
import { renderWithProviders, screen, within, cleanup } from '../../test-utils';
import DeliverablesGrid from './DeliverablesGrid';
import { ASSESSMENT_DELIVERABLES } from '../../constants/readinessAssessmentContent';

/*
 * Section 4.3 in its rendered form. Every expected value is derived from
 * ASSESSMENT_DELIVERABLES.items and never restated here, so an amendment to the
 * fenced copy moves the expectation with the source.
 */

describe('DeliverablesGrid', () => {
  it('renders the deliverables in the source order of the constant', () => {
    renderWithProviders(<DeliverablesGrid />);
    const rendered = screen
      .getAllByTestId(/^deliverable-/)
      .map((card) => card.getAttribute('data-testid'));

    expect(rendered).toEqual(
      ASSESSMENT_DELIVERABLES.items.map((item) => `deliverable-${item.id}`),
    );
  });

  ASSESSMENT_DELIVERABLES.items.forEach((item) => {
    it(`renders the ${item.id} card copy from the constants`, () => {
      renderWithProviders(<DeliverablesGrid />);
      const card = screen.getByTestId(`deliverable-${item.id}`);

      expect(
        within(card).getByRole('heading', { level: 3, name: item.title }),
      ).toBeInTheDocument();
      expect(card).toHaveTextContent(item.body);
    });
  });

  it('stacks to one column and pairs from the medium breakpoint', () => {
    renderWithProviders(<DeliverablesGrid />);
    screen.getAllByTestId(/^deliverable-/).forEach((card) => {
      const column = card.closest('.col-12');

      expect(column).not.toBeNull();
      expect(column).toHaveClass('col-md-6');
    });
  });

  it('states no count of data points', () => {
    renderWithProviders(<DeliverablesGrid />);
    expect(screen.getByTestId('deliverables-grid').textContent).not.toMatch(
      /\d/,
    );
  });

  it('gives the cards no badge or header treatment', () => {
    const { container } = renderWithProviders(<DeliverablesGrid />);

    expect(
      container.querySelector('.badge, .pillar-badge, .card-header'),
    ).toBeNull();
    screen.getAllByTestId(/^deliverable-/).forEach((card) => {
      expect(card).toHaveClass('readiness-deliverable');
    });
  });

  it('has no accessibility violations', async () => {
    cleanup();
    const { container } = renderWithProviders(<DeliverablesGrid />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
