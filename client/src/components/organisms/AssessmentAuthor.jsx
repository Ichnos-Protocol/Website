import { ASSESSMENT_AUTHOR } from '../../constants/readinessAssessmentContent';

// Section 4.7, text only. This route is an offering surface, so no label
// imagery, logo or credential strip may ever be added here, and nothing is
// imported from catenaXStatus.js. The page-level guard asserts that no label
// asset and no image renders anywhere on the page.
//
// The optional membership sentence is omitted by owner default. It must not
// be reintroduced without its verification sibling, which is the
// re-verification obligation that decision declined.
export default function AssessmentAuthor() {
  return (
    <section className="pt-5 pb-3" data-testid="assessment-author">
      <p className="mb-0" data-testid="assessment-author-line">
        {ASSESSMENT_AUTHOR}
      </p>
    </section>
  );
}
