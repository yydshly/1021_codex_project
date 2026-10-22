import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  server: { host: '127.0.0.1', port: 5215, strictPort: true },
  build: {
    outDir: '../web',
    emptyOutDir: true,
    rollupOptions: { input: { research: 'index.html', scene: 'scene.html' } },
  },
});
