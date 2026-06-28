import { Element } from 'react-scroll';
import Container from 'react-bootstrap/Container';

import { WHY_ICHNOS } from '../../constants/landingContent';
import { CATENA_X_TITLE_BASE } from '../../constants/catenaXStatus';
import CatenaXQualifierSpan from '../atoms/CatenaXQualifierSpan';

function renderParagraph(text) {
  if (!text.includes(CATENA_X_TITLE_BASE)) return text;
  const [before, after] = text.split(CATENA_X_TITLE_BASE);
  return (
    <>
      {before}
      {CATENA_X_TITLE_BASE}
      <CatenaXQualifierSpan />
      {after}
    </>
  );
}

export default function WhyIchnosSection() {
  return (
    <Element name="company">
      <section
        id="company"
        className="py-5 section-rhythm-alt"
        data-testid="why-ichnos"
      >
        <Container>
          <h2 className="text-center fw-bold mb-4">{WHY_ICHNOS.heading}</h2>
          {WHY_ICHNOS.paragraphs.map((paragraph) => (
            <p key={paragraph.slice(0, 32)} className="lead mx-auto mb-4">
              {renderParagraph(paragraph)}
            </p>
          ))}
        </Container>
      </section>
    </Element>
  );
}
