import { useAppState } from './state/gameStore'
import { HomeScreen } from './components/HomeScreen'
import { TableScreen } from './components/TableScreen'

export function App() {
  const { screen } = useAppState()
  // Home is ALWAYS portrait; the table (character selection + life counter, now
  // unified) is ALWAYS landscape. Each frame rotates 90° when the device is held
  // the "wrong" way for that screen.
  return (
    <div className={`app-frame app-frame--${screen}`}>
      {screen === 'table' ? <TableScreen /> : <HomeScreen />}
    </div>
  )
}
