package com.unmatchedcounter.ui.game

interface OnPlayerUpdatedListener {
    fun onLifeIncremented(
        playerId: Int,
        amountDifference: Int,
        segmentIndex: Int = 0,
    )
    fun onLifeAmountSet(playerId: Int, amount: Int, segmentIndex: Int = 0)
}
