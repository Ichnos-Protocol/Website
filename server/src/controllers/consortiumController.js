/**
 * Consortium Controller
 *
 * Thin HTTP handlers for consortium endpoints.
 * Delegates all business logic to consortiumService.
 */
import * as consortiumService from "../services/consortiumService.js";
import { formatResponse } from "../helpers/formatResponse.js";

export async function getMe(req, res, next) {
  try {
    const { uid } = req.user;

    const profile = await consortiumService.getMyConsortium(uid);

    res
      .status(200)
      .json(formatResponse(profile, "Consortium profile retrieved"));
  } catch (error) {
    next(error);
  }
}

export async function getTiers(req, res, next) {
  try {
    const { uid } = req.user;

    const tiers = await consortiumService.getPermittedTiers(uid);

    res.status(200).json(formatResponse(tiers, "Tiers retrieved"));
  } catch (error) {
    next(error);
  }
}

export async function selectTier(req, res, next) {
  try {
    const { uid } = req.user;

    const profile = await consortiumService.selectTier(uid, req.body.tier);

    res.status(200).json(formatResponse(profile, "Tier saved"));
  } catch (error) {
    next(error);
  }
}
