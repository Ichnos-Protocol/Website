/*
 * Canonical route paths.
 *
 * This file is the only place in client/src where a route path literal may
 * appear. The one named exception is App.test.jsx, which mounts the router
 * against written-out literals so that the constants below are pinned to real
 * values by something that does not import them; routes.test.js sweeps every
 * other file and skips those two by name.
 *
 * Children are written out in full, deliberately. The /passport rename
 * dispute is still open (spec section 2.1), and composing a child from its
 * parent would relocate a published, indexed URL as a silent side effect of
 * renaming the parent, with no line in the diff saying so. Flat literals make
 * every published address explicit and greppable in one file; the
 * parent/child relationship is asserted in routes.test.js instead of being
 * enforced by construction, so a parent rename fails loudly and a human
 * decides whether the child moves with it.
 *
 * As of T6 all three readiness constants have router consumers in App.jsx:
 * ROUTE_READINESS_ASSESSMENT mounts the readiness page, and the two legacy
 * readiness children answer with Navigate replace to it. App.test.jsx pins
 * all three as written-out literals, so they sit under the same behavioural
 * value pin as the rest rather than being exempt from it, and their
 * parent/child relationship stays an assertion in routes.test.js rather than
 * something construction enforces.
 */

export const ROUTE_LANDING = "/";
export const ROUTE_ADMIN = "/admin";
export const ROUTE_SERVICES = "/services";
export const ROUTE_TEAM = "/team";
export const ROUTE_CONTACT = "/contact";
export const ROUTE_CONSORTIUM = "/consortium";
export const ROUTE_CONSORTIUM_TIERS = "/consortium/tiers";
export const ROUTE_PRIVACY = "/privacy";
export const ROUTE_PASSPORT = "/passport";
export const ROUTE_READINESS_ASSESSMENT = "/passport/readiness-assessment";
export const ROUTE_LEGACY_DATA = "/data";
export const ROUTE_LEGACY_CATENA_X = "/catena-x";
export const ROUTE_LEGACY_DATA_READINESS = "/data/readiness-assessment";
export const ROUTE_LEGACY_CATENA_X_READINESS = "/catena-x/readiness-assessment";
