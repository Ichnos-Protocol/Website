import { Link } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";

import { CATENAX_META } from "../../constants/seoMeta";
import { PAGE_STRUCTURED_DATA } from "../../constants/structuredData";
import {
  CATENAX_PAGE_HEADER,
  CATENAX_FOCUS_HEADING,
  CATENAX_FOCUS_NOTE,
  CATENAX_FOCUS_AREAS,
  CATENAX_COMMITMENT,
  CATENAX_CTA,
} from "../../constants/catenaXContent";
import PageTransition from "../templates/PageTransition";
import NavbarSkeleton from "../molecules/NavbarSkeleton";
import ContentCardSkeleton from "../molecules/ContentCardSkeleton";
import SeoHead from "../molecules/SeoHead";
import AdvisoryPageHero from "../organisms/AdvisoryPageHero";
import Button from "../atoms/Button";

const catenaXSkeleton = (
  <>
    <NavbarSkeleton />
    <Container className="py-5">
      <ContentCardSkeleton count={3} />
    </Container>
  </>
);

function FocusCard({ area }) {
  return (
    <Col md={6} className="mb-4">
      <Card data-testid={`catenax-focus-${area.id}`} className="h-100">
        <Card.Body>
          <Card.Title as="h3" className="h5">
            {area.title}
          </Card.Title>
          <Card.Text>{area.description}</Card.Text>
        </Card.Body>
      </Card>
    </Col>
  );
}

export default function CatenaXPage() {
  return (
    <div>
      <SeoHead meta={CATENAX_META} schemas={PAGE_STRUCTURED_DATA.catenaX} />

      <PageTransition skeleton={catenaXSkeleton}>
        <AdvisoryPageHero
          title={CATENAX_PAGE_HEADER.title}
          subtitle={CATENAX_PAGE_HEADER.subtitle}
        />

        <Container>
          <section data-testid="catenax-focus" className="py-5">
            <h2 className="section-heading mb-1">{CATENAX_FOCUS_HEADING}</h2>
            <p className="text-secondary mb-4">{CATENAX_FOCUS_NOTE}</p>
            <Row>
              {CATENAX_FOCUS_AREAS.map((area) => (
                <FocusCard key={area.id} area={area} />
              ))}
            </Row>
          </section>

          <section data-testid="catenax-commitment" className="py-5">
            <h2 className="section-heading mb-3">{CATENAX_COMMITMENT.heading}</h2>
            <p className="lead">{CATENAX_COMMITMENT.body}</p>
          </section>

          <section
            data-testid="catenax-cta"
            className="py-5 text-center"
          >
            <Button as={Link} to={CATENAX_CTA.path} variant="primary">
              {CATENAX_CTA.label}
            </Button>
          </section>
        </Container>
      </PageTransition>
    </div>
  );
}
