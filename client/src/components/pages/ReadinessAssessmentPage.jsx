import Container from "react-bootstrap/Container";

import BookingButton from "../molecules/BookingButton";
import Breadcrumb from "../molecules/Breadcrumb";
import ProcessSteps from "../molecules/ProcessSteps";
import SeoHead from "../molecules/SeoHead";
import AssessmentAudience from "../organisms/AssessmentAudience";
import AssessmentFaq from "../organisms/AssessmentFaq";
import AssessmentInputs from "../organisms/AssessmentInputs";
import AssessmentNextSteps from "../organisms/AssessmentNextSteps";
import AssessmentWindow from "../organisms/AssessmentWindow";
import AudiencePanels from "../organisms/AudiencePanels";
import CtaBand from "../organisms/CtaBand";
import DeliverablesGrid from "../organisms/DeliverablesGrid";
import ReadinessAssessmentHero from "../organisms/ReadinessAssessmentHero";
import ScopeBoundary from "../organisms/ScopeBoundary";
import { ASSESSMENT_CTA_BAND } from "../../constants/readinessAssessmentContent";
import { ROUTE_CONTACT } from "../../constants/routes";
import { READINESS_ASSESSMENT_META } from "../../constants/seoMeta";
import { PAGE_STRUCTURED_DATA } from "../../constants/structuredData";

// Composition only. Every copy string, price and date lives in
// `readinessAssessmentContent.js` and reaches the DOM through the organisms,
// so this file holds no copy, calls no `interpolate` and imports no pricing.
// Passing ASSESSMENT_CTA_BAND values and a BookingButton node into CtaBand
// props is composition, not copy ownership: the band's action is deliberately
// supplied here, so the same band serves the passport page with a different
// action. The head block is composition too.
//
// Section order, reworked by owner amendment 2026-09-23, reads as a
// consultation rather than a brochure: what it is (hero), why now (window),
// who it applies to (audience plus panels), what you get (deliverables), how
// it runs (process), what we need (inputs), what it is not (boundary), act
// (mid band), where it leads (next steps), objections (FAQ), act again
// (final band).
//
// Two bands, at the page's two highest-intent moments. The mid band follows
// the boundary, where the reader has the full picture; it keeps a headline
// and the quieter written fallback. The final band follows the FAQ, where the
// last objection has just been answered; it is a button alone, so nothing
// competes with it. Sections 4.7 and 4.7.1, the author line and the published
// work, were deleted in the same amendment.
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
        <AssessmentWindow />
        <AssessmentAudience />
        <AudiencePanels />
        <DeliverablesGrid />
        <ProcessSteps />
        <AssessmentInputs />
        <ScopeBoundary />
        <CtaBand
          testId="readiness-cta-mid"
          headline={ASSESSMENT_CTA_BAND.midHeadline}
          action={
            <BookingButton
              label={ASSESSMENT_CTA_BAND.midCtaLabel}
              testId="readiness-cta-mid-booking"
            />
          }
          fallbackTo={ROUTE_CONTACT}
          fallbackLabel={ASSESSMENT_CTA_BAND.fallbackLabel}
        />
        <AssessmentNextSteps />
        <AssessmentFaq />
        <CtaBand
          testId="readiness-cta-final"
          action={
            <BookingButton
              label={ASSESSMENT_CTA_BAND.finalCtaLabel}
              testId="readiness-cta-final-booking"
            />
          }
        />
      </Container>
    </div>
  );
}
