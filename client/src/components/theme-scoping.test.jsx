/*
 * Pre-Phase 2 (T02) failing/pending harness for theme scoping.
 * Refs: Approach §1.5 D-N3, §5.2, §1.3 D-M1; Analysis §3.1; ticket T01.
 * vite.config.js sets test.css: false, so index.css is injected manually.
 *
 * TODO (T02): (1) add --color-bg-base + .theme-advisory/.theme-passport
 * blocks in client/src/index.css per §1.3 D-M1; (2) drop `.skip` below.
 */

import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { cleanup, render, screen } from '@testing-library/react';

const EXPECTED_ADVISORY_BG = '#1C1F26';
const EXPECTED_PASSPORT_BG = '#0A1628';

const INDEX_CSS_PATH = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  'index.css',
);

function injectIndexCss() {
  const css = readFileSync(INDEX_CSS_PATH, 'utf8');
  const styleEl = document.createElement('style');
  styleEl.setAttribute('data-testid', 'injected-index-css');
  styleEl.textContent = css;
  document.head.appendChild(styleEl);
  return styleEl;
}

function findThemeRule(selector) {
  const rules = Array.from(document.styleSheets[0]?.cssRules ?? []);
  return rules.find(
    (rule) =>
      rule instanceof CSSStyleRule &&
      typeof rule.selectorText === 'string' &&
      rule.selectorText.includes(selector),
  );
}

describe('theme-scoping (pending T02 — Phase 2 token rename + theme blocks)', () => {
  let styleEl;

  beforeAll(() => {
    styleEl = injectIndexCss();
  });

  afterAll(() => {
    styleEl?.remove();
  });

  afterEach(() => {
    cleanup();
  });

  describe('primary path — getComputedStyle resolves --color-bg-base', () => {
    it('.theme-advisory wrapper resolves --color-bg-base to #1C1F26', () => {
      render(<div className="theme-advisory" data-testid="advisory-wrapper" />);
      const el = screen.getByTestId('advisory-wrapper');
      const value = getComputedStyle(el)
        .getPropertyValue('--color-bg-base')
        .trim()
        .toUpperCase();
      expect(value).toBe(EXPECTED_ADVISORY_BG.toUpperCase());
    });

    it('.theme-passport wrapper resolves --color-bg-base to #0A1628', () => {
      render(<div className="theme-passport" data-testid="passport-wrapper" />);
      const el = screen.getByTestId('passport-wrapper');
      const value = getComputedStyle(el)
        .getPropertyValue('--color-bg-base')
        .trim()
        .toUpperCase();
      expect(value).toBe(EXPECTED_PASSPORT_BG.toUpperCase());
    });
  });

  describe('fallback path — document.styleSheets[0].cssRules contains the rule', () => {
    it('contains a .theme-advisory rule declaring --color-bg-base: #1C1F26', () => {
      render(<div className="theme-advisory" data-testid="advisory-wrapper" />);
      const el = screen.getByTestId('advisory-wrapper');
      expect(document.styleSheets[0]?.ownerNode).toBe(styleEl);
      const rule = findThemeRule('.theme-advisory');
      const ruleValue = rule?.style
        .getPropertyValue('--color-bg-base')
        .trim()
        .toUpperCase();
      expect(el.classList.contains('theme-advisory')).toBe(true);
      expect(rule).toBeTruthy();
      expect(ruleValue).toBe(EXPECTED_ADVISORY_BG.toUpperCase());
    });

    it('contains a .theme-passport rule declaring --color-bg-base: #0A1628', () => {
      render(<div className="theme-passport" data-testid="passport-wrapper" />);
      const el = screen.getByTestId('passport-wrapper');
      expect(document.styleSheets[0]?.ownerNode).toBe(styleEl);
      const rule = findThemeRule('.theme-passport');
      const ruleValue = rule?.style
        .getPropertyValue('--color-bg-base')
        .trim()
        .toUpperCase();
      expect(el.classList.contains('theme-passport')).toBe(true);
      expect(rule).toBeTruthy();
      expect(ruleValue).toBe(EXPECTED_PASSPORT_BG.toUpperCase());
    });
  });
});
