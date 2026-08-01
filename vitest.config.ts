import { config } from "dotenv";
// Load .env.local first (real secrets, highest priority — matches Next.js precedence),
// then .env as fallback (placeholder defaults). dotenv never overwrites already-set vars.
config({ path: ".env.local" });
config({ path: ".env" });
import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    globals: true,
    exclude: ["**/node_modules/**", "**/.agents/**", "**/.next/**"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
