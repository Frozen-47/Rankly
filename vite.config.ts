import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // Forward any request starting with /api to your Express server
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      }
    }
  }
})