import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    coverage: {
      provider: "v8",
      include: ["src/**/*.js"],
      exclude: ["src/**/*.test.js"],
      reporter: ["text-summary", "lcov"],
      thresholds: {
        lines: 89,
        "src/helpers/**": { lines: 80 },
        "src/services/**": { lines: 80 },
      },
    },
  },
});
