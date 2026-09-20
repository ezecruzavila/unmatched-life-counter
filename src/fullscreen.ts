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

interface FsDocument extends Document {
  webkitFullscreenElement?: Element | null
}

/** True when the Fullscreen API currently owns the screen (standard or webkit). */
function isFullscreen(): boolean {
  const doc = document as FsDocument
  return !!(document.fullscreenElement || doc.webkitFullscreenElement)
}

/** Ask the browser to take the whole screen. No-op if unavailable/denied. */
export function enterFullscreen(): void {
  if (isFullscreen()) return
  const el = document.documentElement as FsElement
  try {
    const req = el.requestFullscreen?.bind(el) ?? el.webkitRequestFullscreen?.bind(el)
    // requestFullscreen returns a promise that rejects if denied — ignore it.
    void Promise.resolve(req?.()).catch(() => {})
  } catch {
    /* unsupported — stay windowed */
  }
}

// Module-level guard so repeated calls don't stack duplicate listeners.
let armed = false

/**
 * Go fullscreen on the user's interactions, from any screen. Fullscreen can't
 * be entered automatically on load (the browser requires a user gesture), so an
 * installed PWA reopened on Home starts windowed until the user acts. This wires
 * up listeners that maximise on tap/key anywhere.
 *
 * Unlike a naive one-shot, this keeps retrying: a gesture that fails to enter
 * fullscreen (rejected/ignored) does NOT disarm us, and once the user later
 * EXITS fullscreen the listeners re-arm so the next tap maximises again.
 * Idempotent — safe to call on every render/mount.
 */
export function armFullscreenOnFirstGesture(): void {
  if (armed) return
  // Standalone/installed only — in a normal browser tab, hijacking taps to go
  // fullscreen is intrusive (and CONTINUE already handles that flow).
  const standalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches ||
    (navigator as unknown as { standalone?: boolean }).standalone === true
  if (!standalone) return
  armed = true

  // Fire on every gesture; enterFullscreen() no-ops once we're already there, so
  // this is cheap and self-limiting. We deliberately do NOT remove the listeners
  // on success — leaving them attached means a later EXIT (back/Esc/swipe) is
  // followed by the next tap re-entering fullscreen, with no re-arming needed.
  const onGesture = () => {
    if (!isFullscreen()) enterFullscreen()
  }
  window.addEventListener('pointerdown', onGesture)
  window.addEventListener('keydown', onGesture)
}
