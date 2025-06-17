import * as radixColors from "@radix-ui/colors";

const colors: string[] = [
  "gray",
  "mauve",
  "slate",
  "sage",
  "olive",
  "sand",
  "tomato",
  "red",
  "ruby",
  "crimson",
  "pink",
  "plum",
  "purple",
  "violet",
  "iris",
  "indigo",
  "blue",
  "cyan",
  "teal",
  "jade",
  "green",
  "grass",
  "bronze",
  "gold",
  "brown",
  "orange",
  "amber",
  "yellow",
  "lime",
  "mint",
  "sky",
];

/**
 * Returns an array of color key pairs for solid and alpha variants
 */
export function getColorKeys(): Array<[solid: string, alpha: string]> {
  return colors.map((color) => {
    return [color, `${color}A`];
  });
}

/**
 * Returns an array of dark color key pairs for solid and alpha variants
 */
export function getDarkColorKeys(): Array<
  [darkSolid: string, darkAlpha: string]
> {
  return colors.map((color) => {
    return [`${color}Dark`, `${color}DarkA`];
  });
}

/**
 * Returns an array of P3 color key pairs for solid and alpha variants
 */
export function getP3ColorKeys(): Array<[p3Solid: string, p3Alpha: string]> {
  return colors.map((color) => {
    return [`${color}P3`, `${color}P3A`];
  });
}

/**
 * Returns the color palette entries for a given color key
 */
export function getPalette(key: string): Array<[key: string, value: string]> {
  const palette = radixColors[key];
  return Object.entries(palette);
}

/**
 * Format a Radix color palette key with prefix and hyphenation.
 *
 * @example
 * formatColorKey('amber1')  // -> 'rx-amber-1'
 * formatColorKey('amberA1') // -> 'rx-amber-a1'
 */
export function normalizeColorKey(key: string): string {
  const normalized = key.replace(/(A?\d)/, "-$1").toLowerCase();
  return `rx-${normalized}`;
}

/**
 * Denormalize a normalized Radix color palette key into its original format.
 *
 * @example
 * formatColorKey('rx-amber-1')  // -> 'amber1'
 * formatColorKey('rx-amber-a1') // -> 'amberA1'
 */
export function denormalizeColorKey(key: string): string {
  return (
    key
      // Remove prefix (including CSS variable hyphens)
      .replace(/(--)?rx-/, "")
      // Revert alpha key to uppercase
      .replace(/-a(\d)/, "A$1")
      // Remove hyphen between color and shade
      .replace(/-(\d)/, "$1")
  );
}

/**
 * Processes each color in the provided color palettes by applying a callback function.
 * Handles both solid and alpha variants of each color.
 */
export function processColorPalettes(
  colorPairs: Array<[solid: string, alpha: string]>,
  onColor: (colorKey: string, colorValue: string) => void,
): void {
  for (const [solidKey, alphaKey] of colorPairs) {
    const solidPalette = getPalette(solidKey);
    const alphaPalette = getPalette(alphaKey);

    for (const palette of [solidPalette, alphaPalette]) {
      for (const [key, color] of palette) {
        onColor(key, color);
      }
    }
  }
}
