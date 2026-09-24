import { axe } from "vitest-axe";
import { renderWithProviders, screen, cleanup } from "../../test-utils";
import AssessmentAudience from "./AssessmentAudience";
import { ASSESSMENT_AUDIENCE } from "../../constants/readinessAssessmentContent";

/*
 * Section 4.2.0 in its rendered form. Expected values come from
 * ASSESSMENT_AUDIENCE, never from a restated copy string.
 */

describe("AssessmentAudience", () => {
  it("renders the heading and body from the constant", () => {
    renderWithProviders(<AssessmentAudience />);

    expect(
      screen.getByRole("heading", {
        level: 2,
        name: ASSESSMENT_AUDIENCE.heading,
      }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("assessment-audience-body")).toHaveTextContent(
      ASSESSMENT_AUDIENCE.body,
    );
  });

  // This section sits directly above the panels that carry every price and
  // the page's only passport date. A figure or a date here would duplicate
  // one of them and fail the page-level guard, so it is asserted at the
  // component rather than left to the page sweep to catch.
  it("renders no figure and no date", () => {
    const { container } = renderWithProviders(<AssessmentAudience />);
    const text = container.textContent;

    expect(text).not.toMatch(/\d/);
    expect(text).not.toMatch(/\{/);
  });

  it("has no accessibility violations", async () => {
    cleanup();
    const { container } = renderWithProviders(<AssessmentAudience />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
