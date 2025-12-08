import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    server: "src/server.ts",
    worker: "src/work-runner.ts",
  },
  outDir: "dist",
  splitting: false,
  sourcemap: true,
  clean: true,
  target: "es2022", // <-- IMPORTANTE
  format: ["esm"], // <-- evita CJS e permite top-level await
  dts: false,
  shims: false,
  minify: false,
});
