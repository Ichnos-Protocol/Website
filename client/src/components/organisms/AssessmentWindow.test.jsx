import { axe } from "vitest-axe";
import { renderWithProviders, screen, cleanup } from "../../test-utils";
import AssessmentWindow from "./AssessmentWindow";
import { ASSESSMENT_WINDOW } from "../../constants/readinessAssessmentContent";

/*
 * Section 4.2.2 in its rendered form.
 *
 * Nothing here restates a copy string: every expected value comes from
 * ASSESSMENT_WINDOW itself, so an amendment to the fenced copy moves the
 * expectation with the source instead of leaving a stale literal behind.
 */

// The three copy strings as one blob, for the token tripwire below.
const WINDOW_TEXT = Object.values(ASSESSMENT_WINDOW).join(" ");

// Any markup that would turn the section into a ticking surface.
const CLOCK_SELECTOR =
  '[data-testid*="countdown" i], [data-testid*="timer" i], [data-testid*="clock" i], [data-testid*="remaining" i], [class*="countdown" i], [class*="timer" i], [class*="clock" i], [class*="remaining" i]';

describe("AssessmentWindow", () => {
  it("renders the heading, body and closing line from the constant", () => {
    renderWithProviders(<AssessmentWindow />);
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: ASSESSMENT_WINDOW.heading,
      }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("assessment-window-body")).toHaveTextContent(
      ASSESSMENT_WINDOW.body,
    );
    expect(screen.getByTestId("assessment-window-closing")).toHaveTextContent(
      ASSESSMENT_WINDOW.closing,
    );
  });

  it("gives the closing line the emphasis class", () => {
    renderWithProviders(<AssessmentWindow />);
    expect(screen.getByTestId("assessment-window-closing")).toHaveClass(
      "readiness-window-closing",
    );
  });

  it("renders no countdown, timer or clock surface", () => {
    const { container } = renderWithProviders(<AssessmentWindow />);
    const { textContent } = screen.getByTestId("assessment-window");

    expect(container.querySelector("time")).toBeNull();
    expect(container.querySelector(CLOCK_SELECTOR)).toBeNull();
    expect(textContent).not.toMatch(/countdown/i);
    expect(textContent).not.toMatch(/days remaining/i);
    expect(textContent).not.toMatch(/timer/i);
  });

  it("renders no date literal and no unresolved token", () => {
    renderWithProviders(<AssessmentWindow />);
    const { textContent } = screen.getByTestId("assessment-window");

    expect(textContent).not.toMatch(/\b\d{4}\b/);
    expect(textContent).not.toContain("{");
  });

  // Tripwire for section 8 item 7. The window copy carries no {passportDate}
  // token today, which is why this component interpolates nothing and why
  // Panel B remains the only render of a regulatory date on the page. If the
  // fenced copy is ever amended to carry a token, this fails, and the fix is
  // to route the affected string through interpolate() in
  // AssessmentWindow.jsx, not to relax the assertion.
  it("carries no interpolation token in the fenced copy", () => {
    expect(WINDOW_TEXT).not.toContain("{");
  });

  it("has no accessibility violations", async () => {
    cleanup();
    const { container } = renderWithProviders(<AssessmentWindow />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
