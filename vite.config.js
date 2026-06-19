import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync } from 'fs'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-admin-files',
      closeBundle() {
        // Copia os arquivos do admin para a pasta dist após o build
        const files = ['admin.html', 'admin.css', 'admin.js', 'supabase-config.js', 'supabase-auth.js']
        files.forEach(file => {
          try {
            copyFileSync(file, resolve('dist', file))
            console.log(`✅ Copiado: ${file}`)
          } catch (err) {
            console.warn(`⚠️ Não foi possível copiar ${file}:`, err.message)
          }
        })
      }
    }
  ],
  server: {
    port: 3000
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      }
    }
  }
})
