import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  consortiumApi,
  useGetConsortiumMeQuery,
} from "../features/consortium/consortiumApi";
import {
  CONSORTIUM_CONSENT_VERSION,
  SUBMIT_INQUIRY_LABEL,
  SUBMIT_REGISTRATION_LABEL,
  UPDATE_REGISTRATION_LABEL,
} from "../constants/consortiumContent";

const EMPTY_VALUES = Object.freeze({
  position: "",
  chainRole: "",
  productLine: "",
  customerRequest: "",
  dataExtract: "",
  dataNeeds: "",
  preferredStart: "",
  consent: false,
});

// snake_case column -> camelCase form field. The row shape is whatever
// GET /api/consortium/me returns, i.e. the user_profiles row itself.
const ROW_TO_VALUE = Object.freeze({
  consortium_position: "position",
  consortium_chain_role: "chainRole",
  consortium_product_line: "productLine",
  consortium_customer_request: "customerRequest",
  consortium_data_extract: "dataExtract",
  consortium_data_needs: "dataNeeds",
  consortium_preferred_start: "preferredStart",
});

// Everything except `consent`, which is a UI gate and never leaves the form.
const ANSWER_KEYS = Object.freeze(Object.values(ROW_TO_VALUE));

function rowToValues(row) {
  const mapped = {};
  for (const [column, field] of Object.entries(ROW_TO_VALUE)) {
    if (row[column] != null) mapped[field] = row[column];
  }
  return mapped;
}

// T14 writes the campaign marker; a missing key must stay harmless.
function readSource() {
  try {
    return window.sessionStorage.getItem("consortium_src") || "";
  } catch {
    return "";
  }
}

export function useConsortiumForm(mode) {
  const isConsortium = mode === "consortium";
  const [interest, setInterest] = useState(isConsortium);
  const [edits, setEdits] = useState({});
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((s) => s.auth.isAuthenticated);
  const { data } = useGetConsortiumMeQuery(undefined, {
    skip: !isAuthenticated,
  });
  const row = data?.data ?? null;
  const isRegistered = row?.consortium_interest === true;

  // Prefill is derived, not copied into state, so a row arriving late needs no
  // effect and never overwrites what the visitor has already typed. It also
  // never reaches `interest` — that keeps the box unticked on /contact.
  const values = {
    ...EMPTY_VALUES,
    ...(row ? rowToValues(row) : {}),
    ...edits,
  };

  const setValue = (name, value) =>
    setEdits((prev) => ({ ...prev, [name]: value }));

  const submitFields = () => {
    if (!interest) return {};
    const answers = {};
    for (const key of ANSWER_KEYS) answers[key] = values[key];
    const source = readSource();
    return {
      consortiumInterest: true,
      consortium: {
        ...answers,
        ...(source ? { source } : {}),
        consentTimestamp: new Date().toISOString(),
        consentVersion: CONSORTIUM_CONSENT_VERSION,
      },
    };
  };

  // contactApi writes the registration but can only invalidate its own tag,
  // so the caller invokes this once that write succeeded.
  const invalidate = () => {
    if (interest) dispatch(consortiumApi.util.invalidateTags(["Consortium"]));
  };

  let submitLabel = SUBMIT_INQUIRY_LABEL;
  if (isRegistered && interest) submitLabel = UPDATE_REGISTRATION_LABEL;
  else if (isConsortium) submitLabel = SUBMIT_REGISTRATION_LABEL;

  return {
    interest,
    toggleProps: {
      checked: interest,
      onChange: (e) => setInterest(e.target.checked),
    },
    fieldsProps: { show: interest, values, onChange: setValue },
    submitFields,
    invalidate,
    submitLabel,
    authMode: isConsortium ? "signup" : "login",
  };
}
