import { useState } from 'react'
import { useAppState, resetGame, backToSetup } from '../state/gameStore'
import { SEAT_ROTATION, EXTRA_BUTTON_CORNER, tabletopPositionsFor } from '../domain/gameRules'
import { PlayerPanel } from './PlayerPanel'

type Confirm = 'reset' | 'exit' | null

export function GameScreen() {
  const { gamePlayers, playerCount } = useAppState()
  const positions = tabletopPositionsFor(playerCount)
  const [confirm, setConfirm] = useState<Confirm>(null)

  return (
    <div className={`table table--${playerCount}`}>
      {gamePlayers.map((player, i) => {
        const position = positions[i]
        return (
          <div
            key={player.id}
            className={`table__seat table__seat--${position.toLowerCase()}`}
          >
            <PlayerPanel
              player={player}
              rotation={SEAT_ROTATION[position]}
              extraCorner={EXTRA_BUTTON_CORNER[position]}
            />
          </div>
        )
      })}

      <div className="table__hub">
        <button
          type="button"
          className="hub-btn"
          onClick={() => setConfirm('reset')}
          title="Restart game"
          aria-label="Restart game"
        >
          <ReloadIcon />
        </button>
        <button
          type="button"
          className="hub-btn"
          onClick={() => setConfirm('exit')}
          title="Exit game"
          aria-label="Exit game"
        >
          <ExitIcon />
        </button>
      </div>

      {confirm && (
        <ConfirmDialog
          title={confirm === 'reset' ? 'Reset Game' : 'Exit Game'}
          message={
            confirm === 'reset'
              ? 'Are you sure you want to reset the game?'
              : 'Are you sure you want to exit the game?'
          }
          onCancel={() => setConfirm(null)}
          onConfirm={() => {
            if (confirm === 'reset') resetGame()
            else backToSetup()
            setConfirm(null)
          }}
        />
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

/** Exit glyph — a plain X. */
function ExitIcon() {
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
