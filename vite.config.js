import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // em desenvolvimento, as chamadas para /api vão para o server-dev.js (porta 3001)
  server: {
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
})
