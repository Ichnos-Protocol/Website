import { ASSESSMENT_SCOPE_BOUNDARY } from "../../constants/readinessAssessmentContent";

// Section 4.6. A heading plus four plain strings in source order. The order
// is normative: never sort, slice or filter the lines here.
//
// This section discharges claim rules 3 and 6 in visible copy, so every line
// is load-bearing. No line may be dropped, split across elements or softened.
//
// The heading was added by owner amendment 2026-09-23 so the reader meets the
// boundary knowing what it is. It is a heading only: it must never grow body
// copy that softens or qualifies the four lines beneath it.
//
// The muted treatment is deliberate: the boundary reads quieter than the
// deliverables grid above it. It reuses .text-muted-custom and Bootstrap list
// utilities rather than a new class, and takes no inline styles.
//
// Testids are index-suffixed because the lines are bare strings with no id of
// their own, following the AssessmentInputs.jsx precedent.
export default function ScopeBoundary() {
  return (
    <section className="py-5" data-testid="scope-boundary">
      <h2 className="section-heading mb-3" data-testid="scope-boundary-heading">
        {ASSESSMENT_SCOPE_BOUNDARY.heading}
      </h2>
      <ul className="list-unstyled mb-0 text-muted-custom">
        {ASSESSMENT_SCOPE_BOUNDARY.lines.map((line, index) => (
          <li key={line} data-testid={`scope-boundary-line-${index}`}>
            {line}
          </li>
        ))}
      </ul>
    </section>
  );
}
