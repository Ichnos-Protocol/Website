import { axe } from 'vitest-axe';
import { renderWithProviders, screen, cleanup } from '../../test-utils';
import WhyIchnosSection from './WhyIchnosSection';
import { WHY_ICHNOS } from '../../constants/landingContent';
import {
  CATENA_X_TITLE_BASE,
  CATENA_X_QUALIFIER_CLASS,
} from '../../constants/catenaXStatus';

describe('WhyIchnosSection', () => {
  it('renders the heading from WHY_ICHNOS.heading', () => {
    renderWithProviders(<WhyIchnosSection />);
    expect(
      screen.getByRole('heading', { level: 2, name: WHY_ICHNOS.heading }),
    ).toBeInTheDocument();
  });

  it('renders one paragraph per WHY_ICHNOS.paragraphs entry, in order', () => {
    const { container } = renderWithProviders(<WhyIchnosSection />);
    const paragraphs = container.querySelectorAll('p.lead');
    expect(paragraphs).toHaveLength(WHY_ICHNOS.paragraphs.length);
    WHY_ICHNOS.paragraphs.forEach((paragraph, index) => {
      // Match on the paragraph's leading text, which precedes the inlined
      // credential qualifier span in every entry — derived from the
      // constant rather than hard-coded copy.
      expect(paragraphs[index]).toHaveTextContent(paragraph.slice(0, 40));
    });
  });

  it('renders the Catena-X credential with the pending qualifier span', () => {
    const { container } = renderWithProviders(<WhyIchnosSection />);
    expect(container.textContent).toContain(CATENA_X_TITLE_BASE);
    expect(
      container.querySelector(`.${CATENA_X_QUALIFIER_CLASS}`),
    ).toBeInTheDocument();
  });

  it('renders a section with id="company"', () => {
    const { container } = renderWithProviders(<WhyIchnosSection />);
    expect(container.querySelector('section#company')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    cleanup();
    const { container } = renderWithProviders(<WhyIchnosSection />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
