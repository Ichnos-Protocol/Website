import { Link } from 'react-router-dom';
import { Element } from 'react-scroll';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';

import { HOMEPAGE_OFFER_CARDS } from '../../constants/landingContent';

export default function ServicesSnapshot() {
  return (
    <Element name="services">
      <section className="py-5">
        <Container>
          <h2 className="text-center fw-bold mb-5">What we do</h2>
          <Row className="g-4">
            {HOMEPAGE_OFFER_CARDS.map((card) => (
              <Col key={card.id} md={6} lg={4}>
                <Card className="h-100 service-card">
                  <Card.Body className="d-flex flex-column">
                    <h3 className="h5 mb-2 service-card-title">{card.title}</h3>
                    <p className="mb-4 service-card-text">{card.description}</p>
                    <Link
                      to={card.linkTo}
                      className="fw-semibold mt-auto"
                    >
                      {card.linkLabel}
                    </Link>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>
    </Element>
  );
}
