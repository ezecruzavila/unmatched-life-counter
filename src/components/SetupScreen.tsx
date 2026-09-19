import type { CSSProperties } from 'react'
import { useAppState, setPlayerCharacter, setPlayerCount, startGame } from '../state/gameStore'
import { CHARACTER_NAMES_SORTED, getCharacter } from '../domain/characters'
import { SUPPORTED_PLAYER_COUNTS } from '../domain/gameRules'
import { art } from '../art'
import type { PlayerSetup } from '../domain/types'

/**
 * Which corner of each card is "bitten" so the four cards converge on the
 * centre hub (top-left, top-right, bottom-left, bottom-right seats).
 */
const BITE_CORNER: Array<'tl' | 'tr' | 'bl' | 'br'> = ['br', 'bl', 'tr', 'tl']

export function SetupScreen() {
  const { setupPlayers, playerCount } = useAppState()
  // Always render the full 2×2 grid; in 2-player mode the bottom two seats are
  // dimmed and non-interactive instead of removed (keeps the layout intact).

  return (
    <div className="setup">
      <h1 className="setup__title">Unmatched Life Counter</h1>

      {/* Two-tone divider with a centre diamond. */}
      <div className="setup__divider">
        <span className="setup__divider-line setup__divider-line--left" />
        <span className="setup__diamond" />
        <span className="setup__divider-line setup__divider-line--right" />
      </div>

      <div className="setup__count">
        <span className="setup__count-label">PLAYERS</span>
        <div className="setup__count-buttons">
          {SUPPORTED_PLAYER_COUNTS.map((count) => (
            <button
              key={count}
              type="button"
              className={`count-btn ${playerCount === count ? 'count-btn--active' : ''}`}
              onClick={() => setPlayerCount(count)}
            >
              <PersonIcon count={count} />
              {count} Players
            </button>
          ))}
        </div>
      </div>

      <div className="setup__grid">
        {/* Centre logo where the four cards converge. */}
        <img className="setup__center-logo" src={art('ic_setup_center_unmatched.png')} alt="" aria-hidden />
        {setupPlayers.map((player, i) => (
          <SetupPlayerCard
            key={player.id}
            player={player}
            bite={BITE_CORNER[i]}
            disabled={i >= playerCount}
          />
        ))}
      </div>

      <button type="button" className="setup__start" onClick={startGame}>
        <SwordsIcon />
        START GAME
      </button>
    </div>
  )
}

function SetupPlayerCard({
  player,
  bite,
  disabled,
}: {
  player: PlayerSetup
  bite: 'tl' | 'tr' | 'bl' | 'br'
  /** Seat not in play (2-player mode): dimmed and non-interactive. */
  disabled: boolean
}) {
  const character = getCharacter(player.characterName)
  const accent = disabled ? 'var(--border-disabled, #3a3a3d)' : character.setupAccentColor

  return (
    <div
      className={`pcard pcard--bite-${bite}${disabled ? ' pcard--disabled' : ''}`}
      style={{ '--pcard-border': accent } as CSSProperties}
      aria-hidden={disabled}
    >
      <img
        className="pcard__avatar"
        style={{ borderColor: accent }}
        src={art(character.avatar)}
        alt={character.displayName}
      />
      <span className="pcard__seat">Player {player.id + 1}</span>
      <div className="pcard__select-wrap" style={{ borderColor: accent }}>
        <select
          className="pcard__select"
          value={player.characterName}
          disabled={disabled}
          onChange={(e) => setPlayerCharacter(player.id, e.target.value)}
        >
          {CHARACTER_NAMES_SORTED.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
        <span className="pcard__chevron" aria-hidden>▾</span>
      </div>
    </div>
  )
}

function PersonIcon({ count }: { count: number }) {
  // One head for "2 Players", two heads for "4 Players".
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" className="count-btn__icon">
      {count === 2 ? (
        <path
          fill="currentColor"
          d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0 2c-3.3 0-8 1.7-8 5v1h16v-1c0-3.3-4.7-5-8-5Z"
        />
      ) : (
        <path
          fill="currentColor"
          d="M8 12a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm8 0a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM8 14c-3 0-7 1.5-7 4.5V20h9v-1.5c0-1.3.6-2.4 1.5-3.2C10.5 14.4 9.2 14 8 14Zm8 0c-1 0-2 .2-2.9.6 1.1.9 1.9 2 1.9 3.4V20h8v-1.5c0-3-4-4.5-7-4.5Z"
        />
      )}
    </svg>
  )
}

function SwordsIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" className="setup__start-icon">
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M14.5 3.5 20 3l-.5 5.5-8 8M5 20l3.5-3.5M3.5 14.5 9.5 3 4 3.5 4.5 9M19 20l-3.5-3.5M4 3l16 16M4 17l3 3M20 17l-3 3"
      />
    </svg>
  )
}
