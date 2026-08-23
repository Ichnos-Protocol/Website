import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const mocks = vi.hoisted(() => ({
  queryState: { data: undefined, isLoading: false, error: undefined },
  querySpy: vi.fn(),
  updateSpy: vi.fn(),
  exportSpy: vi.fn(),
}));

vi.mock('../../features/admin/adminApi', () => ({
  useGetConsortiumRegistrantsQuery: (filters) => {
    mocks.querySpy(filters);
    return mocks.queryState;
  },
  useUpdateConsortiumRegistrantMutation: () => [mocks.updateSpy, {}],
  useLazyExportConsortiumRegistrantsQuery: () => [mocks.exportSpy],
}));

import ConsortiumRegistrations from './ConsortiumRegistrations';

const ROWS = [
  {
    userId: 'uid-1',
    name: 'Jane',
    surname: 'Doe',
    company: 'Acme',
    email: 'jane@acme.test',
    phone: '+39 000',
    linkedin: 'linkedin.com/in/janedoe',
    consortiumPosition: 'Head of Quality',
    consortiumChainRole: 'Cell manufacturer',
    consortiumTier: 'Tier 1',
    consortiumSource: 'website',
    consortiumRegisteredAt: '2026-03-04T10:00:00.000Z',
    consortiumStatus: 'registered',
    consortiumAdminNotes: '',
  },
  {
    userId: 'uid-2',
    name: 'John',
    surname: 'Smith',
    company: 'Beta Cells',
    email: 'john@beta.test',
    consortiumPosition: 'CTO',
    consortiumChainRole: 'Recycler',
    consortiumTier: 'Tier 2',
    consortiumSource: 'event',
    consortiumRegisteredAt: '2026-04-01T08:30:00.000Z',
    consortiumStatus: 'contacted',
    consortiumAdminNotes: 'Follow up',
  },
];

const originalCreateObjectURL = URL.createObjectURL;
const originalRevokeObjectURL = URL.revokeObjectURL;

// userEvent.setup() installs its own navigator.clipboard stub, so the spy has
// to be defined after setup — not in beforeEach — to survive.
function stubClipboard(writeText) {
  Object.defineProperty(navigator, 'clipboard', {
    value: { writeText },
    configurable: true,
  });
}

function captureAnchors() {
  const anchors = [];
  const createElement = document.createElement.bind(document);
  vi.spyOn(document, 'createElement').mockImplementation((tag) => {
    const element = createElement(tag);
    if (tag === 'a') {
      element.click = vi.fn();
      anchors.push(element);
    }
    return element;
  });
  return anchors;
}

describe('ConsortiumRegistrations', () => {
  beforeEach(() => {
    mocks.querySpy.mockClear();
    mocks.updateSpy.mockReset();
    mocks.exportSpy.mockReset();
    mocks.updateSpy.mockReturnValue({ unwrap: () => Promise.resolve({}) });
    mocks.exportSpy.mockReturnValue({
      unwrap: () => Promise.resolve('csv,text'),
    });
    mocks.queryState = {
      data: { data: ROWS },
      isLoading: false,
      error: undefined,
    };
    URL.createObjectURL = vi.fn(() => 'blob:consortium');
    URL.revokeObjectURL = vi.fn();
  });

  afterEach(() => {
    URL.createObjectURL = originalCreateObjectURL;
    URL.revokeObjectURL = originalRevokeObjectURL;
    vi.restoreAllMocks();
  });

  it('renders a spinner while loading', () => {
    mocks.queryState = { data: undefined, isLoading: true, error: undefined };
    render(<ConsortiumRegistrations />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders a failure alert on a query error', () => {
    mocks.queryState = {
      data: undefined,
      isLoading: false,
      error: { status: 500 },
    };
    render(<ConsortiumRegistrations />);
    expect(
      screen.getByText('Could not load consortium registrants.'),
    ).toBeInTheDocument();
  });

  it('renders the empty state when there are no registrants', () => {
    mocks.queryState = { data: { data: [] }, isLoading: false };
    render(<ConsortiumRegistrations />);
    expect(screen.getByText('No consortium registrants')).toBeInTheDocument();
  });

  it('renders every column header and the first row', () => {
    render(<ConsortiumRegistrations />);
    [
      'Name',
      'Company',
      'Position',
      'Chain role',
      'Tier',
      'Source',
      'Registered',
      'Consortium status',
    ].forEach((header) => {
      expect(
        screen.getByRole('columnheader', { name: header }),
      ).toBeInTheDocument();
    });

    const firstRow = screen.getAllByRole('row')[1];
    const cells = within(firstRow).getAllByRole('cell');
    expect(cells.slice(0, 8).map((cell) => cell.textContent)).toEqual([
      'Jane Doe',
      'Acme',
      'Head of Quality',
      'Cell manufacturer',
      'Tier 1',
      'website',
      '2026-03-04',
      'registered',
    ]);
  });

  it('re-queries with the merged filters when selects change', async () => {
    const user = userEvent.setup();
    render(<ConsortiumRegistrations />);

    await user.selectOptions(screen.getByLabelText('Filter by tier'), 'Tier 1');
    await user.selectOptions(
      screen.getByLabelText('Filter by status'),
      'declined',
    );

    expect(mocks.querySpy).toHaveBeenLastCalledWith({
      tier: 'Tier 1',
      source: '',
      status: 'declined',
    });
  });

  it('offers every consortium status in the status filter', () => {
    render(<ConsortiumRegistrations />);
    const statusFilter = screen.getByLabelText('Filter by status');
    const labels = within(statusFilter)
      .getAllByRole('option')
      .map((option) => option.textContent);
    expect(labels).toEqual([
      'All statuses',
      'Registered',
      'Contacted',
      'Readiness',
      'In consortium',
      'Declined',
    ]);
  });

  it('saves an edited status and notes from the detail card', async () => {
    const user = userEvent.setup();
    render(<ConsortiumRegistrations />);

    await user.click(screen.getAllByRole('button', { name: 'Details' })[0]);
    await user.selectOptions(
      screen.getByLabelText('Consortium status'),
      'contacted',
    );
    await user.type(screen.getByLabelText('Admin notes'), 'Called them');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(mocks.updateSpy).toHaveBeenCalledWith({
      userId: 'uid-1',
      status: 'contacted',
      adminNotes: 'Called them',
    });
    expect(await screen.findByText('Registrant updated.')).toBeInTheDocument();
  });

  it('copies every loaded e-mail address to the clipboard', async () => {
    const user = userEvent.setup();
    stubClipboard(vi.fn(() => Promise.resolve()));
    render(<ConsortiumRegistrations />);

    await user.click(screen.getByRole('button', { name: 'Copy all e-mails' }));

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      'jane@acme.test, john@beta.test',
    );
    expect(
      await screen.findByText('E-mail addresses copied to the clipboard.'),
    ).toBeInTheDocument();
  });

  it('reports a clipboard failure without throwing', async () => {
    const user = userEvent.setup();
    stubClipboard(vi.fn(() => Promise.reject(new Error('denied'))));
    render(<ConsortiumRegistrations />);

    await user.click(screen.getByRole('button', { name: 'Copy all e-mails' }));

    expect(
      await screen.findByText('Could not copy the e-mail addresses.'),
    ).toBeInTheDocument();
  });

  it('downloads the Google Contacts CSV with the active filters', async () => {
    const user = userEvent.setup();
    const anchors = captureAnchors();
    render(<ConsortiumRegistrations />);

    await user.selectOptions(screen.getByLabelText('Filter by tier'), 'Tier 1');
    await user.click(
      screen.getByRole('button', { name: 'Export Google Contacts' }),
    );

    expect(mocks.exportSpy).toHaveBeenCalledWith({
      format: 'google-contacts',
      tier: 'Tier 1',
      source: '',
      status: '',
    });
    await waitFor(() => {
      expect(anchors).toHaveLength(1);
    });
    expect(anchors[0].download).toBe('consortium-google-contacts.csv');
    expect(anchors[0].click).toHaveBeenCalled();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:consortium');
  });

  it('requires a group address before the Google Groups export', async () => {
    const user = userEvent.setup();
    render(<ConsortiumRegistrations />);

    await user.click(
      screen.getByRole('button', { name: 'Export Google Groups' }),
    );

    expect(mocks.exportSpy).not.toHaveBeenCalled();
    expect(
      await screen.findByText('Enter a group e-mail address before exporting.'),
    ).toBeInTheDocument();
  });

  it('downloads the Google Groups CSV once a group address is given', async () => {
    const user = userEvent.setup();
    const anchors = captureAnchors();
    render(<ConsortiumRegistrations />);

    await user.type(screen.getByLabelText('Group e-mail'), 'group@ichnos.test');
    await user.click(
      screen.getByRole('button', { name: 'Export Google Groups' }),
    );

    expect(mocks.exportSpy).toHaveBeenCalledWith({
      format: 'google-groups',
      tier: '',
      source: '',
      status: '',
      group: 'group@ichnos.test',
    });
    await waitFor(() => {
      expect(anchors).toHaveLength(1);
    });
    expect(anchors[0].download).toBe('consortium-google-groups.csv');
  });
});
