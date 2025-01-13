import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    outDir: "dist",
  },
  plugins: [react()],
  base: './',
  server: {
    historyApiFallback: true, // Ensure history fallback is enabled for React Router
  },
});
