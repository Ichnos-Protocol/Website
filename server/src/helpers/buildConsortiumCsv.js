/**
 * Google CSV builders for consortium registrants.
 *
 * Pure module: no database access and no Express concerns. It consumes the
 * rows returned by `adminRepository.getConsortiumRegistrants(filters)` (already
 * aliased to camelCase) and returns a CSV string.
 *
 * The column names below are Google's own import names, taken from
 * `docs/IBS2026_consortium_cta_spec.md` §4.6. Google matches columns by these
 * exact strings — do not rename them.
 */
import { stringify } from "csv-stringify/sync";

const GOOGLE_CONTACTS_HEADERS = [
  "Name",
  "Given Name",
  "Family Name",
  "E-mail 1 - Type",
  "E-mail 1 - Value",
  "Phone 1 - Type",
  "Phone 1 - Value",
  "Organization 1 - Name",
  "Organization 1 - Title",
  "Website 1 - Value",
  "Notes",
  "Group Membership",
];

const GOOGLE_GROUPS_HEADERS = [
  "Group Email [Required]",
  "Member Email",
  "Member Type",
  "Member Role",
];

const CONTACT_TYPE_WORK = "Work";
const GROUP_MEMBERSHIP_LABEL = "* myContacts ::: Consortium 2026";
const MEMBER_TYPE_USER = "USER";
const MEMBER_ROLE_MEMBER = "MEMBER";
const TITLE_SEPARATOR = " / ";
const NOTES_SEPARATOR = "; ";
const NOTES_TIER_LABEL = "Tier: ";
const NOTES_SOURCE_LABEL = "Source: ";
const NOTES_REGISTERED_LABEL = "Registered: ";
const NAME_SEPARATOR = " ";
const EMPTY_CELL = "";

function toCell(value) {
  return value === null || value === undefined ? EMPTY_CELL : String(value);
}

function formatRegisteredAt(value) {
  if (value === null || value === undefined) return EMPTY_CELL;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return EMPTY_CELL;
  return date.toISOString().slice(0, 10);
}

function joinParts(parts, separator) {
  return parts
    .map(toCell)
    .filter((part) => part.trim() !== EMPTY_CELL)
    .join(separator)
    .trim();
}

function buildNotes(row) {
  const registered = formatRegisteredAt(row.consortiumRegisteredAt);
  const parts = [
    row.consortiumTier ? NOTES_TIER_LABEL + toCell(row.consortiumTier) : null,
    row.consortiumSource
      ? NOTES_SOURCE_LABEL + toCell(row.consortiumSource)
      : null,
    registered ? NOTES_REGISTERED_LABEL + registered : null,
  ];
  return joinParts(parts, NOTES_SEPARATOR);
}

function buildContactRecord(row) {
  return {
    Name: joinParts([row.name, row.surname], NAME_SEPARATOR),
    "Given Name": toCell(row.name),
    "Family Name": toCell(row.surname),
    "E-mail 1 - Type": CONTACT_TYPE_WORK,
    "E-mail 1 - Value": toCell(row.email),
    "Phone 1 - Type": CONTACT_TYPE_WORK,
    "Phone 1 - Value": toCell(row.phone),
    "Organization 1 - Name": toCell(row.company),
    "Organization 1 - Title": joinParts(
      [row.consortiumPosition, row.consortiumChainRole],
      TITLE_SEPARATOR,
    ),
    "Website 1 - Value": toCell(row.linkedin),
    Notes: buildNotes(row),
    "Group Membership": GROUP_MEMBERSHIP_LABEL,
  };
}

function buildGroupRecord(row, groupEmail) {
  return {
    "Group Email [Required]": toCell(groupEmail),
    "Member Email": toCell(row.email),
    "Member Type": MEMBER_TYPE_USER,
    "Member Role": MEMBER_ROLE_MEMBER,
  };
}

/**
 * Builds a Google Contacts import CSV from consortium registrant rows.
 * An empty input still emits the header line.
 */
export function buildGoogleContactsCsv(rows = []) {
  const records = rows.map(buildContactRecord);
  return stringify(records, { header: true, columns: GOOGLE_CONTACTS_HEADERS });
}

/**
 * Builds a Google Groups bulk-membership CSV from consortium registrant rows.
 * An empty input still emits the header line.
 */
export function buildGoogleGroupsCsv(rows = [], groupEmail) {
  const records = rows.map((row) => buildGroupRecord(row, groupEmail));
  return stringify(records, { header: true, columns: GOOGLE_GROUPS_HEADERS });
}
