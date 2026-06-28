import { PASSPORT_CATENAX } from "../../constants/passportContent";

export default function PassportCatenaXStack() {
  const { heading, body, pointer } = PASSPORT_CATENAX;

  return (
    <section id="catena-x-stack" className="py-5" data-testid="passport-catenax">
      <h2 className="section-heading mb-3">{heading}</h2>
      <p className="mb-3">{body}</p>
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
