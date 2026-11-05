import { defineConfig } from "vitest/config";

export default defineConfig({
  build: {
    lib: { entry: "src/isoplan-card.ts", formats: ["es"], fileName: () => "isoplan-card.js" },
    outDir: "dist",
    emptyOutDir: true,
  },
  server: { fs: { allow: [".."] } },
  test: {
    environment: "jsdom",
    include: ["src/**/*.test.ts"],
    coverage: { include: ["src/**/*.ts"], exclude: ["src/**/*.test.ts"] },
  },
});
