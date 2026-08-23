/*
 * CHARACTERIZATION TEST — documents CURRENT, DEFECTIVE behaviour.
 *
 * The daily digest builder interpolates user-supplied text (name, company,
 * question preview) straight into HTML with NO escaping. The assertions below
 * describe that defect exactly as it exists today; they are NOT a statement of
 * desired behaviour. Ticket T3 introduces escaping and will flip these
 * expectations to entity-encoded output. Until then, do NOT "fix" the
 * expectations in this file — a failure here means the output drifted.
 *
 * The builder now lives in `helpers/buildDigestHtml.js` and this test targets
 * it directly. It previously drove `adminService.sendDailyDigest`, reading the
 * HTML back off a mocked Resend client; only the `renderDigest` adapter
 * changed when the function was extracted — every assertion below is
 * byte-identical to the pre-extraction version, which is the proof that the
 * move was faithful.
 */
import { describe, it, expect } from "vitest";

import { buildDigestHtml } from "./buildDigestHtml.js";

/**
 * The only seam step 2 rewrote: feed the two collections in, get the digest
 * HTML out. Everything below this line stays untouched across the extraction.
 */
function renderDigest(inquiries, chatLeads) {
  return buildDigestHtml(inquiries, chatLeads);
}

const HOSTILE_NAME = 'Ada & "Lovelace"<script>alert(1)</script>';
const HOSTILE_COMPANY = 'Acme & "Co"<script>alert(2)</script>';
const HOSTILE_PREVIEW = 'Why & "how"?<script>alert(3)</script>';
const HOSTILE_LEAD_NAME = 'Bob & "Tables"<script>alert(4)</script>';

const HOSTILE_INQUIRY = {
  id: 1,
  name: HOSTILE_NAME,
  email: "ada@example.com",
  company: HOSTILE_COMPANY,
  status: "new",
  questionPreview: HOSTILE_PREVIEW,
};

const HOSTILE_LEAD = {
  userId: "uid-1",
  name: HOSTILE_LEAD_NAME,
  email: "bob@example.com",
  totalMessages: 7,
};

// Em dash (U+2014) separator; no whitespace or newline between the sections.
const EXPECTED_HOSTILE_HTML =
  `<h2>New Inquiries (1)</h2><ul>` +
  `<li><b>${HOSTILE_NAME}</b> (ada@example.com, ${HOSTILE_COMPANY}) — new` +
  `<br/><em>${HOSTILE_PREVIEW}</em></li>` +
  `</ul>` +
  `<h2>Chat-Only Leads (1)</h2><ul>` +
  `<li><b>${HOSTILE_LEAD_NAME}</b> (bob@example.com) — 7 messages</li>` +
  `</ul>`;

const EXPECTED_FALLBACK_HTML =
  `<h2>New Inquiries (1)</h2><ul>` +
  `<li><b>Carol</b> (carol@example.com, N/A) — contacted</li>` +
  `</ul>` +
  `<h2>Chat-Only Leads (0)</h2><ul><li>None</li></ul>`;

const EXPECTED_EMPTY_HTML =
  `<h2>New Inquiries (0)</h2><ul><li>None</li></ul>` +
  `<h2>Chat-Only Leads (0)</h2><ul><li>None</li></ul>`;

describe("buildDigestHtml", () => {
  it("renders hostile payloads character-for-character, unescaped", async () => {
    const html = await renderDigest([HOSTILE_INQUIRY], [HOSTILE_LEAD]);

    expect(html).toBe(EXPECTED_HOSTILE_HTML);

    // Injection defect: the raw script tag reaches the email body intact.
    expect(html).toContain("<script>alert(1)</script>");
    expect(html).toContain("<script>alert(4)</script>");
    // Injection defect: ampersands pass through un-encoded.
    expect(html).toContain('Ada & "Lovelace"');
    // Injection defect: double quotes pass through un-encoded.
    expect(html).toContain('"Co"');
    // Injection defect: no HTML entity encoding is applied anywhere.
    expect(html).not.toContain("&lt;");
    expect(html).not.toContain("&amp;");
    expect(html).not.toContain("&quot;");
  });

  it("falls back to N/A and omits the preview fragment", async () => {
    const inquiry = {
      id: 2,
      name: "Carol",
      email: "carol@example.com",
      company: null,
      status: "contacted",
    };

    const html = await renderDigest([inquiry], []);

    expect(html).toBe(EXPECTED_FALLBACK_HTML);
    expect(html).toContain("N/A");
    expect(html).not.toContain("<br/><em>");
  });

  it("renders zero counts with None fallbacks in both sections", async () => {
    const html = await renderDigest([], []);

    expect(html).toBe(EXPECTED_EMPTY_HTML);
  });
});
