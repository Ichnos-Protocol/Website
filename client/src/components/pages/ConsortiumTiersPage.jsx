import { useState } from "react";
import Alert from "react-bootstrap/Alert";
import Card from "react-bootstrap/Card";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import ListGroup from "react-bootstrap/ListGroup";
import Row from "react-bootstrap/Row";
import Spinner from "react-bootstrap/Spinner";

import { CONSORTIUM_TIERS_META } from "../../constants/seoMeta";
import { PAGE_STRUCTURED_DATA } from "../../constants/structuredData";
import { CONSORTIUM_TIER_DESCRIPTIONS } from "../../constants/consortiumContent";
import {
  useGetTiersQuery,
  useSetTierMutation,
} from "../../features/consortium/consortiumApi";
import PageTransition from "../templates/PageTransition";
import SeoHead from "../molecules/SeoHead";
import ConsortiumTiersError from "../molecules/ConsortiumTiersError";
import AdvisoryPageHero from "../organisms/AdvisoryPageHero";
import Button from "../atoms/Button";

const PAGE_TITLE = "Consortium tiers";
const PAGE_SUBTITLE = "The participation options open to your registration.";
const SUCCESS_MESSAGE =
  "Thank you. You are registered for the consortium. We answer within five working days; the first group call is in October 2026.";
const SELECT_ERROR = "Something went wrong. Please try again.";

// Figures come from the server, prose from the client; a tier id the client
// has no prose for is dropped rather than rendered half-empty.
function mergeTiers(tiers) {
  return (tiers ?? [])
    .map((tier) => ({ ...tier, ...CONSORTIUM_TIER_DESCRIPTIONS[tier.tierId] }))
    .filter((tier) => Boolean(tier.description));
}

export default function ConsortiumTiersPage() {
  const { data, isLoading, error } = useGetTiersQuery();
  const [setTier] = useSetTierMutation();
  const [status, setStatus] = useState(null);

  const handleSelect = async (tierId) => {
    try {
      await setTier(tierId).unwrap();
      setStatus({ variant: "success", text: SUCCESS_MESSAGE });
    } catch {
      setStatus({ variant: "danger", text: SELECT_ERROR });
    }
  };

  const offer = data?.data ?? {};
  const tiers = mergeTiers(offer.tiers);
  const recurringFees = offer.recurringFees ?? [];

  let content = null;

  if (isLoading) {
    content = <Spinner animation="border" className="d-block mx-auto" />;
  } else if (error) {
    content = <ConsortiumTiersError error={error} />;
  } else {
    content = (
      <>
        {status && <Alert variant={status.variant}>{status.text}</Alert>}
        <Row className="g-4 mb-4">
          {tiers.map((tier) => (
            <Col key={tier.tierId} md={6}>
              <Card className="h-100">
                <Card.Body>
                  <Card.Title>{tier.title}</Card.Title>
                  <Card.Text>{tier.description}</Card.Text>
                  {tier.priceLabel && <p>{tier.priceLabel}</p>}
                  <Button
                    aria-label={`Choose ${tier.title}`}
                    onClick={() => handleSelect(tier.tierId)}
                  >
                    Choose
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
        {recurringFees.length > 0 && (
          <ListGroup className="mb-4">
            {recurringFees.map((fee) => (
              <ListGroup.Item key={fee}>{fee}</ListGroup.Item>
            ))}
          </ListGroup>
        )}
        {offer.termNote && <p>{offer.termNote}</p>}
        {offer.capacityNote && <p>{offer.capacityNote}</p>}
      </>
    );
  }

  return (
    <div>
      <SeoHead
        meta={CONSORTIUM_TIERS_META}
        schemas={PAGE_STRUCTURED_DATA.consortiumTiers}
      />

      <PageTransition>
        <AdvisoryPageHero title={PAGE_TITLE} subtitle={PAGE_SUBTITLE} />
        <Container className="py-5">{content}</Container>
      </PageTransition>
    </div>
  );
}
