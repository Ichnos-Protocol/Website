import { describe, it, expect } from 'vitest';

import {
  CATENA_X_LABEL_ASSET,
  CATENA_X_LABEL_ASSET_NEG,
  CATENA_X_MEMBER_LABEL_ASSET,
  CATENA_X_MEMBER_LABEL_ASSET_NEG,
  CATENA_X_QUALIFICATION_GRANTED,
  CATENA_X_QUALIFIER_CLASS,
  CATENA_X_TITLE_BASE,
  TRADEMARK_NOTICE,
  computeCatenaXQualifierText,
  computeCatenaXFullTitle,
  getCatenaXQualifierText,
  getCatenaXFullTitle,
} from './catenaXStatus';

describe('catenaXStatus (granted state — real module)', () => {
  it('ships with the qualification flag on', () => {
    expect(CATENA_X_QUALIFICATION_GRANTED).toBe(true);
  });

  it('exposes the stable qualifier class name', () => {
    expect(CATENA_X_QUALIFIER_CLASS).toBe('catenax-qualifier-pending');
  });

  it('returns an empty qualifier suffix once granted', () => {
    const granted = getCatenaXQualifierText();
    expect(granted).toBe(computeCatenaXQualifierText(true));
    expect(granted).toBe('');
  });

  it('reduces the full title to the base credential', () => {
    expect(getCatenaXFullTitle()).toBe(CATENA_X_TITLE_BASE);
  });
});

describe('catenaXStatus (granted state — real computation)', () => {
  it('drops the qualifier once the flag is granted', () => {
    expect(computeCatenaXQualifierText(true)).toBe('');
  });

  it('reduces the full title to the base credential when granted', () => {
    expect(computeCatenaXFullTitle(true)).toBe(CATENA_X_TITLE_BASE);
  });

  it('keeps the qualifier appended while pending (flip relationship)', () => {
    expect(computeCatenaXQualifierText(false)).not.toBe('');
    expect(computeCatenaXFullTitle(false)).toBe(
      CATENA_X_TITLE_BASE + computeCatenaXQualifierText(false),
    );
  });
});

describe('catenaXStatus (tier-3 exact strings)', () => {
  it('matches the §2.1 trademark notice character for character', () => {
    // The only legitimate place to restate this literal (§7.3 item 13) — comparing the constant to itself would assert nothing. The DOM-equals-constant half lives in Footer.test.jsx (T7).
    expect(TRADEMARK_NOTICE).toBe(
      'Catena-X® is a registered trademark of Catena-X Automotive Network e.V. Ichnos Protocol Pte. Ltd. is an ordinary member of the association and a Catena-X Qualified Advisor. References to Catena-X standards and committees describe factual participation and do not imply certification of Ichnos products or endorsement by the association or its bodies.',
    );
  });
});

describe('catenaXStatus (tier-3 exact label filenames)', () => {
  // Item 15 widens tier 3 from three exact strings to six: each of these four
  // paths is an independent Logo Use Agreement exposure, since a wrong filename
  // either serves an unofficial asset or 404s the official one. This file is
  // the only legitimate place to restate the literals (§7.3) — asserting a
  // constant against itself, or against CX_LABEL_ASSETS, would assert nothing.
  it('points at the official Qualified Advisor label files', () => {
    expect(CATENA_X_LABEL_ASSET).toBe(
      '/brand/CX_Logo_Qualified-Advisor_CLR_RGB_pos_16x9.svg',
    );
    expect(CATENA_X_LABEL_ASSET_NEG).toBe(
      '/brand/CX_Logo_Qualified-Advisor_RGB_neg_16x9.svg',
    );
  });

  it('points at the official ordinary-member label files', () => {
    expect(CATENA_X_MEMBER_LABEL_ASSET).toBe(
      '/brand/Association_member_Logo_RGB_pos.svg',
    );
    expect(CATENA_X_MEMBER_LABEL_ASSET_NEG).toBe(
      '/brand/Association_member_Logo_RGB_neg.svg',
    );
  });
});
