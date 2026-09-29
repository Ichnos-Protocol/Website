/**
 * Consortium Service
 *
 * Every authorization decision for the consortium slice lives here: who counts
 * as a registrant, which tiers their position permits, and which figures they
 * are allowed to see. Callers receive their permitted subset, never the ladder.
 * Currency selection lives here too, resolved from the registrant's region;
 * turning figures into display strings is delegated to the pure
 * consortiumPricing helper.
 */
import * as userRepository from "../repositories/userRepository.js";
import {
  CONSORTIUM_POSITION_TIERS,
  CONSORTIUM_REGION_CURRENCY,
  CONSORTIUM_DEFAULT_CURRENCY,
  CONSORTIUM_TERM_NOTE,
  CONSORTIUM_CAPACITY_NOTE,
} from "../config/consortiumTiers.js";
import {
  formatTierPriceLabel,
  formatRecurringFees,
} from "../helpers/consortiumPricing.js";

// Refusal messages restate no figure and no mapping.
const NOT_REGISTERED_MESSAGE = "Consortium registration required";
const TIER_NOT_PERMITTED_MESSAGE = "Tier not available for this registration";

function buildError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

// Fail closed: no registration, or a position with no mapping, is a refusal.
async function resolvePermitted(userId) {
  const profile = await userRepository.getConsortiumProfile(userId);

  if (!profile) throw buildError(NOT_REGISTERED_MESSAGE, 403);

  const permitted = CONSORTIUM_POSITION_TIERS[profile.consortium_position];

  if (!permitted) throw buildError(NOT_REGISTERED_MESSAGE, 403);

  return { profile, permitted };
}

function resolveCurrency(region) {
  return CONSORTIUM_REGION_CURRENCY[region] ?? CONSORTIUM_DEFAULT_CURRENCY;
}

export async function getMyConsortium(userId) {
  return userRepository.getConsortiumProfile(userId);
}

export async function getPermittedTiers(userId) {
  const { profile, permitted } = await resolvePermitted(userId);
  const currency = resolveCurrency(profile.consortium_region);

  return {
    tiers: permitted.map((tierId) => ({
      tierId,
      priceLabel: formatTierPriceLabel(tierId, currency),
    })),
    recurringFees: formatRecurringFees(currency),
    termNote: CONSORTIUM_TERM_NOTE,
    capacityNote: CONSORTIUM_CAPACITY_NOTE,
  };
}

export async function selectTier(userId, tier) {
  const { permitted } = await resolvePermitted(userId);

  if (!permitted.includes(tier)) {
    throw buildError(TIER_NOT_PERMITTED_MESSAGE, 403);
  }

  const updated = await userRepository.setConsortiumTier(userId, tier);

  // The update predicate re-checks the registration, so a null row means the
  // registration went away between the read above and the write. Success must
  // mean the tier was persisted, never a silent no-op.
  if (!updated) throw buildError(NOT_REGISTERED_MESSAGE, 403);

  return updated;
}
