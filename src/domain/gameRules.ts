import type { PlayerColor } from './types'

/** Fixed game rules and supported tabletop layouts (ported from GameRules.kt). */
export const MAX_LIFE_SEGMENTS = 3
export const MAX_PLAYER_COUNT = 4
export const SUPPORTED_PLAYER_COUNTS = [2, 4] as const

/**
 * Seat positions on the tabletop. In the app each panel is rotated so the player
 * sitting on that side reads it right-side up.
 */
export type TableLayoutPosition =
  | 'TOP_PANEL'
  | 'BOTTOM_PANEL'
  | 'TOP_LEFT'
  | 'TOP_RIGHT'
  | 'BOTTOM_LEFT'
  | 'BOTTOM_RIGHT'

/**
 * Rotation (degrees) applied to each seat so it faces its player. The tablet
 * lies flat on the table: the top row faces the far side (rotated 180°) and the
 * bottom row faces the near side (0°).
 */
export const SEAT_ROTATION: Record<TableLayoutPosition, number> = {
  TOP_PANEL: 180,
  BOTTOM_PANEL: 0,
  TOP_LEFT: 180,
  TOP_RIGHT: 180,
  BOTTOM_LEFT: 0,
  BOTTOM_RIGHT: 0,
}

/**
 * Which bottom corner (in the panel's own, un-rotated space) the floating extra
 * button sits in, so that after this seat's rotation it lands in the bottom
 * corner furthest from the table centre — from the seated player's view.
 * Ported from Android's anchorExtraButtonToOuterCorner, derived for the 0°/180°
 * layout: 180° seats have their outer side mirrored, so left/right flips.
 */
export const EXTRA_BUTTON_CORNER: Record<TableLayoutPosition, 'left' | 'right'> = {
  // Bottom row (0°): outer side maps straight through.
  BOTTOM_PANEL: 'right',
  BOTTOM_LEFT: 'left',
  BOTTOM_RIGHT: 'right',
  // Top row (180°): outer side is mirrored.
  TOP_PANEL: 'left',
  TOP_LEFT: 'right',
  TOP_RIGHT: 'left',
}

/** 2 seats: face-to-face across the table (top rotated 180°, bottom upright). */
const POSITIONS_2P: TableLayoutPosition[] = ['TOP_PANEL', 'BOTTOM_PANEL']

/**
 * 4 seats in a 2×2 grid matching the setup grid. Seating follows the game rule
 * order 1,3,2,4 when reading the cells left-to-right, top-to-bottom:
 *   P1 top-left    P3 top-right
 *   P2 bottom-left P4 bottom-right
 * So P1↔P2 face each other down the left column and P3↔P4 down the right column.
 * The top row is rotated 180° so those two seats face the players across.
 */
const POSITIONS_4P: TableLayoutPosition[] = [
  'TOP_LEFT',
  'BOTTOM_LEFT',
  'TOP_RIGHT',
  'BOTTOM_RIGHT',
]

export function tabletopPositionsFor(playerCount: number): TableLayoutPosition[] {
  switch (playerCount) {
    case 2:
      return POSITIONS_2P
    case 4:
      return POSITIONS_4P
    default:
      throw new Error(`Unsupported player count: ${playerCount}`)
  }
}

/**
 * Selectable seat colors. Ported from PlayerColor.kt (NONE excluded from the
 * pickable set). Order here is the palette shown in the picker.
 */
export const PLAYER_COLORS: PlayerColor[] = [
  { id: 'BLUE', color: '#00B0FF' },
  { id: 'RED', color: '#EF5350' },
  { id: 'TURKWISE', color: '#1DE9B6' },
  { id: 'PURPLE', color: '#B388FF' },
  { id: 'ORANGE', color: '#FFC400' },
  { id: 'GREEN', color: '#00C853' },
  { id: 'INDIGO', color: '#536DFE' },
  { id: 'LIGHT_GREEN', color: '#CCFF90' },
  { id: 'PINK', color: '#FF80AB' },
  { id: 'WHITE', color: '#FFFFFF' },
]

export const NONE_COLOR: PlayerColor = { id: 'NONE', color: null }

export function colorById(id: string): PlayerColor {
  return PLAYER_COLORS.find((c) => c.id === id) ?? NONE_COLOR
}

/** Pick `amount` distinct random colors for initial seats. */
export function randomColors(amount: number): PlayerColor[] {
  const shuffled = [...PLAYER_COLORS]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled.slice(0, amount)
}
