import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import radwind from "radwind/vite";

export default defineConfig({
  // plugins: [tailwindcss()],
  plugins: [tailwindcss(), radwind()],
});
