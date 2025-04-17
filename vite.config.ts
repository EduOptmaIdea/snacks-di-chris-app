import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react({
    jsxRuntime: 'classic' // Adicione esta linha se usar React 16+
  })],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    host: true,
    port: 5174,
    strictPort: true,
    open: true,
    cors: true
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true
  }
})