/*
 * Single source of truth for every regulatory date rendered on /passport.
 *
 * Authored order IS display order — the consumer renders the array as-is and
 * never sorts. Every value traces to `docs/website_Catena_pivot_4.md` §1
 * (verified-facts table, checked 2026-08-11). Changing a date here requires
 * re-verifying §1 in the same commit.
 *
 * Data only: no imports, no functions, no display copy beyond the label and
 * the citation. Formatting belongs to the consumer.
 */

// Date the §1 verified-facts table was last checked against the source.
export const VERIFIED_AS_OF = "2026-08-11";

// One of `date` (ISO YYYY-MM-DD) or `datePending` is present per entry, never
// both. `deferred` marks an obligation whose enforcement date has moved or
// still depends on a delegated act. `id` is a stable contract: it drives the
// `data-testid="timeline-item-${id}"` hooks on /passport.
export const REGULATORY_DATES = [
  {
    id: "harmonised-labelling",
    label: "Harmonised labelling",
    date: "2026-08-18",
    deferred: false,
    source: "Reg. (EU) 2023/1542",
  },
  {
    id: "battery-passport",
    label: "EU battery passport",
    date: "2027-02-18",
    deferred: false,
    source: "Art. 77, Reg. (EU) 2023/1542",
  },
  {
    id: "removability",
    label: "Removability and replaceability (portable)",
    date: "2027-02-18",
    deferred: false,
    source: "Reg. (EU) 2023/1542",
  },
  {
    // The originally legislated hard date is superseded: the delegated act
    // setting the calculation method has not been adopted, so no enforceable
    // date exists yet. Skipped by the chronological check for that reason.
    id: "carbon-footprint",
    label: "Carbon-footprint declaration",
    datePending: "pending delegated act",
    deferred: true,
    source: "Art. 7, Reg. (EU) 2023/1542",
  },
  {
    // Postponed date under the amending act Reg. (EU) 2025/1561.
    id: "due-diligence",
    label: "Supply-chain due diligence",
    date: "2027-08-18",
    deferred: true,
    source: "Reg. (EU) 2025/1561",
  },
  {
    id: "durability",
    label: "Performance and durability (industrial >2 kWh)",
    date: "2027-08-18",
    deferred: false,
    source: "Reg. (EU) 2023/1542",
  },
  {
    id: "recycled-content",
    label: "Recycled-content declaration",
    date: "2028-08-18",
    deferred: true,
    source: "Reg. (EU) 2023/1542",
  },
];
