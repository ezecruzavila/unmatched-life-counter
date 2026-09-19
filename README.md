# UnmatchedCounter — Web (PWA)

Life counter for the **Unmatched** board game, as an installable, offline-capable
web app. Built with React + Vite + TypeScript. Runs entirely in the browser (no
server), works offline, and can be installed to the home screen on Android,
iPad/iPhone (Safari), and desktop.

This `main` branch is the **web** app. The native apps live on their own
branches:

- `android` — Android app (Kotlin, MVVM, Hilt)
- `ios` — iOS app (Swift)

The game domain — the 22 fighters, their life pools, labels, setup accent colors,
and floating extra buttons (Muldoon's trap counter, Schrödinger's / Alice's
toggles) — is ported 1:1 from the Android sources (`android` branch). Character
art is reused verbatim under `public/art`.

## Develop

```bash
npm install
npm run dev        # http://localhost:5173
```

## Build & preview

```bash
npm run build      # outputs to dist/
npm run preview    # serve the production build (add --host to expose on your LAN)
```

## Use on a tablet / phone

1. `npm run preview -- --host` and open the printed LAN URL on the device
   (or deploy `dist/` to any static host — GitHub Pages, Netlify, etc.).
2. Android/Chrome: menu → "Add to Home screen".
   iPad/iPhone Safari: Share → "Add to Home Screen".
3. Once loaded, it works offline — all art is cached by the service worker.

## Why a PWA

Because it's a Progressive Web App, it installs like a native app and runs 100%
locally on the device — no connection needed at the game table.

## Adding a character

Add an entry to [`src/domain/characters.ts`](src/domain/characters.ts) (display
name, life pools, labels, setup accent color, optional extra button) and drop the
matching `avatar_*.png` / `bg_*.png` art into [`public/art`](public/art).
