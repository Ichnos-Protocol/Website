/* global process */
import { readFileSync } from 'fs';
import { resolve } from 'path';

import { describe, it, expect } from 'vitest';

// Client Vitest runs with cwd = client/, so index.html resolves at the root.
const htmlPath = resolve(process.cwd(), 'index.html');
const html = readFileSync(htmlPath, 'utf-8');

describe('index.html default head', () => {
  // Positioning line updated 2026-08-12 (Francesco): "Battery and EU battery
  // passport advisory for ASEAN". These two literals are the pre-render
  // fallback head; the React pages derive theirs from companyInfo.js.
  it('uses the battery / passport-advisory default title', () => {
    expect(html).toContain(
      '<title>Ichnos Protocol — Battery & EU battery passport advisory</title>',
    );
  });

  it('uses the battery / passport-advisory default description', () => {
    expect(html).toContain(
      'Practitioner-led battery and EU battery passport advisory for ASEAN — systems engineering, safety, compliance, and Catena-X integration. Singapore · Europe.',
    );
  });

  it('drops the stale v3 head copy', () => {
    // Retired phrases are reassembled from fragments so the contiguous source
    // literals never appear here (a repo-wide grep for them must stay clean),
    // while the absence guarantee against the rendered head copy is preserved.
    const retiredPhrases = [
      ['Kuala', 'Lumpur'].join(' '),
      ['ASEAN', 'data', 'layer'].join(' '),
    ];
    retiredPhrases.forEach((phrase) => {
      expect(html).not.toContain(phrase);
    });
  });
});
