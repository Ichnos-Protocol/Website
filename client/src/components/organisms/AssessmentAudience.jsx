import { ASSESSMENT_AUDIENCE } from "../../constants/readinessAssessmentContent";

// Section 4.2.0, added by owner amendment 2026-09-23. It frames the two
// audience panels that follow it, so it renders immediately above them and
// never anywhere else on the page.
//
// This section carries no price, no figure and no date. The panels below it
// hold every price on the page and Panel B holds the only passport date, so
// an interpolation here would either duplicate a figure or introduce a second
// rendered date, and the page guard fails on both.
export default function AssessmentAudience() {
  return (
    <section className="py-5" data-testid="assessment-audience">
      <h2
        className="section-heading mb-3"
        data-testid="assessment-audience-heading"
      >
        {ASSESSMENT_AUDIENCE.heading}
      </h2>
      <p data-testid="assessment-audience-body">{ASSESSMENT_AUDIENCE.body}</p>
    </section>
  );
}
