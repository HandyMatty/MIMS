import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  build: {
    outDir: "dist",
    rollupOptions: {
      output: {
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          // Use names[0] if available, otherwise fallback to name
          const assetName = assetInfo.names?.[0] || assetInfo.name || 'asset';
          if (assetName.endsWith('.css')) {
            return 'css/[name]-[hash][extname]';
          }
          if (/\.(png|jpe?g|svg|gif|tiff|bmp|ico)$/i.test(assetName)) {
            return 'img/[name]-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        },
      },
    },
  },
  plugins: [react()],
  base: '/Sentinel-MIMS/',
  server: {
    historyApiFallback: true,
  },
});