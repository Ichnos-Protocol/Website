import { Link } from 'react-router-dom';
import { Element } from 'react-scroll';
import Container from 'react-bootstrap/Container';

import { SERVICE_PILLARS, getServicesByPillar } from '../../constants/services';
import ServicesGroup from './ServicesGroup';

export default function ServicesSnapshot() {
  return (
    <Element name="services">
      <section id="services" className="py-5">
        <Container>
          <h2 className="text-center fw-bold mb-5">What we do</h2>
          {SERVICE_PILLARS.map((pillar) => (
            <ServicesGroup
              key={pillar.id}
              id={pillar.anchor}
              label={pillar.label}
              services={getServicesByPillar(pillar.id)}
              nested
            />
          ))}
          <div className="text-center mt-4">
            <Link to="/services" className="fw-semibold">
              See full services →
            </Link>
          </div>
        </Container>
      </section>
    </Element>
  );
}
