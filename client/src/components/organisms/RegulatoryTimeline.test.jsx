import { axe } from 'vitest-axe';
import { renderWithProviders, screen, cleanup } from '../../test-utils';
import RegulatoryTimeline from './RegulatoryTimeline';
import { PASSPORT_STATUS } from '../../constants/passportContent';
import {
  REGULATORY_DATES,
  VERIFIED_AS_OF,
} from '../../constants/regulatoryDates';
import { formatTimelineDate } from '../../helpers/regulatoryTimeline';

// Structural hooks only — every copy expectation is derived from the imported
// constants so a wording change never has to be restated here.
const ITEM_PREFIX = 'timeline-item-';
const DEFERRED_CLASS = 'regulatory-timeline__item--deferred';

describe('RegulatoryTimeline', () => {
  it('renders the status section with its heading and intro', () => {
    renderWithProviders(<RegulatoryTimeline />);
    expect(
      screen.getByTestId('passport-regulatory-timeline'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: PASSPORT_STATUS.heading,
      }),
    ).toBeInTheDocument();
    expect(screen.getByTestId('passport-regulatory-timeline')).toHaveTextContent(
      PASSPORT_STATUS.intro,
    );
  });

  it.each(REGULATORY_DATES)('renders a node for $id', ({ id }) => {
    renderWithProviders(<RegulatoryTimeline />);
    expect(screen.getByTestId(`${ITEM_PREFIX}${id}`)).toBeInTheDocument();
  });

  it('renders the entries in authored order, never sorted', () => {
    renderWithProviders(<RegulatoryTimeline />);
    const rendered = Array.from(
      screen.getByTestId('regulatory-timeline-axis').children,
    )
      .map((node) => node.dataset.testid)
      .filter((testid) => testid.startsWith(ITEM_PREFIX))
      .map((testid) => testid.slice(ITEM_PREFIX.length));
    expect(rendered).toEqual(REGULATORY_DATES.map(({ id }) => id));
  });

  it.each(REGULATORY_DATES)(
    'shows the date, label and source for $id',
    (entry) => {
      renderWithProviders(<RegulatoryTimeline />);
      const shownDate = entry.date
        ? formatTimelineDate(entry.date)
        : entry.datePending;
      const node = screen.getByTestId(`${ITEM_PREFIX}${entry.id}`);
      expect(node).toHaveTextContent(shownDate);
      expect(node).toHaveTextContent(entry.label);
      expect(node).toHaveTextContent(entry.source);
    },
  );

  it.each(REGULATORY_DATES)(
    'flags $id as deferred exactly when the data does',
    (entry) => {
      renderWithProviders(<RegulatoryTimeline />);
      const node = screen.getByTestId(`${ITEM_PREFIX}${entry.id}`);
      expect(node.classList.contains(DEFERRED_CLASS)).toBe(entry.deferred);
    },
  );

  it('splices a today marker into the axis', () => {
    renderWithProviders(<RegulatoryTimeline />);
    expect(screen.getByTestId('timeline-today')).toBeInTheDocument();
    expect(
      screen.getByTestId('regulatory-timeline-axis').children,
    ).toHaveLength(REGULATORY_DATES.length + 1);
  });

  it('closes with a footnote carrying the verification date', () => {
    renderWithProviders(<RegulatoryTimeline />);
    expect(screen.getByTestId('timeline-footnote')).toHaveTextContent(
      VERIFIED_AS_OF,
    );
  });

  it('has no accessibility violations', async () => {
    cleanup();
    const { container } = renderWithProviders(<RegulatoryTimeline />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
