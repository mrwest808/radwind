import {
  getColorKeys,
  normalizeColorKey,
  processColorPalettes,
} from "./colors";

export function getColors() {
  const colors: Record<
    string,
    {
      customProperty: string;
      customPropertyWithFallback: string;
      value: string;
    }
  > = {};

  processColorPalettes(getColorKeys(), (key, value) => {
    const formattedKey = normalizeColorKey(key);
    colors[formattedKey] = {
      customProperty: `var(--${formattedKey})`,
      customPropertyWithFallback: `var(--${formattedKey}, ${value})`,
      value,
    };
  });

  return colors;
}

export function getColorsWithVariableReferences() {
  const colors: Record<string, string> = {};

  processColorPalettes(getColorKeys(), (key) => {
    const formattedKey = normalizeColorKey(key);
    colors[formattedKey] = `var(--${formattedKey})`;
  });

  return colors;
}

export function getColorsWithRawValues() {
  const colors: Record<string, string> = {};

  processColorPalettes(getColorKeys(), (key, value) => {
    const formattedKey = normalizeColorKey(key);
    colors[formattedKey] = value;
  });

  return colors;
}
