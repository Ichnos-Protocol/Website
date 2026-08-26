// Top-level navbar entries.
// - Flat items have `path` (route) and optionally `sectionId` (scroll target
//   when already on `/`) + `activeSectionId` (scrollspy match).
// - Dropdown items have `children`. Active state for the parent fires when
//   any child matches the current route or the scrollspy section.
//
// Battery Passport routes to /passport — the live Battery Passport page (status
// quo + milestones of the EU battery passport, the case for seamless
// value-chain data flow, the Catena-X stack intro, and the ASEAN ↔ EU
// localization). The legacy /data and /catena-x URLs 301-redirect here.
//
// Consortium routes to /consortium and is route-only like Battery Passport —
// no `sectionId`/`activeSectionId`, so it never participates in the homepage
// scrollspy.
export const NAV_ITEMS = [
  {
    label: 'Company',
    activeSectionId: 'company',
    children: [
      // "Why Ichnos" → homepage company section anchor (scrolls to #company)
      { label: 'Why Ichnos', sectionId: 'company' },
      // "Team" → /team route
      { label: 'Team', path: '/team' },
    ],
  },
  { label: 'Services', path: '/services', sectionId: 'services', activeSectionId: 'services' },
  { label: 'Battery Passport', path: '/passport' },
  // Live demo of the passport app itself — a separate deployment (not part of
  // this site), so it's a real external link, not a client-side route.
  { label: 'Live Demo', href: 'https://passport.ichnos-protocol.com/demo', external: true },
  { label: 'Consortium', path: '/consortium' },
  { label: 'Contact', path: '/contact', sectionId: 'contact', activeSectionId: 'contact' },
];

// Homepage section ids spied on by the scrollspy, in document order: Why Ichnos
// (#company), Services (#services), Battery Passport teaser (#passport), Contact.
export const LANDING_SECTION_IDS = ['company', 'services', 'passport', 'contact'];
