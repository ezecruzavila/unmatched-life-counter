import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { version } from './package.json'

// Served under a subpath on GitHub Pages etc.; use relative base so it works anywhere.
export default defineConfig({
  base: './',
  // Expose the package version to the app (shown in the setup footer).
  define: {
    __APP_VERSION__: JSON.stringify(version),
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['art/**/*.png', 'favicon.svg'],
      manifest: {
        name: 'Unmatched Counter',
        short_name: 'Unmatched',
        description: 'Life & effect tracker for the Unmatched board game.',
        theme_color: '#121212',
        background_color: '#121212',
        display: 'standalone',
        // Both device orientations are allowed; the app rotates each screen
        // itself (setup → portrait, game → landscape) via CSS.
        orientation: 'any',
        start_url: './',
        scope: './',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Cache the app shell + all character art so the game works fully offline.
        globPatterns: ['**/*.{js,css,html,png,svg,woff2}'],
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
      },
    }),
  ],
})
