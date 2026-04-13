import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
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
      if (fs.existsSync(src)) {
        cpSync(src, dest, { recursive: true, force: true })
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
        // Match /assets/... or /seppo_rpg/assets/...
        let assetPath: string | null = null
        if (req.url?.startsWith('/assets/')) {
          assetPath = req.url.substring(7)
        } else if (req.url?.startsWith('/seppo_rpg/assets/')) {
          assetPath = req.url.substring(18)
        }
        if (!assetPath) return next()
        const filePath = path.join(assetsDir, assetPath)
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
  base: '/seppo_rpg/',
  plugins: [
    react(),
    serveParentAssets(),
    copyParentAssets(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['assets/**/*'],
      manifest: {
        name: "Seppo's Last Round",
        short_name: 'Seppo RPG',
        description: 'A pixel-art bar-crawl RPG',
        theme_color: '#1a1a2e',
        background_color: '#1a1a2e',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/seppo_rpg/',
        start_url: '/seppo_rpg/',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,woff2}'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        navigateFallback: '/seppo_rpg/index.html',
        runtimeCaching: [
          {
            urlPattern: /\/assets\/.*\.(?:png|jpg|webp|json)$/i,
            handler: 'CacheFirst',
            options: { cacheName: 'game-assets', expiration: { maxEntries: 500, maxAgeSeconds: 60 * 60 * 24 * 30 } },
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: { cacheName: 'google-fonts-css', expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 } },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: { cacheName: 'google-fonts-webfont', expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 } },
          },
        ],
      },
    }),
  ],
})
