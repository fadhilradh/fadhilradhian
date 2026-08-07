import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/server.ts'],
  format: ['esm'],
  target: 'node22',
  platform: 'node',
  outDir: 'dist',
  clean: true,
  sourcemap: true,
  // Workspace packages are shipped as TypeScript source, so they must be
  // bundled rather than left as bare imports node cannot resolve.
  noExternal: [/^@niaga\//],
});
