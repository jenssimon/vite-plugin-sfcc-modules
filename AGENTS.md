<!--VITE PLUS START-->

# Using Vite+, the Unified Toolchain for the Web

This project is using Vite+, a unified toolchain built on top of Vite, Rolldown, Vitest, tsdown, Oxlint, Oxfmt, and Vite Task. Vite+ wraps runtime management, package management, and frontend tooling in a single global CLI called `vp`. Vite+ is distinct from Vite, and it invokes Vite through `vp dev` and `vp build`. Run `vp help` to print a list of commands and `vp <command> --help` for information about a specific command.

Docs are local at `node_modules/vite-plus/docs` or online at https://viteplus.dev/guide/.

## Review Checklist

- [ ] Run `vp install` after pulling remote changes and before getting started.
- [ ] Run `vp check` and `vp test` to format, lint, type check and test changes.
- [ ] Check if there are `vite.config.ts` tasks or `package.json` scripts necessary for validation, run via `vp run <script>`.

<!--VITE PLUS END-->

---

# vite-plugin-sfcc-modules

A Vite plugin that resolves non-standard module paths used by Salesforce Commerce Cloud (SFCC) server-side code. It is the Babel-free counterpart to `babel-plugin-sfcc-modules`.

## What the Plugin Does

The plugin handles three SFCC-specific patterns inside `src/index.ts`:

| Pattern                              | Meaning                                             | Hook used                                    |
| ------------------------------------ | --------------------------------------------------- | -------------------------------------------- |
| `require("*/cartridge/scripts/foo")` | First matching cartridge in cartridge path          | `transform`                                  |
| `require("~/cartridge/scripts/bar")` | Own cartridge of the calling file                   | `transform`                                  |
| `module.superModule`                 | Next match in cartridge path for the current module | `transform` (rewritten to a static `import`) |

### Important: `module.superModule` uses a static import

`module.superModule` is rewritten to a static `import` at the top of the file — **not** a `require()` call. This is intentional: only statically imported modules pass through Vite's transform pipeline. A `require()` call inside evaluated code bypasses the pipeline, meaning transitive `module.superModule` chains would not be resolved correctly.

## Project Structure

```
src/
  index.ts          # Plugin implementation (resolveId + transform hooks)
test/
  plugin.test.js    # Vitest tests — no @babel/register, no Babel dependency
  cartridges/       # SFCC fixture cartridges used by the tests
    app_brand/
    app_core/
    app_storefront_base/
```

## Plugin Configuration

The plugin is configured in `vite.config.ts` under `plugins`. For tests, the same top-level `plugins` array applies — do **not** use `test.plugins`, as that does not cover transitive module transforms.

```ts
import sfccModules from "vite-plugin-sfcc-modules"

export default defineConfig({
  plugins: [
    sfccModules({
      cartridgePath: ["app_brand", "app_core", "app_storefront_base"],
      basePath: "./path/to/cartridges",
    }),
  ],
})
```

Options:

| Option          | Type       | Description                                                                         |
| --------------- | ---------- | ----------------------------------------------------------------------------------- |
| `cartridgePath` | `string[]` | Ordered cartridge lookup path. Order matters — first match wins.                    |
| `basePath`      | `string`   | Path to the folder containing the cartridges. Resolved relative to `process.cwd()`. |

## Writing Tests

Tests use static `import` for SFCC fixture modules — `createRequire` bypasses the plugin:

```js
// correct
import hello from "./cartridges/app_core/cartridge/scripts/hello.js"

// wrong — bypasses transform pipeline
const require = createRequire(import.meta.url)
const hello = require("./cartridges/app_core/cartridge/scripts/hello")
```

## Supported File Extensions

The plugin resolves files with extensions `.js`, `.ds`, and `.json` — matching SFCC server-side conventions.

## Relation to `babel-plugin-sfcc-modules`

|                    | `babel-plugin-sfcc-modules`         | `vite-plugin-sfcc-modules` |
| ------------------ | ----------------------------------- | -------------------------- |
| Transform time     | Babel (build or `@babel/register`)  | Vite/Vitest pipeline       |
| Babel required     | yes                                 | no                         |
| Vitest integration | via `@babel/register` in test setup | natively via `plugins`     |
| Use case           | existing Babel-based setups         | Vite-native projects       |
