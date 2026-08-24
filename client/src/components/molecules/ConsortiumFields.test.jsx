import { axe } from "vitest-axe";
import userEvent from "@testing-library/user-event";

import { renderWithProviders, screen, cleanup } from "../../test-utils";
import ConsortiumFields from "./ConsortiumFields";
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

const EMPTY = {
  position: "",
  chainRole: "",
  productLine: "",
  customerRequest: "",
  dataExtract: "",
  dataNeeds: "",
  preferredStart: "",
  consent: false,
};

const ALL_LABELS = [
  CONSORTIUM_POSITION_LABEL,
  CONSORTIUM_CHAIN_ROLE_LABEL,
  CONSORTIUM_PRODUCT_LINE_LABEL,
  CONSORTIUM_CUSTOMER_REQUEST_LABEL,
  CONSORTIUM_DATA_EXTRACT_LABEL,
  CONSORTIUM_DATA_NEEDS_LABEL,
  CONSORTIUM_PREFERRED_START_LABEL,
  CONSORTIUM_CONSENT_LABEL,
];

const SELECT_ENUMS = [
  [CONSORTIUM_POSITION_LABEL, CONSORTIUM_POSITION_OPTIONS],
  [CONSORTIUM_CHAIN_ROLE_LABEL, CONSORTIUM_CHAIN_ROLE_OPTIONS],
];

const RADIO_ENUM = [
  ...CONSORTIUM_DATA_EXTRACT_OPTIONS,
  ...CONSORTIUM_PREFERRED_START_OPTIONS,
];

function renderFields(overrides = {}) {
  const onChange = vi.fn();
  const utils = renderWithProviders(
    <ConsortiumFields show values={EMPTY} onChange={onChange} {...overrides} />,
  );
  return { ...utils, onChange };
}

describe("ConsortiumFields", () => {
  it("renders nothing when show is false", () => {
    const { container } = renderFields({ show: false });
    expect(container).toBeEmptyDOMElement();
  });

  it("renders all eight field labels when show is true", () => {
    renderFields();
    for (const label of ALL_LABELS) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
  });

  it("renders option values matching the migration 006 enums", () => {
    renderFields();

    for (const [label, options] of SELECT_ENUMS) {
      const values = [...screen.getByLabelText(label).options]
        .map((o) => o.value)
        .filter(Boolean);
      expect(values).toEqual(options.map((o) => o.value));
    }
    for (const option of RADIO_ENUM) {
      expect(screen.getByLabelText(option.label)).toHaveAttribute(
        "value",
        option.value,
      );
    }
  });

  it("reports every edit as (name, value)", async () => {
    const user = userEvent.setup();
    const { onChange } = renderFields();

    await user.type(screen.getByLabelText(CONSORTIUM_PRODUCT_LINE_LABEL), "M");
    expect(onChange).toHaveBeenCalledWith("productLine", "M");

    await user.selectOptions(
      screen.getByLabelText(CONSORTIUM_POSITION_LABEL),
      "anchor",
    );
    expect(onChange).toHaveBeenCalledWith("position", "anchor");

    await user.click(screen.getByLabelText(RADIO_ENUM[0].label));
    expect(onChange).toHaveBeenCalledWith("dataExtract", "yes");

    await user.click(screen.getByLabelText(CONSORTIUM_CONSENT_LABEL));
    expect(onChange).toHaveBeenCalledWith("consent", true);
  });

  it("has no accessibility violations", async () => {
    cleanup();
    const { container } = renderFields();
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
