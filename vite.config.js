import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/mental-math-trainer/' : '/',
  plugins: [vue()],
  server: {
    port: 3000
  }
})
