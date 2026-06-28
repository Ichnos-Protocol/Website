import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

import { PASSPORT_BUILD_STACK } from "../../constants/passportContent";

export default function PassportBuildStack() {
  const { heading, body, standardsList } = PASSPORT_BUILD_STACK;

  return (
    <section id="build-stack" className="py-5" data-testid="passport-build-stack">
      <h2 className="section-heading mb-3">{heading}</h2>
      <p className="mb-4">{body}</p>
      <Row>
        {standardsList.map((standard) => (
          <Col xs={12} md={6} key={standard.label} className="mb-3">
            <span className="section-eyebrow fw-semibold d-block">
              {standard.label}
            </span>
            <span className="text-muted-custom">{standard.note}</span>
          </Col>
        ))}
      </Row>
    </section>
  );
}
