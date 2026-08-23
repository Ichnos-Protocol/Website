import { describe, it, expect, beforeEach, vi } from "vitest";
import { axe } from "vitest-axe";
import { screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {
  contactApiMock,
  authApiMock,
  consortiumApiMock,
  firebaseMock,
  mocks,
  resetMocks,
} from "./contactFormMocks";
import { renderForm, interestBox, REGISTERED_ROW } from "./contactFormHarness";
import {
  CONSORTIUM_POSITION_LABEL,
  CONSORTIUM_CHAIN_ROLE_LABEL,
  CONSORTIUM_PRODUCT_LINE_LABEL,
  CONSORTIUM_DATA_EXTRACT_LABEL,
  CONSORTIUM_CONSENT_LABEL,
} from "../../constants/consortiumContent";

vi.mock("../../features/contact/contactApi", () => contactApiMock());
vi.mock("../../features/auth/authApi", () => authApiMock());
vi.mock("../../features/consortium/consortiumApi", () => consortiumApiMock());
vi.mock("../../config/firebase", () => firebaseMock());

describe("ContactRequestForm registration fields", () => {
  beforeEach(resetMocks);

  it("shows the interest box unticked and hides the fields in inquiry mode", async () => {
    await renderForm();

    expect(interestBox()).not.toBeChecked();
    expect(
      screen.queryByLabelText(CONSORTIUM_POSITION_LABEL),
    ).not.toBeInTheDocument();
  });

  it("reveals and hides the eight fields as the interest box is toggled", async () => {
    const user = userEvent.setup();
    await renderForm();

    await user.click(interestBox());
    expect(
      screen.getByLabelText(CONSORTIUM_POSITION_LABEL),
    ).toBeInTheDocument();
    expect(screen.getByText(CONSORTIUM_DATA_EXTRACT_LABEL)).toBeInTheDocument();
    expect(screen.getByText(CONSORTIUM_CONSENT_LABEL)).toBeInTheDocument();

    await user.click(interestBox());
    expect(
      screen.queryByLabelText(CONSORTIUM_POSITION_LABEL),
    ).not.toBeInTheDocument();
  });

  it("ticks the box and shows the registration label in consortium mode", async () => {
    await renderForm({ mode: "consortium" });

    expect(interestBox()).toBeChecked();
    expect(
      screen.getByLabelText(CONSORTIUM_POSITION_LABEL),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Submit registration" }),
    ).toBeInTheDocument();
  });

  it("prefills from an existing registration and offers to update it", async () => {
    mocks.consortiumMe = { data: { data: REGISTERED_ROW } };
    await renderForm({ mode: "consortium" });

    expect(screen.getByLabelText(CONSORTIUM_POSITION_LABEL)).toHaveValue(
      "supplier",
    );
    expect(screen.getByLabelText(CONSORTIUM_CHAIN_ROLE_LABEL)).toHaveValue(
      "electrode",
    );
    expect(screen.getByLabelText(CONSORTIUM_PRODUCT_LINE_LABEL)).toHaveValue(
      "Anode coating line",
    );
    expect(screen.getByRole("radio", { name: "Later" })).toBeChecked();
    expect(
      screen.getByRole("button", { name: "Update my registration" }),
    ).toBeInTheDocument();
  });

  it("leaves the interest box unticked in inquiry mode even for a registrant", async () => {
    mocks.consortiumMe = { data: { data: REGISTERED_ROW } };
    await renderForm();

    expect(interestBox()).not.toBeChecked();
    expect(
      screen.queryByLabelText(CONSORTIUM_POSITION_LABEL),
    ).not.toBeInTheDocument();
  });

  it("has no accessibility violations in inquiry mode", async () => {
    cleanup();
    const { container } = await renderForm();
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("has no accessibility violations in consortium mode", async () => {
    cleanup();
    const { container } = await renderForm({ mode: "consortium" });
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
