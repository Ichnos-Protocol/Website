import { screen } from "@testing-library/react";
import { configureStore } from "@reduxjs/toolkit";

import { renderWithProviders } from "../../test-utils";
import authReducer from "../../features/auth/authSlice";
import contactReducer from "../../features/contact/contactSlice";
import {
  CONSORTIUM_POSITION_LABEL,
  CONSORTIUM_CHAIN_ROLE_LABEL,
  CONSORTIUM_PRODUCT_LINE_LABEL,
  CONSORTIUM_CONSENT_LABEL,
  CONSORTIUM_INTEREST_LABEL,
} from "../../constants/consortiumContent";

const AUTH_STATE = {
  user: { uid: "u1" },
  isAuthenticated: true,
  isAdmin: false,
  loading: false,
  error: null,
  modalMode: null,
  profileState: null,
  authSuccess: false,
  enforcedLogout: false,
};

const CONTACT_STATE = {
  isOpen: true,
  requestId: null,
  formData: {},
  myRequests: [],
  submitting: false,
  error: null,
};

export const REGISTERED_ROW = {
  consortium_interest: true,
  consortium_position: "supplier",
  consortium_chain_role: "electrode",
  consortium_product_line: "Anode coating line",
  consortium_customer_request: "A cell maker asked for a carbon footprint.",
  consortium_data_extract: "not_yet",
  consortium_data_needs: "Upstream material data.",
  consortium_preferred_start: "later",
};

export function createStore(auth = {}, contact = {}) {
  return configureStore({
    reducer: { auth: authReducer, contact: contactReducer },
    preloadedState: {
      auth: { ...AUTH_STATE, ...auth },
      contact: { ...CONTACT_STATE, ...contact },
    },
  });
}

export async function renderForm(props = {}, authOverrides = {}) {
  const { default: ContactRequestForm } = await import("./ContactRequestForm");
  const store = createStore(authOverrides);
  const utils = renderWithProviders(<ContactRequestForm {...props} />, {
    store,
  });
  return { ...utils, store };
}

export const interestBox = () =>
  screen.getByRole("checkbox", { name: CONSORTIUM_INTEREST_LABEL });

export const queryInterestBox = () =>
  screen.queryByRole("checkbox", { name: CONSORTIUM_INTEREST_LABEL });

export const inquiryConsent = () =>
  screen.getByRole("checkbox", { name: /agree to be contacted/i });

export const consortiumConsent = () =>
  screen.getByRole("checkbox", { name: CONSORTIUM_CONSENT_LABEL });

export async function fillConsortium(user) {
  await user.selectOptions(
    screen.getByLabelText(CONSORTIUM_POSITION_LABEL),
    "anchor",
  );
  await user.selectOptions(
    screen.getByLabelText(CONSORTIUM_CHAIN_ROLE_LABEL),
    "module_pack",
  );
  await user.type(
    screen.getByLabelText(CONSORTIUM_PRODUCT_LINE_LABEL),
    "48V pack line",
  );
  await user.click(
    screen.getByRole("radio", { name: "Not yet, but we could prepare one" }),
  );
  await user.click(screen.getByRole("radio", { name: "November 2026" }));
  await user.click(consortiumConsent());
}

export async function submitRegistration(user) {
  await fillConsortium(user);
  await user.click(inquiryConsent());
  await user.click(screen.getByRole("button", { name: /registration/i }));
}

export async function submitInquiry(user, text = "A question") {
  await user.type(screen.getByLabelText("Question 1"), text);
  await user.click(inquiryConsent());
  await user.click(screen.getByRole("button", { name: "Submit Inquiry" }));
}
