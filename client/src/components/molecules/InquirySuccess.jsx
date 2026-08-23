import Alert from "react-bootstrap/Alert";

import Button from "../atoms/Button";

export default function InquirySuccess({ onBook }) {
  return (
    <>
      <Alert variant="success">
        Inquiry submitted! We'll respond within 24 hours.
      </Alert>
      <Button onClick={onBook}>Book a Meeting</Button>
    </>
  );
}
