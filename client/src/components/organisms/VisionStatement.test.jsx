import { axe } from "vitest-axe";
import { renderWithProviders, screen, cleanup } from "../../test-utils";
import VisionStatement from "./VisionStatement";
import { VISION_STATEMENT } from "../../constants/teamContent";

describe("VisionStatement", () => {
  it("renders the locked section heading", () => {
    renderWithProviders(<VisionStatement />);
    expect(
      screen.getByRole("heading", { name: "Our Vision" }),
    ).toBeInTheDocument();
  });

  it("renders both vision quotes, the compliance quote first, and the attribution", () => {
    renderWithProviders(<VisionStatement />);
    const [first, second] = VISION_STATEMENT.quotes.map((quote) =>
      screen.getByText(quote),
    );
    expect(first).toHaveTextContent(/^Compliance and traceability/);
    expect(second).toHaveTextContent(/^Batteries should live/);
    expect(
      first.compareDocumentPosition(second) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      screen.getByText(new RegExp(VISION_STATEMENT.attribution)),
    ).toBeInTheDocument();
  });

  it("has no accessibility violations", async () => {
    cleanup();
    const { container } = renderWithProviders(<VisionStatement />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
