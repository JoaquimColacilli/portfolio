import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Relative base: the same build works on Netlify, on a sub-path and in previews.
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    target: 'es2022',
    chunkSizeWarningLimit: 1400,
  },
});
