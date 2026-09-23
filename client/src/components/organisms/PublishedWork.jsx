import { ASSESSMENT_PUBLISHED_WORK } from '../../constants/readinessAssessmentContent';

// Section 4.7.1. Each item renders its `text` and nothing else. `factDate` is
// audit metadata for the section 8 item 19 review: it must never be spread
// onto the element, passed as an attribute or rendered.
//
// The list order is the constant's order, and no label or logo accompanies
// this list.
//
// The root test id is load-bearing. The page-level date guard in
// ReadinessAssessmentPage.test.jsx draws its boundary on `published-work`:
// it subtracts this subtree from the bare-year sweep and sweeps the subtree
// on its own. Renaming the test id means updating that guard in the same
// change.
export default function PublishedWork() {
  return (
    <section className="pb-5" data-testid="published-work">
      <h2 className="section-heading mb-3" data-testid="published-work-heading">
        {ASSESSMENT_PUBLISHED_WORK.heading}
      </h2>
      <ul className="list-unstyled mb-0">
        {ASSESSMENT_PUBLISHED_WORK.items.map((item, index) => (
          <li key={item.text} data-testid={`published-work-item-${index}`}>
            {item.text}
          </li>
        ))}
      </ul>
    </section>
  );
}
