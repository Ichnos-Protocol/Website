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

describe('catenaXStatus (pending state — real module)', () => {
  it('ships with the qualification flag off', () => {
    expect(CATENA_X_QUALIFICATION_GRANTED).toBe(false);
  });

  it('exposes the stable qualifier class name', () => {
    expect(CATENA_X_QUALIFIER_CLASS).toBe('catenax-qualifier-pending');
  });

  it('returns a non-empty qualifier suffix with a leading space while pending', () => {
    const pending = getCatenaXQualifierText();
    expect(pending).toBe(computeCatenaXQualifierText(false));
    expect(pending.startsWith(' ')).toBe(true);
    expect(pending.trim().length).toBeGreaterThan(0);
  });

  it('builds the full title as base + qualifier', () => {
    expect(getCatenaXFullTitle()).toBe(
      CATENA_X_TITLE_BASE + getCatenaXQualifierText(),
    );
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
