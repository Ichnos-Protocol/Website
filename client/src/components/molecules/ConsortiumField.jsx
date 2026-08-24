import Form from "react-bootstrap/Form";

// The id comes from the Form.Group controlId below — passing it here as well
// makes react-bootstrap warn and ignore one of the two.
function renderInput(field, value, onChange) {
  const common = {
    required: field.required,
    value: value ?? "",
    onChange: (e) => onChange(field.name, e.target.value),
  };

  if (field.type === "select")
    return (
      <Form.Select {...common}>
        <option value="">Select an option</option>
        {field.options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </Form.Select>
    );

  if (field.type === "textarea")
    return <Form.Control as="textarea" rows={3} {...common} />;

  return <Form.Control type="text" {...common} />;
}

function renderRadios(field, value, onChange) {
  return field.options.map((o) => (
    <Form.Check
      key={o.value}
      inline
      type="radio"
      name={field.name}
      id={`consortium-${field.name}-${o.value}`}
      label={o.label}
      value={o.value}
      required={field.required}
      checked={value === o.value}
      onChange={(e) => onChange(field.name, e.target.value)}
    />
  ));
}

export default function ConsortiumField({ field, value, onChange }) {
  if (field.type === "checkbox")
    return (
      <Form.Group className="mb-3">
        <Form.Check
          type="checkbox"
          id={`consortium-${field.name}`}
          label={field.label}
          required={field.required}
          checked={Boolean(value)}
          onChange={(e) => onChange(field.name, e.target.checked)}
        />
      </Form.Group>
    );

  if (field.type === "radio")
    return (
      <Form.Group as="fieldset" className="mb-3">
        <Form.Label as="legend" className="fs-6">
          {field.label}
        </Form.Label>
        {renderRadios(field, value, onChange)}
      </Form.Group>
    );

  return (
    <Form.Group className="mb-3" controlId={`consortium-${field.name}`}>
      <Form.Label>{field.label}</Form.Label>
      {renderInput(field, value, onChange)}
    </Form.Group>
  );
}
