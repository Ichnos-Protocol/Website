import {
  ASSESSMENT_FAQ,
  interpolate,
} from '../../constants/readinessAssessmentContent';

// Section 4.8 questions, one native <details>/<summary> per entry of
// ASSESSMENT_FAQ, in source order. Native disclosure elements are required:
// every answer sits in the initial DOM whether or not the entry is open, so
// crawlers, find-in-page and assistive technology reach it without a click
// (spec section 8 item 5). That is why there is no `open` attribute, no
// state, no click handler and no Accordion here.
//
// The section carries no heading element. Section 4.8 fences no heading
// string, and the page must hold no copy literals, so none is invented here.
//
// `pricing` is optional and is forwarded unchanged into interpolate(), so
// interpolate()'s own `pricing = PRICING` default supplies the live model
// when the prop is absent. Never default it here and never import PRICING.
// Never type a figure or a currency symbol in this file: the cost answer
// resolves its {tier.CURRENCY} tokens through interpolate().
export default function AssessmentFaq({ pricing }) {
  return (
    <section className="py-5" data-testid="assessment-faq">
      <h2 className="section-heading mb-4" data-testid="assessment-faq-heading">
        {ASSESSMENT_FAQ.heading}
      </h2>
      {ASSESSMENT_FAQ.entries.map((entry) => (
        <details
          key={entry.id}
          className="mb-3"
          data-testid={`assessment-faq-${entry.id}`}
        >
          <summary
            className="readiness-faq-summary py-2"
            data-testid={`assessment-faq-question-${entry.id}`}
          >
            {entry.question}
          </summary>
          <p
            className="text-muted-custom mt-2 mb-0"
            data-testid={`assessment-faq-answer-${entry.id}`}
          >
            {interpolate(entry.answer, pricing)}
          </p>
        </details>
      ))}
    </section>
  );
}
