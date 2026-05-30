import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: 'dist/main',
    emptyOutDir: true,
    target: 'node22',
    sourcemap: true,
    minify: false,
    lib: {
      entry: {
        main: resolve(__dirname, 'src/main/main.ts'),
        preload: resolve(__dirname, 'src/main/preload.ts')
      },
      formats: ['cjs']
    },
    rollupOptions: {
      external: ['electron', 'node:path', 'node:url'],
      output: {
        entryFileNames: '[name].cjs'
      }
    }
  }
});
