import { getColors } from "../src/tailwind.utils";

export async function generateTailwindTheme() {
  const colors = getColors();

  let output = "@theme {\n";

  for (const [key, { customProperty }] of Object.entries(colors)) {
    output += `  --color-${key}: ${customProperty};\n`;
  }

  output += "}\n";

  await Bun.write("build/tailwind.theme.css", output);
  console.log("-> Wrote file: tailwind.theme.css");
}
