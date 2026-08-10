import { Link } from "react-router-dom";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";

import ServiceMicroline from "../molecules/ServiceMicroline";

function ServiceCard({
  icon,
  title,
  description,
  passportLink,
  comingSoon,
  lead,
  microline,
}) {
  const cardClass = [
    "h-100 service-card",
    comingSoon && "service-card--coming-soon",
    lead && "service-card--lead",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Col xs={12} md={6} lg={4} className="mb-4">
      <Card className={cardClass}>
        <Card.Body>
          {icon && (
            <i
              className={`bi ${icon} fs-2 mb-3 text-accent d-block`}
              aria-hidden="true"
            />
          )}
          <Card.Title className="h5 mb-2 service-card-title">
            {title}
          </Card.Title>
          <Card.Text className="service-card-text">{description}</Card.Text>
          {passportLink && !comingSoon && (
            <Link to={passportLink} className="fw-semibold text-decoration-none">
              Learn more →
            </Link>
          )}
          <ServiceMicroline segments={microline} />
        </Card.Body>
      </Card>
    </Col>
  );
}

export default function ServicesGroup({
  id,
  label,
  services = [],
  nested = false,
  kicker,
  heading,
  lede,
}) {
  const Wrapper = nested ? "div" : "section";
  const Heading = nested ? "h3" : "h2";
  const wrapperClass = nested ? "services-group-nested py-4" : "services-group py-5";

  return (
    <Wrapper id={id} className={wrapperClass}>
      {kicker && (
        <p className="services-group-kicker text-uppercase small fw-semibold text-accent mb-2">
          {kicker}
        </p>
      )}
      <Heading className="fw-bold mb-3">{heading || label}</Heading>
      {lede && <p className="services-group-lede lead mb-4">{lede}</p>}
      <Row className="g-4">
        {services.map((service) => (
          <ServiceCard key={service.id} {...service} />
        ))}
      </Row>
    </Wrapper>
  );
}
