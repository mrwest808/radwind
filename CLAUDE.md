# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Radwind is a CSS color system built on top of Radix UI Colors, providing plugins for PostCSS, TailwindCSS, and Vite. The project uses Bun as the package manager and runtime.

## Commands

### Building
- `bun run build` - Build the main radwind package
- `bun run build:next` - Build the Next.js example
- `bun run build:postcss` - Build the PostCSS example

### Development
- `bun run dev:next` - Start Next.js example in development mode
- `bun run dev:vite` - Start Vite example in development mode

### Testing
- `bun run test` - Run tests (PostCSS example)
- `bun run test:watch` - Run tests in watch mode

### Package Management
This is a Bun workspace with workspaces defined in the root package.json. The main package is in `packages/radwind/` and examples are in `examples/`.

## Architecture

### Core Package Structure (`packages/radwind/`)
- **postcss.plugin.ts**: PostCSS plugin that processes CSS variable references (`var(--rx-*)`) and generates dark mode and P3 color gamut variants
- **tailwind.plugin.ts**: TailwindCSS plugin that extends the theme with Radix color utilities  
- **vite.plugin.ts**: Vite plugin integration
- **colors.ts**: Color processing utilities and type definitions
- **build.ts**: Build script that compiles plugins to both ESM and CJS formats and generates Tailwind theme CSS

### Plugin System
The project provides three main integrations:
1. **PostCSS Plugin**: Automatically detects Radix color variable usage and injects dark mode overrides
2. **TailwindCSS Plugin**: Provides utility classes for Radix colors via CSS variables
3. **Vite Plugin**: Integration for Vite-based projects

### Build Process
- Uses Bun.build() to compile TypeScript plugins to both ESM and CJS formats
- Generates static Tailwind theme CSS file
- Outputs to `build/` directory with appropriate export paths defined in package.json

### Color System
Based on Radix UI Colors with support for:
- Light/dark mode variants
- P3 color gamut for wide-gamut displays  
- Alpha channel variants
- CSS custom properties with `--rx-` prefix

### Testing
Uses Bun's built-in test runner with snapshot testing for CSS output validation.