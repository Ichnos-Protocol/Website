import { afterEach, describe, it, expect, vi } from 'vitest';

import { renderWithProviders } from '../../test-utils';

describe('CatenaXQualifierSpan', () => {
  afterEach(() => {
    vi.resetModules();
    vi.doUnmock('../../constants/catenaXStatus');
  });

  it('renders the muted qualifier span while the qualification is pending', async () => {
    const { default: CatenaXQualifierSpan } = await import(
      './CatenaXQualifierSpan'
    );
    const { getCatenaXQualifierText } = await import(
      '../../constants/catenaXStatus'
    );

    const { container } = renderWithProviders(<CatenaXQualifierSpan />);

    const span = container.querySelector('span.catenax-qualifier-pending');
    expect(span).toBeTruthy();
    expect(span.textContent).toBe(getCatenaXQualifierText());
  });

  it('renders nothing once the qualification is granted', async () => {
    vi.resetModules();
    vi.doMock('../../constants/catenaXStatus', () => ({
      CATENA_X_QUALIFICATION_GRANTED: true,
      CATENA_X_QUALIFIER_CLASS: 'catenax-qualifier-pending',
      getCatenaXQualifierText: () => '',
    }));

    const { default: CatenaXQualifierSpan } = await import(
      './CatenaXQualifierSpan'
    );

    const { container } = renderWithProviders(<CatenaXQualifierSpan />);

    expect(container).toBeEmptyDOMElement();
  });
});
