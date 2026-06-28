import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";

import { PASSPORT_CUSTOMERS } from "../../constants/passportContent";

export default function PassportCustomers() {
  const { heading, intro, groups } = PASSPORT_CUSTOMERS;

  return (
    <section id="customers" className="py-5" data-testid="passport-customers">
      <h2 className="section-heading mb-3">{heading}</h2>
      <p className="lead mb-4">{intro}</p>
      <Row>
        {groups.map((group) => (
          <Col xs={12} md={4} key={group.id} className="mb-4">
            <Card className="h-100">
              <Card.Body>
                <Card.Title as="h3" className="h5 fw-bold mb-3">
                  {group.label}
                </Card.Title>
                <Card.Text>{group.body}</Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </section>
  );
}
