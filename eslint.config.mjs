import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import sonarjs from "eslint-plugin-sonarjs";

// Rationale for every rule group: docs/adr/0005-minimum-viable-harness.md

/** Server-only modules. Client Components must reach NASA data through a page or /api/gallery. */
const SERVER_ONLY_IMPORTS = {
  group: ["@/lib/nasa/*"],
  message: "src/lib/nasa is server-only (holds NASA_API_KEY). Fetch in a Server Component and pass props.",
};

/** Raw-HTML sinks bypass React escaping; dialogs must go through ui/Modal. */
const BANNED_SYNTAX = [
  {
    selector: "AssignmentExpression[left.property.name=/^(innerHTML|outerHTML)$/]",
    message: "Raw HTML sink: render with JSX instead.",
  },
  {
    selector:
      "CallExpression[callee.object.name='document'][callee.property.name=/^(write|writeln)$/], CallExpression[callee.property.name='insertAdjacentHTML']",
    message: "Raw HTML sink: render with JSX instead.",
  },
];
const DIALOG_ROLE = {
  selector: "JSXAttribute[name.name='role'][value.value='dialog']",
  message: "Use components/ui/Modal: it manages focus, Escape and nesting.",
};
/** Committed focus/skip silently shrinks the suite. */
const FOCUSED_TESTS = {
  // it.only / describe.skip, and Playwright's test.describe.only.
  selector:
    "CallExpression[callee.property.name=/^(only|skip)$/]:matches([callee.object.name=/^(describe|it|test)$/], [callee.object.property.name='describe'])",
  message: "Don't commit .only/.skip.",
};

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // Same glob eslint-config-next registers the react plugin for.
    files: ["**/*.{js,jsx,mjs,ts,tsx,mts,cts}"],
    plugins: { sonarjs },
    rules: {
      // Allow the `_name` convention for intentionally unused parameters.
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],

      // Dead logic: conditions that can't change, branches that do the same thing, writes never read.
      "no-constant-condition": "error",
      "no-unreachable": "error",
      "no-useless-return": "error",
      "sonarjs/no-all-duplicated-branches": "error",
      "sonarjs/no-duplicated-branches": "error",
      "sonarjs/no-identical-conditions": "error",
      "sonarjs/no-identical-expressions": "error",
      "sonarjs/no-gratuitous-expressions": "error",
      "sonarjs/no-dead-store": "error",
      "sonarjs/no-unused-collection": "error",
      "sonarjs/no-element-overwrite": "error",
      "sonarjs/no-redundant-jump": "error",
      "sonarjs/no-use-of-empty-return-value": "error",
      "sonarjs/no-identical-functions": "error",

      // Complexity budgets: hard limits, not style. Raise one only with a comment saying why.
      complexity: ["error", 12],
      "sonarjs/cognitive-complexity": ["error", 15],
      "max-depth": ["error", 4],
      "max-params": ["error", 5],

      // Banned APIs.
      "no-eval": "error",
      "no-implied-eval": "error",
      "no-new-func": "error",
      "react/no-danger": "error",
      "no-console": ["error", { allow: ["warn", "error"] }],
      "no-restricted-syntax": ["error", ...BANNED_SYNTAX],
      "no-restricted-imports": [
        "error",
        {
          paths: [
            { name: "react", importNames: ["FC"], message: "Type props directly instead of React.FC." },
            { name: "axios", message: "Use fetch through src/lib/nasa/client (caching + error mapping)." },
          ],
        },
      ],
    },
  },
  {
    // process.env is read in one place so the key boundary stays auditable.
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["src/lib/nasa/client.ts", "src/proxy.ts"],
    rules: {
      "no-restricted-properties": [
        "error",
        { object: "process", property: "env", message: "Read env vars only in src/lib/nasa/client.ts." },
      ],
    },
  },
  {
    // Client-side layers may not import the server data layer.
    files: ["src/components/**/*.{ts,tsx}"],
    ignores: [
      // Async Server Components that fetch on the server.
      "src/components/gallery/GalleryCategoryPage.tsx",
      "src/components/gallery/GalleryDetailView.tsx",
      "src/components/research/ExoplanetsSection.tsx",
    ],
    rules: {
      "no-restricted-imports": ["error", { patterns: [SERVER_ONLY_IMPORTS] }],
    },
  },
  {
    // Per-pixel/per-particle kernels: positional numbers avoid allocating an object per call.
    files: ["src/lib/space3d/**", "src/lib/galaxy3d/**"],
    rules: { "max-params": ["error", 6] },
  },
  {
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["src/components/ui/Modal.tsx"],
    rules: { "no-restricted-syntax": ["error", ...BANNED_SYNTAX, DIALOG_ROLE] },
  },
  {
    files: ["tests/**/*.{ts,tsx}"],
    rules: {
      // Test tables and fixtures legitimately repeat shapes.
      "sonarjs/no-identical-functions": "off",
      "max-params": "off",
      "no-restricted-syntax": ["error", ...BANNED_SYNTAX, FOCUSED_TESTS],
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Standalone Vite project with its own toolchain:
    "visuals/**",
    "coverage/**",
    "playwright-report/**",
    "test-results/**",
  ]),
]);

export default eslintConfig;
