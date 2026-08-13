import { PASSPORT_STATUS } from "../../constants/passportContent";
import {
  REGULATORY_DATES,
  VERIFIED_AS_OF,
} from "../../constants/regulatoryDates";
import {
  formatTimelineDate,
  todayMarkerIndex,
} from "../../helpers/regulatoryTimeline";

// The verification date is interpolated from the data module and is never
// restated as a literal here: re-checking §1 updates VERIFIED_AS_OF alone.
const FOOTNOTE = `Dates verified ${VERIFIED_AS_OF}; deferred items track pending delegated acts.`;

const TODAY_LABEL = "today";
const TAG_DEFERRED = "deferred";
const TAG_PENDING = "pending";

// `formatTimelineDate` renders `18 Feb 2027`; the marker only needs the month
// and year, so the last two tokens are kept. Reusing the helper keeps the
// month names locale-independent, exactly as the helper documents.
function markerLabel(now) {
  const tokens = formatTimelineDate(now.toISOString().slice(0, 10)).split(" ");
  return tokens.slice(-2).join(" ");
}

// `todayMarkerIndex` counts dated entries only, so a `datePending` row must
// not shift the splice point. Map the dated-subsequence index back onto the
// authored array; past the last dated entry the marker goes at the end.
function markerPosition(entries, datedIndex) {
  const datedPositions = entries.flatMap((entry, index) =>
    entry.date ? [index] : [],
  );
  return datedPositions[datedIndex] ?? entries.length;
}

function TimelineNode({ entry }) {
  const modifier = entry.deferred ? " regulatory-timeline__item--deferred" : "";
  const tag = entry.datePending ? TAG_PENDING : TAG_DEFERRED;

  return (
    <li
      className={`regulatory-timeline__item${modifier}`}
      data-testid={`timeline-item-${entry.id}`}
    >
      <span className="regulatory-timeline__date">
        {entry.date ? formatTimelineDate(entry.date) : entry.datePending}
      </span>
      <span className="regulatory-timeline__label">{entry.label}</span>
      <span className="regulatory-timeline__source">{entry.source}</span>
      {entry.deferred && (
        <span className="regulatory-timeline__tag">{tag}</span>
      )}
    </li>
  );
}

export default function RegulatoryTimeline() {
  const now = new Date();
  const position = markerPosition(
    REGULATORY_DATES,
    todayMarkerIndex(REGULATORY_DATES, now),
  );

  return (
    <section
      id="status"
      className="py-5"
      data-testid="passport-regulatory-timeline"
    >
      <h2 className="section-heading mb-3">{PASSPORT_STATUS.heading}</h2>
      <p className="lead mb-4">{PASSPORT_STATUS.intro}</p>
      <ol
        className="regulatory-timeline__axis list-unstyled"
        data-testid="regulatory-timeline-axis"
      >
        {REGULATORY_DATES.slice(0, position).map((entry) => (
          <TimelineNode entry={entry} key={entry.id} />
        ))}
        <li
          className="regulatory-timeline__item regulatory-timeline__item--today"
          data-testid="timeline-today"
        >
          <span className="regulatory-timeline__date">{markerLabel(now)}</span>
          <span className="regulatory-timeline__label">{TODAY_LABEL}</span>
        </li>
        {REGULATORY_DATES.slice(position).map((entry) => (
          <TimelineNode entry={entry} key={entry.id} />
        ))}
      </ol>
      <p
        className="regulatory-timeline__footnote mb-0"
        data-testid="timeline-footnote"
      >
        {FOOTNOTE}
      </p>
    </section>
  );
}
