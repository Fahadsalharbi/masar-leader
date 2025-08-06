import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './', // مهم جداً ليشتغل الموقع بشكل صحيح عند النشر
})
