import { axe } from 'vitest-axe';
import { renderWithProviders, screen, cleanup } from '../../test-utils';
import PassportCustomers from './PassportCustomers';
import { PASSPORT_CUSTOMERS } from '../../constants/passportContent';

describe('PassportCustomers', () => {
  it('renders the section with its testid', () => {
    renderWithProviders(<PassportCustomers />);
    expect(screen.getByTestId('passport-customers')).toBeInTheDocument();
  });

  it('renders the heading at level 2', () => {
    renderWithProviders(<PassportCustomers />);
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: PASSPORT_CUSTOMERS.heading,
      }),
    ).toBeInTheDocument();
  });

  it('names a partner in the passport-app vendor group', () => {
    const { container } = renderWithProviders(<PassportCustomers />);
    const partnerGroup = PASSPORT_CUSTOMERS.groups.find(
      (group) => group.id === 'passport-app-partners',
    );
    expect(container).toHaveTextContent(partnerGroup.body);
  });

  it('has no accessibility violations', async () => {
    cleanup();
    const { container } = renderWithProviders(<PassportCustomers />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
