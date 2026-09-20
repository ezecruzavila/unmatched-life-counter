import { useState } from 'react'
import type { CSSProperties } from 'react'
import {
  useAppState,
  setPlayerCharacter,
  confirmPlayer,
  resetGame,
  backToHome,
  revivePlayer,
} from '../state/gameStore'
import { SEAT_ROTATION, EXTRA_BUTTON_CORNER, tabletopPositionsFor } from '../domain/gameRules'
import { CHARACTER_NAMES_SORTED, getCharacter } from '../domain/characters'
import { characterArt, uiArt } from '../art'
import type { PlayerSetup } from '../domain/types'
import { PlayerPanel } from './PlayerPanel'

type Confirm = 'reset' | 'home' | null

/**
 * The unified table: character selection and the life counter share ONE screen.
 * Every seat sits in its final tabletop position from the start. A seat begins
 * in "selecting" mode (pick a character, then tap CONFIRM); confirming flips
 * just that seat in place to its life counter, leaving the others untouched.
 * The centre hub menu restarts every seat back to selection (keeping each
 * chosen character) or exits to Home.
 */
export function TableScreen() {
  const { setupPlayers, playerCount, models, currentTurn } = useAppState()
  const positions = tabletopPositionsFor(playerCount)
  const [confirm, setConfirm] = useState<Confirm>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  // Player id whose DEAD legend was tapped — drives the "Revive player?" popup.
  const [reviveId, setReviveId] = useState<number | null>(null)
  const closeMenu = () => setMenuOpen(false)

  const active = setupPlayers.slice(0, playerCount)

  return (
    <div className="table-wrap">
      <div className={`table table--${playerCount}`}>
        {active.map((setup, i) => {
          const position = positions[i]
          const rotation = SEAT_ROTATION[position]
          const model = models[setup.id]
          return (
            <div
              key={setup.id}
              className={`table__seat table__seat--${position.toLowerCase()}`}
            >
              {model ? (
                <PlayerPanel
                  player={model}
                  rotation={rotation}
                  extraCorner={EXTRA_BUTTON_CORNER[position]}
                  isTurn={currentTurn === model.id}
                  onDefeatedClick={() => setReviveId(model.id)}
                />
              ) : (
                <SeatSelector player={setup} rotation={rotation} />
              )}
            </div>
          )
        })}

        {/*
          Centre hub: a single toggle that expands to reveal restart + exit.
          Restart sends every seat back to character selection (keeping each
          chosen character); exit returns to Home.
        */}
        <div className={`table__hub ${menuOpen ? 'table__hub--open' : ''}`}>
          <button
            type="button"
            className="hub-btn hub-btn--action hub-btn--reset"
            onClick={() => {
              setConfirm('reset')
              closeMenu()
            }}
            title="Restart"
            aria-label="Restart — back to character selection"
            tabIndex={menuOpen ? 0 : -1}
          >
            <ReloadIcon />
          </button>
          <button
            type="button"
            className="hub-btn hub-btn--action hub-btn--exit"
            onClick={() => {
              setConfirm('home')
              closeMenu()
            }}
            title="Home"
            aria-label="Back to home screen"
            tabIndex={menuOpen ? 0 : -1}
          >
            <HomeIcon />
          </button>

          {/* Always-visible toggle (the provided menu asset). */}
          <button
            type="button"
            className="hub-btn hub-btn--toggle"
            onClick={() => setMenuOpen((o) => !o)}
            title="Menu"
            aria-label="Menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? (
              <CloseIcon />
            ) : (
              <img className="hub-btn__img" src={uiArt('buttons/menu.webp')} alt="" aria-hidden />
            )}
          </button>
        </div>
      </div>

      {/* Tap-away scrim to close the open menu. */}
      {menuOpen && <div className="hub-scrim" onClick={closeMenu} />}

      {confirm && (
        <ConfirmDialog
          title={confirm === 'reset' ? 'Restart' : 'Home'}
          message={
            confirm === 'reset'
              ? 'Send every seat back to character selection? Life totals will be lost.'
              : 'Return to the home screen?'
          }
          onCancel={() => setConfirm(null)}
          onConfirm={() => {
            if (confirm === 'reset') resetGame()
            else backToHome()
            setConfirm(null)
          }}
        />
      )}

      {reviveId !== null && (
        <ConfirmDialog
          title="Revive player"
          message="Revive this player?"
          onCancel={() => setReviveId(null)}
          onConfirm={() => {
            revivePlayer(reviveId)
            setReviveId(null)
          }}
        />
      )}
    </div>
  )
}

/**
 * A seat still choosing its character. Fills the same footprint the life counter
 * will occupy and is rotated to face the seated player (top row 180°), so tapping
 * CONFIRM flips the seat in place with no shift.
 */
function SeatSelector({ player, rotation }: { player: PlayerSetup; rotation: number }) {
  const character = getCharacter(player.characterName)
  const accent = character.setupAccentColor
  const rot = ((rotation % 360) + 360) % 360

  return (
    <div
      className={`seat-sel seat-sel--rot-${rot}`}
      style={{ '--sel-accent': accent } as CSSProperties}
    >
      <div className="seat-sel__inner">
        {/* Avatar + "Player N" label. Stacked by default; on the Galaxy Tab A7
            Lite viewport they sit side by side (see styles.css media query).
            Avatar is hidden on phones where it would push the controls off the
            seat — see the media query in styles.css. */}
        <div className="seat-sel__id">
          <img
            className="seat-sel__avatar"
            style={{ borderColor: accent }}
            src={characterArt(character.slug, 'avatar')}
            alt={character.displayName}
          />
          <span className="seat-sel__seat">Player {player.id + 1}</span>
        </div>
        <CharacterDropdown
          value={player.characterName}
          accent={accent}
          onChange={(name) => setPlayerCharacter(player.id, name)}
        />
        <button
          type="button"
          className="seat-sel__confirm"
          style={{ background: accent }}
          onClick={() => confirmPlayer(player.id)}
        >
          CONFIRM
        </button>
      </div>
    </div>
  )
}

/**
 * Custom character dropdown. A native <select> renders its option list in the OS
 * coordinate space and ignores our per-seat `transform: rotate()`, so a player
 * across the table would see the list upside-down (or, on iOS, a bottom sheet).
 * This listbox lives INSIDE the rotated seat, so the menu inherits the rotation
 * and opens facing the correct player.
 */
function CharacterDropdown({
  value,
  accent,
  onChange,
}: {
  value: string
  accent: string
  onChange: (name: string) => void
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className={`cdrop ${open ? 'cdrop--open' : ''}`} style={{ borderColor: accent }}>
      <button
        type="button"
        className="cdrop__trigger"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="cdrop__value">{value}</span>
        <span className="cdrop__chevron" aria-hidden>▾</span>
      </button>

      {open && (
        <>
          {/* Tap-away closes the list. Kept inside the seat so it also rotates. */}
          <div className="cdrop__scrim" onClick={() => setOpen(false)} />
          <ul className="cdrop__list" role="listbox">
            {CHARACTER_NAMES_SORTED.map((name) => (
              <li
                key={name}
                role="option"
                aria-selected={name === value}
                className={`cdrop__opt ${name === value ? 'cdrop__opt--sel' : ''}`}
                onClick={() => {
                  onChange(name)
                  setOpen(false)
                }}
              >
                {name}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}

function ConfirmDialog({
  title,
  message,
  onCancel,
  onConfirm,
}: {
  title: string
  message: string
  onCancel: () => void
  onConfirm: () => void
}) {
  return (
    <div className="dialog__overlay" onClick={onCancel}>
      <div
        className="dialog"
        role="alertdialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="dialog__title">{title}</h2>
        <p className="dialog__message">{message}</p>
        <div className="dialog__actions">
          <button type="button" className="dialog__btn" onClick={onCancel}>
            No
          </button>
          <button
            type="button"
            className="dialog__btn dialog__btn--primary"
            onClick={onConfirm}
          >
            Yes
          </button>
        </div>
      </div>
    </div>
  )
}

/** Circular-arrow "restart" glyph. */
function ReloadIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M20 12a8 8 0 1 1-2.34-5.66M20 4v4h-4"
      />
    </svg>
  )
}

/** Home glyph — a house outline. */
function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 11l8-6 8 6M6 10v9a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-9M10 20v-5h4v5"
      />
    </svg>
  )
}

/** Close glyph — a plain X (shown when the menu is open). */
function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        d="M6 6l12 12M18 6L6 18"
      />
    </svg>
  )
}
