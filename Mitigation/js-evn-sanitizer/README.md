# JavaScript Environemnt Sanitizer (js-env-sanizer)

Simplifies the management of environment-specific flaky tests. Developers can annotate test blocks with docblock tags to specify the conditions under which a test should be skipped or enabled.

The plugin **skips or enables tests** based on environment conditions such as OS, Node.js version, or browser, and works with **Jest**, **Mocha**, and **Vitest**.

---

## Quick Start

Install the plugin:

```bash
npm install --save-dev git+https://github.com/Negar-Hashemi/js-env-sanitizer.git
```

That’s it! The `setup.js` script runs automatically (via `postinstall`) to configure Babel and your test framework.  

Add annotations above your test blocks:

```js
/**
 * @skipOnOS win32
 */
it('skips on Windows', () => {});

/**
 * @enabledOnNodeVersion 18
 */
test('runs only on Node 18', () => {});
```

---

## Features

- **Docblock annotations** for conditional skipping/enabling:
  - `@skipOnOS`, `@enabledOnOS`
  - `@skipOnNodeVersion`, `@enabledOnNodeVersion`
  - `@skipForNodeRange`, `@enabledForNodeRange`
  - `@skipOnBrowser`, `@enabledOnBrowser`
- **Automatic setup** with Babel integration via `postinstall`.
- Logs all skipped tests to the console **and** `sanitize-tests.log`.

---

## Example package.json

```json
{
  "name": "test-project",
  "version": "1.0.0",
  "devDependencies": {
    "js-env-sanitizer": "git+https://github.com/Negar-Hashemi/js-env-sanitizer.git"
  }
}
```

---

## Supported Annotations

| Annotation                        | Description                                        | Example                                    |
|-----------------------------------|----------------------------------------------------|--------------------------------------------|
| `@skipOnOS <os>`                  | Skip test on specific OS (`win32`, `darwin`, `linux`) | `@skipOnOS win32,darwin`                  |
| `@enabledOnOS <os>`               | Only run test on specified OS                      | `@enabledOnOS darwin`                      |
| `@skipOnNodeVersion <v>`          | Skip test on specific Node version                 | `@skipOnNodeVersion 18,20`                 |
| `@enabledOnNodeVersion <v>`       | Only run test on specified Node version            | `@enabledOnNodeVersion 20`                 |
| `@skipForNodeRange min=x,max=y`   | Skip test if Node version is in the given range    | `@skipForNodeRange min=16,max=18`          |
| `@enabledForNodeRange min=x,max=y`| Only run test if Node version is outside the range | `@enabledForNodeRange min=14,max=16`       |
| `@skipOnBrowser <browser>`        | Skip test in specified browser (`Chrome`, `Firefox`, `Safari`, `Edge`) | `@skipOnBrowser Chrome` |
| `@enabledOnBrowser <browser>`     | Only run test in specified browser                 | `@enabledOnBrowser Firefox`                |

---

## Framework Integration

The plugin works with **Jest**, **Mocha**, and **Vitest**.  
The `setup.js` script automatically configures the correct integration:

### Jest
- Ensures Babel is active using `babel-jest` (or `ts-jest` with a Babel pass).
- Creates a minimal `jest.config.js` if none exists.
- Does not overwrite existing configs — just ensure:
  - `transform` includes `babel-jest`, **or**
  - `ts-jest` has `globals['ts-jest'].babelConfig = true`.
- Ensures `@babel/preset-env` (and `@babel/preset-typescript` if using TS).

### Mocha
- Creates `babel.register.js` to hook Babel at runtime.
- Adds `--require ./babel.register.js`:
  - Mocha ≥ 6: updates/creates `.mocharc.json`.
  - Older Mocha: updates/creates `mocha.opts`.
- Ensures `jest-docblock`, `@babel/register`, and Babel presets.

### Vitest
- Creates `vitest.setup.js` (always present).
- Adds it under `vitest.setupFiles` in `package.json`.
- Enables `vite-plugin-babel` so Babel plugins (like `module:js-env-sanitizer`) apply to test files.
- Does not overwrite existing `vitest.config.*`.
- Ensures `@babel/preset-env` (and `@babel/preset-typescript` if using TS).

---

## Manual Setup

If you don’t want to use `setup.js`, configure manually.

### Common Prerequisites

```bash
npm i -D @babel/core @babel/preset-env @babel/preset-typescript
```

```js
// babel.config.js (or .cjs / .babelrc)
module.exports = {
  presets: [
    ["@babel/preset-env", { targets: { node: "current" }, modules: false }],
    ["@babel/preset-typescript", { allowDeclareFields: true }] // if using TypeScript
  ],
  plugins: ["module:js-env-sanitizer"],
  comments: true
};
```

### Jest (Manual)

```bash
# For JS
npm i -D babel-jest

# For TS (already using ts-jest)
npm i -D ts-jest
```

```js
// jest.config.js (JS)
module.exports = {
  testEnvironment: 'node',
  transform: { '^.+\.[jt]sx?$': 'babel-jest' },
};
```

```js
// jest.config.js (TS with ts-jest)
module.exports = {
  testEnvironment: 'node',
  transform: { '^.+\.ts$': 'ts-jest' },
  globals: { 'ts-jest': { babelConfig: true } },
};
```

### Mocha (Manual)

```bash
npm i -D @babel/register jest-docblock
```

```js
// babel.register.js
require('@babel/register')({
  extensions: ['.js', '.jsx', '.ts', '.tsx'],
  cache: true,
  babelrc: true,
  configFile: true,
});
```

- **Mocha ≥ 6**: `.mocharc.json`
  ```json
  { "require": ["./babel.register.js"] }
  ```
- **Older Mocha**: `mocha.opts`
  ```
  --require ./babel.register.js
  ```

### Vitest (Manual)

```bash
npm i -D vite-plugin-babel
```

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import babel from 'vite-plugin-babel'

export default defineConfig({
  test: {
    environment: 'node',
    setupFiles: ['./vitest.setup.js'],
  },
  plugins: [
    babel({
      filter: /\.(test|spec)\.(js|ts|jsx|tsx)$/,
      babelConfig: { configFile: true, babelrc: true },
    }),
  ],
})
```

```js
// vitest.setup.js
// optional: globals/mocks
```

---

## Logs of Skipped Tests

During execution, skipped tests log messages such as:

```bash
[SKIPPING] test("sanitized test") in /path/to/file.js due to @enabledOnOS darwin
```

All decisions are also written to `sanitize-tests.log` with timestamps:

```
[2025-08-17T10:42:00.123Z] [SKIPPING] test("Example") in src/foo.test.js due to @skipOnNodeVersion 18
```

---

## Notes

- **Monorepos/workspaces**: if tests run from a workspace without a local `vitest` dep, still create `vitest.setup.js` and reference it.  
- **Windows CI**: if tests write to `D:\tmp\…`, create the directory first:
  ```pwsh
  New-Item -ItemType Directory -Path 'D:\tmp' -Force | Out-Null
  ```
- Do **not** mix `@babel/register` with Vitest’s `vite-plugin-babel`.  
- **Browser detection** works in browser-like environments (e.g., `jsdom`).  
- Use `JS_SANITIZER_BROWSER` in CI to explicitly set a browser name (`Chrome`, `Firefox`, `Safari`, `Edge`).  

---
