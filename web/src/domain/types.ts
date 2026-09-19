/**
 * Optional floating button shown over a player's life counter, anchored to the
 * corner of the panel furthest from the table center. Ported from the Android
 * `ExtraButtonSpec` sealed interface.
 *
 * Two flavors:
 *  - Counter: an image with a number overlaid; tapping decrements it, wrapping
 *    back to `start` once it passes 0.
 *  - Toggle: a text label that cycles through a fixed set of states, each with
 *    its own text color and background color.
 *
 * The mutable state is a single number held on the player model:
 *  - Counter -> the current count.
 *  - Toggle  -> the index of the current state.
 */
export interface CounterButton {
  kind: 'counter'
  /** Filename under /art for the counter art (e.g. Muldoon's trap triangle). */
  image: string
  /** Starting count; each tap subtracts 1, wrapping 0 -> start. */
  start: number
}

export interface ToggleState {
  text: string
  textColor: string
  backgroundColor: string
}

export interface ToggleButton {
  kind: 'toggle'
  states: ToggleState[]
}

export type ExtraButtonSpec = CounterButton | ToggleButton

/** The initial stored value for a fresh game/reset. */
export function initialExtraValue(spec: ExtraButtonSpec): number {
  return spec.kind === 'counter' ? spec.start : 0
}

/** Next value after a tap: counters decrement (wrap to start), toggles advance (wrap to 0). */
export function nextExtraValue(spec: ExtraButtonSpec, current: number): number {
  if (spec.kind === 'counter') {
    return current <= 0 ? spec.start : current - 1
  }
  return (current + 1) % spec.states.length
}

/** A playable Unmatched fighter and all of its per-character presentation. */
export interface Character {
  /** Canonical display name (matches the Android fighter list). */
  displayName: string
  /** One label per life pool (same order/length as startingLifeSegments). */
  segmentLabels: string[]
  /** Panel art filename under /art (behind the life digits). */
  background: string
  /** Round avatar filename under /art (setup card + spinner). */
  avatar: string
  /** Non-empty list (length 1..3) of starting life per pool. */
  startingLifeSegments: number[]
  /** Setup accent color (card / spinner / avatar borders), CSS hex. */
  setupAccentColor: string
  /** Optional floating extra button; undefined = none. */
  extraButton?: ExtraButtonSpec
}

/** One player's colored seat color. */
export interface PlayerColor {
  id: string
  /** CSS color, or null for NONE. */
  color: string | null
}

/** Per-seat setup choices made on the setup screen. */
export interface PlayerSetup {
  id: number
  characterName: string
  colorId: string
  startingLifeSegments: number[]
}

/** Live per-player state during a game. */
export interface PlayerModel {
  id: number
  characterName: string
  lifeSegmentLabels: string[]
  /** Per-pool ceiling (starting life); current value never exceeds this. */
  lifeSegmentMaximums: number[]
  /** Current life per pool. */
  lifeSegments: number[]
  colorId: string
  /** Current extra-button value, or null if this character has none. */
  extraButtonValue: number | null
}
