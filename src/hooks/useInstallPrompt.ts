import { useEffect, useState, useSyncExternalStore } from 'react'
import {
  subscribeInstall,
  getDeferredPrompt,
  isInstalledFlag,
  runInstallPrompt,
} from '../installState'

/** True when the app is already running installed (standalone / fullscreen). */
function isRunningStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches ||
    window.matchMedia('(display-mode: minimal-ui)').matches ||
    // iOS Safari's non-standard flag.
    (navigator as unknown as { standalone?: boolean }).standalone === true
  )
}

/**
 * PWA install affordance. Returns `canInstall` (a deferred install prompt was
 * captured AND we're not already installed) and `promptInstall` to fire it.
 *
 * The prompt event is captured at module load in installState (it can fire
 * before React mounts); this hook just subscribes to that store, so it works
 * even if the event arrived before the component rendered.
 */
export function useInstallPrompt() {
  // Re-render whenever the global install state changes (event captured / used
  // / appinstalled). We read the deferred prompt inside the snapshot.
  const hasPrompt = useSyncExternalStore(
    subscribeInstall,
    () => getDeferredPrompt() !== null || isInstalledFlag(),
  )
  void hasPrompt // subscription trigger; actual values read below

  const [standalone, setStandalone] = useState(isRunningStandalone)

  useEffect(() => {
    const mql = window.matchMedia('(display-mode: standalone)')
    const onChange = () => {
      if (isRunningStandalone()) setStandalone(true)
    }
    mql.addEventListener?.('change', onChange)
    return () => mql.removeEventListener?.('change', onChange)
  }, [])

  const installed = standalone || isInstalledFlag()
  const canInstall = !installed && getDeferredPrompt() !== null

  return { canInstall, promptInstall: runInstallPrompt }
}
