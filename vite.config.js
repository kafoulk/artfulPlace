import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr';
// export Vite configuration
export default defineConfig({
  plugins: [
    react(),// Enable React support
    svgr(),// Enable SVG as React components
  ],
});
