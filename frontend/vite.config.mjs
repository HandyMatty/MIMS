import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  return {
    build: {
      outDir: "dist",
      rollupOptions: {
        output: {
          chunkFileNames: 'js/[name]-[hash].js',
          entryFileNames: 'js/[name]-[hash].js',
          assetFileNames: (assetInfo) => {
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
    base: env.VITE_BASE_URL || '/',
    server: {
      historyApiFallback: true,
    },
  };
});