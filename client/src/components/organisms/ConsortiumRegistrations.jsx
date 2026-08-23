import { useState } from 'react';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

import {
  useGetConsortiumRegistrantsQuery,
  useUpdateConsortiumRegistrantMutation,
  useLazyExportConsortiumRegistrantsQuery,
} from '../../features/admin/adminApi';
import {
  buildExportParams,
  buildToolbarActions,
  downloadCsv,
  toEmailList,
  toFilterOptions,
  CONSORTIUM_FILTERS,
  EMPTY_FILTERS,
  REGISTRANT_TEXT,
} from '../../helpers/consortiumRegistrants';
import ConsortiumRegistrantsTable from '../molecules/ConsortiumRegistrantsTable';
import ConsortiumRegistrantDetail from '../molecules/ConsortiumRegistrantDetail';

export default function ConsortiumRegistrations() {
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [groupEmail, setGroupEmail] = useState('');
  const [feedback, setFeedback] = useState(null);
  const { data, isLoading, error } = useGetConsortiumRegistrantsQuery(filters);
  const [updateRegistrant] = useUpdateConsortiumRegistrantMutation();
  const [triggerExport] = useLazyExportConsortiumRegistrantsQuery();
  const rows = data?.data ?? [];
  const selected = rows.find((row) => row.userId === selectedUserId) ?? null;
  const actions = buildToolbarActions(handleCopyEmails, handleExport);
  const notify = (variant, key) =>
    setFeedback(variant ? { variant, text: REGISTRANT_TEXT[key] } : null);

  // No `successKey` when success already shows itself — the CSV download does.
  async function attempt(action, successKey, failureKey) {
    notify();
    try {
      await action();
      if (successKey) notify('success', successKey);
    } catch {
      notify('danger', failureKey);
    }
  }

  function handleFilterChange(key, value) {
    setSelectedUserId(null);
    setFilters((current) => ({ ...current, [key]: value }));
  }
  function handleCopyEmails() {
    const copy = () => navigator.clipboard.writeText(toEmailList(rows));
    return attempt(copy, 'copySuccess', 'copyFailure');
  }
  function handleSave(payload) {
    const save = () => updateRegistrant(payload).unwrap();
    return attempt(save, 'saveSuccess', 'saveFailure');
  }
  function handleExport(target) {
    const group = groupEmail.trim();
    if (target.needsGroup && !group) return notify('danger', 'missingGroup');
    const params = buildExportParams(target, filters, group);
    const run = async () =>
      downloadCsv(await triggerExport(params).unwrap(), target.filename);
    return attempt(run, null, 'exportFailure');
  }

  return (
    <div>
      <div className="d-flex flex-wrap align-items-end gap-2 mb-3">
        {CONSORTIUM_FILTERS.map((filter) => (
          <Form.Select
            key={filter.key}
            aria-label={filter.label}
            className="w-auto"
            value={filters[filter.key]}
            onChange={(e) => handleFilterChange(filter.key, e.target.value)}
          >
            {toFilterOptions(filter, rows).map(({ value, label }) => (
              <option key={label} value={value}>
                {label}
              </option>
            ))}
          </Form.Select>
        ))}
        <Form.Control
          type="email"
          aria-label="Group e-mail"
          placeholder="Group email"
          className="ms-auto w-auto"
          value={groupEmail}
          onChange={(e) => setGroupEmail(e.target.value)}
        />
        {actions.map(({ label, variant, onClick }) => (
          <Button key={label} variant={variant} size="sm" onClick={onClick}>
            {label}
          </Button>
        ))}
      </div>
      {feedback && (
        <Alert variant={feedback.variant} dismissible onClose={() => notify()}>
          {feedback.text}
        </Alert>
      )}
      <ConsortiumRegistrantsTable
        rows={rows}
        isLoading={isLoading}
        error={error}
        onSelect={setSelectedUserId}
      />
      <ConsortiumRegistrantDetail
        key={selectedUserId}
        registrant={selected}
        onSave={handleSave}
        onClose={() => setSelectedUserId(null)}
      />
    </div>
  );
}
