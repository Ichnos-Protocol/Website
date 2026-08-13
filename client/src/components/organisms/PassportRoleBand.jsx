import { PASSPORT_LOCALIZATION } from "../../constants/passportContent";

export default function PassportRoleBand() {
  const { heading, intro, diagram } = PASSPORT_LOCALIZATION;

  return (
    <section id="ichnos-role" className="py-5" data-testid="passport-role">
      <h2 className="section-heading mb-3">{heading}</h2>
      <p className="lead mb-4">{intro}</p>
      <a
        className="d-block"
        href={diagram.src}
        target="_blank"
        rel="noopener noreferrer"
      >
        <img
          className="passport-diagram"
          src={diagram.src}
          alt={diagram.alt}
          loading="lazy"
          decoding="async"
        />
      </a>
    </section>
  );
}
