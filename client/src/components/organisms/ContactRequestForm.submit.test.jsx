import { describe, it, expect, beforeEach, vi } from "vitest";
import { waitFor } from "@testing-library/react";
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
  submitRegistration,
  submitInquiry,
} from "./contactFormHarness";

vi.mock("../../features/contact/contactApi", () => contactApiMock());
vi.mock("../../features/auth/authApi", () => authApiMock());
vi.mock("../../features/consortium/consortiumApi", () => consortiumApiMock());
vi.mock("../../config/firebase", () => firebaseMock());

const ANONYMOUS = { isAuthenticated: false, user: null };

describe("ContactRequestForm submission", () => {
  beforeEach(() => {
    resetMocks();
    mocks.unwrap.mockResolvedValue({ data: {} });
  });

  it("opens the signup modal from consortium mode", async () => {
    const user = userEvent.setup();
    const { store } = await renderForm({ mode: "consortium" }, ANONYMOUS);

    await submitRegistration(user);

    expect(store.getState().auth.modalMode).toBe("signup");
  });

  it("opens the login modal from inquiry mode", async () => {
    const user = userEvent.setup();
    const { store } = await renderForm({}, ANONYMOUS);

    await submitInquiry(user);

    expect(store.getState().auth.modalMode).toBe("login");
  });

  it("submits a consortium registration with no questions at all", async () => {
    const user = userEvent.setup();
    await renderForm({ mode: "consortium" });

    await submitRegistration(user);

    await waitFor(() => expect(mocks.submit).toHaveBeenCalled());
    const body = mocks.submit.mock.calls[0][0];
    expect(body.questions).toEqual([]);
    expect(body.consortiumInterest).toBe(true);
    expect(body.consortium).toMatchObject({
      position: "anchor",
      chainRole: "module_pack",
      productLine: "48V pack line",
      dataExtract: "not_yet",
      preferredStart: "nov_2026",
      consentVersion: "consortium-v1",
    });
    expect(body.consentVersion).toBe("v1");
    expect(body.consortium.consent).toBeUndefined();
  });

  it("carries the stored campaign source", async () => {
    const user = userEvent.setup();
    window.sessionStorage.setItem("consortium_src", "ibs2026");
    await renderForm({ mode: "consortium" });

    await submitRegistration(user);

    await waitFor(() => expect(mocks.submit).toHaveBeenCalled());
    expect(mocks.submit.mock.calls[0][0].consortium.source).toBe("ibs2026");
  });

  it("omits the campaign source when none is stored", async () => {
    const user = userEvent.setup();
    await renderForm({ mode: "consortium" });

    await submitRegistration(user);

    await waitFor(() => expect(mocks.submit).toHaveBeenCalled());
    expect(mocks.submit.mock.calls[0][0].consortium).not.toHaveProperty(
      "source",
    );
  });

  it("invalidates the Consortium cache after a successful registration", async () => {
    const user = userEvent.setup();
    await renderForm({ mode: "consortium" });

    await submitRegistration(user);

    await waitFor(() =>
      expect(mocks.invalidateTags).toHaveBeenCalledWith(["Consortium"]),
    );
  });

  it("leaves the Consortium cache alone for a plain inquiry", async () => {
    const user = userEvent.setup();
    await renderForm();

    await submitInquiry(user);

    await waitFor(() => expect(mocks.submit).toHaveBeenCalled());
    expect(mocks.invalidateTags).not.toHaveBeenCalled();
  });
});
