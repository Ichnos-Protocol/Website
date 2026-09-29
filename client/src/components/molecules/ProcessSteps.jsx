import { ASSESSMENT_PROCESS } from "../../constants/readinessAssessmentContent";

// Section 4.4. The three steps render in ASSESSMENT_PROCESS source order as
// an ordered list.
//
// This is a sales sequence, not a regulatory axis. Section 4.4 asks for a
// fresh molecule precisely so the sequence stays uncoupled from the
// regulatory-date single source: this file must never import
// RegulatoryTimeline, regulatoryDates.js, helpers/regulatoryTimeline or
// passportContent, and must never render a date, a today marker, a deferred
// or waiting tag, a connector graphic, an animation or a computed index.
//
// `week` is a display label carried by the constant. Nothing here computes
// it, and no Date is ever constructed. The label reuses .section-eyebrow,
// which needs no new rule and applies no text-transform.
export default function ProcessSteps() {
  return (
    <section className="py-5" data-testid="process-steps">
      <h2 className="section-heading mb-4" data-testid="process-steps-heading">
        {ASSESSMENT_PROCESS.heading}
      </h2>
      <ol className="list-unstyled mb-0">
        {ASSESSMENT_PROCESS.steps.map((step) => (
          <li
            className="mb-4"
            key={step.id}
            data-testid={`process-step-${step.id}`}
          >
            <p className="section-eyebrow mb-1">{step.week}</p>
            <h3 className="h5">{step.title}</h3>
            <p className="mb-0">{step.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
