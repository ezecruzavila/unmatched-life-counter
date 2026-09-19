import {
  useAppState,
  setPlayerCharacter,
  setPlayerColor,
  setPlayerCount,
  startGame,
} from '../state/gameStore'
import {
  CHARACTER_NAMES_SORTED,
  getCharacter,
} from '../domain/characters'
import { PLAYER_COLORS, SUPPORTED_PLAYER_COUNTS, colorById } from '../domain/gameRules'
import { art } from '../art'
import type { PlayerSetup } from '../domain/types'

export function SetupScreen() {
  const { setupPlayers, playerCount } = useAppState()
  const activePlayers = setupPlayers.slice(0, playerCount)

  return (
    <div className="setup">
      <header className="setup__header">
        <img className="setup__logo" src={art('ic_setup_center_unmatched.png')} alt="Unmatched" />
        <div className="setup__count">
          {SUPPORTED_PLAYER_COUNTS.map((count) => (
            <button
              key={count}
              type="button"
              className={`count-btn ${playerCount === count ? 'count-btn--active' : ''}`}
              onClick={() => setPlayerCount(count)}
            >
              {count} jugadores
            </button>
          ))}
        </div>
      </header>

      <div className={`setup__grid setup__grid--${playerCount}`}>
        {activePlayers.map((player) => (
          <SetupPlayerCard key={player.id} player={player} />
        ))}
      </div>

      <button type="button" className="setup__start" onClick={startGame}>
        Empezar juego
      </button>
    </div>
  )
}

function SetupPlayerCard({ player }: { player: PlayerSetup }) {
  const character = getCharacter(player.characterName)
  const accent = character.setupAccentColor
  const seatColor = colorById(player.colorId).color

  return (
    <div className="pcard" style={{ borderColor: accent }}>
      <div className="pcard__top">
        <img
          className="pcard__avatar"
          style={{ borderColor: accent }}
          src={art(character.avatar)}
          alt={character.displayName}
        />
        <div className="pcard__meta">
          <span className="pcard__seat">Jugador {player.id + 1}</span>
          <span className="pcard__life">
            {character.startingLifeSegments.join(' / ')} PV
          </span>
        </div>
      </div>

      <select
        className="pcard__select"
        style={{ borderColor: accent }}
        value={player.characterName}
        onChange={(e) => setPlayerCharacter(player.id, e.target.value)}
      >
        {CHARACTER_NAMES_SORTED.map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </select>

      <div className="pcard__colors">
        {PLAYER_COLORS.map((c) => (
          <button
            key={c.id}
            type="button"
            aria-label={c.id}
            className={`swatch ${seatColor === c.color ? 'swatch--active' : ''}`}
            style={{ backgroundColor: c.color ?? undefined }}
            onClick={() => setPlayerColor(player.id, c.id)}
          />
        ))}
      </div>
    </div>
  )
}
