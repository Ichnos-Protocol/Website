import { axe } from 'vitest-axe';
import { renderWithProviders, screen, within, cleanup } from '../../test-utils';
import ScopeBoundary from './ScopeBoundary';
import { ASSESSMENT_SCOPE_BOUNDARY } from '../../constants/readinessAssessmentContent';

/*
 * Section 4.6 in its rendered form. Expected values come from
 * ASSESSMENT_SCOPE_BOUNDARY, never from a restated copy string.
 */

describe('ScopeBoundary', () => {
  it('renders every boundary line in the source order of the constant', () => {
    renderWithProviders(<ScopeBoundary />);
    const items = screen.getAllByRole('listitem');

    expect(items).toHaveLength(ASSESSMENT_SCOPE_BOUNDARY.length);
    expect(items.map((item) => item.textContent)).toEqual(
      ASSESSMENT_SCOPE_BOUNDARY,
    );
  });

  it('renders the lines as a single list', () => {
    renderWithProviders(<ScopeBoundary />);
    const list = screen.getByRole('list');

    expect(within(list).getAllByRole('listitem')).toHaveLength(
      ASSESSMENT_SCOPE_BOUNDARY.length,
    );
  });

  it('has no accessibility violations', async () => {
    cleanup();
    const { container } = renderWithProviders(<ScopeBoundary />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
