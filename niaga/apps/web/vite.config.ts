import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    strictPort: true,
  },
  preview: {
    port: 4173,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    // Fonts come from Google Fonts, so nothing here should be inlined as a
    // data URL and bloat the entry chunk.
    assetsInlineLimit: 0,
  },
});
