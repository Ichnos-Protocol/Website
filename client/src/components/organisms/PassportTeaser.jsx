import { Element } from 'react-scroll';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import { Link } from 'react-router-dom';

const DATA_TEASER_HEADING = 'The ASEAN data layer';
const DATA_TEASER_BODY =
  'We deliver Catena-X-compatible carbon, provenance, and composition data for ASEAN-made battery materials, cells, and modules — structured so European importers have a passport-ready dataset. We feed your passport; we do not replace it.';
const DATA_TEASER_CTA = 'Explore the data layer →';

export default function PassportTeaser() {
  return (
    <Element name="data">
      <section
        id="data"
        className="py-5"
        data-testid="data-teaser"
      >
        <Container>
          <Row className="justify-content-center">
            <Col lg={8} md={10}>
              <Card
                bg="dark"
                text="white"
                className="passport-teaser-card border-0 shadow"
              >
                <Card.Body>
                  <h2 className="h3 mb-3">{DATA_TEASER_HEADING}</h2>
                  <p className="mb-4">{DATA_TEASER_BODY}</p>
                  <Link to="/data" className="fw-semibold link-light">
                    {DATA_TEASER_CTA}
                  </Link>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>
    </Element>
  );
}
