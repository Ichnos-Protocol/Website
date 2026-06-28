import { PASSPORT_ROADMAP } from "../../constants/passportContent";

export default function PassportRoadmap() {
  const { heading, body } = PASSPORT_ROADMAP;

  return (
    <section id="roadmap" className="py-5" data-testid="passport-roadmap">
      <h2 className="section-heading mb-3">{heading}</h2>
      <p className="mb-0">{body}</p>
    </section>
  );
}
