import { axe } from 'vitest-axe';
import { renderWithProviders, screen, cleanup } from '../../test-utils';
import PassportRoadmap from './PassportRoadmap';
import { PASSPORT_ROADMAP } from '../../constants/passportContent';

describe('PassportRoadmap', () => {
  it('renders the section with its testid', () => {
    renderWithProviders(<PassportRoadmap />);
    expect(screen.getByTestId('passport-roadmap')).toBeInTheDocument();
  });

  it('renders the heading at level 2', () => {
    renderWithProviders(<PassportRoadmap />);
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: PASSPORT_ROADMAP.heading,
      }),
    ).toBeInTheDocument();
  });

  it('renders the ESP/BAP role-model phrase', () => {
    const { container } = renderWithProviders(<PassportRoadmap />);
    expect(container).toHaveTextContent(
      'Enablement Service Provider (ESP) and Business Application Provider (BAP)',
    );
  });

  it('has no accessibility violations', async () => {
    cleanup();
    const { container } = renderWithProviders(<PassportRoadmap />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
