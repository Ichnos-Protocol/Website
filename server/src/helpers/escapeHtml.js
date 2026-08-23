/**
 * Escapes HTML-special characters to prevent injection when interpolating
 * untrusted values (e.g. environment variables) into an HTML template.
 */
export function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
