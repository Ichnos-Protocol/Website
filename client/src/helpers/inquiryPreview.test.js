import { describe, it, expect } from 'vitest';
import {
  getInquiryPreview,
  CONSORTIUM_PREVIEW_LABEL,
  CONSORTIUM_REQUEST_KIND,
} from './inquiryPreview';

describe('getInquiryPreview', () => {
  it('returns the first question text when present', () => {
    expect(
      getInquiryPreview({ questions: [{ question: 'How does pricing work?' }] }),
    ).toBe('How does pricing work?');
  });

  it('falls back to the first question text field', () => {
    expect(getInquiryPreview({ questions: [{ text: 'What is the lead time?' }] })).toBe(
      'What is the lead time?',
    );
  });

  it('falls back to questionPreview', () => {
    expect(getInquiryPreview({ questionPreview: 'Camel case preview' })).toBe(
      'Camel case preview',
    );
  });

  it('falls back to question_preview', () => {
    expect(getInquiryPreview({ question_preview: 'Snake case preview' })).toBe(
      'Snake case preview',
    );
  });

  it('prefers questionPreview over question_preview', () => {
    expect(
      getInquiryPreview({
        questionPreview: 'Camel case preview',
        question_preview: 'Snake case preview',
      }),
    ).toBe('Camel case preview');
  });

  it('labels a consortium row that has no question', () => {
    expect(getInquiryPreview({ kind: CONSORTIUM_REQUEST_KIND })).toBe(
      CONSORTIUM_PREVIEW_LABEL,
    );
  });

  it('returns an empty string for an inquiry row with no question', () => {
    expect(getInquiryPreview({ kind: 'inquiry' })).toBe('');
  });

  it('returns an empty string when the row carries no kind at all', () => {
    expect(getInquiryPreview({})).toBe('');
  });

  it('returns an empty string for a missing request', () => {
    expect(getInquiryPreview(undefined)).toBe('');
    expect(getInquiryPreview(null)).toBe('');
  });
});
