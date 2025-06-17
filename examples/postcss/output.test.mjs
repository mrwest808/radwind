import { expect, test } from "bun:test";
import fs from "fs";
import postcss from "postcss";
import radwindPlugin from "radwind/postcss";

test("matches snapshot", async () => {
  const input = fs.readFileSync("input.css", "utf8");
  const result = await postcss([radwindPlugin()]).process(input, {
    from: undefined,
  });
  expect(result.css).toMatchSnapshot();
});

test("excludeP3ColorGamut option", async () => {
  const input = fs.readFileSync("input.css", "utf8");
  const result = await postcss([
    radwindPlugin({ excludeP3ColorGamut: true }),
  ]).process(input, { from: undefined });
  expect(result.css).toMatchSnapshot();
});

test("custom selectors", async () => {
  const input = fs.readFileSync("input.css", "utf8");
  const result = await postcss([
    radwindPlugin({
      rootSelector: ".custom-root",
      darkModeSelector: ".custom-dark",
    }),
  ]).process(input, { from: undefined });
  expect(result.css).toMatchSnapshot();
});

test("handles CSS with no variables", async () => {
  const input = "body { color: red; }";
  const result = await postcss([radwindPlugin()]).process(input, {
    from: undefined,
  });
  expect(result.css).toMatchSnapshot();
});
