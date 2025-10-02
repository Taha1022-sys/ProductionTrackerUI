import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Tüm network interface'lerden erişim
    port: 5174,
    proxy: {
      '/api': {
        target: 'https://production-tracker-taha-aee2bubdg9hyg9g6.francecentral-01.azurewebsites.net/index.html',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
