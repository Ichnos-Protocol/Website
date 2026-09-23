import { ASSESSMENT_INPUTS } from '../../constants/readinessAssessmentContent';

// Section 4.5. Four plain strings, rendered in source order as a plain list:
// no heading (the specification fences none), no icons, no reordering, no
// truncation and no added copy.
//
// The last line answers the trade-secret objection before the scoping call
// and is load-bearing. It renders verbatim and must never be dropped, split
// across elements or softened.
//
// Testids are index-suffixed because the constant holds bare strings with no
// id of their own, following the readiness-price-${id}-${index} precedent in
// AudiencePanel.jsx.
export default function AssessmentInputs() {
  return (
    <section className="py-5" data-testid="assessment-inputs">
      <ul className="mb-0">
        {ASSESSMENT_INPUTS.map((line, index) => (
          <li key={line} data-testid={`assessment-input-${index}`}>
            {line}
          </li>
        ))}
      </ul>
    </section>
  );
}
