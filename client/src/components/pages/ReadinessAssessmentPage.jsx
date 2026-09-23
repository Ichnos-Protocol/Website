import Container from "react-bootstrap/Container";

import BookingButton from "../molecules/BookingButton";
import Breadcrumb from "../molecules/Breadcrumb";
import ProcessSteps from "../molecules/ProcessSteps";
import SeoHead from "../molecules/SeoHead";
import AssessmentAuthor from "../organisms/AssessmentAuthor";
import AssessmentFaq from "../organisms/AssessmentFaq";
import AssessmentInputs from "../organisms/AssessmentInputs";
import AssessmentNextSteps from "../organisms/AssessmentNextSteps";
import AssessmentWindow from "../organisms/AssessmentWindow";
import AudiencePanels from "../organisms/AudiencePanels";
import CtaBand from "../organisms/CtaBand";
import DeliverablesGrid from "../organisms/DeliverablesGrid";
import PublishedWork from "../organisms/PublishedWork";
import ReadinessAssessmentHero from "../organisms/ReadinessAssessmentHero";
import ScopeBoundary from "../organisms/ScopeBoundary";
import { ASSESSMENT_CTA_BAND } from "../../constants/readinessAssessmentContent";
import { ROUTE_CONTACT } from "../../constants/routes";
import { READINESS_ASSESSMENT_META } from "../../constants/seoMeta";
import { PAGE_STRUCTURED_DATA } from "../../constants/structuredData";

// Composition only. The page now assembles the breadcrumb, the section 4.1
// hero, the section 4.2 audience panels, the section 4.2.2 window, the
// section 4.3 deliverables, the section 4.4 process, the section 4.5
// inputs, the section 4.5.1 next steps, the section 4.6 scope boundary, the
// section 4.7 author line, the section 4.7.1 published work, the section 4.8
// questions and the section 4.9 closing band. Every copy string, price and
// date lives in `readinessAssessmentContent.js` and reaches the DOM through
// the organisms, so this file holds no copy, calls no `interpolate` and
// imports no pricing. Passing ASSESSMENT_CTA_BAND values and a BookingButton
// node into CtaBand props is composition, not copy ownership: the band's
// action is deliberately supplied here, so the same band serves the passport
// page with a different action. The head block is composition too: SeoHead
// receives the meta and schema constants, and the page still holds no copy
// and imports no pricing.
//
// The breadcrumb container is deliberately tighter than the page default:
// the hero has to start high enough that its headline, subhead and CTA all
// land on the first phone screen (spec section 8 item 13). The hero's own
// padding in `.readiness-hero` is the other lever on that.
export default function ReadinessAssessmentPage() {
  return (
    <div data-testid="readiness-assessment-page">
      <SeoHead
        meta={READINESS_ASSESSMENT_META}
        schemas={PAGE_STRUCTURED_DATA.readinessAssessment}
      />
      <Container className="pt-4 pb-2">
        <Breadcrumb />
      </Container>
      <ReadinessAssessmentHero />
      <Container>
        <AudiencePanels />
        <AssessmentWindow />
        <DeliverablesGrid />
        <ProcessSteps />
        <AssessmentInputs />
        <AssessmentNextSteps />
        <ScopeBoundary />
        <AssessmentAuthor />
        <PublishedWork />
        <AssessmentFaq />
        <CtaBand
          headline={ASSESSMENT_CTA_BAND.headline}
          action={
            <BookingButton
              label={ASSESSMENT_CTA_BAND.ctaLabel}
              testId="readiness-cta-booking"
            />
          }
          fallbackTo={ROUTE_CONTACT}
          fallbackLabel={ASSESSMENT_CTA_BAND.fallbackLabel}
        />
      </Container>
    </div>
  );
}
