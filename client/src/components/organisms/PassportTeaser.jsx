import { Element } from 'react-scroll';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import { Link } from 'react-router-dom';

import { PASSPORT_TEASER } from '../../constants/landingContent';

export default function PassportTeaser() {
  return (
    <Element name="passport">
      <section id="passport" className="py-5" data-testid="passport-teaser">
        <Container>
          <Row className="justify-content-center">
            <Col lg={8} md={10}>
              <Card
                bg="dark"
                text="white"
                className="passport-teaser-card border-0 shadow"
              >
                <Card.Body>
                  <h2 className="h3 mb-3">{PASSPORT_TEASER.heading}</h2>
                  <p className="mb-4">{PASSPORT_TEASER.body}</p>
                  <Link
                    to={PASSPORT_TEASER.ctaHref}
                    className="fw-semibold link-light"
                  >
                    {PASSPORT_TEASER.ctaLabel}
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
