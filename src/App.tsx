import { useAppState } from './state/gameStore'
import { SetupScreen } from './components/SetupScreen'
import { GameScreen } from './components/GameScreen'

export function App() {
  const { screen } = useAppState()
  return screen === 'game' ? <GameScreen /> : <SetupScreen />
}
