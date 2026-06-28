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
  { label: 'Contact', path: '/contact', sectionId: 'contact', activeSectionId: 'contact' },
];

// Homepage section ids spied on by the scrollspy, in document order: Why Ichnos
// (#company), Services (#services), Battery Passport teaser (#passport), Contact.
export const LANDING_SECTION_IDS = ['company', 'services', 'passport', 'contact'];
