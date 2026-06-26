// Top-level navbar entries (flat).
// Each item has `path` (route) and optionally `sectionId` (scroll target when
// already on `/`) + `activeSectionId` (scrollspy match).
export const NAV_ITEMS = [
  { label: 'Home', path: '/' },
  { label: 'Services', path: '/services', sectionId: 'services', activeSectionId: 'services' },
  { label: 'Data', path: '/data' },
  { label: 'Catena-X', path: '/catena-x' },
  { label: 'Team', path: '/team' },
  { label: 'Contact', path: '/contact', sectionId: 'contact', activeSectionId: 'contact' },
];

export const LANDING_SECTION_IDS = ['company', 'services', 'data', 'contact'];
