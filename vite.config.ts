import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // Include static assets in precache
      includeAssets: ['icons/*.svg', 'icons/*.png'],
      manifest: {
        name: 'Zakupowo',
        short_name: 'Zakupowo',
        description: 'Lista zakupów i planer w stylu świeżego targu',
        lang: 'pl',
        theme_color: '#161c17',
        background_color: '#161c17',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          {
            src: '/icons/icon-app-dark.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any',
          },
          {
            src: '/icons/icon-maskable.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'maskable',
          },
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icons/icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
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
