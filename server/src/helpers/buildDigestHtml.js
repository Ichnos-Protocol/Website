/**
 * Builds the daily admin digest HTML from recent inquiries and chat-only leads.
 *
 * NOTE: values are interpolated into the markup UNESCAPED today — this is a
 * verbatim move of the previously private builder in adminService.js.
 * HTML escaping arrives with T3; see buildDigestHtml.test.js, which documents
 * the current behaviour.
 */
export function buildDigestHtml(inquiries, chatLeads) {
  const inquiryRows = inquiries
    .map((i) => {
      const preview = i.questionPreview
        ? `<br/><em>${i.questionPreview}</em>`
        : "";
      return `<li><b>${i.name}</b> (${i.email}, ${i.company || "N/A"}) — ${i.status}${preview}</li>`;
    })
    .join("");
  const leadRows = chatLeads
    .map(
      (l) =>
        `<li><b>${l.name}</b> (${l.email}) — ${l.totalMessages} messages</li>`,
    )
    .join("");

  return (
    `<h2>New Inquiries (${inquiries.length})</h2><ul>${inquiryRows || "<li>None</li>"}</ul>` +
    `<h2>Chat-Only Leads (${chatLeads.length})</h2><ul>${leadRows || "<li>None</li>"}</ul>`
  );
}
