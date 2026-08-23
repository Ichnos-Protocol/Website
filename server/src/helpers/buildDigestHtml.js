import { escapeHtml } from "./escapeHtml.js";

/**
 * Builds the daily admin digest HTML from recent inquiries and chat-only leads.
 *
 * Every dynamic value (names, emails, company, status, question preview and
 * message counts) is passed through `escapeHtml` before interpolation, so
 * user-supplied text cannot inject markup into the email body. Headings,
 * counts and the `None` fallbacks are static markup and stay unescaped.
 */
export function buildDigestHtml(inquiries, chatLeads) {
  const inquiryRows = inquiries
    .map((i) => {
      const preview = i.questionPreview
        ? `<br/><em>${escapeHtml(i.questionPreview)}</em>`
        : "";
      return `<li><b>${escapeHtml(i.name)}</b> (${escapeHtml(i.email)}, ${escapeHtml(i.company || "N/A")}) — ${escapeHtml(i.status)}${preview}</li>`;
    })
    .join("");
  const leadRows = chatLeads
    .map(
      (l) =>
        `<li><b>${escapeHtml(l.name)}</b> (${escapeHtml(l.email)}) — ${escapeHtml(l.totalMessages)} messages</li>`,
    )
    .join("");

  return (
    `<h2>New Inquiries (${inquiries.length})</h2><ul>${inquiryRows || "<li>None</li>"}</ul>` +
    `<h2>Chat-Only Leads (${chatLeads.length})</h2><ul>${leadRows || "<li>None</li>"}</ul>`
  );
}
