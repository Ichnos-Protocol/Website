import { useState } from 'react';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

import {
  toCell,
  formatRegisteredAt,
  CONSORTIUM_STATUS_OPTIONS,
} from '../../helpers/consortiumRegistrants';

const DETAIL_FIELDS = [
  { label: 'E-mail', key: 'email' },
  { label: 'Phone', key: 'phone' },
  { label: 'LinkedIn', key: 'linkedin' },
  { label: 'Product line', key: 'consortiumProductLine' },
  { label: 'Customer request', key: 'consortiumCustomerRequest' },
  { label: 'Data extract', key: 'consortiumDataExtract' },
  { label: 'Data needs', key: 'consortiumDataNeeds' },
  { label: 'Preferred start', key: 'consortiumPreferredStart' },
];

export default function ConsortiumRegistrantDetail({
  registrant,
  onSave,
  onClose,
}) {
  const [status, setStatus] = useState(
    registrant?.consortiumStatus || CONSORTIUM_STATUS_OPTIONS[0].value,
  );
  const [adminNotes, setAdminNotes] = useState(
    registrant?.consortiumAdminNotes ?? '',
  );

  // The organism keeps this mounted and re-keys it, so no registrant means no
  // row is selected — the hooks above still have to run before the guard.
  if (!registrant) return null;

  return (
    <Card className="mt-3">
      <Card.Body>
        <Card.Title>
          {toCell([registrant.name, registrant.surname].filter(Boolean).join(' '))}
        </Card.Title>
        <dl className="row mb-3">
          {DETAIL_FIELDS.map((field) => (
            <DetailRow
              key={field.key}
              label={field.label}
              value={registrant[field.key]}
            />
          ))}
          <DetailRow
            label="Registered at"
            value={formatRegisteredAt(registrant.consortiumRegisteredAt)}
          />
        </dl>
        <Form.Select
          aria-label="Consortium status"
          className="mb-2"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          {CONSORTIUM_STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Form.Select>
        <Form.Control
          as="textarea"
          rows={3}
          aria-label="Admin notes"
          className="mb-2"
          value={adminNotes}
          onChange={(e) => setAdminNotes(e.target.value)}
        />
        <div className="d-flex gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() =>
              onSave({ userId: registrant.userId, status, adminNotes })
            }
          >
            Save
          </Button>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
}

function DetailRow({ label, value }) {
  return (
    <>
      <dt className="col-sm-4">{label}</dt>
      <dd className="col-sm-8">{toCell(value)}</dd>
    </>
  );
}
