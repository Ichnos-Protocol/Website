/**
 * Zod Schemas for Consortium Endpoints
 *
 * Validates tier selection payloads. Only the tier ids cross into this module —
 * no price figure does.
 */
import { z } from "zod/v4";

import { CONSORTIUM_TIER_IDS } from "../config/consortiumTiers.js";

// Shape gate only: this proves the id exists. Whether the caller's registered
// position permits that tier is decided in consortiumService.
export const selectTierSchema = z.object({
  tier: z.enum(CONSORTIUM_TIER_IDS),
});
