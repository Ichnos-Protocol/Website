import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import vitest from "@vitest/eslint-plugin";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  globalIgnores(["dist", ".vercel/output/**"]),
  {
    files: ["**/*.{js,jsx}"],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: "latest",
        ecmaFeatures: { jsx: true },
        sourceType: "module",
      },
    },
    rules: {
      "no-unused-vars": ["error", { varsIgnorePattern: "^[A-Z_]" }],
    },
  },
  {
    files: [
      "**/*.{test,mock}.{js,jsx}",
      "**/*.spec.{js,jsx}",
      "**/setupTests.js",
    ],
    plugins: { vitest },
    languageOptions: {
      globals: vitest.environments.env.globals,
    },
    rules: {
      ...vitest.configs.recommended.rules,
      "vitest/expect-expect": "warn",
      "vitest/no-disabled-tests": "warn",
      "vitest/no-focused-tests": "error",
    },
  },
  // 200-line cap on application modules; prose rule in CLAUDE.md §5.1.
  {
    files: ["src/**/*.{js,jsx}"],
    rules: { "max-lines": ["error", { max: 200 }] },
  },
  // Test files grow with the cases they cover.
  {
    files: [
      "src/**/*.{test,mock}.{js,jsx}",
      "src/**/*.spec.{js,jsx}",
      "src/setupTests.js",
    ],
    rules: { "max-lines": "off" },
  },
  // Content-exempt: length follows copy or declarative data, not logic.
  // Content-exempt is not grandfathered.
  {
    files: [
      "src/constants/readinessAssessmentContent.js",
      "src/constants/vocabulary.js",
      "src/constants/services.js",
    ],
    rules: { "max-lines": "off" },
  },
]);
