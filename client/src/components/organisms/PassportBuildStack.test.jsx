import { axe } from 'vitest-axe';
import { renderWithProviders, screen, cleanup } from '../../test-utils';
import PassportBuildStack from './PassportBuildStack';
import { PASSPORT_BUILD_STACK } from '../../constants/passportContent';

describe('PassportBuildStack', () => {
  it('renders the section with its testid', () => {
    renderWithProviders(<PassportBuildStack />);
    expect(screen.getByTestId('passport-build-stack')).toBeInTheDocument();
  });

  it('renders the heading at level 2', () => {
    renderWithProviders(<PassportBuildStack />);
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: PASSPORT_BUILD_STACK.heading,
      }),
    ).toBeInTheDocument();
  });

  it('renders a representative standards label', () => {
    const { container } = renderWithProviders(<PassportBuildStack />);
    expect(container).toHaveTextContent('CX-0143');
  });

  it('has no accessibility violations', async () => {
    cleanup();
    const { container } = renderWithProviders(<PassportBuildStack />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
