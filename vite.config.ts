import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  // css alanı kaldırıldı, Vite otomatik olarak postcss.config.cjs dosyasını bulacak
  resolve: {
    alias: {
      react: path.resolve(__dirname, 'node_modules/react'),
      'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
      // project absolute imports like '@/components/..' -> ./src
      '@': path.resolve(__dirname, 'src'),
      '@/components': path.resolve(__dirname, 'src/components'),
      '@/lib': path.resolve(__dirname, 'src/lib')
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:5001'
    }
  },
});
