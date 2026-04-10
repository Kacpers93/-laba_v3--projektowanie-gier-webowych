import { defineConfig } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@assets': path.resolve(__dirname, './src/presentation/assets'),
      '@dev': path.resolve(__dirname, './src/dev'),
      '@engine': path.resolve(__dirname, './src/engine'),
      '@entities': path.resolve(__dirname, './src/entities'),
      '@physics': path.resolve(__dirname, './src/physics'),
      '@presentation': path.resolve(__dirname, './src/presentation'),
      '@world': path.resolve(__dirname, './src/world'),
      '@types': path.resolve(__dirname, './src/types'),
    },
  },

  server: {
    port: 5173,
    strictPort: false,
    open: true,
  },

  build: {
    target: 'ES2020',
    minify: 'terser',
    sourcemap: false,
    outDir: 'dist',
    assetsDir: 'assets',
  },
});
