import { axe } from 'vitest-axe';
import { renderWithProviders, screen, within, cleanup } from '../../test-utils';
import ProcessSteps from './ProcessSteps';
import { ASSESSMENT_PROCESS } from '../../constants/readinessAssessmentContent';

/*
 * Section 4.4 in its rendered form. Every expected value comes from
 * ASSESSMENT_PROCESS; no week label, title or body is restated here.
 */

// Markup that would couple this sequence to the regulatory-date axis.
const TIMELINE_SELECTOR =
  '[class*="regulatory-timeline"], [data-testid^="timeline-"]';

describe('ProcessSteps', () => {
  it('renders the steps in the source order of the constant', () => {
    renderWithProviders(<ProcessSteps />);
    const rendered = screen
      .getAllByTestId(/^process-step-/)
      .map((step) => step.getAttribute('data-testid'));

    expect(rendered).toEqual(
      ASSESSMENT_PROCESS.map((step) => `process-step-${step.id}`),
    );
  });

  ASSESSMENT_PROCESS.forEach((step) => {
    it(`renders the ${step.id} step copy from the constants`, () => {
      renderWithProviders(<ProcessSteps />);
      const item = screen.getByTestId(`process-step-${step.id}`);

      expect(item).toHaveTextContent(step.week);
      expect(
        within(item).getByRole('heading', { level: 3, name: step.title }),
      ).toBeInTheDocument();
      expect(item).toHaveTextContent(step.body);
    });
  });

  it('renders the sequence as an ordered list', () => {
    renderWithProviders(<ProcessSteps />);
    const list = screen.getByRole('list');

    expect(list.tagName).toBe('OL');
    expect(within(list).getAllByRole('listitem')).toHaveLength(
      ASSESSMENT_PROCESS.length,
    );
  });

  // Section 4.4 asks for a fresh molecule so the sales sequence stays
  // uncoupled from the regulatory-date single source. No timeline markup, no
  // date, and none of the timeline's own state vocabulary may appear here.
  it('borrows nothing from the regulatory timeline', () => {
    const { container } = renderWithProviders(<ProcessSteps />);
    const { textContent } = screen.getByTestId('process-steps');

    expect(container.querySelector(TIMELINE_SELECTOR)).toBeNull();
    expect(textContent).not.toMatch(/deferred/i);
    expect(textContent).not.toMatch(/pending/i);
    expect(textContent).not.toMatch(/\btoday\b/i);
    expect(textContent).not.toMatch(/\b\d{4}\b/);
  });

  it('has no accessibility violations', async () => {
    cleanup();
    const { container } = renderWithProviders(<ProcessSteps />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
