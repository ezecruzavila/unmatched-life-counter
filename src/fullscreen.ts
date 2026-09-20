/**
 * Fullscreen helpers. Browsers require a user gesture (e.g. a tap) to enter
 * fullscreen, so `requestFullscreen` must be called from within a click handler.
 * All calls are best-effort: fullscreen may be unsupported (notably iOS Safari,
 * which lacks the Element.requestFullscreen API) or blocked, so we swallow
 * errors and let the app carry on windowed.
 */

interface FsElement extends HTMLElement {
  webkitRequestFullscreen?: () => Promise<void> | void
}

/** Ask the browser to take the whole screen. No-op if unavailable/denied. */
export function enterFullscreen(): void {
  if (document.fullscreenElement) return
  const el = document.documentElement as FsElement
  try {
    const req = el.requestFullscreen?.bind(el) ?? el.webkitRequestFullscreen?.bind(el)
    // requestFullscreen returns a promise that rejects if denied — ignore it.
    void Promise.resolve(req?.()).catch(() => {})
  } catch {
    /* unsupported — stay windowed */
  }
}

/**
 * Go fullscreen on the user's FIRST interaction, from any screen. Fullscreen
 * can't be entered automatically on load (the browser requires a user gesture),
 * so when an installed PWA reopens on Home it starts windowed. This arms a
 * one-shot listener that maximises on the first tap/key anywhere, then removes
 * itself. Safe to call repeatedly; it re-arms only when not already fullscreen.
 */
export function armFullscreenOnFirstGesture(): void {
  // Standalone/installed only — in a normal browser tab, hijacking the first
  // tap to go fullscreen is intrusive (and CONTINUE already handles that flow).
  const standalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches ||
    (navigator as unknown as { standalone?: boolean }).standalone === true
  if (!standalone) return
  if (document.fullscreenElement) return

  const onFirst = () => {
    enterFullscreen()
    window.removeEventListener('pointerdown', onFirst)
    window.removeEventListener('keydown', onFirst)
  }
  // `once` isn't enough — we want it removed from BOTH events after either fires.
  window.addEventListener('pointerdown', onFirst)
  window.addEventListener('keydown', onFirst)
}
