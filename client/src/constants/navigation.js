// Top-level navbar entries.
// - Flat items have `path` (route) and optionally `sectionId` (scroll target
//   when already on `/`) + `activeSectionId` (scrollspy match).
// - Dropdown items have `children`. Active state for the parent fires when
//   any child matches the current route or the scrollspy section.
//
// Battery Passport is a dropdown as of 2026-09-23, so the readiness
// assessment is reachable from the navbar without becoming a top-level entry
// of its own (spec section 2.2: a paid engagement sitting alongside Services
// and Team reads as a product catalogue; a child under the page that gives it
// context does not).
//
// It follows the Company pattern deliberately: a parent with NO `path`, and
// the route moved down to a child. NavDropdown renders a parent as a
// `<button>`, never an anchor, and Navbar checks `children` before anything
// else — so a parent that kept its own `path` would silently stop linking
// anywhere. "Overview" is that link. This also fixes active state for free:
// isDropdownActive matches on children paths, so both /passport and
// /passport/readiness-assessment light the parent.
//
// /passport is the live Battery Passport page (status quo + milestones of the
// EU battery passport, the case for seamless value-chain data flow, the
// Catena-X stack intro, and the ASEAN ↔ EU localization). The legacy /data
// and /catena-x URLs 301-redirect here.
//
// Consortium routes to /consortium and is route-only like Battery Passport —
// no `sectionId`/`activeSectionId`, so it never participates in the homepage
// scrollspy.

import {
  ROUTE_CONSORTIUM,
  ROUTE_CONTACT,
  ROUTE_PASSPORT,
  ROUTE_READINESS_ASSESSMENT,
  ROUTE_SERVICES,
  ROUTE_TEAM,
} from "./routes";

export const NAV_ITEMS = [
  {
    label: "Company",
    activeSectionId: "company",
    children: [
      // "Why Ichnos" → homepage company section anchor (scrolls to #company)
      { label: "Why Ichnos", sectionId: "company" },
      // "Team" → /team route
      { label: "Team", path: ROUTE_TEAM },
    ],
  },
  {
    label: "Services",
    path: ROUTE_SERVICES,
    sectionId: "services",
    activeSectionId: "services",
  },
  {
    label: "Battery Passport",
    children: [
      // "Overview" → /passport, the parent page. This child is what keeps the
      // route reachable once the parent becomes a toggle button.
      { label: "Overview", path: ROUTE_PASSPORT },
      // "Readiness Assessment" → the fixed-scope engagement under it.
      { label: "Readiness Assessment", path: ROUTE_READINESS_ASSESSMENT },
    ],
  },
  // Live demo of the passport app itself — a separate deployment (not part of
  // this site), so it's a real external link, not a client-side route. It
  // carries `href`, not `path`, so it is deliberately not a ROUTE_* constant.
  {
    label: "Live Demo",
    href: "https://passport.ichnos-protocol.com/demo",
    external: true,
  },
  { label: "Consortium", path: ROUTE_CONSORTIUM },
  {
    label: "Contact",
    path: ROUTE_CONTACT,
    sectionId: "contact",
    activeSectionId: "contact",
  },
];

// Homepage section ids spied on by the scrollspy, in document order: Why Ichnos
// (#company), Services (#services), Battery Passport teaser (#passport), Contact.
export const LANDING_SECTION_IDS = [
  "company",
  "services",
  "passport",
  "contact",
];
