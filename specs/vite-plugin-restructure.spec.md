# Vite Plugin Restructure Specification

## Overview

This specification outlines the restructuring of examples and completion of the Vite plugin to provide better separation between Tailwind-integrated examples and barebones plugin testing.

## Goals

1. Create clear separation between Tailwind-integrated examples and barebones plugin testing
2. Provide a minimal Vite example similar to the PostCSS example for direct plugin testing
3. Complete the Vite plugin implementation with proper dark mode and P3 color gamut support
4. Maintain existing functionality while improving testing coverage

## Implementation Plan

### 1. Restructure Existing Examples

#### 1.1 Rename Current Examples
- **From**: `examples/vite/` → **To**: `examples/vite-tailwind/`
- **From**: `examples/next/` → **To**: `examples/next-tailwind/`

#### 1.2 Update Root Package.json Scripts
```json
{
  "scripts": {
    "build": "bun --filter=radwind run build",
    "build:next-tailwind": "bun --bun --filter=@examples/next-tailwind run --elide-lines=0 build",
    "build:postcss": "bun --bun --filter=@examples/postcss run --elide-lines=0 build",
    "build:vite": "bun --bun --filter=@examples/vite run --elide-lines=0 build",
    "dev:next-tailwind": "bun --bun --filter=@examples/next-tailwind run --elide-lines=0 dev",
    "dev:vite": "bun --bun --filter=@examples/vite run --elide-lines=0 dev",
    "dev:vite-tailwind": "bun --bun --filter=@examples/vite-tailwind run --elide-lines=0 dev",
    "test": "bun --bun --filter=@examples/postcss run --elide-lines=0 test",
    "test:vite": "bun --bun --filter=@examples/vite run --elide-lines=0 test",
    "test:watch": "bun --bun --filter=@examples/postcss run --elide-lines=0 test:watch",
    "test:vite:watch": "bun --bun --filter=@examples/vite run --elide-lines=0 test:watch"
  }
}
```

#### 1.3 Update Package Names
- **vite-tailwind**: `@examples/vite-tailwind`
- **next-tailwind**: `@examples/next-tailwind`

### 2. Create New Barebones Vite Example

#### 2.1 Directory Structure
```
examples/vite/
├── package.json
├── vite.config.mjs
├── input.css
├── output.css (generated)
├── output.test.mjs
└── __snapshots__/
    └── output.test.mjs.snap
```

#### 2.2 Package.json
```json
{
  "name": "@examples/vite",
  "private": true,
  "type": "module",
  "scripts": {
    "build": "vite build --outDir=. --emptyOutDir=false",
    "test": "bun test",
    "test:watch": "bun test --watch"
  },
  "devDependencies": {
    "radwind": "workspace:*",
    "vite": "catalog:build"
  }
}
```

#### 2.3 Vite Config
```javascript
import { defineConfig } from "vite";
import radwind from "radwind/vite";

export default defineConfig({
  plugins: [radwind()],
  build: {
    rollupOptions: {
      input: "input.css",
      output: {
        assetFileNames: "output.css"
      }
    }
  }
});
```

#### 2.4 Input CSS (Similar to PostCSS example)
```css
:root {
  --background: var(--rx-gray-2);
  --foreground: var(--rx-gray-12);
}

body {
  background: var(--background);
  color: var(--foreground);
  border-color: var(--rx-amber-a5);
  font-family: Arial, Helvetica, sans-serif;
}
```

#### 2.5 Test File
```javascript
import { expect, test } from "bun:test";
import fs from "fs";

test("matches snapshot", () => {
  const output = fs.readFileSync("output.css", "utf8");
  expect(output).toMatchSnapshot();
});
```

### 3. Fix Vite Plugin Implementation

#### 3.1 Current Issues
- Plugin uses `transform` hook which may not work correctly with Vite's CSS processing
- Missing P3 color gamut support
- Incomplete CSS injection logic

#### 3.2 Required Fixes
1. **Proper Hook Usage**: Use `generateBundle` or `transformIndexHtml` for CSS injection
2. **P3 Color Gamut**: Add support similar to PostCSS plugin
3. **Variable Tracking**: Ensure proper detection of `--rx-*` variables across the build
4. **CSS Generation**: Generate the same output format as PostCSS plugin

#### 3.3 Expected Output
The Vite plugin should generate CSS output identical to the PostCSS plugin:
- Dark mode variables under `.dark, .dark-theme` selector
- P3 color gamut support with `@supports` and `@media` queries
- Proper variable resolution for all detected `--rx-*` references

### 4. Testing Strategy

#### 4.1 Test Coverage
- **PostCSS Example**: Tests PostCSS plugin directly
- **Vite Example**: Tests Vite plugin in isolation
- **Integration Examples**: vite-tailwind and next-tailwind serve as documentation

#### 4.2 Snapshot Testing
- Use same snapshot testing approach as PostCSS example
- Verify identical output between PostCSS and Vite plugins
- Ensure P3 color gamut and dark mode variants are properly generated

### 5. Success Criteria

1. **Restructure Complete**: Examples renamed and scripts updated
2. **Vite Plugin Fixed**: Generates identical output to PostCSS plugin
3. **Tests Passing**: New Vite example has working snapshot tests
4. **Documentation**: Integration examples serve as clear usage documentation
5. **Build Scripts**: All build and dev scripts work correctly with new structure

## Implementation Order

1. Create new barebones Vite example structure
2. Fix Vite plugin implementation
3. Add tests to new Vite example
4. Rename existing examples
5. Update root package.json scripts
6. Verify all examples and tests work correctly