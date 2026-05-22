import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icon.svg'],
      manifest: {
        name: 'Shaadi Pro',
        short_name: 'Shaadi Pro',
        description: 'Professional Wedding Management — plan ceremonies, guests, vendors & budget',
        theme_color: '#C2486E',
        background_color: '#1C0F14',
        display: 'standalone',
        start_url: '/',
        orientation: 'portrait',
        categories: ['lifestyle', 'utilities'],
        icons: [
          {
            src: 'icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any',
          },
          {
            src: 'icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // Cache all static assets
        globPatterns: ['**/*.{js,css,html,ico,svg,png,woff2,woff}'],
        // Network-only for Supabase API — never cache auth or data calls
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: 'NetworkOnly',
          },
        ],
        // Fallback to /index.html for SPA navigation when offline
        navigateFallback: 'index.html',
        navigateFallbackDenylist: [/^\/api/],
      },
      devOptions: {
        // Enable SW in dev mode for testing
        enabled: false,
      },
    }),
  ],
})
