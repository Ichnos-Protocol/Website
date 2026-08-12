import { axe } from "vitest-axe";
import { renderWithProviders, screen, cleanup } from "../../test-utils";
import ServicesGroup from "./ServicesGroup";

const FIXTURE_SERVICES = [
  {
    id: "card-plain",
    icon: "bi-shield-check",
    title: "Plain Card",
    description: "Plain description.",
  },
  {
    id: "card-microline",
    icon: "bi-diagram-3",
    title: "Microline Card",
    description: "Microline description.",
    microline: [
      { text: "Linked Term (LT)", href: "https://example.org/linked-term" },
      { text: "Plain Term (PT)" },
    ],
  },
  {
    id: "card-passport",
    icon: "bi-shield-fill-check",
    title: "Passport Card",
    description: "Passport description.",
    passportLink: "/passport",
  },
  {
    id: "card-coming-soon",
    icon: "bi-clock-history",
    title: "Coming Soon Card",
    description: "Coming soon description.",
    passportLink: "/passport",
    comingSoon: true,
  },
];

function renderGroup(props = {}) {
  return renderWithProviders(
    <ServicesGroup
      id="engineering"
      label="Engineering"
      services={FIXTURE_SERVICES}
      {...props}
    />,
  );
}

describe("ServicesGroup", () => {
  it("renders an h2 heading with the provided label", () => {
    renderGroup();
    expect(
      screen.getByRole("heading", { level: 2, name: "Engineering" }),
    ).toBeInTheDocument();
  });

  it("renders a section element with the provided id", () => {
    const { container } = renderGroup();
    expect(container.querySelector("section#engineering")).not.toBeNull();
  });

  it("renders one card per service with title and description", () => {
    renderGroup();
    FIXTURE_SERVICES.forEach((service) => {
      expect(
        screen.getByText(service.title, { selector: ".service-card-title" }),
      ).toBeInTheDocument();
      expect(screen.getByText(service.description)).toBeInTheDocument();
    });
  });

  it("renders the microline with prefix, linked term, and plain term", () => {
    const { container } = renderGroup();
    const microline = container.querySelector(".service-card-microline");
    expect(microline).not.toBeNull();
    expect(microline).toHaveTextContent("In Catena-X terms:");
    expect(microline).toHaveTextContent("Plain Term (PT)");

    const link = screen.getByRole("link", { name: "Linked Term (LT)" });
    expect(link).toHaveAttribute("href", "https://example.org/linked-term");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");

    // The plain segment renders as text, not a link.
    expect(
      screen.queryByRole("link", { name: "Plain Term (PT)" }),
    ).toBeNull();
  });

  // The kicker/heading-override case was removed with the renderer's temporary
  // compatibility path (P5d): ServicesGroup no longer accepts `kicker` or
  // `heading`, so the heading always renders `label`.

  it("renders the subtitle below the heading only when provided", () => {
    renderGroup({
      subtitle: "Catena-X data exchange, delivered end to end.",
      lede: "The lede paragraph.",
    });
    const subtitle = screen.getByText(
      "Catena-X data exchange, delivered end to end.",
    );
    expect(subtitle).toHaveClass("pillar-subtitle");

    const heading = screen.getByRole("heading", { level: 2 });
    expect(heading.nextElementSibling).toBe(subtitle);
    expect(subtitle.nextElementSibling).toHaveClass("services-group-lede");

    cleanup();
    const { container } = renderGroup({ lede: "The lede paragraph." });
    expect(container.querySelector(".pillar-subtitle")).toBeNull();
    expect(screen.getByText("The lede paragraph.")).toHaveClass(
      "services-group-lede",
    );
  });

  it("renders a Learn more → link to /passport for a passportLink service", () => {
    renderGroup();
    const link = screen.getByRole("link", { name: "Learn more →" });
    expect(link).toHaveAttribute("href", "/passport");
  });

  it("does not render an eyebrow even when a service carries a stale eyebrow prop", () => {
    const { container } = renderGroup({
      services: [
        {
          id: "card-stale-eyebrow",
          icon: "bi-award",
          title: "Stale Eyebrow Card",
          description: "Stale eyebrow description.",
          eyebrow: "Catena-X Qualified Advisor",
        },
      ],
    });
    expect(container.querySelector(".service-card-eyebrow")).toBeNull();
    expect(screen.queryByText("Catena-X Qualified Advisor")).toBeNull();
    expect(
      screen.getByText("Stale Eyebrow Card", {
        selector: ".service-card-title",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("Stale eyebrow description.")).toBeInTheDocument();
  });

  it("applies the coming-soon class and renders no CTA for a coming-soon service", () => {
    const { container } = renderGroup({
      services: [FIXTURE_SERVICES[3]],
    });
    expect(
      container.querySelector(".service-card--coming-soon"),
    ).not.toBeNull();
    expect(screen.queryByRole("link", { name: "Learn more →" })).toBeNull();
  });

  it("has no accessibility violations", async () => {
    cleanup();
    const { container } = renderGroup();
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
