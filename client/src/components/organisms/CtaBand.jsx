import { Link } from 'react-router-dom';

// A closing call-to-action band: a headline, one primary action and an
// optional quieter text link beneath it.
//
// Decision D1 draws the boundary. The band owns the layout and the fallback
// link; the parent owns every destination. `action` is a node the parent
// builds (a BookingButton on the readiness page, a route Link on the passport
// page), so a booking CTA hardcoded here would break that reuse. The fallback
// is a plain router Link, never a Button and never a btn-* class, so it reads
// as the quieter of the two choices. It renders only when both `fallbackTo`
// and `fallbackLabel` are given.
export default function CtaBand({
  headline,
  action,
  fallbackTo,
  fallbackLabel,
  testId = 'cta-band',
}) {
  return (
    <section className="py-5 text-center" data-testid={testId}>
      <h2 className="section-heading">{headline}</h2>
      <div className="mt-4" data-testid={`${testId}-action`}>
        {action}
      </div>
      {fallbackTo && fallbackLabel && (
        <Link
          to={fallbackTo}
          className="d-block mt-3 text-muted-custom"
          data-testid={`${testId}-fallback`}
        >
          {fallbackLabel}
        </Link>
      )}
    </section>
  );
}
