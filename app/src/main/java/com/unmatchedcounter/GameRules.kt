package com.unmatchedcounter

import com.unmatchedcounter.view.TableLayoutPosition

/** Fixed game rules and supported tabletop layouts. */
object GameRules {
    const val STARTING_LIFE = 15
    const val MIN_PLAYER_COUNT = 2
    const val MAX_PLAYER_COUNT = 4
    val SUPPORTED_PLAYER_COUNTS: List<Int> = listOf(2, 4)

    /** 2 seats: face-to-face across the table (top vs bottom). */
    private val POSITIONS_2P: List<TableLayoutPosition> = listOf(
        TableLayoutPosition.TOP_PANEL,
        TableLayoutPosition.BOTTOM_PANEL,
    )

    /**
     * 4 seats: row-major order so the in-game tabletop matches the
     * 2×2 setup grid (P1 top-left, P2 top-right, P3 bottom-left, P4 bottom-right).
     */
    private val POSITIONS_4P: List<TableLayoutPosition> = listOf(
        TableLayoutPosition.LEFT_PANEL_1,
        TableLayoutPosition.RIGHT_PANEL_1,
        TableLayoutPosition.LEFT_PANEL_2,
        TableLayoutPosition.RIGHT_PANEL_2,
    )

    fun tabletopPositionsFor(playerCount: Int): List<TableLayoutPosition> = when (playerCount) {
        2 -> POSITIONS_2P
        4 -> POSITIONS_4P
        else -> throw IllegalArgumentException("Unsupported player count: $playerCount")
    }
}
