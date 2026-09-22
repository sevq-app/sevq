import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  // Относительный base — сайт публикуется в подпапке (GitHub Pages
  // отдаёт репозиторий по адресу /sevq/, а не с корня домена), поэтому
  // абсолютные пути к бандлу (/assets/...) вели в никуда и давали
  // пустой белый экран. С относительным base пути считаются от
  // index.html, так что деплой работает из любой подпапки.
  base: './',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
