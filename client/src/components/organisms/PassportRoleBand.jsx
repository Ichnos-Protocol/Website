import { Fragment } from "react";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Badge from "react-bootstrap/Badge";

import { PASSPORT_LOCALIZATION } from "../../constants/passportContent";

function ColumnList({ column }) {
  return (
    <Col xs={12} md={6} className="mb-4">
      <h3 className="h5 fw-bold mb-3">{column.heading}</h3>
      <ul>
        {column.bullets.map((bullet, index) => (
          <li key={index} className="mb-2">
            {bullet}
          </li>
        ))}
      </ul>
    </Col>
  );
}

export default function PassportRoleBand() {
  const { heading, intro, layers, twoColumn } = PASSPORT_LOCALIZATION;

  return (
    <section id="ichnos-role" className="py-5" data-testid="passport-role">
      <h2 className="section-heading mb-3">{heading}</h2>
      <p className="lead mb-4">{intro}</p>
      <div className="d-flex flex-wrap align-items-stretch justify-content-center gap-2 mb-4 stack-band">
        {layers.map((layer, index) => (
          <Fragment key={layer.id}>
            <div
              className={`text-center p-3 rounded stack-band-layer${
                layer.highlight ? " stack-band-layer--highlight" : ""
              }`}
            >
              <span className="d-block fw-semibold">{layer.label}</span>
              {layer.highlight ? (
                <Badge bg="primary" className="mt-2">
                  {layer.role}
                </Badge>
              ) : null}
            </div>
            {index < layers.length - 1 ? (
              <div
                className="d-flex align-items-center fw-bold stack-band-arrow"
                aria-hidden="true"
              >
                →
              </div>
            ) : null}
          </Fragment>
        ))}
      </div>
      <Row>
        <ColumnList column={twoColumn.asean} />
        <ColumnList column={twoColumn.eu} />
      </Row>
    </section>
  );
}
