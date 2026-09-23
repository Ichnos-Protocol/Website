import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';

import { ASSESSMENT_DELIVERABLES } from '../../constants/readinessAssessmentContent';

// Section 4.3. The four deliverables render in ASSESSMENT_DELIVERABLES source
// order; never sort, filter or slice them. There is no section heading here
// because the specification fences no heading string for this section, and
// inventing one would put copy in a component.
//
// Two columns from 768px and one column below it come from Col xs={12}
// md={6} and nothing else: no media query, no grid class of our own, no
// breakpoint prop beyond these two.
//
// All four cards carry an identical class set. The section 4.3 implementer
// note forbids stating a count of data points, and the same equal-weight
// rule as the audience panels applies: no numbering, no icon, no badge, no
// Card.Header, no "featured" variant, here or in the stylesheet.
export default function DeliverablesGrid() {
  return (
    <section className="py-5" data-testid="deliverables-grid">
      <Row>
        {ASSESSMENT_DELIVERABLES.map((item) => (
          <Col xs={12} md={6} className="mb-4" key={item.id}>
            <Card
              className="h-100 readiness-deliverable"
              data-testid={`deliverable-${item.id}`}
            >
              <Card.Body>
                <Card.Title as="h3" className="h5">
                  {item.title}
                </Card.Title>
                <Card.Text>{item.body}</Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </section>
  );
}
