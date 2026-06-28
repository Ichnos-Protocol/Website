import Container from "react-bootstrap/Container";

import { PASSPORT_META } from "../../constants/seoMeta";
import { PAGE_STRUCTURED_DATA } from "../../constants/structuredData";
import { PASSPORT_HERO } from "../../constants/passportContent";
import SeoHead from "../molecules/SeoHead";
import AdvisoryPageHero from "../organisms/AdvisoryPageHero";
import PassportStatusTimeline from "../organisms/PassportStatusTimeline";
import PassportValueChainCase from "../organisms/PassportValueChainCase";
import PassportCatenaXStack from "../organisms/PassportCatenaXStack";
import PassportRoleBand from "../organisms/PassportRoleBand";
import PassportOffer from "../organisms/PassportOffer";
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
        <PassportRoleBand />
        <PassportOffer />
        <ContactSection />
      </Container>
    </div>
  );
}
