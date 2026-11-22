import { defineConfig } from 'vitest/config';

export default defineConfig({
  build: {
    target: ['es2022', 'safari16'],
    rollupOptions: {
      output: {
        // three.js in its own chunk: cached across deploys and keeps the app chunk small.
        manualChunks: (id) => (id.includes('node_modules/three/') ? 'three' : undefined),
      },
    },
    // three.js alone is ~500 kB minified (~130 kB gzipped); the first-load budget is 1 MB gzipped.
    chunkSizeWarningLimit: 800,
  },
  test: { include: ['src/**/*.test.ts'], environment: 'node' },
});
