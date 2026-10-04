// Architecture rules: circular dependencies, layer direction, orphans.
// The layer diagram and the reasons are in docs/adr/0002-layered-architecture.md.

/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: "no-circular",
      severity: "error",
      comment: "Cycles make modules impossible to reason about or test in isolation.",
      from: {},
      to: { circular: true },
    },
    {
      name: "types-are-leaves",
      severity: "error",
      comment: "src/types is the domain model; it depends on nothing in the app.",
      from: { path: "^src/types/" },
      to: { path: "^src/(?!types/)" },
    },
    {
      name: "lib-is-framework-free-of-ui",
      severity: "error",
      comment: "src/lib (data access + pure generators) must not depend on UI or routes.",
      from: { path: "^src/lib/" },
      to: { path: "^src/(components|app)/" },
    },
    {
      name: "pure-generators-stay-pure",
      severity: "error",
      comment: "Procedural generators are seeded pure functions: no React, three.js, Next, or I/O.",
      from: { path: "^src/lib/(galaxy3d|space3d)/" },
      to: { path: "^(node_modules/(react|react-dom|three|@react-three|next)/|src/lib/nasa/)" },
    },
    {
      name: "components-do-not-import-routes",
      severity: "error",
      comment: "Routes compose components, never the reverse.",
      from: { path: "^src/components/" },
      to: { path: "^src/app/" },
    },
    {
      name: "ui-primitives-are-generic",
      severity: "error",
      comment: "components/ui is reusable across features, so it must not import a feature folder.",
      from: { path: "^src/components/ui/" },
      to: { path: "^src/components/(?!ui/)" },
    },
    {
      name: "no-orphans",
      severity: "error",
      comment: "A module nothing imports is dead code (entry points are excluded).",
      from: {
        orphan: true,
        pathNot: ["\\.d\\.ts$", "^src/app/", "^src/proxy\\.ts$", "\\.worker\\.ts$"],
      },
      to: {},
    },
  ],
  options: {
    doNotFollow: { path: "node_modules" },
    includeOnly: "^(src|node_modules)",
    tsConfig: { fileName: "tsconfig.json" },
    tsPreCompilationDeps: true,
    enhancedResolveOptions: {
      exportsFields: ["exports"],
      conditionNames: ["import", "require", "node", "default", "types"],
    },
  },
};
