import { describe, it, expect, beforeEach, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {
  contactApiMock,
  authApiMock,
  consortiumApiMock,
  firebaseMock,
  mocks,
  resetMocks,
} from "./contactFormMocks";
import {
  renderForm,
  queryInterestBox,
  interestBox,
  inquiryConsent,
  REGISTERED_ROW,
} from "./contactFormHarness";
import {
  CONSORTIUM_POSITION_LABEL,
  CONSORTIUM_CONSENT_LABEL,
} from "../../constants/consortiumContent";

vi.mock("../../features/contact/contactApi", () => contactApiMock());
vi.mock("../../features/auth/authApi", () => authApiMock());
vi.mock("../../features/consortium/consortiumApi", () => consortiumApiMock());
vi.mock("../../config/firebase", () => firebaseMock());

const FOLLOW_UP = { requestId: 7 };

describe("ContactRequestForm follow-up mode", () => {
  beforeEach(() => {
    resetMocks();
    mocks.addQuestionUnwrap.mockResolvedValue({ data: {} });
  });

  it("hides the consortium interest checkbox and its fields", async () => {
    mocks.consortiumMe = { data: { data: REGISTERED_ROW } };
    await renderForm(FOLLOW_UP);

    expect(queryInterestBox()).not.toBeInTheDocument();
    expect(
      screen.queryByText(CONSORTIUM_CONSENT_LABEL),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText(CONSORTIUM_POSITION_LABEL),
    ).not.toBeInTheDocument();
  });

  it("keeps the question required", async () => {
    const user = userEvent.setup();
    await renderForm(FOLLOW_UP);

    expect(screen.getByLabelText("Question 1")).toBeRequired();

    await user.click(inquiryConsent());
    await user.click(screen.getByRole("button", { name: "Add Question" }));

    expect(mocks.addQuestion).not.toHaveBeenCalled();
  });

  it("sends the follow-up question and never a contact submission", async () => {
    const user = userEvent.setup();
    await renderForm(FOLLOW_UP);

    await user.type(screen.getByLabelText("Question 1"), "Follow-up question");
    await user.click(inquiryConsent());
    await user.click(screen.getByRole("button", { name: "Add Question" }));

    await waitFor(() =>
      expect(mocks.addQuestion).toHaveBeenCalledWith({
        id: 7,
        question: "Follow-up question",
      }),
    );
    expect(mocks.submit).not.toHaveBeenCalled();
    expect(mocks.invalidateTags).not.toHaveBeenCalled();
  });

  it("makes the question optional once the interest box is ticked", async () => {
    const user = userEvent.setup();
    await renderForm();

    expect(screen.getByLabelText("Question 1")).toBeRequired();

    await user.click(interestBox());

    expect(screen.getByLabelText("Question 1")).not.toBeRequired();
  });

  it("still requires a question for a plain inquiry", async () => {
    const user = userEvent.setup();
    await renderForm();

    await user.click(inquiryConsent());
    await user.click(screen.getByRole("button", { name: "Submit Inquiry" }));

    expect(mocks.submit).not.toHaveBeenCalled();
  });
});
