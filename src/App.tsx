import { useEffect } from 'react'
import { useAppState } from './state/gameStore'
import { armFullscreenOnFirstGesture } from './fullscreen'
import { HomeScreen } from './components/HomeScreen'
import { TableScreen } from './components/TableScreen'

export function App() {
  const { screen } = useAppState()
  // On an installed PWA, re-enter fullscreen on the first tap after (re)open —
  // it can't be done automatically on load. No-op in a browser tab.
  useEffect(() => {
    armFullscreenOnFirstGesture()
  }, [])
  // Home is ALWAYS portrait; the table (character selection + life counter, now
  // unified) is ALWAYS landscape. Each frame rotates 90° when the device is held
  // the "wrong" way for that screen.
  return (
    <div className={`app-frame app-frame--${screen}`}>
      {screen === 'table' ? <TableScreen /> : <HomeScreen />}
    </div>
  )
}
