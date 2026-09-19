# UnmatchedCounter — Web (PWA)

Web port of the UnmatchedCounter life & effect tracker, built with React + Vite +
TypeScript. Runs entirely in the browser (no server), works offline, and can be
installed to the home screen on Android, iPad/iPhone (Safari), and desktop.

The game domain — the 23 fighters, their life pools, labels, setup accent colors,
and floating extra buttons (Muldoon's trap counter, Schrödinger's / Alice's
toggles) — is ported 1:1 from the Android sources under `../app`. Character art is
copied verbatim from `../app/src/main/res/drawable-nodpi` into `public/art`.

## Develop

```bash
cd web
npm install
npm run dev        # http://localhost:5173
```

## Build & preview

```bash
npm run build      # outputs to dist/
npm run preview    # serve the production build (also on your LAN with --host)
```

## Use on a tablet / phone

1. `npm run preview -- --host` and open the printed LAN URL on the device
   (or deploy `dist/` to any static host — GitHub Pages, Netlify, etc.).
2. Android/Chrome: menu → "Add to Home screen".
   iPad/iPhone Safari: Share → "Add to Home Screen".
3. Once loaded, it works offline — all art is cached by the service worker.

## Install to home screen (why PWA)

Because it's a Progressive Web App, it installs like a native app and runs 100%
locally on the device — no connection needed at the game table.
