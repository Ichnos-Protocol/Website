import { Link } from "react-router-dom";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";

const ServiceCard = ({ icon, title, description }) => (
  <Col xs={12} md={6} lg={4} className="mb-4">
    <Card className="h-100 service-card">
      <Card.Body>
        {icon && (
          <i
            className={`bi ${icon} fs-2 mb-3 text-accent d-block`}
            aria-hidden="true"
          />
        )}
        <Card.Title className="h5 mb-2 service-card-title">{title}</Card.Title>
        <Card.Text className="service-card-text">{description}</Card.Text>
      </Card.Body>
    </Card>
  </Col>
);

export default function ServicesGroup({
  id,
  label,
  intro,
  items = [],
  teaser,
  cta,
}) {
  return (
    <section id={id} className="services-group py-5">
      <h2 className="fw-bold mb-3">{label}</h2>
      {intro && <p className="services-group-intro mb-4">{intro}</p>}

      {teaser ? (
        <p className="services-group-teaser mb-3">{teaser}</p>
      ) : (
        <Row className="g-4">
          {items.map((item) => (
            <ServiceCard key={item.id} {...item} />
          ))}
        </Row>
      )}

      {cta && (
        <Link
          to={cta.to}
          className="mt-3 d-inline-block fw-semibold text-decoration-none"
        >
          {cta.label}
        </Link>
      )}
    </section>
  );
}
