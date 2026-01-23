import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // This allows process.env.API_KEY to be replaced with the actual value at build time
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY),
  },
});