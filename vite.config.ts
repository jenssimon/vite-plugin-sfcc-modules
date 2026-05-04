import { defineConfig } from "vite-plus"

import sfccModules from "./src/index.ts"

export default defineConfig({
  plugins: [
    sfccModules({
      cartridgePath: ["app_brand", "app_core", "app_storefront_base"],
      basePath: "./test/cartridges",
    }),
  ],
  pack: {
    entry: ["src/index.ts"],
    format: ["esm", "cjs"],
    dts: true,
  },
  staged: { "*": "vp check --fix" },
  lint: {
    options: {
      typeAware: true,
      typeCheck: true,
    },
    plugins: ["vitest", "jsdoc"],
  },
  fmt: {
    semi: false,
    sortImports: {
      groups: [
        "type-import",
        ["value-builtin", "value-external"],
        "type-internal",
        "value-internal",
        ["type-parent", "type-sibling", "type-index"],
        ["value-parent", "value-sibling", "value-index"],
        "unknown",
      ],
    },
  },
})
