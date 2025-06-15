import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://chatapp-wl3v.onrender.com', // your backend port
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
