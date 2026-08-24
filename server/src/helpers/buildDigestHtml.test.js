/*
 * Pins the ESCAPED digest output.
 *
 * The daily digest builder passes every user-supplied value (name, email,
 * company, status, question preview, message count) through `escapeHtml`
 * before interpolation. The assertions below check that hostile text is
 * entity-encoded, and that the section structure, counts and `None` fallbacks
 * are unchanged from the characterization baseline. This is the only test that
 * inspects the digest HTML, so any new interpolation point must add its
 * escaping assertion here.
 *
 * The builder lives in `helpers/buildDigestHtml.js` and this test targets it
 * directly. It previously drove `adminService.sendDailyDigest`, reading the
 * HTML back off a mocked Resend client; the `renderDigest` adapter is what
 * changed when the function was extracted. The markup skeleton below is
 * byte-identical to the pre-extraction version — only the encoding of the
 * user-supplied text differs.
 */
import { describe, it, expect } from "vitest";

import { buildDigestHtml } from "./buildDigestHtml.js";

/**
 * The only seam step 2 rewrote: feed the collections in, get the digest HTML
 * out. Everything below this line stays untouched across the extraction; the
 * third collection (consortium registrations) was appended later.
 */
function renderDigest(inquiries, chatLeads, consortiumRegistrations = []) {
  return buildDigestHtml(inquiries, chatLeads, consortiumRegistrations);
}

const HOSTILE_NAME = 'Ada & "Lovelace"<script>alert(1)</script>';
const HOSTILE_COMPANY = 'Acme & "Co"<script>alert(2)</script>';
const HOSTILE_PREVIEW = 'Why & "how"?<script>alert(3)</script>';
const HOSTILE_LEAD_NAME = 'Bob & "Tables"<script>alert(4)</script>';

// Spelled out as literals, not computed with escapeHtml — computing them from
// the helper under test would make the expectations tautological.
const ESCAPED_NAME =
  "Ada &amp; &quot;Lovelace&quot;&lt;script&gt;alert(1)&lt;/script&gt;";
const ESCAPED_COMPANY =
  "Acme &amp; &quot;Co&quot;&lt;script&gt;alert(2)&lt;/script&gt;";
const ESCAPED_PREVIEW =
  "Why &amp; &quot;how&quot;?&lt;script&gt;alert(3)&lt;/script&gt;";
const ESCAPED_LEAD_NAME =
  "Bob &amp; &quot;Tables&quot;&lt;script&gt;alert(4)&lt;/script&gt;";

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

// The third section always renders, so an empty registration list appends this
// block to every payload that does not supply one.
const EMPTY_CONSORTIUM_SECTION =
  `<h2>New consortium registrations (0)</h2><ul><li>None</li></ul>`;

// Em dash (U+2014) separator; no whitespace or newline between the sections.
// Emails, `new` and `7` contain no special characters, so they render as-is.
const EXPECTED_HOSTILE_HTML =
  `<h2>New Inquiries (1)</h2><ul>` +
  `<li><b>${ESCAPED_NAME}</b> (ada@example.com, ${ESCAPED_COMPANY}) — new` +
  `<br/><em>${ESCAPED_PREVIEW}</em></li>` +
  `</ul>` +
  `<h2>Chat-Only Leads (1)</h2><ul>` +
  `<li><b>${ESCAPED_LEAD_NAME}</b> (bob@example.com) — 7 messages</li>` +
  `</ul>` +
  EMPTY_CONSORTIUM_SECTION;

const EXPECTED_FALLBACK_HTML =
  `<h2>New Inquiries (1)</h2><ul>` +
  `<li><b>Carol</b> (carol@example.com, N/A) — contacted</li>` +
  `</ul>` +
  `<h2>Chat-Only Leads (0)</h2><ul><li>None</li></ul>` +
  EMPTY_CONSORTIUM_SECTION;

const EXPECTED_EMPTY_HTML =
  `<h2>New Inquiries (0)</h2><ul><li>None</li></ul>` +
  `<h2>Chat-Only Leads (0)</h2><ul><li>None</li></ul>` +
  EMPTY_CONSORTIUM_SECTION;

const HOSTILE_REGISTRATION_COMPANY = 'Dyn & "Corp"<script>alert(5)</script>';
const ESCAPED_REGISTRATION_COMPANY =
  "Dyn &amp; &quot;Corp&quot;&lt;script&gt;alert(5)&lt;/script&gt;";

const HOSTILE_REGISTRATION = {
  name: "Dana",
  email: "dana@example.com",
  company: HOSTILE_REGISTRATION_COMPANY,
  position: "CTO",
  chainRole: "OEM",
  source: "website",
};

const EXPECTED_HOSTILE_REGISTRATION_HTML =
  `<h2>New Inquiries (0)</h2><ul><li>None</li></ul>` +
  `<h2>Chat-Only Leads (0)</h2><ul><li>None</li></ul>` +
  `<h2>New consortium registrations (1)</h2><ul>` +
  `<li><b>Dana</b> (dana@example.com, ${ESCAPED_REGISTRATION_COMPANY}) — CTO, OEM, website</li>` +
  `</ul>`;

const EXPECTED_REGISTRATION_FALLBACK_HTML =
  `<h2>New Inquiries (0)</h2><ul><li>None</li></ul>` +
  `<h2>Chat-Only Leads (0)</h2><ul><li>None</li></ul>` +
  `<h2>New consortium registrations (1)</h2><ul>` +
  `<li><b>Erin</b> (erin@example.com, N/A) — Analyst, Recycler, N/A</li>` +
  `</ul>`;

describe("buildDigestHtml", () => {
  it("entity-encodes hostile payloads in every field", async () => {
    const html = await renderDigest([HOSTILE_INQUIRY], [HOSTILE_LEAD]);

    expect(html).toBe(EXPECTED_HOSTILE_HTML);

    // Angle brackets, ampersands and double quotes are all encoded.
    expect(html).toContain("&lt;");
    expect(html).toContain("&amp;");
    expect(html).toContain("&quot;");
    // No executable markup survives from any of the four payloads.
    expect(html).not.toContain("<script");
    expect(html).not.toContain("<script>alert(1)</script>");
    expect(html).not.toContain("<script>alert(4)</script>");
    // Raw ampersands and quotes never reach the email body.
    expect(html).not.toContain('Ada & "Lovelace"');
    expect(html).not.toContain('"Co"');
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
    // The `|| "N/A"` fallback resolves before escaping, so a null company
    // never reaches escapeHtml and stringifies to the literal "null".
    expect(html).not.toContain("null");
  });

  it("renders zero counts with None fallbacks in all three sections", async () => {
    const html = await renderDigest([], []);

    expect(html).toBe(EXPECTED_EMPTY_HTML);
  });

  it("entity-encodes hostile registration text without touching the other sections", async () => {
    const html = await renderDigest([], [], [HOSTILE_REGISTRATION]);

    expect(html).toBe(EXPECTED_HOSTILE_REGISTRATION_HTML);
    expect(html).toContain(ESCAPED_REGISTRATION_COMPANY);
    expect(html).not.toContain("<script");
    expect(html).not.toContain('Dyn & "Corp"');
    // The first two sections keep their zero-count `None` markup.
    expect(html).toContain(`<h2>New Inquiries (0)</h2><ul><li>None</li></ul>`);
    expect(html).toContain(`<h2>Chat-Only Leads (0)</h2><ul><li>None</li></ul>`);
  });

  it("falls back to N/A for a registration with null company and source", async () => {
    const registration = {
      name: "Erin",
      email: "erin@example.com",
      company: null,
      position: "Analyst",
      chainRole: "Recycler",
      source: null,
    };

    const html = await renderDigest([], [], [registration]);

    expect(html).toBe(EXPECTED_REGISTRATION_FALLBACK_HTML);
    expect(html).toContain("N/A");
    // The `|| "N/A"` fallbacks resolve before escaping, so a null value never
    // reaches escapeHtml and stringifies to the literal "null".
    expect(html).not.toContain("null");
  });
});
