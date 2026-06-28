import { Link } from "react-router-dom";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";

import CatenaXQualifierSpan from "../atoms/CatenaXQualifierSpan";

function ServiceCard({
  icon,
  title,
  description,
  eyebrow,
  passportLink,
  comingSoon,
}) {
  const cardClass = comingSoon
    ? "h-100 service-card service-card--coming-soon"
    : "h-100 service-card";

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
          {eyebrow && (
            <span className="service-card-eyebrow d-block mb-2">
              {eyebrow}
              <CatenaXQualifierSpan />
            </span>
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
}) {
  const Wrapper = nested ? "div" : "section";
  const Heading = nested ? "h3" : "h2";
  const wrapperClass = nested ? "services-group-nested py-4" : "services-group py-5";

  return (
    <Wrapper id={id} className={wrapperClass}>
      <Heading className="fw-bold mb-3">{label}</Heading>
      <Row className="g-4">
        {services.map((service) => (
          <ServiceCard key={service.id} {...service} />
        ))}
      </Row>
    </Wrapper>
  );
}
