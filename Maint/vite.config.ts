

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  root: 'client',
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client/src"),
    },
  },
  server: {
    port: 5173,
  },
  css: {
    postcss: path.resolve(__dirname, 'client/postcss.config.cjs'),
  },
});
