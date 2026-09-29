import { Link } from "react-router-dom";

import { PASSPORT_OFFER } from "../../constants/passportContent";

export default function PassportOffer() {
  const { pointer, ctaLabel, ctaHref } = PASSPORT_OFFER;

  return (
    <section id="ichnos-offer" className="py-5" data-testid="passport-offer">
      <p className="mb-3">{pointer}</p>
      <Link to={ctaHref} className="fw-semibold">
        {ctaLabel}
      </Link>
    </section>
  );
}
