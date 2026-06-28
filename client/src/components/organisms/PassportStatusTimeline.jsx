import { PASSPORT_STATUS } from "../../constants/passportContent";

export default function PassportStatusTimeline() {
  const { heading, intro, milestones } = PASSPORT_STATUS;

  return (
    <section id="status" className="py-5" data-testid="passport-status">
      <h2 className="section-heading mb-3">{heading}</h2>
      <p className="lead mb-4">{intro}</p>
      <ul className="passport-timeline list-unstyled">
        {milestones.map((milestone) => (
          <li key={milestone.date} className="passport-timeline-item mb-3">
            <span className="passport-timeline-date fw-bold d-block">
              {milestone.date}
            </span>
            <span className="passport-timeline-text">{milestone.text}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
