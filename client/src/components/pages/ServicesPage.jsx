import Container from "react-bootstrap/Container";

import { SERVICES_META } from "../../constants/seoMeta";
import { PAGE_STRUCTURED_DATA } from "../../constants/structuredData";
import {
  SERVICES_PAGE_CONTENT,
  SERVICES_SECTIONS,
} from "../../constants/services";
import { useScrollToSection } from "../../hooks/useScrollToSection";
import PageTransition from "../templates/PageTransition";
import NavbarSkeleton from "../molecules/NavbarSkeleton";
import ContentCardSkeleton from "../molecules/ContentCardSkeleton";
import SeoHead from "../molecules/SeoHead";
import AdvisoryPageHero from "../organisms/AdvisoryPageHero";
import ServicesGroup from "../organisms/ServicesGroup";
import ContactSection from "../organisms/ContactSection";

const servicesSkeleton = (
  <>
    <NavbarSkeleton />
    <Container className="py-5">
      <ContentCardSkeleton count={3} />
    </Container>
  </>
);

export default function ServicesPage() {
  useScrollToSection();

  return (
    <div>
      <SeoHead meta={SERVICES_META} schemas={PAGE_STRUCTURED_DATA.services} />

      <PageTransition skeleton={servicesSkeleton}>
        <AdvisoryPageHero
          title={SERVICES_PAGE_CONTENT.title}
          subtitle={SERVICES_PAGE_CONTENT.subtitle}
        />

        <Container>
          {SERVICES_SECTIONS.map((section) => (
            <ServicesGroup
              key={section.id}
              id={section.id}
              label={section.label}
              intro={section.intro}
              items={section.items}
              teaser={section.teaser}
              cta={section.cta}
            />
          ))}
          <ContactSection />
        </Container>
      </PageTransition>
    </div>
  );
}
