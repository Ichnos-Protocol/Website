import { axe } from "vitest-axe";
import { renderWithProviders, screen, cleanup } from "../../test-utils";
import ServicesGroup from "./ServicesGroup";
import { CATENA_X_TITLE_BASE } from "../../constants/catenaXStatus";

const FIXTURE_SERVICES = [
  {
    id: "card-plain",
    icon: "bi-shield-check",
    title: "Plain Card",
    description: "Plain description.",
  },
  {
    id: "card-eyebrow",
    icon: "bi-diagram-3",
    title: "Eyebrow Card",
    description: "Eyebrow description.",
    eyebrow: CATENA_X_TITLE_BASE,
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

  it("renders the credential eyebrow with the muted pending qualifier span", () => {
    const { container } = renderGroup();
    const eyebrow = container.querySelector(".service-card-eyebrow");
    expect(eyebrow).not.toBeNull();
    expect(eyebrow).toHaveTextContent(CATENA_X_TITLE_BASE);
    expect(
      eyebrow.querySelector(".catenax-qualifier-pending"),
    ).not.toBeNull();
  });

  it("renders a Learn more → link to /passport for a passportLink service", () => {
    renderGroup();
    const link = screen.getByRole("link", { name: "Learn more →" });
    expect(link).toHaveAttribute("href", "/passport");
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
