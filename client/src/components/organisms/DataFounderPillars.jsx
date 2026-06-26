import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Badge from "react-bootstrap/Badge";

import { DATA_FOUNDER } from "../../constants/dataContent";

function PillarCard({ pillar }) {
  return (
    <Col md={6} className="mb-4">
      <Card data-testid={`data-pillar-${pillar.id}`} className="h-100 service-card">
        <Card.Body>
          <Card.Title as="h3" className="h5">
            {pillar.title}
          </Card.Title>
          <Card.Text>{pillar.body}</Card.Text>
        </Card.Body>
      </Card>
    </Col>
  );
}

export default function DataFounderPillars() {
  const { heading, paragraph, pillars, credibilityRow } = DATA_FOUNDER;

  return (
    <section data-testid="data-founder" className="py-5">
      <h2 className="section-heading mb-3">{heading}</h2>
      <p className="lead mb-4">{paragraph}</p>
      <Row>
        {pillars.map((pillar) => (
          <PillarCard key={pillar.id} pillar={pillar} />
        ))}
      </Row>
      <div className="d-flex flex-wrap gap-2 mt-3">
        {credibilityRow.map((chip) => (
          <Badge key={chip} bg="" className="badge-status-live">
            {chip}
          </Badge>
        ))}
      </div>
    </section>
  );
}
