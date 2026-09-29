import { ASSESSMENT_WINDOW } from "../../constants/readinessAssessmentContent";

// Section 4.2.2, rendered between the audience panels and the deliverables.
// The copy states the arithmetic in prose rather than counting down to a
// date, so it stays true without maintenance: no Date, no interval, no state,
// no <time>, no "days remaining" wording belongs in this file.
//
// The constant carries no {passportDate} token today, so nothing here is
// interpolated. A no-op interpolate() call would only manufacture the
// appearance of a resolved date. If the fenced copy is ever amended to carry
// the token, this component MUST start routing the affected string through
// interpolate() in the same change; the colocated test fails the moment a
// token appears in the constant, precisely so that cannot be forgotten.
//
// The section must never gain a due diligence or carbon-footprint deadline:
// the enforceable dates live in regulatoryDates.js and render through
// Panel B alone.
export default function AssessmentWindow() {
  return (
    <section className="py-5" data-testid="assessment-window">
      <h2
        className="section-heading mb-3"
        data-testid="assessment-window-heading"
      >
        {ASSESSMENT_WINDOW.heading}
      </h2>
      <p className="mb-3" data-testid="assessment-window-body">
        {ASSESSMENT_WINDOW.body}
      </p>
      <p
        className="readiness-window-closing mb-0"
        data-testid="assessment-window-closing"
      >
        {ASSESSMENT_WINDOW.closing}
      </p>
    </section>
  );
}
