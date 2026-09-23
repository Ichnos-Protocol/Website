import { axe } from 'vitest-axe';
import { renderWithProviders, screen, cleanup } from '../../test-utils';
import PublishedWork from './PublishedWork';
import { ASSESSMENT_PUBLISHED_WORK } from '../../constants/readinessAssessmentContent';

/*
 * Section 4.7.1 in its rendered form. Expected values come from
 * ASSESSMENT_PUBLISHED_WORK, never from a restated copy string.
 */

const ITEM_TEXTS = ASSESSMENT_PUBLISHED_WORK.items.map((item) => item.text);
const FACT_DATES = ASSESSMENT_PUBLISHED_WORK.items.map((item) => item.factDate);

describe('PublishedWork', () => {
  it('renders the heading from the constant', () => {
    renderWithProviders(<PublishedWork />);

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: ASSESSMENT_PUBLISHED_WORK.heading,
      }),
    ).toBeInTheDocument();
  });

  it('renders every item text in the source order of the constant', () => {
    renderWithProviders(<PublishedWork />);
    const items = screen.getAllByRole('listitem');

    expect(items.map((item) => item.textContent)).toEqual(ITEM_TEXTS);
  });

  // factDate is audit metadata. It must reach neither the text nor any
  // attribute, so both the text and the markup are checked.
  it('never renders a factDate', () => {
    const { container } = renderWithProviders(<PublishedWork />);

    FACT_DATES.forEach((factDate) => {
      expect(container.textContent).not.toContain(factDate);
      expect(container.innerHTML).not.toContain(factDate);
    });
  });

  it('renders no image', () => {
    const { container } = renderWithProviders(<PublishedWork />);

    expect(container.querySelector('img')).toBeNull();
  });

  // The page-level date guard draws its boundary on this test id.
  it('carries the published-work test id on its root', () => {
    const { container } = renderWithProviders(<PublishedWork />);

    expect(screen.getByTestId('published-work')).toBe(
      container.firstElementChild,
    );
  });

  it('has no accessibility violations', async () => {
    cleanup();
    const { container } = renderWithProviders(<PublishedWork />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
