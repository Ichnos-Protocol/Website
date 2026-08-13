import { describe, it, expect } from 'vitest';

import Logo from './Logo';
import { renderWithProviders, screen, fireEvent } from '../../test-utils';

describe('Logo', () => {
  it('renders default logo when no theme is provided', () => {
    renderWithProviders(<Logo />);

    const img = screen.getByAltText('Ichnos Protocol');
    expect(img).toHaveAttribute('src', '/brand/ichnos_mark_dualtone.svg');
  });

  it('renders dark-on-light logo when theme="light"', () => {
    renderWithProviders(<Logo theme="light" />);

    const img = screen.getByAltText('Ichnos Protocol');
    expect(img).toHaveAttribute('src', '/brand/ichnos_mark_dualtone.svg');
  });

  it('renders light-on-dark logo when theme="dark"', () => {
    renderWithProviders(<Logo theme="dark" />);

    const img = screen.getByAltText('Ichnos Protocol');
    expect(img).toHaveAttribute('src', '/brand/ichnos_mark_white.svg');
  });

  it('renders dark-on-light logo when theme="advisory"', () => {
    renderWithProviders(<Logo theme="advisory" />);

    const img = screen.getByAltText('Ichnos Protocol');
    expect(img).toHaveAttribute('src', '/brand/ichnos_mark_dualtone.svg');
  });

  it('remains backwards-compatible with legacy theme="passport"', () => {
    renderWithProviders(<Logo theme="passport" />);

    const img = screen.getByAltText('Ichnos Protocol');
    expect(img).toHaveAttribute('src', '/brand/ichnos_mark_white.svg');
  });

  it('renders the wordmark alongside the mark when withWordmark is set', () => {
    renderWithProviders(<Logo withWordmark />);

    const wordmark = screen.getByTestId('logo-wordmark');
    expect(wordmark).toBeInTheDocument();
    expect(wordmark).toHaveAttribute('aria-hidden', 'true');
    expect(wordmark).toHaveClass('d-none', 'd-sm-inline');
    expect(wordmark).toHaveTextContent('Ichnos Protocol');

    expect(screen.getByText('Ichnos')).toHaveClass('fw-bold');
    expect(screen.getByText('Protocol')).toHaveClass('fw-medium', 'text-accent');

    expect(screen.getByAltText('Ichnos Protocol')).toBeInTheDocument();
  });

  it('renders the mark only when withWordmark is not set', () => {
    renderWithProviders(<Logo />);

    expect(screen.queryByTestId('logo-wordmark')).toBeNull();
    expect(screen.getByAltText('Ichnos Protocol')).toBeInTheDocument();
  });

  it('falls back to text when image fails to load', () => {
    renderWithProviders(<Logo />);

    const img = screen.getByAltText('Ichnos Protocol');
    fireEvent.error(img);

    expect(screen.getByText('ICHNOS PROTOCOL')).toBeInTheDocument();
    expect(screen.queryByAltText('Ichnos Protocol')).toBeNull();
  });
});
