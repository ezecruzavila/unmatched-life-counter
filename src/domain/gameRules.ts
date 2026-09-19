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
  | 'LEFT_PANEL_1'
  | 'LEFT_PANEL_2'
  | 'RIGHT_PANEL_1'
  | 'RIGHT_PANEL_2'

/** Rotation (degrees) applied to each seat so it faces its player. From Android defaults. */
export const SEAT_ROTATION: Record<TableLayoutPosition, number> = {
  TOP_PANEL: 180,
  BOTTOM_PANEL: 0,
  LEFT_PANEL_1: 270,
  LEFT_PANEL_2: 270,
  RIGHT_PANEL_1: 90,
  RIGHT_PANEL_2: 90,
}

/** 2 seats: face-to-face across the table (top vs bottom). */
const POSITIONS_2P: TableLayoutPosition[] = ['TOP_PANEL', 'BOTTOM_PANEL']

/**
 * 4 seats in row-major order matching the 2x2 setup grid
 * (P1 top-left, P2 top-right, P3 bottom-left, P4 bottom-right).
 */
const POSITIONS_4P: TableLayoutPosition[] = [
  'LEFT_PANEL_1',
  'RIGHT_PANEL_1',
  'LEFT_PANEL_2',
  'RIGHT_PANEL_2',
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
