import { Link } from 'react-router-dom';

// A call-to-action band: an optional headline, one primary action and an
// optional quieter text link beneath it.
//
// Decision D1 draws the boundary. The band owns the layout and the fallback
// link; the parent owns every destination. `action` is a node the parent
// builds (a BookingButton on the readiness page, a route Link on the passport
// page), so a booking CTA hardcoded here would break that reuse. The fallback
// is a plain router Link, never a Button and never a btn-* class, so it reads
// as the quieter of the two choices. It renders only when both `fallbackTo`
// and `fallbackLabel` are given.
//
// `headline` became optional on 2026-09-23. The readiness page ends on a band
// that is a button alone: after the FAQ the reader has just had their last
// objection answered, and a headline there would be one more thing to read
// between them and the only action on offer. An empty `h2` would still take
// heading space and land in the accessibility tree as a nameless heading, so
// the element is omitted rather than emptied.
export default function CtaBand({
  headline,
  action,
  fallbackTo,
  fallbackLabel,
  testId = 'cta-band',
}) {
  return (
    <section className="py-5 text-center" data-testid={testId}>
      {headline && <h2 className="section-heading">{headline}</h2>}
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
