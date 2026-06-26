import { Fragment } from 'react';
import { Element } from 'react-scroll';
import Container from 'react-bootstrap/Container';
import Badge from 'react-bootstrap/Badge';
import { Link } from 'react-router-dom';

import { HOMEPAGE_STACK_BAND } from '../../constants/landingContent';

export default function CompanySnapshot() {
  const { heading, layers, summary } = HOMEPAGE_STACK_BAND;

  return (
    <Element name="company">
      <section
        id="company"
        className="py-5 section-rhythm-alt"
        data-testid="company-snapshot"
      >
        <Container>
          <h2 className="text-center fw-bold mb-4">{heading}</h2>
          <div className="d-flex flex-wrap align-items-stretch justify-content-center gap-2 mb-4 stack-band">
            {layers.map((layer, index) => (
              <Fragment key={layer.id}>
                <div
                  className={`text-center p-3 rounded stack-band-layer${
                    layer.highlight ? ' stack-band-layer--highlight' : ''
                  }`}
                >
                  <span className="d-block fw-semibold">{layer.label}</span>
                  {layer.providers ? (
                    <span className="d-block small text-muted-custom">
                      {layer.providers}
                    </span>
                  ) : null}
                  {layer.highlight ? (
                    <Badge bg="primary" className="mt-2">
                      Ichnos
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
          <p
            className="text-center lead mx-auto mb-4 company-snapshot-lead"
            data-testid="company-snapshot-paragraph"
          >
            {summary}
          </p>
          <div className="text-center mt-4">
            <Link to="/team" className="fw-semibold">
              Meet the team →
            </Link>
          </div>
        </Container>
      </section>
    </Element>
  );
}
