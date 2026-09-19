import { useAppState } from './state/gameStore'
import { SetupScreen } from './components/SetupScreen'
import { GameScreen } from './components/GameScreen'

export function App() {
  const { screen } = useAppState()
  // Setup is ALWAYS portrait; the game is ALWAYS landscape — each rotates 90°
  // when the device is held the "wrong" way for that screen.
  return (
    <div className={`app-frame app-frame--${screen}`}>
      {screen === 'game' ? <GameScreen /> : <SetupScreen />}
    </div>
  )
}
