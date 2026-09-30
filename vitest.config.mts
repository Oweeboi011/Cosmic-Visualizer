import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    // Library tests run in node; component tests opt into jsdom with a
    // `// @vitest-environment jsdom` docblock.
    environment: "node",
    include: ["tests/unit/**/*.test.{ts,tsx}"],
    setupFiles: ["tests/unit/setup.ts"],
    coverage: {
      provider: "v8",
      include: ["src/lib/**", "src/components/{alerts,findings,gallery,layout,ui}/**"],
      // Canvas/WebGL-only code has no meaningful jsdom coverage; the e2e suite drives it.
      exclude: ["src/components/ui/Starfield.tsx"],
      // Targets from .github/instructions/typescript-react.instructions.md.
      thresholds: { statements: 85, branches: 50, functions: 85, lines: 85 },
    },
  },
});
