import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

const src = fileURLToPath(new URL("./src", import.meta.url));
const shared = {
  plugins: [react()],
  resolve: {
    alias: {
      "@": src,
      "server-only": fileURLToPath(new URL("./tests/support/server-only.ts", import.meta.url)),
    },
  },
};

/** Test layers: docs/solution-plan/quality-harness.md#test-strategy */
export default defineConfig({
  ...shared,
  test: {
    projects: [
      { ...shared, test: { name: "unit", environment: "node", include: ["tests/unit/**/*.test.ts"] } },
      {
        ...shared,
        test: {
          name: "component",
          environment: "jsdom",
          include: ["tests/component/**/*.test.tsx"],
          setupFiles: ["tests/support/setup.ts"],
        },
      },
      {
        ...shared,
        test: { name: "integration", environment: "node", include: ["tests/integration/**/*.test.ts"] },
      },
      {
        ...shared,
        // Timing budgets: run on demand and in CI, never in the pre-commit hook.
        test: { name: "performance", environment: "node", include: ["tests/performance/**/*.perf.ts"] },
      },
    ],
    coverage: {
      provider: "v8",
      include: [
        "src/lib/**",
        "src/app/api/**",
        "src/proxy.ts",
        "src/components/{alerts,findings,gallery,layout,ui}/**",
      ],
      // Canvas/WebGL-only code has no meaningful jsdom coverage; the e2e suite drives it.
      exclude: ["src/components/ui/Starfield.tsx"],
      thresholds: { statements: 90, branches: 75, functions: 88, lines: 90 },
    },
  },
});
