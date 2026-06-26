import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

import { DATA_CLOSING_CTA } from "../../constants/dataContent";
import { CONTACT_INFO } from "../../constants/companyInfo";
import Button from "../atoms/Button";

export default function DataClosingCta() {
  return (
    <section data-testid="data-closing-cta" className="py-5 text-center">
      <Container>
        <Row className="justify-content-center">
          <Col lg={8} md={10}>
            <p className="lead mb-4">{DATA_CLOSING_CTA.text}</p>
            <Button
              as="a"
              href={CONTACT_INFO.calendly}
              target="_blank"
              rel="noopener noreferrer"
              variant="primary"
            >
              {DATA_CLOSING_CTA.cta.label}
            </Button>
          </Col>
        </Row>
      </Container>
    </section>
  );
}
