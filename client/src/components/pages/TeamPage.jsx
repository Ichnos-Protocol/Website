import { TEAM_META } from "../../constants/seoMeta";
import { PAGE_STRUCTURED_DATA } from "../../constants/structuredData";
import {
  TEAM_CTA,
  TEAM_MEMBERS,
  TEAM_PAGE_HEADER,
} from "../../constants/teamContent";
import SeoHead from "../molecules/SeoHead";
import BookingButton from "../molecules/BookingButton";
import AdvisoryPageHero from "../organisms/AdvisoryPageHero";
import FounderProfile from "../organisms/FounderProfile";
import CtaBand from "../organisms/CtaBand";
import VisionStatement from "../organisms/VisionStatement";

export default function TeamPage() {
  return (
    <div>
      <SeoHead meta={TEAM_META} schemas={PAGE_STRUCTURED_DATA.team} />

      <AdvisoryPageHero
        title={TEAM_PAGE_HEADER.title}
        subtitle={TEAM_PAGE_HEADER.subtitle}
      />

      <div className="container">
        {TEAM_MEMBERS.map((member) => (
          <FounderProfile key={member.id} member={member} />
        ))}
        {/* No headline: the band follows the last profile and nothing should
            compete with the action. */}
        <CtaBand
          testId="team-cta"
          action={
            <BookingButton label={TEAM_CTA.label} testId="team-cta-booking" />
          }
        />
        <VisionStatement />
      </div>
    </div>
  );
}
