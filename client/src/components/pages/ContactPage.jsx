import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import ListGroup from 'react-bootstrap/ListGroup';
import Spinner from 'react-bootstrap/Spinner';

import { openModal as openContactModal } from '../../features/contact/contactSlice';
import { useGetMyRequestsQuery } from '../../features/contact/contactApi';
import { CONTACT_META } from '../../constants/seoMeta';
import { PAGE_STRUCTURED_DATA } from '../../constants/structuredData';
import PageTransition from '../templates/PageTransition';
import MyInquiriesList from '../molecules/MyInquiriesList';
import SeoHead from '../molecules/SeoHead';
import ContactSection from '../organisms/ContactSection';
import ContactForm from '../organisms/ContactForm';
import CalendlyModal from '../organisms/CalendlyModal';

const CONTACT_PAGE_TITLE = 'Contact Ichnos Protocol';
const CONTACT_PAGE_INTRO =
  'Talk to Ichnos Protocol about Catena-X-compatible ASEAN data services, Catena-X onboarding, or battery-systems advisory. Ask the AI assistant for instant answers, then follow up by email, LinkedIn, or a Calendly call. Authenticated visitors keep their full conversation history and pending questions.';
const AI_EXAMPLE_PROMPTS = [
  'What data do you collect from ASEAN sites?',
  'How do you onboard an ASEAN supplier into Catena-X?',
  'Can you be on site for a supplier-diligence visit in Indonesia?',
  'How do you connect to Catena-X / EDC?',
];

export default function ContactPage() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((s) => s.auth.isAuthenticated);
  const [calendlyOpen, setCalendlyOpen] = useState(false);

  const { data: requestsData, isLoading } = useGetMyRequestsQuery(undefined, {
    skip: !isAuthenticated,
  });
  const requests = requestsData?.data || [];

  const handleAddQuestion = (requestId) =>
    dispatch(openContactModal({ requestId }));

  return (
    <div>
      <SeoHead meta={CONTACT_META} schemas={PAGE_STRUCTURED_DATA.contact} />

      <PageTransition>
        <Container>
          {isLoading && (
            <Spinner animation="border" className="d-block mx-auto mb-4" />
          )}

          {isAuthenticated && requests.length > 0 && (
            <MyInquiriesList
              requests={requests}
              onAddQuestion={handleAddQuestion}
              onNewInquiry={() => dispatch(openContactModal())}
            />
          )}

          <header className="text-center mt-4">
            <h1 className="page-title">{CONTACT_PAGE_TITLE}</h1>
            <p className="lead mt-4">{CONTACT_PAGE_INTRO}</p>
          </header>

          <div className="mt-4">
            <p className="fw-bold mb-2 text-center">
              Ask the AI assistant, for example:
            </p>
            <ListGroup>
              {AI_EXAMPLE_PROMPTS.map((prompt) => (
                <ListGroup.Item key={prompt}>{prompt}</ListGroup.Item>
              ))}
            </ListGroup>
          </div>

          <ContactSection persistChat={true} />

          <div className="d-flex flex-wrap gap-2 justify-content-center mt-4">
            <Button
              variant="outline-primary"
              onClick={() => dispatch(openContactModal())}
            >
              Submit a detailed inquiry
            </Button>
            <Button
              variant="outline-primary"
              onClick={() => setCalendlyOpen(true)}
            >
              Schedule a call
            </Button>
          </div>
        </Container>
      </PageTransition>

      <ContactForm />
      <CalendlyModal isOpen={calendlyOpen} onClose={() => setCalendlyOpen(false)} />
    </div>
  );
}
