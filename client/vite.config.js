import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Dev-only: lets the browser call /api without CORS, so dev and
    // production hit the same relative paths.
    proxy: {
      '/api': {
        target: `http://localhost:${process.env.PORT || 8787}`,
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
