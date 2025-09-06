import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./setupTests.ts",
    coverage: {
      provider: "istanbul",
      reporter: ["text", "html"],
    },
  },
  server: {
    port: 5173,
    open: true,
  },
  optimizeDeps: {
    include: ["react", "react-dom"],
  },
});
