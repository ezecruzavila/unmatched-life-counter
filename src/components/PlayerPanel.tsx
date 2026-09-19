import type { CSSProperties } from 'react'
import { incrementLife, tapExtraButton } from '../state/gameStore'
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
}: {
  player: PlayerModel
  rotation: number
  /** Which bottom corner (panel space) the floating extra button sits in. */
  extraCorner: 'left' | 'right'
}) {
  const character = getCharacter(player.characterName)
  const poolCount = player.lifeSegments.length
  const weights = POOL_WEIGHTS[poolCount] ?? player.lifeSegments.map(() => 1)

  return (
    <div
      className={`panel panel--rot-${((rotation % 360) + 360) % 360} panel--pools-${poolCount}`}
    >
      <img className="panel__bg" src={backgroundArt(character.background)} alt="" aria-hidden />

      {/* Seat badge (P1, P2, …) pinned to the panel's OUTER top corner (the same
          outer side as the extra button, away from the central hub). It sits
          inside the rotated panel, so it reads upright for that player and never
          collides with the centre. Doubles as a future turn indicator. */}
      <span className={`panel__seat panel__seat--${extraCorner}`}>P{player.id + 1}</span>

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
