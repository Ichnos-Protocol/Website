import { describe, it, expect } from 'vitest';
import { contrastRatio } from './contrast';

/**
 * Catena-X light-palette token pairs that must meet WCAG AA.
 * Hex literals only — no CSS parsing. `min` is the required ratio
 * (4.5 for normal text, 3 for large text).
 */
const TOKEN_PAIRS = [
  { fg: '#111111', bg: '#FAFBFC', min: 4.5 },
  { fg: '#111111', bg: '#FFFFFF', min: 4.5 },
  { fg: '#111111', bg: '#EAF1FE', min: 4.5 },
  { fg: '#252525', bg: '#FAFBFC', min: 4.5 },
  { fg: '#252525', bg: '#FFFFFF', min: 4.5 },
  { fg: '#FFFFFF', bg: '#0F71CB', min: 4.5 },
  { fg: '#0F71CB', bg: '#FFFFFF', min: 4.5 },
  { fg: '#0F71CB', bg: '#FAFBFC', min: 4.5 },
  // Updating status badge: --color-text-secondary on the amber tint fill,
  // rgba(255, 165, 0, 0.15) composited over the #FFFFFF surface = #FFF2D9.
  { fg: '#252525', bg: '#FFF2D9', min: 4.5 },
];

const GRAPHIC_ONLY_TOKENS = ['#FFA600', '#B3CB2D'];

describe('contrastRatio (Catena-X token pairs)', () => {
  it.each(TOKEN_PAIRS)(
    'meets AA: $fg on $bg is at least $min:1',
    ({ fg, bg, min }) => {
      expect(contrastRatio(fg, bg)).toBeGreaterThanOrEqual(min);
    },
  );

  it('returns ~21 for black on white (sanity check)', () => {
    expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 0);
  });

  it('never uses graphic-only amber/green tokens as foreground text', () => {
    const foregrounds = TOKEN_PAIRS.map(({ fg }) => fg.toUpperCase());
    for (const token of GRAPHIC_ONLY_TOKENS) {
      expect(foregrounds).not.toContain(token.toUpperCase());
    }
  });
});
