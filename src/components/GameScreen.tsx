import { useAppState, resetGame, backToSetup } from '../state/gameStore'
import { SEAT_ROTATION, tabletopPositionsFor } from '../domain/gameRules'
import { PlayerPanel } from './PlayerPanel'

export function GameScreen() {
  const { gamePlayers, playerCount } = useAppState()
  const positions = tabletopPositionsFor(playerCount)

  return (
    <div className={`table table--${playerCount}`}>
      {gamePlayers.map((player, i) => {
        const position = positions[i]
        return (
          <div
            key={player.id}
            className={`table__seat table__seat--${position.toLowerCase()}`}
          >
            <PlayerPanel player={player} rotation={SEAT_ROTATION[position]} />
          </div>
        )
      })}

      <div className="table__hub">
        <button type="button" className="hub-btn" onClick={resetGame} title="Reiniciar">
          ↺
        </button>
        <button type="button" className="hub-btn" onClick={backToSetup} title="Volver al setup">
          ⚙
        </button>
      </div>
    </div>
  )
}
