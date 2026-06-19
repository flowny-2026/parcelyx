import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync, mkdirSync, existsSync } from 'fs'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-admin-files',
      closeBundle() {
        // Garante que a pasta dist existe
        if (!existsSync('dist')) {
          mkdirSync('dist', { recursive: true })
        }
        
        // Arquivos do admin para copiar
        const files = [
          'admin.html',
          'admin.css',
          'admin.js',
          'supabase-config.js',
          'supabase-auth.js'
        ]
        
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
  }
})
