import Container from "react-bootstrap/Container";

import { PASSPORT_META } from "../../constants/seoMeta";
import { PAGE_STRUCTURED_DATA } from "../../constants/structuredData";
import { PASSPORT_HERO } from "../../constants/passportContent";
import SeoHead from "../molecules/SeoHead";
import AdvisoryPageHero from "../organisms/AdvisoryPageHero";
import PassportStatusTimeline from "../organisms/PassportStatusTimeline";
import PassportValueChainCase from "../organisms/PassportValueChainCase";
import PassportCatenaXStack from "../organisms/PassportCatenaXStack";
import PassportBuildStack from "../organisms/PassportBuildStack";
import PassportRoleBand from "../organisms/PassportRoleBand";
import PassportCustomers from "../organisms/PassportCustomers";
import PassportOffer from "../organisms/PassportOffer";
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
        <PassportStatusTimeline />
        <PassportValueChainCase />
        <PassportCatenaXStack />
        <PassportBuildStack />
        <PassportRoleBand />
        <PassportCustomers />
        <PassportOffer />
        <PassportRoadmap />
        <ContactSection />
      </Container>
    </div>
  );
}
