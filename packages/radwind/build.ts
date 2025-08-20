import { BuildConfig } from "bun";
import { generateTailwindTheme } from "./scripts/generate-tailwind-theme";
import { $ } from "bun";

// await Bun.build({
//   entrypoints: [
//     "./src/tailwind.plugin.ts",
//     "./src/postcss.plugin.ts",
//     "./src/vite.plugin.ts",
//   ],
//   format: "esm",
//   outdir: "build",
//   target: "node",
// });

const formats: Array<BuildConfig["format"]> = ["esm", "cjs"];

for (const format of formats) {
  await Bun.build({
    entrypoints: [
      "./src/tailwind.plugin.ts",
      "./src/postcss.plugin.load-config-fix.ts",
      "./src/postcss.plugin.ts",
      "./src/vite.plugin.ts",
    ],
    format,
    outdir: "build",
    target: "node",
    naming: `[dir]/[name].${format === "esm" ? "m" : ""}[ext]`,
  });
}

await generateTailwindTheme();

// Generate TypeScript declarations
await $`tsc --emitDeclarationOnly --declaration --outDir build --target ES2020 --module ESNext --moduleResolution bundler --skipLibCheck src/*.ts`;
