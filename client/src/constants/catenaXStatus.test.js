import { describe, it, expect } from 'vitest';

import {
  CATENA_X_QUALIFICATION_GRANTED,
  CATENA_X_QUALIFIER_CLASS,
  CATENA_X_TITLE_BASE,
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
