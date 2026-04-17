import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  base: '/ThreeReact-Lab/forest/',
  server: {
    port: 3001,
  },
  plugins: [react()],
});
