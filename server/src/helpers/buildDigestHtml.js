import { escapeHtml } from "./escapeHtml.js";

const NA = "N/A";

function renderSection(title, rows) {
  return `<h2>${title} (${rows.length})</h2><ul>${rows.join("") || "<li>None</li>"}</ul>`;
}

function buildInquiryRow(i) {
  const preview = i.questionPreview
    ? `<br/><em>${escapeHtml(i.questionPreview)}</em>`
    : "";
  return `<li><b>${escapeHtml(i.name)}</b> (${escapeHtml(i.email)}, ${escapeHtml(i.company || NA)}) — ${escapeHtml(i.status)}${preview}</li>`;
}

function buildLeadRow(l) {
  return `<li><b>${escapeHtml(l.name)}</b> (${escapeHtml(l.email)}) — ${escapeHtml(l.totalMessages)} messages</li>`;
}

function buildRegistrationRow(r) {
  const details = [r.position || NA, r.chainRole || NA, r.source || NA]
    .map(escapeHtml)
    .join(", ");
  return `<li><b>${escapeHtml(r.name)}</b> (${escapeHtml(r.email)}, ${escapeHtml(r.company || NA)}) — ${details}</li>`;
}

/**
 * Builds the daily admin digest HTML from recent inquiries, chat-only leads and
 * new consortium registrations.
 *
 * Every dynamic value (names, emails, company, status, question preview,
 * message counts, and the position / chain role / source of each registration)
 * is passed through `escapeHtml` before interpolation, so user-supplied text
 * cannot inject markup into the email body. Headings, counts and the `None`
 * fallbacks are static markup and stay unescaped.
 */
export function buildDigestHtml(inquiries, chatLeads, consortiumRegistrations = []) {
  return (
    renderSection("New Inquiries", inquiries.map(buildInquiryRow)) +
    renderSection("Chat-Only Leads", chatLeads.map(buildLeadRow)) +
    renderSection(
      "New consortium registrations",
      consortiumRegistrations.map(buildRegistrationRow),
    )
  );
}
