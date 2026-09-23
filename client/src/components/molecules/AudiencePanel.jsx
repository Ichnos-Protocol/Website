import Card from 'react-bootstrap/Card';

import { interpolate } from '../../constants/readinessAssessmentContent';

// One audience card, rendered once per entry in ASSESSMENT_PANELS. The
// organism owns the section and the grid; everything inside the card lives
// here.
//
// The heading is an h2 under the hero's h1, which keeps the document's
// heading order valid. Panel B's {passportDate} and every {tier.CURRENCY}
// resolve through interpolate() here; no figure and no date is typed.
//
// `pricing` is optional and is forwarded unchanged into both interpolate()
// calls, so interpolate()'s own `pricing = PRICING` default supplies the live
// model when the prop is absent. Never default it here and never import
// PRICING.
//
// Both cards carry an identical class set. Section 4.2 gives the two
// audiences equal weight, so there is no accent border, no background tint,
// no badge and no ordering cue: neither panel may read as recommended.
// Price lines are plain paragraphs for the same reason.
export default function AudiencePanel({ panel, pricing }) {
  return (
    <Card
      className="h-100 readiness-panel"
      data-testid={`audience-panel-${panel.id}`}
    >
      <Card.Body>
        <p className="section-eyebrow">{panel.eyebrow}</p>
        <Card.Title as="h2" className="h4">
          {panel.title}
        </Card.Title>
        <Card.Text>{interpolate(panel.body, pricing)}</Card.Text>
        {panel.priceLines.map((line, index) => (
          <p
            key={line}
            className="readiness-price-line mb-1"
            data-testid={`readiness-price-${panel.id}-${index}`}
          >
            {interpolate(line, pricing)}
          </p>
        ))}
      </Card.Body>
    </Card>
  );
}
