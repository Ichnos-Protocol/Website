import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

import { DATA_PROBLEM } from "../../constants/dataContent";

function StackStage({ label, isGap, providers, gapLabel }) {
  return (
    <Col xs={6} md className="mb-3 text-center">
      <div className={`p-3 border rounded h-100 ${isGap ? "border-accent" : ""}`}>
        <p className="fw-bold mb-1 small">{label}</p>
        {providers.length > 0 && (
          <p className="small text-muted-custom mb-0">{providers.join(" · ")}</p>
        )}
        {isGap && <p className="small text-accent fw-bold mb-0">{gapLabel}</p>}
      </div>
    </Col>
  );
}

function providersFor(stage) {
  const { stack } = DATA_PROBLEM;
  if (stage === "Refinery") return stack.upstreamProviders;
  if (stage === "Pack & EU importer/OEM") return stack.downstreamProviders;
  return [];
}

export default function DataProblemSection() {
  const { heading, stack, explanation, whyNow, complianceItems } = DATA_PROBLEM;

  return (
    <section data-testid="data-problem" className="py-5">
      <h2 className="section-heading mb-4">{heading}</h2>
      <Row className="align-items-stretch mb-4">
        {stack.stages.map((stage) => (
          <StackStage
            key={stage}
            label={stage}
            isGap={stage === stack.middleLabel}
            providers={providersFor(stage)}
            gapLabel={stack.gapLabel}
          />
        ))}
      </Row>
      <p className="lead mb-4">{explanation}</p>
      <h3 className="h5 mb-3">Why this matters now</h3>
      <ul className="mb-4">
        {whyNow.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <h3 className="h5 mb-3">
        The three compliance items most exposed to the gap
      </h3>
      <ul className="mb-0">
        {complianceItems.map((item) => (
          <li key={item.id}>
            <span className="fw-bold">{item.label}</span> ({item.regulation})
          </li>
        ))}
      </ul>
    </section>
  );
}
