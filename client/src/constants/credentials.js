import { CATENA_X_MEMBERSHIP_NOTE } from './catenaXStatus';

// Shared credentials/recognitions list, consumed by CredentialStrip
// (homepage) and the Footer recognitions block. The Catena-X item is
// the only linkable credential, and it may link only to catena-x.net.
// Array order is meaningful: association membership comes first.
export const CREDENTIALS = [
  {
    id: 'catenax-member',
    label: 'Catena-X Association member',
    note: CATENA_X_MEMBERSHIP_NOTE,
  },
  {
    id: 'catenax-qualified-advisor',
    label: 'Catena-X Qualified Advisor',
    note: 'Attestation ID 868 · valid to 06 Jul 2027',
    isCatenaXLabel: true,
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
    note: 'Member — expert group under the Catena-X Sustainability Committee',
  },
  {
    id: 'phd-pem-rwth',
    label: 'PhD, PEM — RWTH Aachen',
    note: 'Circular economy for automotive batteries',
  },
];
