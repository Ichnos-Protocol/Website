// Shared credentials/recognitions list, consumed by CredentialStrip
// (homepage) and the Footer recognitions block. The Catena-X item is
// the only linkable credential, and it may link only to catena-x.net.
export const CREDENTIALS = [
  {
    id: 'catenax-qualified-advisor',
    label: 'Catena-X Qualified Advisor',
    note: 'Attestation ID 868 · valid to 06 Jul 2027',
    isCatenaXLabel: true,
    href: 'https://catena-x.net',
  },
  {
    id: 'expert-committee',
    label: 'Expert committee — Battery Passport',
    note: 'Approved participant',
  },
  {
    id: 'eu-passport-2027',
    label: 'EU battery passport from 18 Feb 2027',
    note: 'Regulation (EU) 2023/1542',
  },
  {
    id: 'phd-pem-rwth',
    label: 'PhD, PEM — RWTH Aachen',
    note: 'Circular economy for automotive batteries',
  },
];
