import { defineConfig } from 'vite'

export default defineConfig({
  base: '/CAFS/',
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})