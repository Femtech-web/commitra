import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["tests/**/*.spec.ts"],
    exclude: ["dist/**", "node_modules/**"],
    coverage: {
      provider: "v8",
      reportsDirectory: "coverage",
    },
    pool: "threads",
    poolOptions: {
      threads: {
        singleThread: false,
      },
    },
    setupFiles: ["./tests/setup.ts"],
  },
  // resolve: {
  //   alias: {
  //     "@": path.resolve(__dirname, "src"),
  //   },
  // },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@src": path.resolve(__dirname, "src"),
      "@dist": path.resolve(__dirname, "dist"),
    }
  }


});
