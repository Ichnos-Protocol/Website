import { readFileSync } from "fs";
import { resolve } from "path";

import { describe, it, expect } from "vitest";

const configPath = resolve(process.cwd(), "vercel.json");
const config = JSON.parse(readFileSync(configPath, "utf-8"));

describe("server vercel.json", () => {
  it("ships the migration SQL files in the api/index.js function bundle", () => {
    const build = config.builds?.find(
      (entry) => entry.src === "api/index.js" && entry.use === "@vercel/node",
    );
    expect(build).toBeDefined();
    expect(build.config?.includeFiles).toBe("migrations/**");
  });

  it("preserves the /api rewrite", () => {
    const rewrite = config.rewrites?.find(
      (entry) => entry.source === "/api/(.*)",
    );
    expect(rewrite).toBeDefined();
    expect(rewrite.destination).toBe("/api");
  });
});
