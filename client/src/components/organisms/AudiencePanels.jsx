import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import { ASSESSMENT_PANELS } from '../../constants/readinessAssessmentContent';
import AudiencePanel from '../molecules/AudiencePanel';

// Sections 4.2 and 4.2.1. Panels render in ASSESSMENT_PANELS source order,
// A then B; never sort, filter or reorder them. The card itself lives in the
// AudiencePanel molecule; this file owns only the section and the grid.
//
// `pricing` is optional and is forwarded unchanged to every panel, which
// passes it straight into interpolate(). The page renders <AudiencePanels />
// with no prop, so `pricing` is undefined and interpolate()'s own
// `pricing = PRICING` default supplies the live model. That is the whole
// mechanism: this component never imports PRICING and never reads `founding`,
// `standard` or `foundingOpen`, and a test can exercise the closed-window
// branch by passing a fixture instead of mutating the export.
export default function AudiencePanels({ pricing }) {
  return (
    <section className="py-5" data-testid="audience-panels">
      <Row>
        {ASSESSMENT_PANELS.map((panel) => (
          <Col xs={12} md={6} className="mb-4" key={panel.id}>
            <AudiencePanel panel={panel} pricing={pricing} />
          </Col>
        ))}
      </Row>
    </section>
  );
}
