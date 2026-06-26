import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Badge from "react-bootstrap/Badge";

import { DATA_HERO, DATA_STATUS_BADGE } from "../../constants/dataContent";
import { CONTACT_INFO } from "../../constants/companyInfo";
import Button from "../atoms/Button";

export default function DataHero() {
  return (
    <section
      className="hero-section full-bleed-section d-flex align-items-center"
      data-testid="data-hero"
    >
      <Container>
        <Row className="justify-content-center text-center">
          <Col lg={9} md={11}>
            <h1 className="display-4 fw-bold mb-4 page-title">
              <span className="gradient-text">{DATA_HERO.headline}</span>
            </h1>
            <p className="lead section-subtext mb-4">
              {DATA_HERO.subheadline}
            </p>
            <Badge
              bg=""
              className="badge-status-live mb-4 text-wrap text-break"
              data-testid="data-status-badge"
            >
              {DATA_STATUS_BADGE}
            </Badge>
            <div>
              <Button
                as="a"
                href={CONTACT_INFO.calendly}
                target="_blank"
                rel="noopener noreferrer"
                variant="primary"
              >
                {DATA_HERO.primaryCta.label}
              </Button>
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
}
