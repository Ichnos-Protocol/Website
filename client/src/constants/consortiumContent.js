/*
 * Consortium registration copy.
 *
 * This file may NEVER carry a monetary figure, a currency symbol, or a
 * position -> tier mapping. Pricing lives server-side only
 * (server/src/config/consortiumTiers.js) and reaches the client through
 * the authenticated /api/consortium/tiers endpoint. Tier prose here
 * describes scope of work, nothing else.
 *
 * The option values restate the CHECK constraints of migration
 * 006_20260823_add_consortium_columns.sql verbatim. That migration is the
 * authoritative source; a change there must be mirrored here in the same
 * commit.
 */

export const CONSORTIUM_POSITION_LABEL =
  "What is your position in the consortium?";

export const CONSORTIUM_CHAIN_ROLE_LABEL =
  "Which part of the value chain do you cover?";

export const CONSORTIUM_PRODUCT_LINE_LABEL =
  "Which product line or use case would you bring in?";

export const CONSORTIUM_CUSTOMER_REQUEST_LABEL =
  "Which customer asked you for battery passport data, and what did they ask for?";

export const CONSORTIUM_DATA_EXTRACT_LABEL =
  "Can you provide one real data extract for that product line?";

export const CONSORTIUM_DATA_NEEDS_LABEL =
  "Which data do you need from others, and which data must you publish yourself?";

export const CONSORTIUM_PREFERRED_START_LABEL = "When would you like to start?";

export const CONSORTIUM_CONSENT_LABEL =
  "I agree that Ichnos Protocol may contact me about this consortium registration, store the answers I have given here, and share my company name and use-case summary with the other consortium participants. See Privacy Policy.";

// Dedicated consortium consent version (docs §4.4), deliberately distinct
// from the generic contact consent "v1" sent at the top level.
export const CONSORTIUM_CONSENT_VERSION = "consortium-v1";

export const CONSORTIUM_INTEREST_LABEL =
  "I am interested in joining the battery passport consortium.";

export const SUBMIT_INQUIRY_LABEL = "Submit Inquiry";

export const SUBMIT_REGISTRATION_LABEL = "Submit registration";

export const UPDATE_REGISTRATION_LABEL = "Update my registration";

export const CONSORTIUM_POSITION_OPTIONS = Object.freeze([
  { value: "anchor", label: "Anchor company" },
  { value: "supplier", label: "Supplier to an anchor company" },
  { value: "equipment_supplier", label: "Equipment supplier" },
  { value: "institute", label: "Research institute or university" },
  { value: "other", label: "Other" },
]);

export const CONSORTIUM_CHAIN_ROLE_OPTIONS = Object.freeze([
  { value: "mining_refining", label: "Mining and refining" },
  { value: "cathode_material", label: "Cathode and anode material" },
  { value: "electrode", label: "Electrode production" },
  { value: "dry_cell", label: "Dry cell assembly" },
  { value: "cell_activation", label: "Cell activation and finishing" },
  { value: "module_pack", label: "Module and pack assembly" },
  { value: "recycling", label: "Recycling and second life" },
  { value: "equipment", label: "Equipment and machinery" },
  { value: "institute", label: "Research institute or university" },
  { value: "other", label: "Other" },
]);

export const CONSORTIUM_DATA_EXTRACT_OPTIONS = Object.freeze([
  { value: "yes", label: "Yes" },
  { value: "not_yet", label: "Not yet, but we could prepare one" },
  { value: "no", label: "No" },
  { value: "not_applicable", label: "Not applicable" },
]);

export const CONSORTIUM_PREFERRED_START_OPTIONS = Object.freeze([
  { value: "nov_2026", label: "November 2026" },
  { value: "later", label: "Later" },
]);

// Scope-of-work prose only. No figure, no currency, no position mapping.
// Consumed by the tier selection work (T14/T15), not by the registration form.
export const CONSORTIUM_TIER_DESCRIPTIONS = Object.freeze({
  readiness: {
    title: "Readiness assessment",
    description:
      "A short engagement that reviews your existing data, names the gaps against the battery passport data model, and returns a written plan for closing them.",
  },
  pilot: {
    title: "Pilot",
    description:
      "One product line taken end to end: we map your data, generate passports for a real batch, and hand you the working pipeline together with its documentation.",
  },
  consortium_anchor: {
    title: "Consortium — anchor company",
    description:
      "The anchor role in the shared programme. You set the product line the group works on, bring your suppliers into the same data flow, and steer the roadmap alongside the other anchors.",
  },
  consortium_supplier: {
    title: "Consortium — supplier",
    description:
      "A supplier seat in the shared programme. You connect your own data to the anchor company that invited you and reuse the group data model instead of building one on your own.",
  },
  member: {
    title: "Member",
    description:
      "Access to the working sessions, the shared data model, and the published results, without a product line of your own inside the programme.",
  },
  not_sure: {
    title: "Not sure yet",
    description:
      "Tell us where you stand and we will walk through the options with you before you commit to any of them.",
  },
});
