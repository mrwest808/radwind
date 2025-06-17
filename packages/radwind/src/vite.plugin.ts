import * as radixColors from "@radix-ui/colors";
import type { Plugin } from "vite";
import { denormalizeColorKey } from "./colors";

// TODO: Ensure functional and follow idiomatic best practices for
// Vite/Rollup plugins injecting extra code (CSS).

/**
 * Options for configuring the Vite plugin
 */
interface PluginOptions {
  /** The CSS selector for root variables */
  rootSelector?: string;
  /** The CSS selector for dark mode */
  darkModeSelector?: string;
  excludeP3ColorGamut?: boolean;
}

/**
 * Creates a Vite plugin that handles Radix UI color variables
 * @param opts - Configuration options for the plugin
 */
export default function radixColorsPlugin(opts: PluginOptions = {}): Plugin {
  const rootSelector = opts.rootSelector ?? ":root, .light, .light-theme";
  const darkModeSelector = opts.darkModeSelector ?? ".dark, .dark-theme";

  return {
    name: "vite-plugin-radwind",
    enforce: "post",

    // Process final CSS assets during bundle generation
    generateBundle(_options, bundle) {
      const allUsedVariables = new Set<string>();
      const cssChunks: Array<{ fileName: string; chunk: any }> = [];

      // First pass: collect all CSS variables across all chunks
      for (const [fileName, chunk] of Object.entries(bundle)) {
        if (fileName.endsWith(".css") && "source" in chunk) {
          cssChunks.push({ fileName, chunk });
          const cssCode = chunk.source as string;

          // Track CSS variable references in this file
          const matches = cssCode.match(/var\(--rx[^,)]+/g) || [];
          matches.forEach((match) => {
            const varName = match.match(/--rx[^,)]+/)?.[0];
            if (varName) {
              allUsedVariables.add(varName);
            }
          });
        }
      }

      // Second pass: inject variables into primary CSS chunk
      if (allUsedVariables.size > 0 && cssChunks.length > 0) {
        const primaryChunk = identifyPrimaryChunk(cssChunks);
        const globalCSS = generateAdditionalCSS(
          allUsedVariables,
          rootSelector,
          darkModeSelector,
          opts.excludeP3ColorGamut,
        );

        // Inject variables into the primary chunk
        primaryChunk.chunk.source =
          primaryChunk.chunk.source + "\n" + globalCSS;
      }
    },
  };
}

/**
 * Identifies the primary CSS chunk to inject variables into
 */
function identifyPrimaryChunk(
  cssChunks: Array<{ fileName: string; chunk: any }>,
) {
  // Priority 1: Look for common primary chunk names
  const primaryNames = ["index", "main", "style", "app"];
  for (const name of primaryNames) {
    const found = cssChunks.find(({ fileName }) =>
      fileName.toLowerCase().includes(name.toLowerCase()),
    );
    if (found) return found;
  }

  // Priority 2: Use the largest chunk (likely contains the most CSS)
  let largestChunk = cssChunks[0];
  for (const cssChunk of cssChunks) {
    if (cssChunk.chunk.source.length > largestChunk.chunk.source.length) {
      largestChunk = cssChunk;
    }
  }

  return largestChunk;
}

/**
 * Generates root, dark mode and P3 color gamut CSS similar to PostCSS plugin
 */
function generateAdditionalCSS(
  uniqueVariables: Set<string>,
  rootSelector: string,
  darkModeSelector: string,
  excludeP3ColorGamut?: boolean,
): string {
  const rootDeclarations: string[] = [];
  const darkModeDeclarations: string[] = [];
  const p3RootDeclarations: string[] = [];
  const p3DarkDeclarations: string[] = [];

  uniqueVariables.forEach((varName: string) => {
    const colorKey = denormalizeColorKey(varName);
    const colorName = colorKey.replace(/A?\d+$/, "");
    const isAlpha = colorKey.includes("A");

    // Base root values
    const rootPaletteKey = isAlpha ? `${colorName}A` : colorName;
    const rootColorValue = radixColors[rootPaletteKey]?.[colorKey];

    if (rootColorValue) {
      rootDeclarations.push(`  ${varName}: ${rootColorValue};`);
    }

    // Dark mode values
    const darkPaletteKey = isAlpha ? `${colorName}DarkA` : `${colorName}Dark`;
    const darkColorValue = radixColors[darkPaletteKey]?.[colorKey];

    if (darkColorValue) {
      darkModeDeclarations.push(`  ${varName}: ${darkColorValue};`);
    }

    // P3 color gamut values
    if (!excludeP3ColorGamut) {
      const p3RootPaletteKey = isAlpha ? `${colorName}P3A` : `${colorName}P3`;
      const p3DarkPaletteKey = isAlpha
        ? `${colorName}DarkP3A`
        : `${colorName}DarkP3`;
      const p3RootColorValue = radixColors[p3RootPaletteKey]?.[colorKey];
      const p3DarkColorValue = radixColors[p3DarkPaletteKey]?.[colorKey];

      if (p3RootColorValue) {
        p3RootDeclarations.push(`      ${varName}: ${p3RootColorValue};`);
      }
      if (p3DarkColorValue) {
        p3DarkDeclarations.push(`      ${varName}: ${p3DarkColorValue};`);
      }
    }
  });

  let css = "";

  // Add root rules
  if (rootDeclarations.length > 0) {
    css += `\n${rootSelector} {\n${rootDeclarations.join("\n")}\n}`;
  }

  // Add dark mode rules
  if (darkModeDeclarations.length > 0) {
    css += `\n${darkModeSelector} {\n${darkModeDeclarations.join("\n")}\n}`;
  }

  // Add P3 color gamut support
  if (
    !excludeP3ColorGamut &&
    (p3RootDeclarations.length > 0 || p3DarkDeclarations.length > 0)
  ) {
    css += `\n\n@supports (color: color(display-p3 1 1 1)) {\n\n  @media (color-gamut: p3) {`;

    if (p3RootDeclarations.length > 0) {
      css += `\n\n    ${rootSelector} {\n${p3RootDeclarations.join("\n")}\n    }`;
    }

    if (p3DarkDeclarations.length > 0) {
      css += `\n\n    ${darkModeSelector} {\n${p3DarkDeclarations.join("\n")}\n    }`;
    }

    css += `\n  }\n}`;
  }

  return css;
}
