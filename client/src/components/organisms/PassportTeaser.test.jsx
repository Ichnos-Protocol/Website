import { axe } from "vitest-axe";
import { renderWithProviders, screen, cleanup } from "../../test-utils";
import PassportTeaser from "./PassportTeaser";
import { PASSPORT_TEASER } from "../../constants/landingContent";
import {
  ROUTE_PASSPORT,
  ROUTE_READINESS_ASSESSMENT,
} from "../../constants/routes";

describe("PassportTeaser", () => {
  it('renders a section with id="passport"', () => {
    const { container } = renderWithProviders(<PassportTeaser />);
    expect(container.querySelector("section#passport")).toBeInTheDocument();
  });

  it("renders the heading and body", () => {
    const { container } = renderWithProviders(<PassportTeaser />);
    expect(
      screen.getByRole("heading", { level: 2, name: PASSPORT_TEASER.heading }),
    ).toBeInTheDocument();
    expect(container.textContent).toContain(PASSPORT_TEASER.body);
  });

  it("renders the passport overview link", () => {
    renderWithProviders(<PassportTeaser />);
    const cta = screen.getByRole("link", { name: PASSPORT_TEASER.ctaLabel });
    expect(cta).toHaveAttribute("href", ROUTE_PASSPORT);
  });

  it("renders a secondary text link to the readiness assessment", () => {
    renderWithProviders(<PassportTeaser />);
    const link = screen.getByTestId("passport-teaser-readiness-link");
    expect(link).toHaveTextContent(PASSPORT_TEASER.readinessLabel);
    expect(link).toHaveAttribute("href", ROUTE_READINESS_ASSESSMENT);
    expect(link).not.toHaveAttribute("target");
  });

  it("renders exactly two text links and no button", () => {
    const { container } = renderWithProviders(<PassportTeaser />);
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(2);
    links.forEach((link) => {
      expect(link.className).not.toMatch(/\bbtn\b/);
    });
    expect(container.querySelector("button")).toBeNull();
  });

  it("has no accessibility violations", async () => {
    cleanup();
    const { container } = renderWithProviders(<PassportTeaser />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
