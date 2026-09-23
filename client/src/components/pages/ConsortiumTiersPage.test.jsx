import { describe, it, expect, beforeEach, vi } from "vitest";
import { axe } from "vitest-axe";
import userEvent from "@testing-library/user-event";

import {
  renderWithProviders,
  screen,
  cleanup,
  waitFor,
  within,
} from "../../test-utils";
import { CONSORTIUM_TIER_DESCRIPTIONS } from "../../constants/consortiumContent";
import {
  ROUTE_CONSORTIUM_TIERS,
  ROUTE_READINESS_ASSESSMENT,
} from "../../constants/routes";
import {
  YEAR_PATTERN,
  MONTH_YEAR_PATTERN,
  ISO_DATE_PATTERN,
  RELATIVE_TIME_PATTERN,
} from "../../constants/dateGuards";
import ConsortiumTiersPage from "./ConsortiumTiersPage";

const OFFER = {
  tiers: [
    { tierId: "readiness", priceLabel: null },
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
  "price for pilot",
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
    route: ROUTE_CONSORTIUM_TIERS,
  });
}

// A subtree's text with every text node separated by a space, the idiom of
// ReadinessAssessmentPage.test.jsx: raw `textContent` glues sibling nodes, so
// a year ending one node and a letter starting the next would lose the word
// boundary the date sweep depends on.
function subtreeText(root) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const parts = [];

  while (walker.nextNode()) parts.push(walker.currentNode.nodeValue);
  return parts.join(" ");
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

  // The readiness price lives on its own page: the card links there and
  // carries no figure. Scoped to the readiness card, because the pilot card
  // legitimately names CX-0160.
  it("links the readiness card to the assessment page, with no figure", () => {
    renderPage();
    const card = screen.getByText(READINESS.description).closest(".card");
    const links = within(card).getAllByRole("link");

    expect(links).toHaveLength(1);
    expect(links[0]).toHaveAccessibleName(READINESS.priceLinkLabel);
    expect(links[0]).toHaveAttribute("href", ROUTE_READINESS_ASSESSMENT);
    expect(links[0]).not.toHaveAttribute("target");
    expect(subtreeText(card)).not.toMatch(/\d/);
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

  // Scanned after a tier is chosen, so the conditional success message is
  // swept together with the loaded tier content in the same subtree.
  it("renders no calendar date or relative time", async () => {
    const user = userEvent.setup();
    const { container } = renderPage();
    await user.click(
      screen.getByRole("button", { name: `Choose ${PILOT.title}` }),
    );
    await screen.findByRole("alert");
    const text = subtreeText(container);

    expect(text).toContain(READINESS.description);
    expect(text).toContain("You are registered");

    expect(text).not.toMatch(YEAR_PATTERN);
    expect(text).not.toMatch(MONTH_YEAR_PATTERN);
    expect(text).not.toMatch(ISO_DATE_PATTERN);
    expect(text).not.toMatch(RELATIVE_TIME_PATTERN);
  });

  it("has no accessibility violations", async () => {
    cleanup();
    const { container } = renderPage();
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
