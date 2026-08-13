import { PASSPORT_CATENAX } from "../../constants/passportContent";

export default function PassportCatenaXStack() {
  const { heading, intro, principlesLead, principles, closing, pointer } =
    PASSPORT_CATENAX;

  return (
    <section
      id="catena-x-stack"
      className="py-5"
      data-testid="passport-catenax"
    >
      <h2 className="section-heading mb-3">{heading}</h2>
      <p className="mb-3">{intro}</p>
      <p className="mb-3">{principlesLead}</p>
      {principles.map((principle) => (
        <p className="mb-2" key={principle.lead}>
          <strong>{principle.lead}</strong> {principle.text}
        </p>
      ))}
      <p className="mb-3">{closing}</p>
      <a
        href={pointer.href}
        target="_blank"
        rel="noopener noreferrer"
        className="fw-semibold"
      >
        {pointer.label}
      </a>
    </section>
  );
}
