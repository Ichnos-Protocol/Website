import { LANDING_META } from "../../constants/seoMeta";
import { PAGE_STRUCTURED_DATA } from "../../constants/structuredData";
import { useScrollToSection } from "../../hooks/useScrollToSection";
import SeoHead from "../molecules/SeoHead";
import Hero from "../organisms/Hero";
import ServicesSnapshot from "../organisms/ServicesSnapshot";
import WhyIchnosSection from "../organisms/WhyIchnosSection";
import CredentialStrip from "../organisms/CredentialStrip";
import PassportTeaser from "../organisms/PassportTeaser";
import ContactSection from "../organisms/ContactSection";

export default function LandingPage() {
  useScrollToSection();

  return (
    <>
      <SeoHead meta={LANDING_META} schemas={PAGE_STRUCTURED_DATA.landing} />
      <Hero />
      <ServicesSnapshot />
      <WhyIchnosSection />
      <CredentialStrip />
      <PassportTeaser />
      <ContactSection showFullContactLink={true} />
    </>
  );
}
