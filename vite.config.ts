import { defineConfig } from "vitest/config";
import { svelte } from "@sveltejs/vite-plugin-svelte";

export default defineConfig({
  base: "./",
  plugins: [svelte()],
  server: {
    host: true,
  },
  test: {
    include: ["tests/**/*.test.ts"],
  },
});
