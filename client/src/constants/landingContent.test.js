import { describe, it, expect } from "vitest";

import { HERO_CONTENT } from "./landingContent";

/*
 * Guard for the landing hero headline (september fixes spec v1.2, P4).
 *
 * Spec section 3 says tests import constants rather than restate strings.
 * The exact-literal assertion below is a recorded exception: the wording
 * comes from owner decision D1, not from this module, so restating it here
 * is what makes an accidental edit to the headline fail.
 */
const D1_HEADLINE =
  "Getting ASEAN battery value chains and their data ready for the EU market";

describe("HERO_CONTENT.headline", () => {
  it("matches the owner-decided wording (D1)", () => {
    expect(HERO_CONTENT.headline).toBe(D1_HEADLINE);
  });

  it("names ASEAN", () => {
    expect(HERO_CONTENT.headline).toMatch(/\bASEAN\b/);
  });

  it("names the EU as a whole word", () => {
    expect(HERO_CONTENT.headline).toMatch(/\bEU\b/);
  });

  it("does not end with a full stop", () => {
    expect(HERO_CONTENT.headline).not.toMatch(/\.$/);
  });
});
