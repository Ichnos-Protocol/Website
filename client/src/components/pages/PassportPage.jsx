import Container from "react-bootstrap/Container";
import { Link } from "react-router-dom";

import { PASSPORT_META } from "../../constants/seoMeta";
import { PAGE_STRUCTURED_DATA } from "../../constants/structuredData";
import {
  PASSPORT_HERO,
  PASSPORT_READINESS_CTA,
} from "../../constants/passportContent";
import Button from "../atoms/Button";
import SeoHead from "../molecules/SeoHead";
import AdvisoryPageHero from "../organisms/AdvisoryPageHero";
import RegulatoryTimeline from "../organisms/RegulatoryTimeline";
import PassportValueChainCase from "../organisms/PassportValueChainCase";
import PassportCatenaXStack from "../organisms/PassportCatenaXStack";
import PassportBuildStack from "../organisms/PassportBuildStack";
import PassportRoleBand from "../organisms/PassportRoleBand";
import PassportCustomers from "../organisms/PassportCustomers";
import PassportOffer from "../organisms/PassportOffer";
import CtaBand from "../organisms/CtaBand";
import PassportRoadmap from "../organisms/PassportRoadmap";
import ContactSection from "../organisms/ContactSection";

export default function PassportPage() {
  return (
    <div>
      <SeoHead meta={PASSPORT_META} schemas={PAGE_STRUCTURED_DATA.passport} />

      <AdvisoryPageHero
        eyebrow={PASSPORT_HERO.eyebrow}
        title={PASSPORT_HERO.title}
        subtitle={PASSPORT_HERO.subtitle}
      />

      <Container>
        <RegulatoryTimeline />
        <PassportValueChainCase />
        <PassportCatenaXStack />
        <PassportBuildStack />
        <PassportRoleBand />
        <PassportCustomers />
        <PassportOffer />
        {/* role="link": react-bootstrap labels anchor-shaped Buttons as
            role="button"; this one navigates, same tab, so it is a link. */}
        <CtaBand
          headline={PASSPORT_READINESS_CTA.headline}
          testId="passport-readiness-cta"
          action={
            <Button
              as={Link}
              to={PASSPORT_READINESS_CTA.ctaHref}
              role="link"
              data-testid="passport-readiness-cta-link"
            >
              {PASSPORT_READINESS_CTA.ctaLabel}
            </Button>
          }
        />
        <PassportRoadmap />
        <ContactSection />
      </Container>
    </div>
  );
}
