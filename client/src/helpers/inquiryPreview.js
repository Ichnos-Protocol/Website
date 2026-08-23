export const CONSORTIUM_PREVIEW_LABEL = 'Consortium registration';

export const CONSORTIUM_REQUEST_KIND = 'consortium';

export function getInquiryPreview(request) {
  if (!request) return '';
  const text =
    request.questions?.[0]?.question ||
    request.questions?.[0]?.text ||
    request.questionPreview ||
    request.question_preview;
  if (text) return text;
  if (request.kind === CONSORTIUM_REQUEST_KIND) return CONSORTIUM_PREVIEW_LABEL;
  return '';
}
