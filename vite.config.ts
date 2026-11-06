import { defineConfig } from 'vite'

export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/CAFS/' : '/',
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})
