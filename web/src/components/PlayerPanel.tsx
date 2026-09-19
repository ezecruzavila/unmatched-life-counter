import { incrementLife, tapExtraButton } from '../state/gameStore'
import { getCharacter } from '../domain/characters'
import { colorById } from '../domain/gameRules'
import { art } from '../art'
import type { PlayerModel } from '../domain/types'
import { useHold } from '../hooks/useHold'

/**
 * One player's life counter, rotated so it faces the seated player. The whole
 * panel is rotated via CSS (matching Android's RotateLayout), and the extra
 * button floats in the panel's outer corner.
 */
export function PlayerPanel({ player, rotation }: { player: PlayerModel; rotation: number }) {
  const character = getCharacter(player.characterName)
  const seatColor = colorById(player.colorId).color

  return (
    <div className="panel" style={{ transform: `rotate(${rotation}deg)` }}>
      <img className="panel__bg" src={art(character.background)} alt="" aria-hidden />
      <div className="panel__tint" style={seatColor ? { boxShadow: `inset 0 0 0 4px ${seatColor}` } : undefined} />

      <div className="panel__pools">
        {player.lifeSegments.map((life, i) => (
          <LifePool
            key={i}
            playerId={player.id}
            segmentIndex={i}
            label={player.lifeSegmentLabels[i]}
            life={life}
            max={player.lifeSegmentMaximums[i]}
          />
        ))}
      </div>

      {player.extraButtonValue !== null && character.extraButton && (
        <ExtraButton
          playerId={player.id}
          spec={character.extraButton}
          value={player.extraButtonValue}
        />
      )}
    </div>
  )
}

function LifePool({
  playerId,
  segmentIndex,
  label,
  life,
  max,
}: {
  playerId: number
  segmentIndex: number
  label: string
  life: number
  max: number
}) {
  const dec = useHold(() => incrementLife(playerId, -1, segmentIndex))
  const inc = useHold(() => incrementLife(playerId, +1, segmentIndex))

  return (
    <div className="pool">
      <button
        type="button"
        className="pool__btn pool__btn--minus"
        aria-label={`Restar ${label}`}
        {...dec}
      >
        −
      </button>
      <div className="pool__center">
        <span className="pool__value">{life}</span>
        <span className="pool__label">
          {label}
          {max ? ` · ${max}` : ''}
        </span>
      </div>
      <button
        type="button"
        className="pool__btn pool__btn--plus"
        aria-label={`Sumar ${label}`}
        {...inc}
      >
        +
      </button>
    </div>
  )
}

function ExtraButton({
  playerId,
  spec,
  value,
}: {
  playerId: number
  spec: NonNullable<ReturnType<typeof getCharacter>['extraButton']>
  value: number
}) {
  if (spec.kind === 'counter') {
    return (
      <button
        type="button"
        className="extra extra--counter"
        onClick={() => tapExtraButton(playerId)}
        aria-label="Contador"
      >
        <img src={art(spec.image)} alt="" aria-hidden />
        <span className="extra__count">{value}</span>
      </button>
    )
  }

  const s = spec.states[value % spec.states.length]
  return (
    <button
      type="button"
      className="extra extra--toggle"
      onClick={() => tapExtraButton(playerId)}
      style={{ backgroundColor: s.backgroundColor, color: s.textColor }}
    >
      {s.text}
    </button>
  )
}
