import * as radixColors from "@radix-ui/colors";
import postcss, { PluginCreator } from "postcss";
import { denormalizeColorKey } from "./colors";

/**
 * Options for configuring the PostCSS plugin
 */
interface PluginOptions {
  /** The CSS selector for root variables */
  rootSelector?: string;
  /** The CSS selector for dark mode */
  darkModeSelector?: string;
  excludeP3ColorGamut?: boolean;
}

/**
 * Creates a PostCSS plugin that handles Radix UI color variables
 * @param opts - Configuration options for the plugin
 */
function radwind(opts: PluginOptions = {}): postcss.AcceptedPlugin {
  const rootSelector = opts.rootSelector ?? ":root, .light, .light-theme";
  const darkModeSelector = opts.darkModeSelector ?? ".dark, .dark-theme";
  let uniqueVariables = new Set<string>();

  return {
    postcssPlugin: "radwind/postcss",
    /**
     * Processes CSS declarations to find and track Radix color variable references
     */
    Declaration(decl) {
      // Look for CSS variable references in the value
      const value = decl.value;

      // Match var(--rx-*) but not any fallback values
      const matches = value.match(/var\(--rx[^,)]+/g) || [];

      matches.forEach((match) => {
        const varName = match.match(/--rx[^,)]+/)?.[0];
        if (varName) {
          uniqueVariables.add(varName);
        }
      });
    },
    /**
     * Finalizes the plugin by injecting color variables and dark mode overrides
     */
    OnceExit(root) {
      // After processing all declarations, inject color variables and overrides
      if (uniqueVariables.size > 0) {
        const rootRule = postcss.rule({ selector: rootSelector });
        const darkRule = postcss.rule({ selector: darkModeSelector });
        const p3SupportsAtRule = postcss.atRule({
          name: "supports",
          params: "(color: color(display-p3 1 1 1))",
        });
        const p3MediaAtRule = postcss.atRule({
          name: "media",
          params: "(color-gamut: p3)",
        });
        const p3RootRule = postcss.rule({ selector: rootSelector });
        const p3DarkRule = postcss.rule({ selector: darkModeSelector });

        uniqueVariables.forEach((varName: string) => {
          const colorKey = denormalizeColorKey(varName);
          const colorName = colorKey.replace(/A?\d+$/, "");
          const isAlpha = colorKey.includes("A");

          // Base root color values
          const rootPaletteKey = isAlpha ? `${colorName}A` : colorName;
          const rootColorValue = radixColors[rootPaletteKey][colorKey];

          rootRule.append({
            prop: varName,
            value: rootColorValue,
            type: "decl",
          });

          // Dark mode color values
          const darkPaletteKey = isAlpha
            ? `${colorName}DarkA`
            : `${colorName}Dark`;

          const darkColorValue = radixColors[darkPaletteKey][colorKey];

          darkRule.append({
            prop: varName,
            value: darkColorValue,
            type: "decl",
          });

          if (!opts.excludeP3ColorGamut) {
            const p3RootPaletteKey = isAlpha
              ? `${colorName}P3A`
              : `${colorName}P3`;
            const p3DarkPaletteKey = isAlpha
              ? `${colorName}DarkP3A`
              : `${colorName}DarkP3`;
            const p3RootColorValue = radixColors[p3RootPaletteKey][colorKey];
            const p3DarkColorValue = radixColors[p3DarkPaletteKey][colorKey];

            p3RootRule.append({
              prop: varName,
              value: p3RootColorValue,
              type: "decl",
            });
            p3DarkRule.append({
              prop: varName,
              value: p3DarkColorValue,
              type: "decl",
            });
          }
        });

        root.append(rootRule);
        root.append(darkRule);

        if (!opts.excludeP3ColorGamut) {
          p3MediaAtRule.append(p3RootRule);
          p3MediaAtRule.append(p3DarkRule);
          p3SupportsAtRule.append(p3MediaAtRule);
          root.append(p3SupportsAtRule);
        }
      }
    },
  };
}

export default Object.assign(radwind, {
  postcss: true,
}) as PluginCreator<PluginOptions>;
