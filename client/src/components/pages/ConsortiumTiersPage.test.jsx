import { describe, it, expect, beforeEach, vi } from "vitest";
import { axe } from "vitest-axe";
import userEvent from "@testing-library/user-event";

import {
  renderWithProviders,
  screen,
  cleanup,
  waitFor,
} from "../../test-utils";
import { CONSORTIUM_TIER_DESCRIPTIONS } from "../../constants/consortiumContent";
import ConsortiumTiersPage from "./ConsortiumTiersPage";

const OFFER = {
  tiers: [
    { tierId: "readiness", priceLabel: "price for readiness" },
    { tierId: "pilot", priceLabel: "price for pilot" },
    { tierId: "legacy_unknown", priceLabel: "price for unknown" },
  ],
  recurringFees: ["recurring fee line"],
  termNote: "term note line",
  capacityNote: "capacity note line",
};
const { readiness: READINESS, pilot: PILOT } = CONSORTIUM_TIER_DESCRIPTIONS;
const REGISTER_LINK = { name: "Go to the consortium registration" };
const GATE_TEXT = /registered consortium participants/;
const MERGED_TEXTS = [
  READINESS.title,
  READINESS.description,
  "price for readiness",
  "recurring fee line",
  "term note line",
  "capacity note line",
];
const state = { query: {}, setTier: vi.fn(), unwrap: vi.fn() };

vi.mock("../../features/consortium/consortiumApi", () => ({
  useGetTiersQuery: () => state.query,
  useSetTierMutation: () => [
    (tier) => {
      state.setTier(tier);
      return { unwrap: state.unwrap };
    },
    { isLoading: false },
  ],
}));
vi.mock("../../config/firebase", () => ({ auth: { currentUser: null } }));
vi.mock("../../hooks/useReducedMotion", () => ({
  useReducedMotion: () => true,
}));

function renderPage() {
  return renderWithProviders(<ConsortiumTiersPage />, {
    route: "/consortium/tiers",
  });
}

describe("ConsortiumTiersPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    state.query = { data: { data: OFFER }, isLoading: false, error: null };
    state.unwrap.mockResolvedValue({});
  });

  it("merges the server tiers with the client prose and notes", () => {
    renderPage();
    MERGED_TEXTS.forEach((text) =>
      expect(screen.getByText(text)).toBeInTheDocument(),
    );
  });

  it("skips a tier id the client has no prose for", () => {
    renderPage();
    expect(screen.queryByText("price for unknown")).toBeNull();
    expect(screen.getAllByRole("button", { name: /^Choose / })).toHaveLength(2);
  });

  it("saves the selected tier and confirms it", async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(
      screen.getByRole("button", { name: `Choose ${PILOT.title}` }),
    );
    expect(state.setTier).toHaveBeenCalledWith("pilot");
    await waitFor(() => {
      expect(screen.getByText(/You are registered/)).toBeInTheDocument();
    });
  });

  it("shows the gate message and a registration link when refused", () => {
    state.query = { data: undefined, isLoading: false, error: { status: 403 } };
    renderPage();
    expect(screen.getByText(GATE_TEXT)).toBeInTheDocument();
    expect(screen.getByRole("link", REGISTER_LINK)).toHaveAttribute(
      "href",
      "/consortium#register",
    );
  });

  it.each([
    ["a server error", { status: 500 }],
    ["a network error", { status: "FETCH_ERROR", error: "Failed to fetch" }],
  ])("shows a load failure on %s", (_label, error) => {
    state.query = { data: undefined, isLoading: false, error };
    renderPage();
    expect(screen.getByText(/could not be loaded/)).toBeInTheDocument();
    expect(screen.queryByRole("link", REGISTER_LINK)).toBeNull();
    expect(screen.queryByText(GATE_TEXT)).toBeNull();
  });

  it("has no accessibility violations", async () => {
    cleanup();
    const { container } = renderPage();
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
