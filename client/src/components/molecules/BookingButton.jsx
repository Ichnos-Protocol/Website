import Button from '../atoms/Button';
import { BOOKING_URL } from '../../constants/companyInfo';

// The href is BOOKING_URL by reference. No concatenation and no query
// parameters: the booking page owns its own state, and anything appended here
// is noise the scheduler has to ignore.
//
// role="link" overrides react-bootstrap, which labels every anchor-shaped
// Button as role="button". This one navigates to another site, so "link" is
// what a screen reader should announce.
export default function BookingButton({
  label = 'Book a scoping call',
  testId,
  variant,
}) {
  return (
    <Button
      href={BOOKING_URL}
      role="link"
      target="_blank"
      rel="noopener noreferrer"
      data-testid={testId}
      variant={variant}
    >
      {label}
    </Button>
  );
}
