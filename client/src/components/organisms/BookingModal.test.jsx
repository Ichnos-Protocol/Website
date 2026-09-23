import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

import BookingModal from './BookingModal';
import { BOOKING_URL } from '../../constants/companyInfo';

describe('BookingModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders modal with title when isOpen is true', () => {
    render(<BookingModal isOpen={true} onClose={vi.fn()} />);

    expect(screen.getByText('Schedule a Call')).toBeInTheDocument();
  });

  it('does not render modal when isOpen is false', () => {
    render(<BookingModal isOpen={false} onClose={vi.fn()} />);

    expect(screen.queryByText('Schedule a Call')).not.toBeInTheDocument();
  });

  it('renders a booking link pointing at BOOKING_URL', () => {
    render(<BookingModal isOpen={true} onClose={vi.fn()} />);

    const link = screen.getByTestId('booking-modal-cta');
    expect(link).toHaveAttribute('href', BOOKING_URL);
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });
});
