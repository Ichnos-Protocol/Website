import { axe } from "vitest-axe";
import { renderWithProviders, screen, cleanup } from "../../test-utils";
import ServicesGroup from "./ServicesGroup";

const FIXTURE_ITEMS = [
  {
    id: "item-a",
    title: "Item A",
    description: "Description A.",
  },
  {
    id: "item-b",
    title: "Item B",
    description: "Description B.",
  },
  {
    id: "item-c",
    title: "Item C",
    description: "Description C.",
  },
];

describe("ServicesGroup", () => {
  it("renders an h2 heading with the provided label", () => {
    renderWithProviders(
      <ServicesGroup id="data-services" label="Data services" items={FIXTURE_ITEMS} />,
    );
    expect(
      screen.getByRole("heading", { level: 2, name: "Data services" }),
    ).toBeInTheDocument();
  });

  it("renders a section element with the provided id", () => {
    const { container } = renderWithProviders(
      <ServicesGroup id="data-services" label="Data services" items={FIXTURE_ITEMS} />,
    );
    expect(container.querySelector("section#data-services")).not.toBeNull();
  });

  it("renders one card per item with title and description", () => {
    renderWithProviders(
      <ServicesGroup id="data-services" label="Data services" items={FIXTURE_ITEMS} />,
    );
    FIXTURE_ITEMS.forEach((item) => {
      expect(
        screen.getByText(item.title, { selector: ".service-card-title" }),
      ).toBeInTheDocument();
    });
    expect(screen.getAllByText(/Description [A-C]\./)).toHaveLength(
      FIXTURE_ITEMS.length,
    );
  });

  it("renders a section-level CTA link with the correct href for card sections", () => {
    renderWithProviders(
      <ServicesGroup
        id="data-services"
        label="Data services"
        items={FIXTURE_ITEMS}
        cta={{ label: "Explore data services →", to: "/data" }}
      />,
    );
    const link = screen.getByRole("link", { name: "Explore data services →" });
    expect(link).toHaveAttribute("href", "/data");
  });

  it("renders a teaser paragraph and CTA link instead of cards when teaser is provided", () => {
    const teaser = "We guide ASEAN manufacturers through Catena-X.";
    renderWithProviders(
      <ServicesGroup
        id="catena-x-consulting"
        label="Catena-X consulting"
        teaser={teaser}
        cta={{ label: "Catena-X consulting →", to: "/catena-x" }}
      />,
    );
    expect(screen.getByText(teaser)).toBeInTheDocument();
    expect(
      screen.queryByText("Item A", { selector: ".service-card-title" }),
    ).toBeNull();
    const link = screen.getByRole("link", { name: "Catena-X consulting →" });
    expect(link).toHaveAttribute("href", "/catena-x");
  });

  it("renders the intro paragraph when the intro prop is provided", () => {
    const intro = "An overview of these services.";
    renderWithProviders(
      <ServicesGroup
        id="data-services"
        label="Data services"
        intro={intro}
        items={FIXTURE_ITEMS}
      />,
    );
    expect(screen.getByText(intro)).toBeInTheDocument();
  });

  it("does not render an intro paragraph when intro is omitted", () => {
    const { container } = renderWithProviders(
      <ServicesGroup id="data-services" label="Data services" items={FIXTURE_ITEMS} />,
    );
    expect(container.querySelector(".services-group-intro")).toBeNull();
  });

  it("has no accessibility violations", async () => {
    cleanup();
    const { container } = renderWithProviders(
      <ServicesGroup
        id="data-services"
        label="Data services"
        intro="An overview of these services."
        items={FIXTURE_ITEMS}
        cta={{ label: "Explore data services →", to: "/data" }}
      />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
