import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173, // ou outra porta livre
    strictPort: true,
    open: true // abre navegador automaticamente
  }
})