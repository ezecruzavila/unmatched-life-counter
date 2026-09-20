import { readFileSync } from 'node:fs'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { version } from './package.json'

/**
 * Optional local HTTPS, for testing the PWA (install / orientation lock) on a
 * real device over the LAN — a PWA needs a secure context, and http://<LAN-IP>
 * is NOT one (only https or localhost). Generate the certs with mkcert:
 *   mkcert -install && cd .certs && mkcert <your-LAN-IP> localhost
 * then run `npm run preview`. If the certs are absent (CI, Render) we serve
 * plain HTTP as before — Render already provides HTTPS.
 */
function localHttps() {
  try {
    return {
      key: readFileSync('.certs/192.168.1.47+2-key.pem'),
      cert: readFileSync('.certs/192.168.1.47+2.pem'),
    }
  } catch {
    return undefined
  }
}

// Served under a subpath on GitHub Pages etc.; use relative base so it works anywhere.
export default defineConfig({
  base: './',
  // Expose the package version to the app (shown in the setup footer).
  define: {
    __APP_VERSION__: JSON.stringify(version),
  },
  server: { https: localHttps() },
  preview: { https: localHttps() },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['art/**/*.webp', 'favicon.svg'],
      manifest: {
        name: 'Unmatched Counter',
        short_name: 'Unmatched',
        description: 'Life & effect tracker for the Unmatched board game.',
        theme_color: '#121212',
        background_color: '#121212',
        // Fullscreen hides BOTH the OS status bar (top) and the Android nav bar
        // (bottom) when the app is INSTALLED (Add to Home screen) — it has no
        // effect in a normal browser tab. display_override is the ordered
        // fallback chain: try fullscreen, then standalone, then minimal-ui.
        display: 'fullscreen',
        display_override: ['fullscreen', 'standalone', 'minimal-ui'],
        // Lock the INSTALLED app to portrait so the device never rotates the UI
        // (the app itself rotates each screen's content via CSS, so the physical
        // orientation must stay fixed). Only takes effect when installed (Add to
        // Home screen); a plain browser tab ignores this and follows the device.
        orientation: 'portrait',
        start_url: './',
        scope: './',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          // Maskable variant has extra padding so Android's circular/squircle
          // crop never cuts the wordmark (the previous full-bleed icon did).
          { src: 'icons/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
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
