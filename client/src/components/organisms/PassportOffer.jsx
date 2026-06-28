import { Link } from "react-router-dom";

import { PASSPORT_OFFER } from "../../constants/passportContent";
import { CATENA_X_TITLE_BASE } from "../../constants/catenaXStatus";
import CatenaXQualifierSpan from "../atoms/CatenaXQualifierSpan";

export default function PassportOffer() {
  const { heading, paragraphs, ctaLabel, ctaHref } = PASSPORT_OFFER;

  return (
    <section id="ichnos-offer" className="py-5" data-testid="passport-offer">
      <p className="section-eyebrow" data-testid="passport-offer-eyebrow">
        {CATENA_X_TITLE_BASE}
        <CatenaXQualifierSpan />
      </p>
      <h2 className="section-heading mb-3">{heading}</h2>
      {paragraphs.map((paragraph, index) => (
        <p key={index} className="mb-3">
          {paragraph}
        </p>
      ))}
      <Link to={ctaHref} className="fw-semibold">
        {ctaLabel}
      </Link>
    </section>
  );
}
