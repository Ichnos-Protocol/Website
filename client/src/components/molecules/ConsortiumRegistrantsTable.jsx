import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import Spinner from 'react-bootstrap/Spinner';

import {
  toCell,
  formatRegisteredAt,
  REGISTRANT_TEXT,
} from '../../helpers/consortiumRegistrants';

const EMPTY_TABLE_TEXT = 'No consortium registrants';
const TABLE_COLUMN_COUNT = 9;

export default function ConsortiumRegistrantsTable({
  rows,
  isLoading,
  error,
  onSelect,
}) {
  if (isLoading)
    return (
      <div className="text-center py-4">
        <Spinner animation="border" role="status" />
      </div>
    );

  if (error)
    return <Alert variant="danger">{REGISTRANT_TEXT.loadFailure}</Alert>;

  return (
    <Table striped hover responsive size="sm">
      <thead>
        <tr>
          <th>Name</th>
          <th>Company</th>
          <th>Position</th>
          <th>Chain role</th>
          <th>Tier</th>
          <th>Source</th>
          <th>Registered</th>
          <th>Consortium status</th>
          <th />
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.userId}>
            <td>{toCell([row.name, row.surname].filter(Boolean).join(' '))}</td>
            <td>{toCell(row.company)}</td>
            <td>{toCell(row.consortiumPosition)}</td>
            <td>{toCell(row.consortiumChainRole)}</td>
            <td>{toCell(row.consortiumTier)}</td>
            <td>{toCell(row.consortiumSource)}</td>
            <td>{formatRegisteredAt(row.consortiumRegisteredAt)}</td>
            <td>{toCell(row.consortiumStatus)}</td>
            <td>
              <Button
                variant="link"
                size="sm"
                onClick={() => onSelect(row.userId)}
              >
                Details
              </Button>
            </td>
          </tr>
        ))}
        {rows.length === 0 && (
          <tr>
            <td colSpan={TABLE_COLUMN_COUNT} className="text-center text-muted">
              {EMPTY_TABLE_TEXT}
            </td>
          </tr>
        )}
      </tbody>
    </Table>
  );
}
