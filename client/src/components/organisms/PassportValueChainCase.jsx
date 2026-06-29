import { PASSPORT_CASE } from "../../constants/passportContent";

export default function PassportValueChainCase() {
  const { heading, paragraphs } = PASSPORT_CASE;

  return (
    <section id="value-chain-case" className="py-5" data-testid="passport-case">
      <h2 className="section-heading mb-3">{heading}</h2>
      {paragraphs.map((paragraph, index) => (
        <p key={index} className="mb-3">
          {paragraph}
        </p>
      ))}
    </section>
  );
}
