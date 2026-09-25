/**
 * The fixed, public E2E configuration: the five role accounts with their
 * emails, the E2E project ID and the deployed E2E URLs. None of it is secret;
 * the provisioning script generates e2e/.env.e2e from it.
 */
import { E2E_FIREBASE_PROJECT_ID } from "./e2eFirebaseCredentials.js";

export const E2E_BASE_URL_VALUE = "https://e2e-client.ichnos-protocol.com";
export const E2E_API_BASE_URL_VALUE = "https://e2e-api.ichnos-protocol.com";

export const ROLES = [
  {
    key: "ADMIN",
    name: "E2E Admin",
    email: "e2e-admin@ichnos-test.com",
    claims: { admin: true },
  },
  {
    key: "USER",
    name: "E2E Test User",
    email: "e2e-user@ichnos-test.com",
    claims: {},
  },
  {
    key: "INCOMPLETE_USER",
    name: "E2E Incomplete User",
    email: "e2e-incomplete@ichnos-test.com",
    claims: {},
  },
  {
    key: "SUPER_ADMIN",
    name: "E2E Super Admin",
    email: "e2e-superadmin@ichnos-test.com",
    claims: { admin: true, superAdmin: true },
  },
  {
    key: "MANAGE_ADMIN_TARGET",
    name: "E2E Manage-Admin Target",
    email: "e2e-manage-target@ichnos-test.com",
    claims: {},
  },
];

/** The project, the two URLs and the five E2E_<ROLE>_EMAIL values. */
export function fixedE2EConfig() {
  return {
    FIREBASE_PROJECT_ID: E2E_FIREBASE_PROJECT_ID,
    E2E_BASE_URL: E2E_BASE_URL_VALUE,
    E2E_API_BASE_URL: E2E_API_BASE_URL_VALUE,
    ...Object.fromEntries(ROLES.map((r) => [`E2E_${r.key}_EMAIL`, r.email])),
  };
}
