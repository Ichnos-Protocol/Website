import { afterEach, describe, it, expect, vi } from 'vitest';

import { renderWithProviders } from '../../test-utils';

describe('CatenaXQualifierSpan', () => {
  afterEach(() => {
    vi.resetModules();
    vi.doUnmock('../../constants/catenaXStatus');
  });

  it('renders nothing once the qualification is granted', async () => {
    const { default: CatenaXQualifierSpan } = await import(
      './CatenaXQualifierSpan'
    );

    const { container } = renderWithProviders(<CatenaXQualifierSpan />);

    expect(container).toBeEmptyDOMElement();
  });

  it('renders the muted qualifier span while the qualification is pending', async () => {
    vi.resetModules();
    vi.doMock('../../constants/catenaXStatus', () => ({
      CATENA_X_QUALIFICATION_GRANTED: false,
      CATENA_X_QUALIFIER_CLASS: 'catenax-qualifier-pending',
      getCatenaXQualifierText: () => ' (qualification in progress)',
    }));

    const { default: CatenaXQualifierSpan } = await import(
      './CatenaXQualifierSpan'
    );

    const { container } = renderWithProviders(<CatenaXQualifierSpan />);

    const span = container.querySelector('span.catenax-qualifier-pending');
    expect(span).toBeTruthy();
    expect(span.textContent).toBe(' (qualification in progress)');
  });
});
