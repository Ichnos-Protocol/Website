import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import BookingButton from "./BookingButton";
import { BOOKING_URL } from "../../constants/companyInfo";

describe("BookingButton", () => {
  it("points at BOOKING_URL exactly, with no appended parameters", () => {
    render(<BookingButton label="Book a call" />);

    const link = screen.getByRole("link", { name: "Book a call" });
    expect(link).toHaveAttribute("href", BOOKING_URL);
    expect(link.getAttribute("href")).not.toContain("?");
  });

  it("opens in a new tab with a safe rel", () => {
    render(<BookingButton label="Book a call" />);

    const link = screen.getByRole("link", { name: "Book a call" });
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("renders the passed label as the accessible name", () => {
    render(<BookingButton label="Schedule with us" />);

    expect(
      screen.getByRole("link", { name: "Schedule with us" }),
    ).toBeInTheDocument();
  });

  it("puts the passed testId on the element", () => {
    render(<BookingButton label="Book a call" testId="booking-cta" />);

    expect(screen.getByTestId("booking-cta")).toHaveAttribute(
      "href",
      BOOKING_URL,
    );
  });
});
