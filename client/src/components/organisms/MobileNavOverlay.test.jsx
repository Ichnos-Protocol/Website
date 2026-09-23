import { axe } from "vitest-axe";
import { renderWithProviders, screen, fireEvent } from "../../test-utils";
import MobileNavOverlay from "./MobileNavOverlay";
import { NAV_ITEMS } from "../../constants/navigation";
import {
  ROUTE_CONSORTIUM,
  ROUTE_CONTACT,
  ROUTE_PASSPORT,
  ROUTE_READINESS_ASSESSMENT,
  ROUTE_SERVICES,
  ROUTE_TEAM,
} from "../../constants/routes";

// Mobile overlay renders all NAV_ITEMS as flat links (no dropdowns remain).
const FLAT_NAV_ITEMS = NAV_ITEMS.filter((item) => !item.children);

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock("firebase/auth", () => ({
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(() => Promise.resolve()),
  getAuth: vi.fn(() => ({})),
  onAuthStateChanged: vi.fn(),
}));

vi.mock("../../config/firebase", () => ({
  auth: {},
}));

vi.mock("../../features/auth/authApi", () => ({
  useSyncProfileMutation: vi.fn(() => [
    vi.fn(() => ({
      unwrap: () => Promise.resolve({ data: { user: {}, isAdmin: false } }),
    })),
    { isLoading: false },
  ]),
}));

vi.mock("../../hooks/useReducedMotion", () => ({
  useReducedMotion: vi.fn(() => true),
}));

describe("MobileNavOverlay", () => {
  it("has mobile-nav-overlay--open class when isOpen is true", () => {
    const { container } = renderWithProviders(
      <MobileNavOverlay isOpen={true} onClose={vi.fn()} />,
    );
    const overlay = container.querySelector(".mobile-nav-overlay");
    expect(overlay).toHaveClass("mobile-nav-overlay--open");
  });

  it("has mobile-nav-overlay--closed class when isOpen is false", () => {
    const { container } = renderWithProviders(
      <MobileNavOverlay isOpen={false} onClose={vi.fn()} />,
    );
    const overlay = container.querySelector(".mobile-nav-overlay");
    expect(overlay).toHaveClass("mobile-nav-overlay--closed");
  });

  it("close button calls onClose when clicked", () => {
    const onClose = vi.fn();
    renderWithProviders(<MobileNavOverlay isOpen={true} onClose={onClose} />);

    fireEvent.click(screen.getByRole("button", { name: /close menu/i }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('close button has aria-label "Close menu"', () => {
    renderWithProviders(<MobileNavOverlay isOpen={true} onClose={vi.fn()} />);
    expect(screen.getByLabelText("Close menu")).toBeInTheDocument();
  });

  it("close button is keyboard accessible", () => {
    renderWithProviders(<MobileNavOverlay isOpen={true} onClose={vi.fn()} />);

    const closeBtn = screen.getByRole("button", { name: /close menu/i });
    closeBtn.focus();
    expect(closeBtn).toHaveFocus();
  });

  it("renders all flat NAV_ITEMS as links", () => {
    renderWithProviders(<MobileNavOverlay isOpen={true} onClose={vi.fn()} />);

    FLAT_NAV_ITEMS.forEach((item) => {
      const link = screen.getByRole("link", { name: item.label });
      expect(link).toHaveAttribute("href", item.external ? item.href : item.path);
    });
  });

  it("renders the Company section label and its dropdown children", () => {
    renderWithProviders(<MobileNavOverlay isOpen={true} onClose={vi.fn()} />);

    // Company appears as a section label (the mobile overlay expands dropdown
    // children inline rather than rendering them behind a click).
    expect(screen.getByText("Company")).toBeInTheDocument();

    // Children — "Why Ichnos" (homepage scroll target) and "Team" (route).
    expect(
      screen.getByRole("link", { name: "Team" }),
    ).toHaveAttribute("href", ROUTE_TEAM);
  });

  it("clicking any flat NAV_ITEMS entry calls onClose", () => {
    FLAT_NAV_ITEMS.forEach((item) => {
      const onClose = vi.fn();
      const { unmount } = renderWithProviders(
        <MobileNavOverlay isOpen={true} onClose={onClose} />,
      );

      fireEvent.click(screen.getByRole("link", { name: item.label }));
      expect(onClose).toHaveBeenCalled();
      unmount();
    });
  });

  it("on / homepage, clicking Company/Services/Contact calls navigate with scrollTo state", () => {
    NAV_ITEMS.filter((item) => item.sectionId).forEach((item) => {
      mockNavigate.mockClear();
      const { unmount } = renderWithProviders(
        <MobileNavOverlay isOpen={true} onClose={vi.fn()} />,
        { route: "/" },
      );

      fireEvent.click(screen.getByRole("link", { name: item.label }));
      expect(mockNavigate).toHaveBeenCalledWith("/", {
        state: { scrollTo: item.sectionId },
      });
      unmount();
    });
  });

  // Battery Passport is a dropdown parent since 2026-09-23. On mobile the
  // parent renders as a plain section label and its children render as links,
  // so the route is reached through "Overview" rather than through the parent.
  it("on / homepage, clicking Overview navigates to /passport", () => {
    mockNavigate.mockClear();
    renderWithProviders(
      <MobileNavOverlay isOpen={true} onClose={vi.fn()} />,
      { route: "/" },
    );

    fireEvent.click(screen.getByRole("link", { name: "Overview" }));
    expect(mockNavigate).toHaveBeenCalledWith(ROUTE_PASSPORT);
  });

  it("renders the Battery Passport section label and both of its children", () => {
    renderWithProviders(
      <MobileNavOverlay isOpen={true} onClose={vi.fn()} />,
      { route: "/" },
    );

    expect(screen.getByText("Battery Passport")).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Battery Passport" }),
    ).toBeNull();
    expect(screen.getByRole("link", { name: "Overview" })).toHaveAttribute(
      "href",
      ROUTE_PASSPORT,
    );
    expect(
      screen.getByRole("link", { name: "Readiness Assessment" }),
    ).toHaveAttribute("href", ROUTE_READINESS_ASSESSMENT);
  });

  it("on /services route, clicking each flat link navigates to its path", () => {
    const expected = {
      Services: ROUTE_SERVICES,
      Consortium: ROUTE_CONSORTIUM,
      Contact: ROUTE_CONTACT,
    };

    Object.entries(expected).forEach(([label, path]) => {
      mockNavigate.mockClear();
      const { unmount } = renderWithProviders(
        <MobileNavOverlay isOpen={true} onClose={vi.fn()} />,
        { route: ROUTE_SERVICES },
      );

      fireEvent.click(screen.getByRole("link", { name: label }));
      expect(mockNavigate).toHaveBeenCalledWith(path);
      unmount();
    });
  });

  it("on /services route, Overview still navigates to /passport", () => {
    mockNavigate.mockClear();
    renderWithProviders(
      <MobileNavOverlay isOpen={true} onClose={vi.fn()} />,
      { route: ROUTE_SERVICES },
    );

    fireEvent.click(screen.getByRole("link", { name: "Overview" }));
    expect(mockNavigate).toHaveBeenCalledWith(ROUTE_PASSPORT);
  });

  it("renders nav links with default token-aware classes on non-matching route", () => {
    renderWithProviders(<MobileNavOverlay isOpen={true} onClose={vi.fn()} />, {
      route: "/catalog",
    });

    FLAT_NAV_ITEMS.forEach(({ label }) => {
      const link = screen.getByRole("link", { name: label });
      expect(link).toHaveClass("nav-link");
      expect(link).toHaveClass("mobile-nav-link-item");
      expect(link).toHaveClass("px-3");
      expect(link).toHaveClass("py-2");
      expect(link).toHaveClass("nav-link-default");
      expect(link).not.toHaveClass("active");
      expect(link).not.toHaveClass("nav-link-active");
    });
  });

  it("marks the active link with active/nav-link-active classes when the route matches", () => {
    renderWithProviders(<MobileNavOverlay isOpen={true} onClose={vi.fn()} />, {
      route: ROUTE_SERVICES,
    });

    const servicesLink = screen.getByRole("link", { name: "Services" });
    expect(servicesLink).toHaveClass("active");
    expect(servicesLink).toHaveClass("nav-link-active");
    expect(servicesLink).toHaveClass("px-3");
    expect(servicesLink).toHaveClass("py-2");
    expect(servicesLink).not.toHaveClass("nav-link-default");

    ["Consortium", "Contact"].forEach((label) => {
      const link = screen.getByRole("link", { name: label });
      expect(link).toHaveClass("nav-link-default");
      expect(link).not.toHaveClass("active");
    });
  });

  it("on /team route, the Team flat link is marked active", () => {
    renderWithProviders(<MobileNavOverlay isOpen={true} onClose={vi.fn()} />, {
      route: ROUTE_TEAM,
    });
    expect(screen.getByRole("link", { name: "Team" })).toHaveClass("active");
  });

  it("all navigation links are keyboard accessible (flat items)", () => {
    renderWithProviders(<MobileNavOverlay isOpen={true} onClose={vi.fn()} />);

    FLAT_NAV_ITEMS.forEach(({ label }) => {
      const link = screen.getByRole("link", { name: label });
      link.focus();
      expect(link).toHaveFocus();
    });
  });

  it("renders Live Demo as a real external link and still calls onClose on click", () => {
    const onClose = vi.fn();
    renderWithProviders(<MobileNavOverlay isOpen={true} onClose={onClose} />);

    const link = screen.getByRole("link", { name: "Live Demo" });
    expect(link).toHaveAttribute("href", "https://passport.ichnos-protocol.com/demo");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", expect.stringContaining("noopener"));

    mockNavigate.mockClear();
    fireEvent.click(link);
    expect(onClose).toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("has no accessibility violations", async () => {
    const { container } = renderWithProviders(
      <MobileNavOverlay isOpen={true} onClose={vi.fn()} />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
