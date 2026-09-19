import type { CSSProperties } from 'react'
import { incrementLife, tapExtraButton, advanceTurn, defeatPlayer } from '../state/gameStore'
import { getCharacter } from '../domain/characters'
import { backgroundArt, extraArt } from '../art'
import type { PlayerModel } from '../domain/types'
import { useHold } from '../hooks/useHold'

/**
 * Per-pool width weights, ported from Android's applyLifeSegmentWeights:
 * a solo fighter fills the panel; a duo splits it 15:9 (main gets more room
 * than the sidekick); the Raptors split evenly in three.
 */
const POOL_WEIGHTS: Record<number, number[]> = {
  1: [1],
  2: [15, 9],
  3: [1, 1, 1],
}

/**
 * One player's life counter, rotated so it faces the seated player. A single
 * character background fills the panel; the life pools sit on top, split by the
 * per-character weights and separated by a thin dark divider.
 */
export function PlayerPanel({
  player,
  rotation,
  extraCorner,
  isTurn,
  onDefeatedClick,
}: {
  player: PlayerModel
  rotation: number
  /** Which bottom corner (panel space) the floating extra button sits in. */
  extraCorner: 'left' | 'right'
  /** Whether it's this player's turn (drives the badge highlight + tap-to-pass). */
  isTurn: boolean
  /** Tapping the DEAD legend asks to revive; handled by the parent (popup). */
  onDefeatedClick: () => void
}) {
  const character = getCharacter(player.characterName)
  const poolCount = player.lifeSegments.length
  const weights = POOL_WEIGHTS[poolCount] ?? player.lifeSegments.map(() => 1)
  // Every tracked pool at 0 → eligible to be marked defeated (manual, since some
  // sidekicks aren't tracked here). Once defeated, they're out of the rotation.
  const allPoolsOut = player.lifeSegments.every((life) => life <= 0)

  return (
    <div
      className={`panel panel--rot-${((rotation % 360) + 360) % 360} panel--pools-${poolCount}${
        player.defeated ? ' panel--defeated' : ''
      }`}
    >
      <img className="panel__bg" src={backgroundArt(character.background)} alt="" aria-hidden />

      {/* Seat badge (P1, P2, …) pinned to the panel's OUTER top corner (the same
          outer side as the extra button, away from the central hub). It sits
          inside the rotated panel, so it reads upright for that player. It's the
          TURN indicator + control: highlighted (red outline) on this player's
          turn, and tapping it (only enabled on your turn) passes to the next
          living player. Disabled otherwise. */}
      <button
        type="button"
        className={`panel__seat panel__seat--${extraCorner}${isTurn ? ' panel__seat--turn' : ''}`}
        onClick={advanceTurn}
        disabled={!isTurn}
        aria-label={isTurn ? `Player ${player.id + 1} — end turn` : `Player ${player.id + 1}`}
        title={isTurn ? 'End turn' : undefined}
      >
        P{player.id + 1}
      </button>

      {/* Defeat control, shown once every tracked pool hits 0. DEFEATED? marks
          the player out (leaves the rotation); after that it reads DEAD and a
          tap asks to revive. */}
      {player.defeated ? (
        <button
          type="button"
          className="panel__defeat panel__defeat--dead"
          onClick={onDefeatedClick}
          aria-label={`Player ${player.id + 1} is dead — revive?`}
        >
          DEAD
        </button>
      ) : (
        allPoolsOut && (
          <button
            type="button"
            className="panel__defeat"
            onClick={() => defeatPlayer(player.id)}
            aria-label={`Mark player ${player.id + 1} defeated`}
          >
            DEFEATED?
          </button>
        )
      )}

      <div className="panel__pools">
        {player.lifeSegments.map((life, i) => (
          <LifePool
            key={i}
            playerId={player.id}
            segmentIndex={i}
            weight={weights[i]}
            divider={i > 0}
            label={player.lifeSegmentLabels[i]}
            life={life}
            overlay={character.poolOverlays?.[i]}
          />
        ))}
      </div>

      {player.extraButtonValue !== null && character.extraButton && (
        <ExtraButton
          playerId={player.id}
          spec={character.extraButton}
          value={player.extraButtonValue}
          corner={extraCorner}
        />
      )}
    </div>
  )
}

function LifePool({
  playerId,
  segmentIndex,
  weight,
  divider,
  label,
  life,
  overlay,
}: {
  playerId: number
  segmentIndex: number
  weight: number
  divider: boolean
  label: string
  life: number
  /** Optional per-pool silhouette (e.g. a Raptor) shown over the shared bg. */
  overlay?: string
}) {
  const dec = useHold(() => incrementLife(playerId, -1, segmentIndex))
  const inc = useHold(() => incrementLife(playerId, +1, segmentIndex))
  const dead = life <= 0

  const style: CSSProperties = { flexGrow: weight, flexBasis: 0 }
  const classes = ['pool']
  if (dead) classes.push('pool--dead')
  if (overlay) classes.push('pool--has-overlay')

  return (
    <div className={classes.join(' ')} style={style}>
      {divider && <span className="pool__divider" aria-hidden />}

      {/* Invisible tap zones: top half increments, bottom half decrements
          (matching the Android counter's +/− hold buttons). */}
      <button
        type="button"
        className="pool__zone pool__zone--plus"
        aria-label={`Sumar ${label}`}
        {...inc}
      />
      <button
        type="button"
        className="pool__zone pool__zone--minus"
        aria-label={`Restar ${label}`}
        {...dec}
      />

      {/* Character/pool name chip near the top, over a dark scrim for legibility. */}
      {label && <span className="pool__label">{label}</span>}

      {/* Silhouette layer (Raptors): anchored to the bottom of the pool. A
          per-asset modifier class (e.g. pool__overlay--charlie) allows tuning
          an individual silhouette's scale. */}
      {overlay && (
        <img
          className={`pool__overlay pool__overlay--${overlay.replace(/^raptors_|\.png$/g, '')}`}
          src={extraArt(overlay)}
          alt=""
          aria-hidden
        />
      )}

      {/* Life number. Centred for normal pools; raised above the silhouette
          for overlay pools. */}
      <div className="pool__content">
        <span className="pool__value">{life}</span>
      </div>
    </div>
  )
}

function ExtraButton({
  playerId,
  spec,
  value,
  corner,
}: {
  playerId: number
  spec: NonNullable<ReturnType<typeof getCharacter>['extraButton']>
  value: number
  /** Bottom corner (panel space) to pin the button to. */
  corner: 'left' | 'right'
}) {
  const cornerClass = `extra--corner-${corner}`

  if (spec.kind === 'counter') {
    return (
      <button
        type="button"
        className={`extra extra--counter ${cornerClass}`}
        onClick={() => tapExtraButton(playerId)}
        aria-label="Contador"
      >
        <img src={extraArt(spec.image)} alt="" aria-hidden />
        <span className="extra__count">{value}</span>
      </button>
    )
  }

  const s = spec.states[value % spec.states.length]
  return (
    <button
      type="button"
      className={`extra extra--toggle ${cornerClass}`}
      onClick={() => tapExtraButton(playerId)}
      style={{ backgroundColor: s.backgroundColor, color: s.textColor }}
    >
      {s.text}
    </button>
  )
}
