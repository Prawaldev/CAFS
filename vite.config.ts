import { defineConfig } from 'vite'

export default defineConfig(({ command }) => ({
  base: command === 'serve' ? '/' : '/CAFS/',
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
}))
