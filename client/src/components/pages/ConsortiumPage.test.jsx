import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { axe } from "vitest-axe";
import userEvent from "@testing-library/user-event";

import {
  renderWithProviders,
  screen,
  cleanup,
  waitFor,
} from "../../test-utils";
import {
  contactApiMock,
  authApiMock,
  consortiumApiMock,
  firebaseMock,
  mocks,
  resetMocks,
} from "../organisms/contactFormMocks";
import {
  createStore,
  submitRegistration,
} from "../organisms/contactFormHarness";
import ConsortiumPage from "./ConsortiumPage";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});
vi.mock("../../hooks/useReducedMotion", () => ({
  useReducedMotion: () => true,
}));
vi.mock("../../features/contact/contactApi", () => contactApiMock());
vi.mock("../../features/auth/authApi", () => {
  const shared = authApiMock();
  return {
    ...shared,
    useGetMeQuery: (arg, options) =>
      options?.skip ? { data: undefined } : shared.useGetMeQuery(),
  };
});
vi.mock("../../features/consortium/consortiumApi", () => consortiumApiMock());
vi.mock("../../config/firebase", () => firebaseMock());

function renderPage(
  route = "/consortium",
  auth = { isAuthenticated: false, user: null },
) {
  const store = createStore(auth);
  return renderWithProviders(<ConsortiumPage />, { route, store });
}

describe("ConsortiumPage", () => {
  beforeEach(resetMocks);
  afterEach(() => vi.useRealTimers());

  it("shows the open-registration headline to an anonymous visitor", () => {
    renderPage();
    expect(
      screen.getByRole("heading", { name: "Join the consortium" }),
    ).toBeInTheDocument();
  });

  it("renders the inline registration form in the register section", () => {
    const { container } = renderPage();
    expect(container.querySelector("#register")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Submit registration" }),
    ).toBeInTheDocument();
  });

  it("stores a well-formed campaign source", () => {
    renderPage("/consortium?src=ibs2026");
    expect(window.sessionStorage.getItem("consortium_src")).toBe("ibs2026");
  });

  it("discards a campaign source that is not a plain slug", () => {
    renderPage("/consortium?src=IBS%202026!");
    expect(window.sessionStorage.getItem("consortium_src")).toBeNull();
  });

  it("moves to the tier overview once the registration succeeds", async () => {
    const user = userEvent.setup();
    mocks.unwrap.mockResolvedValue({ data: {} });
    renderPage("/consortium", { isAuthenticated: true, user: { uid: "u1" } });

    await submitRegistration(user);

    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith("/consortium/tiers"),
    );
  });

  it("shows the later-round headline once the deadline has passed", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-01T00:00:00Z"));
    renderPage();
    expect(
      screen.getByRole("heading", {
        name: "The first round closed on 30 September 2026",
      }),
    ).toBeInTheDocument();
  });

  it("has no accessibility violations", async () => {
    cleanup();
    const { container } = renderPage();
    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });
});
