import { ASSESSMENT_SCOPE_BOUNDARY } from '../../constants/readinessAssessmentContent';

// Section 4.6. Four plain strings in source order. The order is normative:
// never sort, slice or filter the constant here.
//
// This section discharges claim rules 3 and 6 in visible copy, so every line
// is load-bearing. No line may be dropped, split across elements or softened.
//
// The muted treatment is deliberate: the boundary reads quieter than the
// deliverables grid above it. It reuses .text-muted-custom and Bootstrap list
// utilities rather than a new class, and takes no inline styles.
//
// Testids are index-suffixed because the constant holds bare strings with no
// id of their own, following the AssessmentInputs.jsx precedent.
export default function ScopeBoundary() {
  return (
    <section className="py-5" data-testid="scope-boundary">
      <ul className="list-unstyled mb-0 text-muted-custom">
        {ASSESSMENT_SCOPE_BOUNDARY.map((line, index) => (
          <li key={line} data-testid={`scope-boundary-line-${index}`}>
            {line}
          </li>
        ))}
      </ul>
    </section>
  );
}
