import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: 'sistema-obras', // ⚠️ troque pelo nome exato do repo do GitHub
})
