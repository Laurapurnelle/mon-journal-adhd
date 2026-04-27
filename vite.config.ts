import { defineConfig } from 'vite';

export default defineConfig({
  base: '/mon-journal-adhd/',
  build: {
    outDir: 'docs',
    emptyOutDir: true,
  },
});
