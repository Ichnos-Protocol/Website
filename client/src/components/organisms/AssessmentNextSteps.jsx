import { Link } from 'react-router-dom';

import { ASSESSMENT_NEXT_STEPS } from '../../constants/readinessAssessmentContent';
import { ROUTE_SERVICES } from '../../constants/routes';

// Section 4.5.1. The heading, body and link label are fenced copy and render
// from the constant verbatim. The hosting option in the body keeps exactly
// the wording the constant already fences; it is never reworded, shortened
// or restyled here.
//
// Each continuation path is named and never priced: no figure, no currency
// and no interpolation belong in this section.
//
// The link destination comes from ROUTE_SERVICES because routes.js is the
// only place in client/src where a route path literal may live.
export default function AssessmentNextSteps() {
  return (
    <section className="py-5" data-testid="assessment-next-steps">
      <h2
        className="section-heading mb-3"
        data-testid="assessment-next-steps-heading"
      >
        {ASSESSMENT_NEXT_STEPS.heading}
      </h2>
      <p data-testid="assessment-next-steps-body">
        {ASSESSMENT_NEXT_STEPS.body}
      </p>
      <Link to={ROUTE_SERVICES} data-testid="assessment-next-steps-link">
        {ASSESSMENT_NEXT_STEPS.linkLabel}
      </Link>
    </section>
  );
}
