import { FOUNDER_PERSON_SCHEMA, ORGANIZATION_SCHEMA } from "./structuredData";
import {
  CATENA_X_MEMBERSHIP_NOTE,
  getCatenaXFounderLine,
  getCatenaXFullTitle,
} from "./catenaXStatus";

/*
 * Qualified Advisor attribution (september-fixes P7). The vocabulary guard
 * proves the corporate claim is gone; these prove the qualification is still
 * stated and attributed to its holder. Expectations derive from the
 * constants and functions they pin, never from retyped copy.
 */

describe("ORGANIZATION_SCHEMA description", () => {
  it("states the membership and attributes the qualification to the founder", () => {
    expect(ORGANIZATION_SCHEMA.description).toContain(getCatenaXFounderLine());
    expect(ORGANIZATION_SCHEMA.description).toContain(CATENA_X_MEMBERSHIP_NOTE);
  });
});

describe("FOUNDER_PERSON_SCHEMA description", () => {
  it("carries the full Qualified Advisor title", () => {
    expect(FOUNDER_PERSON_SCHEMA.description).toContain(getCatenaXFullTitle());
  });
});
