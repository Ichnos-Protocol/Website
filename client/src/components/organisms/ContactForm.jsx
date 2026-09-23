import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import Modal from "react-bootstrap/Modal";

import { closeModal } from "../../features/contact/contactSlice";
import ContactRequestForm from "./ContactRequestForm";
import BookingModal from "./BookingModal";

export default function ContactForm() {
  const dispatch = useDispatch();
  const isOpen = useSelector((s) => s.contact.isOpen);
  const requestId = useSelector((s) => s.contact.requestId);

  const [bookingOpen, setBookingOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);

  const handleClose = () => {
    dispatch(closeModal());
    setFormKey((k) => k + 1);
  };

  return (
    <>
      <Modal show={isOpen} onHide={handleClose} centered size="lg" data-testid="contact-modal">
        <Modal.Header closeButton>
          <Modal.Title>
            {requestId ? "Add a Follow-up Question" : "Submit an Inquiry"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ContactRequestForm
            key={formKey}
            requestId={requestId}
            onBook={() => setBookingOpen(true)}
          />
        </Modal.Body>
      </Modal>
      <BookingModal
        isOpen={bookingOpen}
        onClose={() => setBookingOpen(false)}
      />
    </>
  );
}
