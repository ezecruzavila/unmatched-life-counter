/**
 * Early capture of the PWA install prompt.
 *
 * `beforeinstallprompt` can fire before React mounts and any component-level
 * listener runs — if we only listened inside a useEffect we'd miss it (the
 * button would never show, notably right after (re)install or a reload). So we
 * register listeners at module load, from main.tsx, and stash the event here.
 * The hook subscribes to this store and also gets the already-captured event.
 */

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

let deferredPrompt: BeforeInstallPromptEvent | null = null
let installed = false
const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((l) => l())
}

/** Start listening ASAP (call once, before React renders). */
export function initInstallCapture() {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferredPrompt = e as BeforeInstallPromptEvent
    emit()
  })
  window.addEventListener('appinstalled', () => {
    installed = true
    deferredPrompt = null
    emit()
  })
}

export function subscribeInstall(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getDeferredPrompt(): BeforeInstallPromptEvent | null {
  return deferredPrompt
}

export function isInstalledFlag(): boolean {
  return installed
}

/** Fire the stored prompt (once). Returns the user's choice, or null if none. */
export async function runInstallPrompt(): Promise<'accepted' | 'dismissed' | null> {
  if (!deferredPrompt) return null
  await deferredPrompt.prompt()
  const choice = await deferredPrompt.userChoice
  deferredPrompt = null
  emit()
  return choice.outcome
}
