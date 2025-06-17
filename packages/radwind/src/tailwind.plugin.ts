import createPlugin from "tailwindcss/plugin";
import { getColorsWithVariableReferences } from "./tailwind.utils" with { type: "macro" };

/**
 * A TailwindCSS plugin that provides utility classes for the Radix Colors palette.
 */
const plugin: any = createPlugin(() => {}, {
  theme: {
    extend: {
      colors: getColorsWithVariableReferences(),
    },
  },
});

export default plugin;
