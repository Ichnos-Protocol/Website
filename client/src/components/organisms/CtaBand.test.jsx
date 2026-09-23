import { axe } from 'vitest-axe';
import { Link } from 'react-router-dom';
import { renderWithProviders, screen, cleanup } from '../../test-utils';
import CtaBand from './CtaBand';
import { BOOKING_URL } from '../../constants/companyInfo';

/*
 * The reusable closing band. Every value is passed in, so the band is tested
 * with arbitrary fixtures rather than readiness copy. That is also the point
 * of decision D1: the band knows no destination of its own.
 */

const HEADLINE = 'Band headline';
const FALLBACK_TO = '/fallback-target';
const FALLBACK_LABEL = 'Fallback label';

function renderBand(props = {}) {
  return renderWithProviders(
    <CtaBand
      headline={HEADLINE}
      action={<span data-testid="stub-action">Stub action</span>}
      {...props}
    />,
  );
}

describe('CtaBand', () => {
  it('renders the headline as a level-2 heading', () => {
    renderBand();
    expect(
      screen.getByRole('heading', { level: 2, name: HEADLINE }),
    ).toBeInTheDocument();
  });

  it('renders the passed action node', () => {
    renderBand();
    expect(screen.getByTestId('cta-band-action')).toContainElement(
      screen.getByTestId('stub-action'),
    );
  });

  it('renders the fallback as a plain text link to the passed route', () => {
    const { container } = renderBand({
      fallbackTo: FALLBACK_TO,
      fallbackLabel: FALLBACK_LABEL,
    });
    const link = screen.getByRole('link', { name: FALLBACK_LABEL });

    expect(link).toHaveAttribute('href', FALLBACK_TO);
    expect(link).toHaveAttribute('data-testid', 'cta-band-fallback');
    expect(link.className).not.toMatch(/\bbtn\b/);
    expect(container.querySelector('button')).toBeNull();
  });

  it('omits the fallback when no target or label is supplied', () => {
    renderBand();
    expect(screen.queryByTestId('cta-band-fallback')).toBeNull();
    expect(screen.queryByRole('link')).toBeNull();
  });

  it('uses the passed test id for the root and its parts', () => {
    renderBand({
      testId: 'other-band',
      fallbackTo: FALLBACK_TO,
      fallbackLabel: FALLBACK_LABEL,
    });
    expect(screen.getByTestId('other-band')).toBeInTheDocument();
    expect(screen.getByTestId('other-band-action')).toBeInTheDocument();
    expect(screen.getByTestId('other-band-fallback')).toBeInTheDocument();
  });

  it('hardcodes no booking destination', () => {
    const { container } = renderWithProviders(
      <CtaBand
        headline={HEADLINE}
        action={<Link to="/arbitrary-route">Route action</Link>}
        fallbackTo={FALLBACK_TO}
        fallbackLabel={FALLBACK_LABEL}
      />,
    );

    expect(screen.getByRole('link', { name: 'Route action' })).toHaveAttribute(
      'href',
      '/arbitrary-route',
    );
    expect(container.innerHTML).not.toContain(BOOKING_URL);
    container.querySelectorAll('[href]').forEach((element) => {
      expect(element.getAttribute('href')).not.toBe(BOOKING_URL);
    });
  });

  it('has no accessibility violations', async () => {
    cleanup();
    const { container } = renderBand({
      fallbackTo: FALLBACK_TO,
      fallbackLabel: FALLBACK_LABEL,
    });
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
