import {
  CONSORTIUM_POSITION_LABEL,
  CONSORTIUM_CHAIN_ROLE_LABEL,
  CONSORTIUM_PRODUCT_LINE_LABEL,
  CONSORTIUM_CUSTOMER_REQUEST_LABEL,
  CONSORTIUM_DATA_EXTRACT_LABEL,
  CONSORTIUM_DATA_NEEDS_LABEL,
  CONSORTIUM_PREFERRED_START_LABEL,
  CONSORTIUM_CONSENT_LABEL,
  CONSORTIUM_POSITION_OPTIONS,
  CONSORTIUM_CHAIN_ROLE_OPTIONS,
  CONSORTIUM_DATA_EXTRACT_OPTIONS,
  CONSORTIUM_PREFERRED_START_OPTIONS,
} from "../../constants/consortiumContent";
import ConsortiumField from "./ConsortiumField";

const FIELD_DEFS = [
  {
    name: "position",
    label: CONSORTIUM_POSITION_LABEL,
    type: "select",
    required: true,
    options: CONSORTIUM_POSITION_OPTIONS,
  },
  {
    name: "chainRole",
    label: CONSORTIUM_CHAIN_ROLE_LABEL,
    type: "select",
    required: true,
    options: CONSORTIUM_CHAIN_ROLE_OPTIONS,
  },
  {
    name: "productLine",
    label: CONSORTIUM_PRODUCT_LINE_LABEL,
    type: "text",
    required: true,
  },
  {
    name: "customerRequest",
    label: CONSORTIUM_CUSTOMER_REQUEST_LABEL,
    type: "textarea",
    required: false,
  },
  {
    name: "dataExtract",
    label: CONSORTIUM_DATA_EXTRACT_LABEL,
    type: "radio",
    required: true,
    options: CONSORTIUM_DATA_EXTRACT_OPTIONS,
  },
  {
    name: "dataNeeds",
    label: CONSORTIUM_DATA_NEEDS_LABEL,
    type: "textarea",
    required: false,
  },
  {
    name: "preferredStart",
    label: CONSORTIUM_PREFERRED_START_LABEL,
    type: "radio",
    required: true,
    options: CONSORTIUM_PREFERRED_START_OPTIONS,
  },
  {
    name: "consent",
    label: CONSORTIUM_CONSENT_LABEL,
    type: "checkbox",
    required: true,
  },
];

export default function ConsortiumFields({ show, values, onChange }) {
  if (!show) return null;

  return (
    <div data-testid="consortium-fields">
      {FIELD_DEFS.map((field) => (
        <ConsortiumField
          key={field.name}
          field={field}
          value={values[field.name]}
          onChange={onChange}
        />
      ))}
    </div>
  );
}
