const EMPTY_CELL = '—';
const EMAIL_SEPARATOR = ', ';
const ALL_OPTION_VALUE = '';
const COPY_EMAILS_LABEL = 'Copy all e-mails';

export const CONSORTIUM_STATUS_OPTIONS = [
  { value: 'registered', label: 'Registered' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'readiness', label: 'Readiness' },
  { value: 'in_consortium', label: 'In consortium' },
  { value: 'declined', label: 'Declined' },
];

// `valueKey` reads the options off the loaded rows; the status filter omits it
// because its options are the fixed CONSORTIUM_STATUS_OPTIONS list.
export const CONSORTIUM_FILTERS = [
  {
    key: 'tier',
    label: 'Filter by tier',
    allLabel: 'All tiers',
    valueKey: 'consortiumTier',
  },
  {
    key: 'source',
    label: 'Filter by source',
    allLabel: 'All sources',
    valueKey: 'consortiumSource',
  },
  { key: 'status', label: 'Filter by status', allLabel: 'All statuses' },
];

export const EMPTY_FILTERS = Object.freeze(
  Object.fromEntries(CONSORTIUM_FILTERS.map(({ key }) => [key, ''])),
);

export const CONSORTIUM_EXPORTS = [
  {
    format: 'google-contacts',
    label: 'Export Google Contacts',
    filename: 'consortium-google-contacts.csv',
  },
  {
    format: 'google-groups',
    label: 'Export Google Groups',
    filename: 'consortium-google-groups.csv',
    needsGroup: true,
  },
];

export const REGISTRANT_TEXT = {
  copySuccess: 'E-mail addresses copied to the clipboard.',
  copyFailure: 'Could not copy the e-mail addresses.',
  saveSuccess: 'Registrant updated.',
  saveFailure: 'Could not update the registrant.',
  exportFailure: 'CSV export failed.',
  missingGroup: 'Enter a group e-mail address before exporting.',
  loadFailure: 'Could not load consortium registrants.',
};

export function toCell(value) {
  return (typeof value === 'string' ? value.trim() : value) || EMPTY_CELL;
}

export function formatRegisteredAt(value) {
  if (!value) return EMPTY_CELL;
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? EMPTY_CELL
    : date.toISOString().slice(0, 10);
}

export function collectOptions(rows, key) {
  return [...new Set(rows.map((row) => row[key]).filter(Boolean))].sort();
}

export function toFilterOptions(filter, rows) {
  const options = filter.valueKey
    ? collectOptions(rows, filter.valueKey).map((value) => ({
        value,
        label: value,
      }))
    : CONSORTIUM_STATUS_OPTIONS;
  return [{ value: ALL_OPTION_VALUE, label: filter.allLabel }, ...options];
}

export function toEmailList(rows) {
  return rows
    .map((row) => row.email)
    .filter(Boolean)
    .join(EMAIL_SEPARATOR);
}

export function buildExportParams(target, filters, group) {
  const params = { format: target.format, ...filters };
  if (target.needsGroup) params.group = group;
  return params;
}

export function buildToolbarActions(onCopy, onExport) {
  return [
    { label: COPY_EMAILS_LABEL, variant: 'outline-secondary', onClick: onCopy },
    ...CONSORTIUM_EXPORTS.map((target) => ({
      label: target.label,
      variant: 'outline-primary',
      onClick: () => onExport(target),
    })),
  ];
}

export function downloadCsv(csvText, filename) {
  const blob = new Blob([csvText], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
