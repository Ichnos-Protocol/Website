/**
 * Consortium tier price formatting.
 *
 * Pure module: no database access, no Express concerns, and no permission or
 * currency-selection logic. It imports only the tier configuration and turns
 * a tier id and a currency code into display strings. Which currency a
 * registrant sees is decided by `consortiumService`.
 */
import {
  CONSORTIUM_TIER_PRICES,
  CONSORTIUM_RECURRING_FEE_RANGES,
} from "../config/consortiumTiers.js";

const DATASPACE_LICENCE_LINE = "Dataspace licence, passed through at cost.";
const MANAGED_OPERATIONS_TEMPLATE =
  "Managed operations: {range} per tenant and year.";
const PASSPORT_MAINTENANCE_TEMPLATE =
  "Passport data maintenance: {range} per year.";

// Same regex idiom as readinessAssessmentContent.formatPrice. Intl is avoided
// on purpose: toLocaleString follows the runtime locale, and under de-DE it
// groups with a period, which would print "26.000".
function groupDigits(amount) {
  return String(amount).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function formatAmount(currency, n) {
  return `${currency} ${groupDigits(n)}`;
}

// The currency code appears once per range; the upper bound is digits only.
function formatRange(currency, [low, high]) {
  return `${formatAmount(currency, low)} to ${groupDigits(high)}`;
}

export function formatTierPriceLabel(tierId, currency) {
  const entry = CONSORTIUM_TIER_PRICES[tierId];

  if (entry === undefined) return null;
  if (typeof entry === "string") return entry;

  const base = formatAmount(currency, entry[currency]);

  if (!entry.extraTenant) return base;

  const extra = formatAmount(currency, entry.extraTenant[currency]);
  return `${base} (+ ${extra} per additional supplier tenant)`;
}

export function formatRecurringFees(currency) {
  const { managedOperations, passportMaintenance } =
    CONSORTIUM_RECURRING_FEE_RANGES;

  return [
    DATASPACE_LICENCE_LINE,
    MANAGED_OPERATIONS_TEMPLATE.replace(
      "{range}",
      formatRange(currency, managedOperations[currency]),
    ),
    PASSPORT_MAINTENANCE_TEMPLATE.replace(
      "{range}",
      formatRange(currency, passportMaintenance[currency]),
    ),
  ];
}
