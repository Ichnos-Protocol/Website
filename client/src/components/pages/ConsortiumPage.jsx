import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Card from "react-bootstrap/Card";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";

import { CONSORTIUM_META } from "../../constants/seoMeta";
import { PAGE_STRUCTURED_DATA } from "../../constants/structuredData";
import PageTransition from "../templates/PageTransition";
import SeoHead from "../molecules/SeoHead";
import AdvisoryPageHero from "../organisms/AdvisoryPageHero";
import ContactRequestForm from "../organisms/ContactRequestForm";

const SRC_PATTERN = /^[a-z0-9_-]{1,40}$/;
const SRC_STORAGE_KEY = "consortium_src";
const DEADLINE = Date.UTC(2026, 8, 30, 23, 59, 59);
const HERO_EYEBROW = "INDONESIAN BATTERY VALUE CHAIN · CONSORTIUM";
const REGISTER_TITLE = "Register";
const TIERS_ROUTE = "/consortium/tiers";

const HERO_OPEN = {
  title: "Join the consortium",
  subtitle:
    "One anchor company and up to five of its suppliers, one project, one test environment. Register by 30 September 2026.",
};

const HERO_CLOSED = {
  title: "The first round closed on 30 September 2026",
  subtitle: "Later entries join the next round.",
};

const OFFER_CARDS = Object.freeze([
  {
    title: "What you get",
    body: "A readiness assessment first, a gap assessment of your data against the battery passport data model, and a written plan for closing the gaps.",
  },
  {
    title: "What you bring",
    body: "One product line, the customer request behind it, and one real data extract for that line.",
  },
  {
    title: "How it runs",
    body: "The readiness assessment comes first and is credited to the project. The first group call is in October 2026, the work starts in November 2026. Scope and price are set out in the proposal; registered participants see the tier overview.",
  },
]);

function pickHero(now) {
  return now <= DEADLINE ? HERO_OPEN : HERO_CLOSED;
}

function storeCampaignSource(value) {
  if (!value || !SRC_PATTERN.test(value)) return;
  try {
    window.sessionStorage.setItem(SRC_STORAGE_KEY, value);
  } catch {
    // Blocked storage is acceptable: the marker is optional.
  }
}

export default function ConsortiumPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const src = searchParams.get("src");
  const [hero] = useState(() => pickHero(Date.now()));
  useEffect(() => {
    storeCampaignSource(src);
  }, [src]);

  return (
    <div>
      <SeoHead
        meta={CONSORTIUM_META}
        schemas={PAGE_STRUCTURED_DATA.consortium}
      />
      <PageTransition>
        <AdvisoryPageHero
          eyebrow={HERO_EYEBROW}
          title={hero.title}
          subtitle={hero.subtitle}
        />
        <Container className="py-5">
          <Row className="g-4 mb-5">
            {OFFER_CARDS.map((card) => (
              <Col key={card.title} md={4}>
                <Card className="h-100">
                  <Card.Body>
                    <Card.Title>{card.title}</Card.Title>
                    <Card.Text>{card.body}</Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
          <section id="register">
            <h2 className="mb-4">{REGISTER_TITLE}</h2>
            <ContactRequestForm
              mode="consortium"
              onSuccess={() => navigate(TIERS_ROUTE)}
            />
          </section>
        </Container>
      </PageTransition>
    </div>
  );
}
