// Top-level navbar entries.
// - Flat items have `path` (route) and optionally `sectionId` (scroll target
//   when already on `/`) + `activeSectionId` (scrollspy match).
// - Dropdown items have `children`. Active state for the parent fires when
//   any child matches the current route or the scrollspy section.
//
// Battery Passport temporarily routes to /data — the existing data-services
// content lives there. Phase D will move it to /passport with rewritten copy
// (per the founder's spec: status quo + milestones of the EU battery passport,
// the case for seamless value-chain data flow, Catena-X intro pointer, the
// stack with ASEAN ↔ EU localization). For now the route stays so external
// links don't break and the nav structure is correct.
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
  { label: 'Battery Passport', path: '/data' },
  { label: 'Contact', path: '/contact', sectionId: 'contact', activeSectionId: 'contact' },
];

// Homepage section ids spied on by the scrollspy. Kept at 'data' for now since
// the LandingPage layout hasn't been rewritten yet; Phase E renames to 'passport'
// when the homepage is restructured.
export const LANDING_SECTION_IDS = ['company', 'services', 'data', 'contact'];
