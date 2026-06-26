import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";

import { DATA_SOLUTION, DATA_SOLUTION_TILES } from "../../constants/dataContent";

function TileCard({ tile }) {
  return (
    <Col md={6} className="mb-4">
      <Card data-testid={`data-tile-${tile.id}`} className="h-100 service-card">
        <Card.Body>
          <Card.Title as="h3" className="h5">
            {tile.title}
          </Card.Title>
          <Card.Text>{tile.body}</Card.Text>
          <p className="small text-accent mb-0">{tile.regulation}</p>
        </Card.Body>
      </Card>
    </Col>
  );
}

function SubList({ heading, items }) {
  return (
    <div className="mb-4">
      <h3 className="h5 mb-3">{heading}</h3>
      <ul className="mb-0">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

export default function DataSolutionSection() {
  const {
    heading,
    narrative,
    deliveryHeading,
    deliveryMethod,
    stepsHeading,
    steps,
    standardsHeading,
    standards,
  } = DATA_SOLUTION;

  return (
    <section data-testid="data-solution" className="py-5">
      <h2 className="section-heading mb-3">{heading}</h2>
      <p className="lead mb-4">{narrative}</p>
      <Row>
        {DATA_SOLUTION_TILES.map((tile) => (
          <TileCard key={tile.id} tile={tile} />
        ))}
      </Row>
      <SubList heading={deliveryHeading} items={deliveryMethod} />
      <SubList heading={stepsHeading} items={steps} />
      <SubList heading={standardsHeading} items={standards} />
    </section>
  );
}
