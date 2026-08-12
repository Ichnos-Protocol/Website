import { PASSPORT_CASE } from "../../constants/passportContent";

export default function PassportValueChainCase() {
  const { heading, lead, diagram } = PASSPORT_CASE;

  return (
    <section id="value-chain-case" className="py-5" data-testid="passport-case">
      <h2 className="section-heading mb-3">{heading}</h2>
      <p className="lead mb-4">{lead}</p>
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
