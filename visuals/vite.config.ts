import { defineConfig } from "vite";

export default defineConfig({
  build: {
    target: "es2022",
    // three.js plus three-vrm are ~700 kB minified on their own; that's expected here.
    chunkSizeWarningLimit: 1000,
  },
});
