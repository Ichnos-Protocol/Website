import Table from "react-bootstrap/Table";

import { DATA_SCHEMA_MAPPING } from "../../constants/dataContent";

function MappingRow({ source, target }) {
  return (
    <tr>
      <td className="table-cell-text">{source}</td>
      <td className="table-cell-text">{target}</td>
    </tr>
  );
}

export default function DataSchemaMappingTable() {
  const { heading, note, columns, rows } = DATA_SCHEMA_MAPPING;

  return (
    <section data-testid="data-schema-mapping" className="py-5">
      <h2 className="section-heading mb-1">{heading}</h2>
      <p className="text-secondary mb-4">{note}</p>
      <Table responsive className="table-dark-custom align-middle">
        <thead>
          <tr>
            <th>{columns.source}</th>
            <th>{columns.target}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <MappingRow key={row.source} source={row.source} target={row.target} />
          ))}
        </tbody>
      </Table>
    </section>
  );
}
