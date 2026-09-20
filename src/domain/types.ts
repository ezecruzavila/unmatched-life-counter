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
  /**
   * Art leaf under this fighter's folder (e.g. 'trap' → muldoon/trap.webp),
   * resolved via characterArt(character.slug, image).
   */
  image: string
  /** Value shown on a fresh game / after reset. */
  start: number
  /**
   * Inclusive bounds and per-tap step. Defaults reproduce Muldoon's trap: it
   * counts DOWN from `start` and wraps back to `start` after passing `min`
   * (min 0, max = start, step -1). Taskmaster's shield counts UP (min 0, max 2,
   * step +1): 0 → 1 → 2 → 0.
   */
  min?: number
  max?: number
  step?: number
  /** Colour of the number drawn over the art. Defaults to black. */
  countColor?: string
  /** Outline colour around the number, for legibility over busy art. */
  countStroke?: string
  /**
   * Vertical nudge (CSS length) to centre the number over this specific art.
   * Defaults to '8px' — the trap triangle is widest at the bottom, so its
   * number sits slightly low. Set '0' (or a negative value) for symmetric art
   * like Taskmaster's shield.
   */
  countOffsetY?: string
  /**
   * Scale factor for the button/art relative to the default 64px counter size.
   * Defaults to 1. E.g. 0.9 renders Loki's tricks icon 10% smaller.
   */
  scale?: number
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

/**
 * Next value after a tap.
 *  - Counter: move by `step` and wrap within [min, max]. Defaults (min 0,
 *    max = start, step -1) reproduce Muldoon's trap: count down, wrap to start.
 *    Taskmaster's shield (min 0, max 2, step +1) counts up: 0 → 1 → 2 → 0.
 *  - Toggle: advance the state index, wrapping to 0.
 */
export function nextExtraValue(spec: ExtraButtonSpec, current: number): number {
  if (spec.kind === 'counter') {
    const min = spec.min ?? 0
    const max = spec.max ?? spec.start
    const step = spec.step ?? -1
    const next = current + step
    if (next > max) return min
    if (next < min) return max
    return next
  }
  return (current + 1) % spec.states.length
}

/** A playable Unmatched fighter and all of its per-character presentation. */
export interface Character {
  /** Canonical display name (matches the Android fighter list). */
  displayName: string
  /**
   * Stable art key. All of this fighter's art lives under
   * art/characters/<slug>/ (avatar.webp, background.webp, plus any extras),
   * resolved via characterArt(slug, leaf). Single source of truth — never
   * derive one asset path from another.
   */
  slug: string
  /** One label per life pool (same order/length as startingLifeSegments). */
  segmentLabels: string[]
  /** Non-empty list (length 1..3) of starting life per pool. */
  startingLifeSegments: number[]
  /** Setup accent color (card / spinner / avatar borders), CSS hex. */
  setupAccentColor: string
  /** Optional floating extra button; undefined = none. */
  extraButton?: ExtraButtonSpec
  /**
   * When true, this fighter is hidden from the selection list and never used as
   * a seat default. Still kept in the roster so persisted state referencing it
   * (e.g. an old saved game) resolves without error.
   */
  disabled?: boolean
  /**
   * Optional per-pool overlay art leaves (one per life pool, same order as
   * segmentLabels), resolved via characterArt(slug, leaf). Used by the Raptors:
   * the shared background is the jungle and each pool shows its own dinosaur
   * silhouette on top (e.g. 'blue' → raptors/blue.webp). Undefined = no overlays.
   */
  poolOverlays?: string[]
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
  /**
   * Whether this player has been knocked out of the game. Set manually via the
   * DEFEATED? button (once every tracked pool is at 0 — manual because some
   * sidekicks aren't tracked in the app), which also drops them from the turn
   * rotation. Cleared by reviving.
   */
  defeated: boolean
}
