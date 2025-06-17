import { defineConfig } from "vite";
import radwind from "radwind/vite";

export default defineConfig({
  plugins: [radwind()],
  build: {
    minify: false,
    rollupOptions: {
      input: "input.css",
      output: {
        assetFileNames: "output.css"
      }
    }
  }
});