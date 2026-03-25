import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'
import { cpSync } from 'fs'

// Copy ../assets into public/assets before build so Vite includes them in dist/
function copyParentAssets(): import('vite').Plugin {
  const src = path.resolve(__dirname, '../assets')
  const dest = path.resolve(__dirname, 'public/assets')
  return {
    name: 'copy-parent-assets',
    buildStart() {
      if (fs.existsSync(src) && !fs.existsSync(dest)) {
        cpSync(src, dest, { recursive: true })
      }
    },
  }
}

// Serve ../assets during development so asset paths like /assets/... resolve
function serveParentAssets(): import('vite').Plugin {
  const assetsDir = path.resolve(__dirname, '../assets')
  return {
    name: 'serve-parent-assets',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url?.startsWith('/assets/')) return next()
        const filePath = path.join(assetsDir, req.url.substring(7))
        const resolved = path.resolve(filePath)
        if (!resolved.startsWith(assetsDir)) return next()
        if (!fs.existsSync(resolved) || !fs.statSync(resolved).isFile()) return next()
        const ext = path.extname(resolved).toLowerCase()
        const mimeTypes: Record<string, string> = {
          '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
          '.gif': 'image/gif', '.webp': 'image/webp', '.json': 'application/json',
          '.svg': 'image/svg+xml',
        }
        res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream')
        res.setHeader('Cache-Control', 'max-age=3600')
        fs.createReadStream(resolved).pipe(res)
      })
    },
  }
}

export default defineConfig({
  base: './',
  plugins: [react(), serveParentAssets(), copyParentAssets()],
})
