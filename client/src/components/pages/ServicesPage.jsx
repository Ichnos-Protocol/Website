import Container from "react-bootstrap/Container";

import { SERVICES_META } from "../../constants/seoMeta";
import { PAGE_STRUCTURED_DATA } from "../../constants/structuredData";
import {
  SERVICES_PAGE_CONTENT,
  SERVICE_PILLARS,
  getServicesByPillar,
  SERVICES_CTA,
} from "../../constants/services";
import { useScrollToSection } from "../../hooks/useScrollToSection";
import SeoHead from "../molecules/SeoHead";
import BookingButton from "../molecules/BookingButton";
import AdvisoryPageHero from "../organisms/AdvisoryPageHero";
import ServicesGroup from "../organisms/ServicesGroup";
import CtaBand from "../organisms/CtaBand";
import ContactSection from "../organisms/ContactSection";

export default function ServicesPage() {
  useScrollToSection();

  return (
    <div>
      <SeoHead meta={SERVICES_META} schemas={PAGE_STRUCTURED_DATA.services} />

      <AdvisoryPageHero
        title={SERVICES_PAGE_CONTENT.title}
        subtitle={SERVICES_PAGE_CONTENT.subtitle}
      />

      <Container>
        {SERVICE_PILLARS.map((pillar) => (
          <ServicesGroup
            key={pillar.id}
            id={pillar.anchor}
            label={pillar.label}
            subtitle={pillar.subtitle}
            lede={pillar.lede}
            services={getServicesByPillar(pillar.id)}
          />
        ))}
        {/* No headline: the band follows the last pillar and nothing should
            compete with the action. */}
        <CtaBand
          testId="services-cta"
          action={
            <BookingButton
              label={SERVICES_CTA.label}
              testId="services-cta-booking"
            />
          }
        />
        <ContactSection />
      </Container>
    </div>
  );
}
