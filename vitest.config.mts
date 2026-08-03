import { defineConfig } from "vitest/config";

/**
 * Two projects because the suites need different globals: route handlers and
 * pure functions run on plain Node, component tests need a DOM.
 */
export default defineConfig({
  test: {
    projects: [
      {
        resolve: { tsconfigPaths: true },
        test: {
          name: "node",
          environment: "node",
          include: ["tests/{unit,integration}/**/*.test.ts"],
          setupFiles: ["tests/setup/node.ts"],
        },
      },
      {
        resolve: { tsconfigPaths: true },
        test: {
          name: "dom",
          environment: "happy-dom",
          include: ["tests/components/**/*.test.tsx"],
          setupFiles: ["tests/setup/dom.ts"],
        },
      },
    ],
    coverage: {
      provider: "v8",
      include: ["src/lib/**", "src/components/shop/**", "app/api/**"],
    },
  },
});
