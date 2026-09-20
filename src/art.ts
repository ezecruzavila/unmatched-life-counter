/**
 * Art lives under /art in two trees:
 *   characters/<slug>/   per-fighter art: avatar.webp, background.webp, and any
 *                        extras (e.g. loki/tricks.webp, raptors/blue.webp).
 *   ui/                  app chrome, independent of any fighter:
 *                        backgrounds/ logos/ icons/ buttons/
 *
 * A character's art is derived from its `slug` (see characters.ts), so there is
 * a single source of truth per fighter — no per-asset filenames to keep in sync.
 */
const url = (path: string) => `${import.meta.env.BASE_URL}art/${path}`

/**
 * Per-fighter art. `leaf` is the file's bare name without extension:
 *   characterArt('loki', 'avatar')  → art/characters/loki/avatar.webp
 *   characterArt('raptors', 'blue') → art/characters/raptors/blue.webp
 */
export const characterArt = (slug: string, leaf: string) =>
  url(`characters/${slug}/${leaf}.webp`)

/** App-chrome art. `path` is relative to art/ui, e.g. 'logos/app.webp'. */
export const uiArt = (path: string) => url(`ui/${path}`)
