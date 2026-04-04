import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // Include static assets in precache
      includeAssets: ['favicon.ico', 'icon.svg', 'icons/*.png'],
      manifest: {
        name: 'Zakupowo',
        short_name: 'Zakupowo',
        description: 'Wspólna lista zakupów dla dwojga',
        theme_color: '#6366f1',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        // Precache all built assets
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        // SPA fallback — all navigation goes to index.html
        navigateFallback: 'index.html',
        // Firebase SDK handles its own Firestore offline caching —
        // avoid double-caching Firestore API requests
        navigateFallbackDenylist: [/^\/__(.*)/],
        runtimeCaching: [],
      },
    }),
  ],
})
