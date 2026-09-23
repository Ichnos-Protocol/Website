import Modal from 'react-bootstrap/Modal';

import BookingButton from '../molecules/BookingButton';

export default function BookingModal({ isOpen, onClose }) {
  return (
    <Modal show={isOpen} onHide={onClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Schedule a Call</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p className="mb-3">
          Book a 30-minute scoping call. The booking page opens in a new tab.
        </p>
        <BookingButton label="Book a scoping call" testId="booking-modal-cta" />
      </Modal.Body>
    </Modal>
  );
}
