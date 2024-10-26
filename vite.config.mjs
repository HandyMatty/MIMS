import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    outDir: "build",
  },
  plugins: [react()],
  server: {
    historyApiFallback: true, // Ensure history fallback is enabled for React Router
  },
});
