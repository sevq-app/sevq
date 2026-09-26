import path from 'path';
import { readFileSync } from 'node:fs';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const packageVersion = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')).version as string;

export default defineConfig({
  // Относительный base — сайт публикуется в подпапке (GitHub Pages
  // отдаёт репозиторий по адресу /sevq/, а не с корня домена), поэтому
  // абсолютные пути к бандлу (/assets/...) вели в никуда и давали
  // пустой белый экран. С относительным base пути считаются от
  // index.html, так что деплой работает из любой подпапки.
  base: './',
  plugins: [react()],
  define: {
    __APP_RELEASE_VERSION__: JSON.stringify(packageVersion),
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
