import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// base: './' — santykiniai keliai, todėl svetainė veikia GitHub Pages
// bet kokiu repozitorijos pavadinimu (https://<vartotojas>.github.io/<repo>/),
// taip pat Vercel, Netlify ar nuosavame domene Vaidore.com.
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    open: true,
  },
})
