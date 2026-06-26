import { axe } from 'vitest-axe';
import { renderWithProviders, screen, cleanup } from '../../test-utils';
import CompanySnapshot from './CompanySnapshot';

describe('CompanySnapshot', () => {
  it('renders the "Where we sit in the stack" heading', () => {
    renderWithProviders(<CompanySnapshot />);
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: 'Where we sit in the stack',
      }),
    ).toBeInTheDocument();
  });

  it('renders the stack-band key phrases', () => {
    const { container } = renderWithProviders(<CompanySnapshot />);
    expect(container.textContent).toContain('Ichnos');
    expect(container.textContent).toContain('Minespider');
    expect(container.textContent).toContain('Path.Era');
  });

  it('renders the full upstream chain in the Ichnos layer label', () => {
    const { container } = renderWithProviders(<CompanySnapshot />);
    expect(container.textContent).toContain('precursors');
    expect(container.textContent).toContain('electrodes');
  });

  it('renders the summary sentence with the positioning phrase', () => {
    renderWithProviders(<CompanySnapshot />);
    const paragraph = screen.getByTestId('company-snapshot-paragraph');
    expect(paragraph.textContent).toContain(
      'between the refinery and the finished passport',
    );
  });

  it('no longer mentions the old advisory positioning', () => {
    const { container } = renderWithProviders(<CompanySnapshot />);
    expect(container.textContent).not.toMatch(/Tier-1/i);
    expect(container.textContent).not.toMatch(/recyclers/i);
  });

  it('renders the "Meet the team →" link to /team', () => {
    renderWithProviders(<CompanySnapshot />);
    const link = screen.getByRole('link', { name: /meet the team/i });
    expect(link).toHaveAttribute('href', '/team');
  });

  it('has no accessibility violations', async () => {
    cleanup();
    const { container } = renderWithProviders(<CompanySnapshot />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
