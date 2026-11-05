import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

// https://vite.dev/config/
export default defineConfig({
  // Relative paths so the build works from any URL, such as https://<user>.github.io/office-typer/.
  base: "./",
  plugins: [react()],
  resolve: {
    // Keep in sync with "paths" in tsconfig.app.json.
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    // src/game is pure logic, so tests run in plain Node with no DOM.
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
