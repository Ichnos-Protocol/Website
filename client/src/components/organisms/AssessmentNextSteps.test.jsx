import { axe } from "vitest-axe";
import { renderWithProviders, screen, cleanup } from "../../test-utils";
import AssessmentNextSteps from "./AssessmentNextSteps";
import { ASSESSMENT_NEXT_STEPS } from "../../constants/readinessAssessmentContent";
import { ROUTE_SERVICES } from "../../constants/routes";

/*
 * Section 4.5.1 in its rendered form. Expected values come from
 * ASSESSMENT_NEXT_STEPS and ROUTE_SERVICES, never from a restated copy string
 * or a path literal.
 */

describe("AssessmentNextSteps", () => {
  it("renders the heading and body from the constant", () => {
    renderWithProviders(<AssessmentNextSteps />);

    expect(
      screen.getByRole("heading", {
        level: 2,
        name: ASSESSMENT_NEXT_STEPS.heading,
      }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("assessment-next-steps-body")).toHaveTextContent(
      ASSESSMENT_NEXT_STEPS.body,
    );
  });

  it("links to the services route under the fenced label", () => {
    renderWithProviders(<AssessmentNextSteps />);
    const link = screen.getByRole("link", {
      name: ASSESSMENT_NEXT_STEPS.linkLabel,
    });

    expect(link).toHaveAttribute("href", ROUTE_SERVICES);
  });

  it("has no accessibility violations", async () => {
    cleanup();
    const { container } = renderWithProviders(<AssessmentNextSteps />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
