import { expect, test } from "bun:test";
import fs from "fs";
import { build } from "vite";
import radwind from "radwind/vite";

test("matches snapshot", async () => {
  const result = await build({
    plugins: [radwind()],
    build: {
      write: false,
      minify: false,
      rollupOptions: {
        input: "input.css",
        output: {
          assetFileNames: "output.css",
        },
      },
    },
    logLevel: "warn",
  });

  const cssAsset = result.output.find(
    (chunk) => chunk.fileName === "output.css",
  );
  
  expect(cssAsset.source).toMatchSnapshot();
});

test("excludeP3ColorGamut option", async () => {
  const result = await build({
    plugins: [radwind({ excludeP3ColorGamut: true })],
    build: {
      write: false,
      minify: false,
      rollupOptions: {
        input: "input.css",
        output: {
          assetFileNames: "output.css",
        },
      },
    },
    logLevel: "warn",
  });

  const cssAsset = result.output.find(
    (chunk) => chunk.fileName === "output.css",
  );
  const variablesAsset = result.output.find(
    (chunk) => chunk.fileName === "radwind-variables.css",
  );
  
  expect({
    mainCSS: cssAsset.source,
    variablesCSS: variablesAsset.source,
  }).toMatchSnapshot();
});

test("custom selectors", async () => {
  const result = await build({
    plugins: [
      radwind({
        rootSelector: ".custom-root",
        darkModeSelector: ".custom-dark",
      }),
    ],
    build: {
      write: false,
      minify: false,
      rollupOptions: {
        input: "input.css",
        output: {
          assetFileNames: "output.css",
        },
      },
    },
    logLevel: "warn",
  });

  const cssAsset = result.output.find(
    (chunk) => chunk.fileName === "output.css",
  );
  const variablesAsset = result.output.find(
    (chunk) => chunk.fileName === "radwind-variables.css",
  );
  
  expect({
    mainCSS: cssAsset.source,
    variablesCSS: variablesAsset.source,
  }).toMatchSnapshot();
});

test("handles CSS with no variables", async () => {
  // Create a temporary CSS file for this test
  const tempInput = "temp-no-vars.css";
  fs.writeFileSync(tempInput, "body { color: red; }");

  try {
    const result = await build({
      plugins: [radwind()],
      build: {
        write: false,
        minify: false,
        rollupOptions: {
          input: tempInput,
          output: {
            assetFileNames: "output.css",
          },
        },
      },
      logLevel: "warn",
    });

    const cssAsset = result.output.find(
      (chunk) => chunk.fileName === "output.css",
    );
    const variablesAsset = result.output.find(
      (chunk) => chunk.fileName === "radwind-variables.css",
    );
    
    expect({
      mainCSS: cssAsset.source,
      variablesCSS: variablesAsset?.source || null,
    }).toMatchSnapshot();
  } finally {
    // Clean up temporary file
    if (fs.existsSync(tempInput)) {
      fs.unlinkSync(tempInput);
    }
  }
});
