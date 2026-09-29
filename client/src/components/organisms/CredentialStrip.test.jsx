import { render, screen, within } from "@testing-library/react";

import CredentialStrip from "./CredentialStrip";
import {
  ADVISOR_CARD_NOTE,
  CX_LABEL_ASSETS,
} from "../../constants/catenaXStatus";
import { CREDENTIALS } from "../../constants/credentials";

const EXPECTED_CREDENTIAL_IDS = [
  "catenax-member",
  "catenax-qualified-advisor",
  "dpp-expert-group",
  "battery-experience",
];

// Label text is derived from the credentials constant and asset paths
// from the label-asset map, never retyped: the tests locate each card by
// test id and its label node by role, then compare the rendered
// alt/src/text against those sources of truth.
const ADVISOR_CREDENTIAL = CREDENTIALS.find(
  ({ id }) => id === "catenax-qualified-advisor",
);
const MEMBER_CREDENTIAL = CREDENTIALS.find(({ id }) => id === "catenax-member");

describe("CredentialStrip", () => {
  afterEach(() => {
    vi.resetModules();
    vi.doUnmock("../../constants/catenaXStatus");
  });

  describe("with the official label assets available", () => {
    beforeEach(() => {
      render(<CredentialStrip />);
    });

    it("renders the section landmark with its accessible label", () => {
      expect(
        screen.getByRole("region", { name: "Credentials" }),
      ).toBeInTheDocument();
    });

    it("renders the official Association member label image, unlinked", () => {
      const card = screen.getByTestId("credential-catenax-member");
      const img = within(card).getByRole("img");
      expect(img).toHaveAttribute("alt", MEMBER_CREDENTIAL.label);
      expect(img).toHaveAttribute("src", CX_LABEL_ASSETS.member.pos);
      expect(img).toHaveAttribute("loading", "lazy");
      expect(img).toHaveAttribute("decoding", "async");
      expect(img).toHaveClass("credential-strip__label-img--member");
      expect(card.querySelector("a")).toBeNull();
    });

    it("renders exactly one label image, the member label", () => {
      // september-fixes P7: the advisor label moved to the founder profile.
      const images = document.querySelectorAll("img");
      expect(images).toHaveLength(1);
      expect(images[0]).toHaveAttribute("src", CX_LABEL_ASSETS.member.pos);
    });

    it("exposes exactly the expected credential ids, in order", () => {
      expect(CREDENTIALS.map(({ id }) => id)).toEqual(EXPECTED_CREDENTIAL_IDS);
    });

    it("renders one card per credential id and no extras", () => {
      EXPECTED_CREDENTIAL_IDS.forEach((id) => {
        expect(screen.getAllByTestId(`credential-${id}`)).toHaveLength(1);
      });
      expect(
        document.querySelectorAll('[data-testid^="credential-"]'),
      ).toHaveLength(EXPECTED_CREDENTIAL_IDS.length);
    });

    it("renders the advisor card as text label and note from the shared constants", () => {
      // §7.0 corollary, same two-halves mechanism as the trademark notice:
      // the exact-string half of tier-3 item 14 lives in
      // catenaXStatus.test.js; this half asserts DOM-equals-constant.
      const card = screen.getByTestId("credential-catenax-qualified-advisor");
      expect(within(card).getByText(ADVISOR_CARD_NOTE)).toBeInTheDocument();
      expect(
        within(card).getByText(ADVISOR_CREDENTIAL.label),
      ).toBeInTheDocument();
      expect(within(card).queryByRole("img")).toBeNull();
    });

    it("renders no link and no anchor anywhere", () => {
      // A raw querySelector as well as the role query: an <a> with no href
      // carries no link role and would slip past a role query — which is
      // exactly the regression this guards. The page's single linked label
      // is on the founder profile (TeamPage.test.jsx).
      expect(screen.queryAllByRole("link")).toHaveLength(0);
      expect(document.querySelector("a")).toBeNull();
    });
  });

  describe("when the member entry in CX_LABEL_ASSETS has no positive asset", () => {
    it("falls back to a text label with no anchor anywhere", async () => {
      vi.resetModules();
      vi.doMock("../../constants/catenaXStatus", async (orig) => {
        const actual = await orig();
        return {
          ...actual,
          CATENA_X_MEMBER_LABEL_ASSET: null,
          CX_LABEL_ASSETS: {
            ...actual.CX_LABEL_ASSETS,
            member: { ...actual.CX_LABEL_ASSETS.member, pos: null },
          },
        };
      });
      const { default: CredentialStripNull } =
        await import("./CredentialStrip");
      render(<CredentialStripNull />);

      const card = screen.getByTestId("credential-catenax-member");
      expect(within(card).queryByRole("img")).toBeNull();
      expect(
        within(card).getByText(MEMBER_CREDENTIAL.label),
      ).toBeInTheDocument();
      expect(document.querySelectorAll("img")).toHaveLength(0);
      expect(screen.queryAllByRole("link")).toHaveLength(0);
      expect(document.querySelector("a")).toBeNull();
    });
  });
});
