import { ADVISOR_CARD_NOTE, MEMBER_CARD_NOTE } from './catenaXStatus';

// Shared credentials/recognitions list, consumed by CredentialStrip
// (homepage) and the Footer recognitions block. Two credentials carry an
// official Catena-X label, selected by `cxLabel` ('member' | 'advisor');
// only the Qualified Advisor is linkable. Array order is meaningful:
// association membership comes first. The fourth card is an experience
// card, not a degree card: the doctorate itself is carried by the
// Why-Ichnos copy (`landingContent.js`) and the team page
// (`teamContent.js`), so no information is lost here.
export const CREDENTIALS = [
  {
    id: 'catenax-member',
    label: 'Catena-X Association member',
    note: MEMBER_CARD_NOTE,
    cxLabel: 'member',
  },
  {
    id: 'catenax-qualified-advisor',
    label: 'Catena-X Qualified Advisor',
    note: ADVISOR_CARD_NOTE,
    cxLabel: 'advisor',
    // Logo Use Agreement §4: a label may link only to catena-x.net, and
    // at most one linked label may appear per page. This is that one —
    // no other credential may carry an `href`.
    href: 'https://catena-x.net',
  },
  // Label and note are literals here rather than
  // `CATENA_X_EXPERT_GROUP_NOTE`: that constant is prose shaped for
  // sentence interpolation in structured data, whereas this card needs a
  // label/note pair worded so it defeats the committee-membership
  // misreading — participation is in the working group, not in the
  // Catena-X Sustainability Committee itself.
  {
    id: 'dpp-expert-group',
    label: 'Digital Product Passport Expert Group',
    note: 'Member: expert group under the Catena-X Sustainability Committee',
  },
  {
    id: 'battery-experience',
    label: '10+ years in battery development',
    note: 'PEM RWTH Aachen & FEV, from cell production research to vehicle battery systems',
  },
];
