import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  define: {
    'process.env': {
      VITE_CLOUDINARY_CLOUD_NAME: JSON.stringify(process.env.VITE_CLOUDINARY_CLOUD_NAME),
      VITE_CLOUDINARY_API_KEY: JSON.stringify(process.env.VITE_CLOUDINARY_API_KEY),
      VITE_CLOUDINARY_API_SECRET: JSON.stringify(process.env.VITE_CLOUDINARY_API_SECRET)
    }
  }
});