import { axe } from 'vitest-axe';
import { renderWithProviders, screen, within, cleanup } from '../../test-utils';
import AssessmentInputs from './AssessmentInputs';
import { ASSESSMENT_INPUTS } from '../../constants/readinessAssessmentContent';

/*
 * Section 4.5 in its rendered form. Expected values come from
 * ASSESSMENT_INPUTS.lines, never from a restated copy string.
 */

describe('AssessmentInputs', () => {
  it('renders every input line in the source order of the constant', () => {
    renderWithProviders(<AssessmentInputs />);
    const items = screen.getAllByRole('listitem');

    expect(items).toHaveLength(ASSESSMENT_INPUTS.lines.length);
    expect(items.map((item) => item.textContent)).toEqual(ASSESSMENT_INPUTS.lines);
  });

  it('renders the lines as a single list', () => {
    renderWithProviders(<AssessmentInputs />);
    const list = screen.getByRole('list');

    expect(list).toBeInTheDocument();
    expect(within(list).getAllByRole('listitem')).toHaveLength(
      ASSESSMENT_INPUTS.lines.length,
    );
  });

  // The closing line answers the trade-secret objection before the scoping
  // call, and it is load-bearing: it must render verbatim, as one item, and
  // must never be dropped, split across elements or softened.
  it('renders the trade-secret line last and verbatim', () => {
    renderWithProviders(<AssessmentInputs />);
    const items = screen.getAllByRole('listitem');

    expect(items[items.length - 1]).toHaveTextContent(
      ASSESSMENT_INPUTS.lines[ASSESSMENT_INPUTS.lines.length - 1],
    );
  });

  it('has no accessibility violations', async () => {
    cleanup();
    const { container } = renderWithProviders(<AssessmentInputs />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
