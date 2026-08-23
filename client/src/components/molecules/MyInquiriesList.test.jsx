import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import MyInquiriesList from './MyInquiriesList';

const inquiryRequest = {
  id: 'req-1',
  status: 'new',
  kind: 'inquiry',
  questions: [{ question: 'How does the battery passport work?' }],
  created_at: '2025-01-10',
};

const consortiumRequest = {
  id: 'req-2',
  status: 'new',
  kind: 'consortium',
  created_at: '2025-01-14',
};

describe('MyInquiriesList', () => {
  it('renders the question and keeps the add-question button for an inquiry row', () => {
    render(
      <MyInquiriesList
        requests={[inquiryRequest]}
        onAddQuestion={vi.fn()}
        onNewInquiry={vi.fn()}
      />,
    );
    expect(
      screen.getByText('How does the battery passport work?'),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add question' })).toBeInTheDocument();
  });

  it('labels a consortium row that carries no question', () => {
    render(
      <MyInquiriesList
        requests={[consortiumRequest]}
        onAddQuestion={vi.fn()}
        onNewInquiry={vi.fn()}
      />,
    );
    expect(screen.getByText('Consortium registration')).toBeInTheDocument();
  });

  it('shows no add-question affordance against a consortium row', () => {
    render(
      <MyInquiriesList
        requests={[inquiryRequest, consortiumRequest]}
        onAddQuestion={vi.fn()}
        onNewInquiry={vi.fn()}
      />,
    );
    expect(screen.getAllByRole('button', { name: 'Add question' })).toHaveLength(1);
  });

  it('calls onAddQuestion with the inquiry row id', async () => {
    const user = userEvent.setup();
    const onAddQuestion = vi.fn();
    render(
      <MyInquiriesList
        requests={[inquiryRequest, consortiumRequest]}
        onAddQuestion={onAddQuestion}
        onNewInquiry={vi.fn()}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Add question' }));
    expect(onAddQuestion).toHaveBeenCalledWith('req-1');
  });

  it('calls onNewInquiry when the new-inquiry button is clicked', async () => {
    const user = userEvent.setup();
    const onNewInquiry = vi.fn();
    render(
      <MyInquiriesList
        requests={[inquiryRequest]}
        onAddQuestion={vi.fn()}
        onNewInquiry={onNewInquiry}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Submit new inquiry' }));
    expect(onNewInquiry).toHaveBeenCalled();
  });
});
