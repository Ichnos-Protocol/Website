import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { Link } from 'react-router-dom';

import {
  ASSESSMENT_CTA_BAND,
  ASSESSMENT_HERO,
} from '../../constants/readinessAssessmentContent';
import { ROUTE_CONTACT } from '../../constants/routes';
import BookingButton from '../molecules/BookingButton';

// Section 4.1. Copy only: headline, subhead, meta line, CTA label. Nothing
// here is interpolated, because the hero constant carries no token: and it
// carries none because section 4.2.1 rule 5 keeps every figure out of the
// hero. Do not import PRICING or interpolate into this file.
//
// The wrapper class is .readiness-hero and deliberately NOT .hero-section,
// .hero-section--advisory or .advisory-page-hero: all three attach the
// bg-advisory.jpg photo treatment, the first of them through
// `.theme-catenax .hero-section`, which is the scope this page mounts under.
// Section 4.1 specifies no giant visual, so .readiness-hero carries vertical
// padding and nothing else.
//
// .section-subtext already renders --color-text-secondary, which is what the
// meta line needs, so no new class is introduced for it.
//
// Section 6.3: the page carries two booking bands, this hero and the closing
// CtaBand, and both offer the same quieter written fallback. The label is the
// section 4.9 ASSESSMENT_CTA_BAND.fallbackLabel, reused deliberately rather
// than duplicated as new copy, and the destination is ROUTE_CONTACT, so no
// copy literal and no /contact string appears here. ASSESSMENT_CTA_BAND
// carries labels only, so the PRICING rule above is unaffected. The primary
// action stays calendar-first: the fallback is a plain text link, never a
// second button.
export default function ReadinessAssessmentHero() {
  return (
    <header className="readiness-hero" data-testid="readiness-hero">
      <Container>
        <Row className="justify-content-center text-center">
          <Col lg={8} md={10}>
            <h1
              className="page-title mb-3"
              data-testid="readiness-hero-headline"
            >
              {ASSESSMENT_HERO.headline}
            </h1>
            <p
              className="lead section-subtext mb-3"
              data-testid="readiness-hero-subhead"
            >
              {ASSESSMENT_HERO.subhead}
            </p>
            <p
              className="section-subtext mb-4"
              data-testid="readiness-hero-meta"
            >
              {ASSESSMENT_HERO.meta}
            </p>
            <BookingButton
              label={ASSESSMENT_HERO.ctaLabel}
              testId="readiness-hero-booking"
            />
            <Link
              to={ROUTE_CONTACT}
              className="d-block mt-3 text-muted-custom"
              data-testid="readiness-hero-fallback"
            >
              {ASSESSMENT_CTA_BAND.fallbackLabel}
            </Link>
          </Col>
        </Row>
      </Container>
    </header>
  );
}
