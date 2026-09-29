import js from "@eslint/js";
import globals from "globals";
import vitest from "@vitest/eslint-plugin";

export default [
  { ignores: ["scripts/python/**"] },
  {
    files: ["**/*.js"],
    ...js.configs.recommended,
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.node,
        fetch: "readonly",
        AbortController: "readonly",
        Request: "readonly",
        Response: "readonly",
        Headers: "readonly",
        URL: "readonly",
        URLSearchParams: "readonly",
      },
    },
    rules: {
      ...js.configs.recommended.rules,
      "no-unused-vars": ["error", { varsIgnorePattern: "^[A-Z_]" }],
    },
  },
  {
    files: ["**/*.{test,spec,mock}.js"],
    plugins: { vitest },
    languageOptions: {
      globals: {
        ...globals.node,
        ...vitest.environments.env.globals,
      },
    },
    rules: {
      ...vitest.configs.recommended.rules,
      "vitest/expect-expect": "warn",
      "vitest/no-disabled-tests": "warn",
      "vitest/no-focused-tests": "error",
    },
  },
  // 200-line cap on application modules; prose rule in CLAUDE.md §5.1.
  // The scripts listed here are in scope because src/app.js reaches them:
  // it imports seedE2EOnPreview.js, which imports the three helpers, and
  // previewMigrations.js imports runMigrations.js.
  {
    files: [
      "src/**/*.js",
      "api/**/*.js",
      "scripts/seedE2EOnPreview.js",
      "scripts/runMigrations.js",
      "scripts/helpers/previewDbConnection.js",
      "scripts/helpers/e2eSeedQueries.js",
      "scripts/helpers/previewMigrations.js",
    ],
    rules: { "max-lines": ["error", { max: 200 }] },
  },
  // Test files grow with the cases they cover.
  {
    files: ["**/*.{test,spec,mock}.js"],
    rules: { "max-lines": "off" },
  },
  // grandfathered: split only when next changed for another reason
  {
    files: [
      "src/repositories/adminRepository.js",
      "src/repositories/userRepository.js",
      "src/controllers/adminController.js",
      "src/services/adminService.js",
    ],
    rules: { "max-lines": "off" },
  },
];
